import { ICodec, IConnection, IConnectionStateSnapshot, IMessageComposer, IMessageConfiguration, IMessageDataWrapper, IMessageEvent, IMessageParser, WebSocketEventEnum } from '@volt/api';
import { GetConfiguration } from '@volt/configuration';
import { GetEventDispatcher, VoltEvent, VoltEventType, ReconnectEvent, WiredCatalogParseFailureEvent } from '@volt/events';
import { VoltLogger } from '@volt/utils';
import { EvaWireFormat } from './codec';
import { aesGcmDecrypt, aesGcmEncrypt, buildClientHello, deriveAesKey, deriveSharedSecret, exportPublicKeySpki, generateEphemeralKeyPair, importPublicKeySpki, importSigningPublicKeyFromBase64, NONCE_LEN, parseServerHello, randomNonce, verifyEphemeralSignature } from './crypto';
import { ConnectionStateStore } from './ConnectionStateStore';
import { MessageClassManager } from './messages';
import { IncomingHeader } from './messages/incoming/IncomingHeader';
import { shouldReconnectAfterClose } from './socketClosePolicy';
import { ClientHelloMessageComposer } from './messages/outgoing/handshake/ClientHelloMessageComposer';

type CryptoState = 'disabled' | 'awaiting_server_hello' | 'ready' | 'error';

export class SocketConnection implements IConnection
{
    private _socket: WebSocket = null;
    private _messages: MessageClassManager = new MessageClassManager();
    private _codec: ICodec = new EvaWireFormat();
    private _dataBuffer: ArrayBuffer = null;
    private _pendingChunks: Uint8Array[] = [];
    private _pendingBytes: number = 0;
    private _isReady: boolean = false;
    private _hasBeenReady: boolean = false;
    private _pendingClientMessages: IMessageComposer<unknown[]>[] = [];
    private _pendingServerMessages: IMessageDataWrapper[] = [];
    private _isAuthenticated: boolean = false;
    private _onOpenCallback: (event: Event) => void = null;
    private _onCloseCallback: (event: Event) => void = null;
    private _onErrorCallback: (event: Event) => void = null;
    private _onMessageCallback: (event: MessageEvent) => void = null;
    private _socketUrl: string = null;
    private _reconnectAttempt: number = 0;
    private _reconnectTimer: ReturnType<typeof setTimeout> = null;
    private _isReconnecting: boolean = false;
    private _intentionalClose: boolean = false;
    private _wasAuthenticated: boolean = false;
    private _helloAnnounced: boolean = false;
    private _socketGeneration: number = 0;
    private _encryptChain: Promise<void> = Promise.resolve();

    public static readonly MAX_RECONNECT_ATTEMPTS: number = 7;
    public static readonly BASE_RECONNECT_DELAY_MS: number = 1000;
    public static readonly MAX_RECONNECT_DELAY_MS: number = 30000;

    private readonly _connectionState = new ConnectionStateStore(SocketConnection.MAX_RECONNECT_ATTEMPTS);

    private _cryptoState: CryptoState = 'disabled';
    private _sessionKey: CryptoKey = null;
    private _pendingEncryptedSends: ArrayBuffer[] = [];
    private _decryptChain: Promise<void> = Promise.resolve();

    public init(socketUrl: string): void
    {
        if(!socketUrl || !socketUrl.length) return;

        this._socketUrl = socketUrl;
        this._intentionalClose = false;

        this.setConnectionState({
            phase: 'connecting',
            reconnectAttempt: 0,
            authenticated: false,
            closeCode: null,
            closeReason: '',
            disconnectReason: undefined
        });

        this.createSocket(socketUrl);
    }

    private createSocket(socketUrl: string): void
    {
        this._helloAnnounced = false;
        this._socketGeneration++;
        this._encryptChain = Promise.resolve();
        this._dataBuffer = new ArrayBuffer(0);
        this._pendingChunks = [];
        this._pendingBytes = 0;
        this._decryptChain = Promise.resolve();
        const cryptoEnabled = !!GetConfiguration().getValue<boolean>('crypto.ws.enabled', false);
        if(cryptoEnabled && !this.subtleCryptoAvailable())
        {
            VoltLogger.error('[ws-crypto] crypto.ws.enabled=true but window.crypto.subtle is unavailable. '
                + 'This page must be served from a secure context - HTTPS, localhost, or 127.0.0.1. '
                + 'Current origin: ' + (typeof window !== 'undefined' ? window.location.origin : 'unknown'));
            this._cryptoState = 'error';
        }
        else
        {
            this._cryptoState = cryptoEnabled ? 'awaiting_server_hello' : 'disabled';
        }
        this._sessionKey = null;
        this._pendingEncryptedSends = [];

        this._socket = new WebSocket(socketUrl);
        this._socket.binaryType = 'arraybuffer';
        this._onOpenCallback = () => this.onSocketOpened();
        this._onCloseCallback = (event: Event) => this.onSocketClosed(event as CloseEvent);
        this._onErrorCallback = () => this.onSocketError();
        this._onMessageCallback = (event: MessageEvent) => this.onSocketMessage(event.data as ArrayBuffer);
        this._socket.addEventListener(WebSocketEventEnum.CONNECTION_OPENED, this._onOpenCallback);
        this._socket.addEventListener(WebSocketEventEnum.CONNECTION_CLOSED, this._onCloseCallback);
        this._socket.addEventListener(WebSocketEventEnum.CONNECTION_ERROR, this._onErrorCallback);
        this._socket.addEventListener(WebSocketEventEnum.CONNECTION_MESSAGE, this._onMessageCallback);
    }

    private subtleCryptoAvailable(): boolean
    {
        return typeof window !== 'undefined'
            && typeof window.crypto !== 'undefined'
            && typeof window.crypto.subtle !== 'undefined';
    }

    private onSocketMessage(data: ArrayBuffer): void
    {
        if(this._cryptoState === 'error')
        {
            this._intentionalClose = true;
            if(this._socket) this._socket.close();
            return;
        }

        if(this._cryptoState === 'awaiting_server_hello')
        {
            const generation = this._socketGeneration;
            this.handleServerHello(data)
                .catch(err =>
                {
                    if(generation !== this._socketGeneration) return;

                    VoltLogger.error('[ws-crypto] handshake failed', err);
                    this._helloAnnounced = false;
                    this._cryptoState = 'error';
                    this._intentionalClose = true;
                    if(this._socket) this._socket.close();
                });
            return;
        }

        if(this._cryptoState === 'ready')
        {
            const frame = data;

            this._decryptChain = this._decryptChain.then(async () =>
            {
                if((this._cryptoState !== 'ready') || this._intentionalClose) return;

                try
                {
                    const plain = await this.decryptFrame(frame);

                    this.enqueueAndProcess(plain);
                }
                catch (err)
                {
                    VoltLogger.error('[ws-crypto] decrypt failed', err);
                    this._cryptoState = 'error';
                    this._intentionalClose = true;
                    if(this._socket) this._socket.close();
                }
            });
            return;
        }

        this.enqueueAndProcess(data);
    }

    private enqueueAndProcess(data: ArrayBuffer): void
    {
        if(data && data.byteLength)
        {
            this._pendingChunks.push(new Uint8Array(data));
            this._pendingBytes += data.byteLength;
        }

        if(this._pendingBytes < 4) return;

        const messageLength = this.peekFirstMessageLength();

        if(messageLength < 0 || (this._pendingBytes < (messageLength + 4))) return;

        this._dataBuffer = this.mergePendingChunks();
        this._pendingChunks = [];
        this._pendingBytes = 0;

        this.processReceivedData();

        const remainder = this._dataBuffer;
        this._dataBuffer = new ArrayBuffer(0);

        if(remainder && remainder.byteLength)
        {
            this._pendingChunks.push(new Uint8Array(remainder));
            this._pendingBytes = remainder.byteLength;
        }
    }

    private peekFirstMessageLength(): number
    {
        let value = 0;
        let read = 0;

        for(const chunk of this._pendingChunks)
        {
            for(let i = 0; (i < chunk.byteLength) && (read < 4); i++)
            {
                value = ((value << 8) | chunk[i]) >>> 0;
                read++;
            }

            if(read >= 4) break;
        }

        if(read < 4) return -1;

        return value | 0;
    }

    private mergePendingChunks(): ArrayBuffer
    {
        if(!this._pendingChunks.length) return new ArrayBuffer(0);

        if(this._pendingChunks.length === 1)
        {
            const only = this._pendingChunks[0];

            if((only.byteOffset === 0) && (only.byteLength === only.buffer.byteLength)) return only.buffer as ArrayBuffer;

            return only.buffer.slice(only.byteOffset, only.byteOffset + only.byteLength) as ArrayBuffer;
        }

        const merged = new Uint8Array(this._pendingBytes);
        let offset = 0;

        for(const chunk of this._pendingChunks)
        {
            merged.set(chunk, offset);
            offset += chunk.byteLength;
        }

        return merged.buffer;
    }

    private async handleServerHello(frame: ArrayBuffer): Promise<void>
    {
        const generation = this._socketGeneration;
        const socket = this._socket;
        const { pubkeySpki: serverPubkeySpki, signature } = parseServerHello(frame);
        const signingRequired = !!GetConfiguration().getValue<boolean>('crypto.ws.signing.enabled', false);
        if(signingRequired)
        {
            if(!signature) throw new Error('crypto.ws.signing.enabled=true but server_hello had no signature');

            const signingPub = await this.getSigningPublicKey();
            const ok = await verifyEphemeralSignature(signingPub, signature, serverPubkeySpki);
            if(!ok) throw new Error('server_hello signature verification failed (MITM?)');
        }

        const serverPubkey = await importPublicKeySpki(serverPubkeySpki);
        const ourKeys = await generateEphemeralKeyPair();
        const ourPubkeySpki = await exportPublicKeySpki(ourKeys.publicKey);
        const shared = await deriveSharedSecret(ourKeys.privateKey, serverPubkey);
        const key = await deriveAesKey(shared);
        if(generation !== this._socketGeneration || socket !== this._socket || this._intentionalClose) return;
        this._sessionKey = key;
        this._socket.send(buildClientHello(ourPubkeySpki));
        this._cryptoState = 'ready';

        if(this._pendingEncryptedSends.length)
        {
            const queued = this._pendingEncryptedSends;
            this._pendingEncryptedSends = [];
            // Enqueue the entire backlog before a ready-state send can append.
            for(const buf of queued) this.queueEncryptedSend(buf);
        }
    }

    private _cachedSigningPublicKey: CryptoKey = null;
    private async getSigningPublicKey(): Promise<CryptoKey>
    {
        if(this._cachedSigningPublicKey) return this._cachedSigningPublicKey;

        const pinned = GetConfiguration().getValue<string>('crypto.ws.signing.public_key', '');
        if(pinned)
        {
            this._cachedSigningPublicKey = await importSigningPublicKeyFromBase64(pinned);
            return this._cachedSigningPublicKey;
        }

        const endpointTemplate = GetConfiguration().getValue<string>('login.server_key.endpoint', '/api/auth/server-key');
        const endpoint = GetConfiguration().interpolate(endpointTemplate);
        const resp = await fetch(endpoint, { credentials: 'include' });
        if(!resp.ok) throw new Error(`server-key fetch failed: HTTP ${ resp.status }`);
        const payload = await resp.json();
        const b64 = typeof payload?.publicKey === 'string' ? payload.publicKey : '';
        if(!b64) throw new Error('server-key response missing publicKey');
        this._cachedSigningPublicKey = await importSigningPublicKeyFromBase64(b64);
        return this._cachedSigningPublicKey;
    }

    private async decryptFrame(frame: ArrayBuffer): Promise<ArrayBuffer>
    {
        if(frame.byteLength < NONCE_LEN + 16) throw new Error('encrypted frame too short');
        const nonce = new Uint8Array(frame, 0, NONCE_LEN);
        const ct = frame.slice(NONCE_LEN);
        return aesGcmDecrypt(this._sessionKey, nonce, ct);
    }

    private queueEncryptedSend(plaintext: ArrayBuffer): void
    {
        const generation = this._socketGeneration;
        const socket = this._socket;
        const key = this._sessionKey;

        this._encryptChain = this._encryptChain.then(async () =>
        {
            if(generation !== this._socketGeneration || socket !== this._socket || this._cryptoState !== 'ready' || this._intentionalClose) return;
            if(!key) throw new Error('Missing encryption key');

            const nonce = randomNonce();
            const ct = await aesGcmEncrypt(key, nonce, plaintext);

            if(generation !== this._socketGeneration || socket !== this._socket || this._cryptoState !== 'ready' || this._intentionalClose) return;
            if(socket.readyState !== WebSocket.OPEN) return;

            const framed = new Uint8Array(NONCE_LEN + ct.byteLength);
            framed.set(nonce, 0);
            framed.set(new Uint8Array(ct), NONCE_LEN);
            socket.send(framed.buffer);
        }).catch(err =>
        {
            if(generation !== this._socketGeneration || socket !== this._socket) return;

            VoltLogger.error('[ws-crypto] encrypt failed', err);
            this._helloAnnounced = false;
            this._cryptoState = 'error';
            this._intentionalClose = true;
            this._pendingEncryptedSends = [];
            socket.close();
        });
    }

    private onSocketOpened(): void
    {
        if(this._isReconnecting)
        {
            // The attempt count only resets once authenticated, so a server that keeps closing the
            // socket during login cannot keep the client reconnecting forever.
            this._isReconnecting = false;

            this.setConnectionState({ phase: 'reauthenticating', authenticated: false });

            GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.SOCKET_RECONNECTED));
        }
        else
        {
            this.setConnectionState({ phase: 'authenticating', authenticated: false });
            GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.SOCKET_OPENED));
        }
    }

    private onSocketClosed(event: CloseEvent): void
    {
        VoltLogger.log('[SocketConnection] Socket closed, code: ' + (event?.code ?? 'unknown') + ', reason: ' + (event?.reason || 'none'));

        const code = event?.code ?? 0;
        const closeReason = event?.reason || '';
        const hadAuthenticatedSession = this._isAuthenticated || this._wasAuthenticated;

        if(!shouldReconnectAfterClose(code, this._intentionalClose))
        {
            this._isAuthenticated = false;
            this._isReady = false;

            this.setConnectionState({
                phase: (!this._intentionalClose && hadAuthenticatedSession) ? 'failed' : 'disconnected',
                authenticated: false,
                closeCode: code,
                closeReason
            });

            GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.SOCKET_CLOSED));
            return;
        }

        if(this._isAuthenticated) this._wasAuthenticated = true;

        this._isAuthenticated = false;
        this._isReady = false;
        this._pendingClientMessages = [];
        this._pendingServerMessages = [];

        this.setConnectionState({
            phase: 'reconnecting',
            authenticated: false,
            closeCode: code,
            closeReason
        });

        this.attemptReconnect();
    }

    private onSocketError(): void
    {
        if(this._isReconnecting)
        {
            return;
        }

        if(!this._wasAuthenticated && !this._isAuthenticated)
        {
            GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.SOCKET_ERROR));
        }
    }

    private attemptReconnect(): void
    {
        if(this._reconnectAttempt >= SocketConnection.MAX_RECONNECT_ATTEMPTS)
        {
            this._isReconnecting = false;
            this._wasAuthenticated = false;

            this.setConnectionState({
                phase: 'failed',
                reconnectAttempt: this._reconnectAttempt,
                authenticated: false
            });

            GetEventDispatcher().dispatchEvent(new ReconnectEvent(
                VoltEventType.SOCKET_RECONNECT_FAILED,
                this._reconnectAttempt,
                SocketConnection.MAX_RECONNECT_ATTEMPTS
            ));

            GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.SOCKET_CLOSED));

            return;
        }

        this._isReconnecting = true;
        this._reconnectAttempt++;

        this.setConnectionState({
            phase: 'reconnecting',
            reconnectAttempt: this._reconnectAttempt,
            authenticated: false
        });

        const delay = Math.min(
            SocketConnection.BASE_RECONNECT_DELAY_MS * Math.pow(2, this._reconnectAttempt - 1) + Math.random() * 1000,
            SocketConnection.MAX_RECONNECT_DELAY_MS
        );

        GetEventDispatcher().dispatchEvent(new ReconnectEvent(
            VoltEventType.SOCKET_RECONNECTING,
            this._reconnectAttempt,
            SocketConnection.MAX_RECONNECT_ATTEMPTS
        ));

        this._reconnectTimer = setTimeout(() =>
        {
            this._reconnectTimer = null;

            this.cleanupSocket();

            this.createSocket(this._socketUrl);
        }, delay);
    }

    private cleanupSocket(): void
    {
        if(!this._socket) return;

        if(this._onOpenCallback) this._socket.removeEventListener(WebSocketEventEnum.CONNECTION_OPENED, this._onOpenCallback);
        if(this._onCloseCallback) this._socket.removeEventListener(WebSocketEventEnum.CONNECTION_CLOSED, this._onCloseCallback);
        if(this._onErrorCallback) this._socket.removeEventListener(WebSocketEventEnum.CONNECTION_ERROR, this._onErrorCallback);
        if(this._onMessageCallback) this._socket.removeEventListener(WebSocketEventEnum.CONNECTION_MESSAGE, this._onMessageCallback);

        if(this._socket.readyState === WebSocket.OPEN || this._socket.readyState === WebSocket.CONNECTING)
        {
            try
            {
                this._socket.close();
            }
            catch (e)
            {}
        }

        this._socket = null;
        this._onOpenCallback = null;
        this._onCloseCallback = null;
        this._onErrorCallback = null;
        this._onMessageCallback = null;
    }

    public dispose(): void
    {
        this._intentionalClose = true;

        if(this._reconnectTimer)
        {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }

        this._isReconnecting = false;
        this._reconnectAttempt = 0;
        this._wasAuthenticated = false;

        this.cleanupSocket();

        this._pendingClientMessages = [];
        this._pendingServerMessages = [];
        this._pendingChunks = [];
        this._pendingBytes = 0;
        this._dataBuffer = null;
        this._decryptChain = Promise.resolve();

        this.setConnectionState({
            phase: 'disconnected',
            reconnectAttempt: 0,
            authenticated: false,
            closeCode: null,
            closeReason: '',
            disconnectReason: undefined
        });
    }

    /**
     * The server said why it is ending the session (ban, login elsewhere, logout, closing).
     * Reconnecting would only be refused or kick the other session, so the socket closes for good.
     */
    public serverDisconnected(reason: number): void
    {
        this._intentionalClose = true;

        if(this._reconnectTimer)
        {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }

        this._isReconnecting = false;

        this.setConnectionState({ disconnectReason: reason });

        const socket = this._socket;

        // Still open: its close event ends the session (no reconnect, as the close is intentional).
        if(socket && ((socket.readyState === WebSocket.OPEN) || (socket.readyState === WebSocket.CONNECTING)))
        {
            socket.close();

            return;
        }

        // Already closed (the reason was still being decrypted): end it here instead of reconnecting.
        this._isAuthenticated = false;
        this._isReady = false;

        this.setConnectionState({ phase: 'disconnected', reconnectAttempt: 0, authenticated: false });

        GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.SOCKET_CLOSED));
    }

    /** No new login could be made after a reconnect: the session ends for good, as after too many attempts. */
    public reauthenticationFailed(): void
    {
        this._intentionalClose = true;

        if(this._reconnectTimer)
        {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }

        this._isReconnecting = false;
        this._isAuthenticated = false;
        this._isReady = false;
        this._wasAuthenticated = false;

        // Without its listeners the closing socket cannot report 'disconnected' over 'failed'.
        this.cleanupSocket();

        this.setConnectionState({ phase: 'failed', reconnectAttempt: 0, authenticated: false });

        GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.SOCKET_CLOSED));
    }

    public ready(): void
    {
        if(this._isReady) return;

        this._isReady = true;
        this._hasBeenReady = true;

        const pendingClientMessages = this._pendingClientMessages;
        const pendingServerMessages = this._pendingServerMessages;

        this._pendingClientMessages = [];
        this._pendingServerMessages = [];

        // Queued requests go out first: a buffered server message can send at once (the home
        // room's RoomEnter), and must not overtake the InfoRetrieve the login queued earlier.
        if(pendingClientMessages && pendingClientMessages.length) this.send(...pendingClientMessages);

        if(pendingServerMessages && pendingServerMessages.length) this.processWrappers(...pendingServerMessages);
    }

    public authenticated(): void
    {
        this._isAuthenticated = true;
        this._reconnectAttempt = 0;
        this.setConnectionState({
            phase: 'connected',
            reconnectAttempt: 0,
            authenticated: true,
            closeCode: null,
            closeReason: ''
        });
    }

    private setConnectionState(patch: Partial<IConnectionStateSnapshot>): void
    {
        if(!this._connectionState.update(patch)) return;

        GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.CONNECTION_STATE_CHANGED));
    }

    public send(...composers: IMessageComposer<unknown[]>[]): boolean
    {
        if(!composers) return false;

        composers = [...composers];
        let supported = true;

        if(this._isAuthenticated && !this._isReady)
        {
            if(!this._helloAnnounced) return false;

            this._pendingClientMessages.push(...composers);

            return false;
        }

        for(const composer of composers)
        {
            if(!composer) continue;

            const header = this._messages.getComposerId(composer);

            if(header === -1)
            {
                VoltLogger.packets('Unknown Composer', composer.constructor.name);
                supported = false;

                continue;
            }

            if(header !== 4000 && !this._helloAnnounced)
            {
                VoltLogger.packets('Hello required', header);
                supported = false;

                continue;
            }

            const message = composer.getMessageArray();

            if(header === 4000 && message[0] !== ClientHelloMessageComposer.BUILD)
            {
                VoltLogger.packets('Hello revision mismatch', message[0]);
                supported = false;

                continue;
            }

            const encoded = this._codec?.encode(header, message);

            if(!encoded)
            {
                VoltLogger.packets('Encoding Failed', composer.constructor.name);
                supported = false;

                continue;
            }

            VoltLogger.packets('OutgoingComposer', header, composer.constructor.name, message);

            const accepted = this.write(encoded.getBuffer());
            if(!accepted) supported = false;
            if(header === 4000 && accepted) this._helloAnnounced = true;
        }

        return supported;
    }

    private write(buffer: ArrayBuffer): boolean
    {
        if(!this._socket || this._socket.readyState !== WebSocket.OPEN) return false;

        if(this._cryptoState === 'disabled')
        {
            this._socket.send(buffer);
            return true;
        }

        if(this._cryptoState === 'ready')
        {
            this.queueEncryptedSend(buffer);
            return true;
        }

        if(this._cryptoState === 'awaiting_server_hello')
        {
            this._pendingEncryptedSends.push(buffer);
            return true;
        }

        return false;
    }

    public processReceivedData(): void
    {
        try
        {
            this.processData();
        }

        catch (err)
        {
            VoltLogger.error(err);
        }
    }

    private processData(): void
    {
        const wrappers = this.splitReceivedMessages();

        if(!wrappers || !wrappers.length) return;

        if(this._isAuthenticated && !this._isReady)
        {
            if(!this._pendingServerMessages) this._pendingServerMessages = [];

            this._pendingServerMessages.push(...wrappers);

            return;
        }

        this.processWrappers(...wrappers);
    }

    private processWrappers(...wrappers: IMessageDataWrapper[]): void
    {
        if(!wrappers || !wrappers.length) return;

        for(let index = 0; index < wrappers.length; index++)
        {
            const wrapper = wrappers[index];

            if(!wrapper) continue;

            const messages = this.getMessagesForWrapper(wrapper);

            if(messages && messages.length)
            {
                VoltLogger.packets('IncomingMessage', wrapper.header, messages[0].constructor.name, messages[0].parser);

                this.handleMessages(...messages);
            }

            // Authentication can complete mid-batch: hold the rest until ready(), as processData does.
            if(this._isAuthenticated && !this._isReady)
            {
                if(!this._pendingServerMessages) this._pendingServerMessages = [];

                this._pendingServerMessages.push(...wrappers.slice(index + 1));

                return;
            }
        }
    }

    private splitReceivedMessages(): IMessageDataWrapper[]
    {
        if(!this._dataBuffer || !this._dataBuffer.byteLength) return null;

        return this._codec.decode(this);
    }

    private getMessagesForWrapper(wrapper: IMessageDataWrapper): IMessageEvent[]
    {
        if(!wrapper) return null;

        const events = this._messages.getEvents(wrapper.header);

        if(!events || !events.length)
        {
            VoltLogger.packets('IncomingMessage', wrapper.header, 'UNREGISTERED', wrapper);

            return null;
        }

        try
        {
            const parser = new (events[0].parserClass as new () => IMessageParser)();

            if(parser && parser.flush() && parser.parse(wrapper))
            {
                for(const event of events) (event.parser = parser);

                return events;
            }
        }

        catch (e)
        {
            VoltLogger.error('Error parsing message', e, events[0].constructor.name);
        }

        this.notifyCatalogParseFailure(wrapper.header);

        return null;
    }

    private notifyCatalogParseFailure(header: number): void
    {
        if(header !== IncomingHeader.WIRED_ALL_VARIABLES_HASH && header !== IncomingHeader.WIRED_ALL_VARIABLES_DIFF) return;

        GetEventDispatcher().dispatchEvent(new WiredCatalogParseFailureEvent(this, header));
    }

    private handleMessages(...messages: IMessageEvent[]): void
    {
        messages = [...messages];

        for(const message of messages)
        {
            if(!message) continue;

            message.connection = this;

            if(message.callBack) message.callBack(message);
        }
    }

    public registerMessages(configuration: IMessageConfiguration): void
    {
        if(!configuration) return;

        this._messages.registerMessages(configuration);
    }

    public addMessageEvent(event: IMessageEvent): void
    {
        if(!event || !this._messages) return;

        this._messages.registerMessageEvent(event);
    }

    public removeMessageEvent(event: IMessageEvent): void
    {
        if(!event || !this._messages) return;

        this._messages.removeMessageEvent(event);
    }

    public get isAuthenticated(): boolean
    {
        return this._isAuthenticated;
    }

    public get connectionState(): Readonly<IConnectionStateSnapshot>
    {
        return this._connectionState.snapshot;
    }

    public get isReconnecting(): boolean
    {
        return this._isReconnecting;
    }

    /** Whether the client has released messages at least once, i.e. its handlers are registered. */
    public get hasBeenReady(): boolean
    {
        return this._hasBeenReady;
    }

    public get wasAuthenticated(): boolean
    {
        return this._wasAuthenticated;
    }

    public get dataBuffer(): ArrayBuffer
    {
        return this._dataBuffer;
    }

    public set dataBuffer(buffer: ArrayBuffer)
    {
        this._dataBuffer = buffer;
    }
}
