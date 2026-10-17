import { ICommunicationManager, IConnection, IMessageConfiguration, IMessageEvent } from '@volt/api';
import { GetConfiguration } from '@volt/configuration';
import { GetEventDispatcher, VoltEventType, SocketReauthenticatedEvent } from '@volt/events';
import { GetTickerTime, VoltLogger } from '@volt/utils';
import { VoltMessages } from './VoltMessages';
import { SocketConnection } from './SocketConnection';
import { AuthenticatedEvent, ClientHelloMessageComposer, ClientPingEvent, DisconnectReasonEvent, InfoRetrieveMessageComposer, PongMessageComposer, SSOTicketMessageComposer, UniqueIDMessageComposer } from './messages';
import { Thumbmark } from '@thumbmarkjs/thumbmarkjs';

export class CommunicationManager implements ICommunicationManager
{
    /** A reconnect that has not logged in again within this time ends the session. */

    private _connection: IConnection = new SocketConnection();
    private _messages: IMessageConfiguration;

    private _pongInterval: any = null;
    private _messageEvents: IMessageEvent[] = [];
    private _socketClosedCallback: () => void = null;
    private _socketOpenedCallback: () => void = null;
    private _socketErrorCallback: () => void = null;
    private _socketReconnectedCallback: () => void = null;

    private _machineIdPromise: Promise<string> | null = null;
    private _initResolved: boolean = false;

    private async generateMachineID(): Promise<string>
    {
        try
        {
            const result = await new Thumbmark().get();

            return result.thumbmark ? `IID-${result.thumbmark}` : 'FAILED';
        }
        catch (error)
        {
            VoltLogger.warn('[CommunicationManager] Failed to generate machine ID', error);

            return 'FAILED';
        }
    }

    private async sendHandshake(ticket: string = GetConfiguration().getValue('sso.ticket', null)): Promise<void>
    {
        if(this._machineIdPromise === null) this._machineIdPromise = this.generateMachineID();

        const machineId = await this._machineIdPromise;

        this._connection.send(new ClientHelloMessageComposer(null, null, null, null));
        // Send the machine fingerprint (UniqueID) BEFORE the SSO ticket so the server
        // has the machineId available when it processes the login in Habbo.connect().
        this._connection.send(new UniqueIDMessageComposer(machineId, '', ''));
        this._connection.send(new SSOTicketMessageComposer(ticket, GetTickerTime()));
    }

    constructor()
    {
        this._messages = new VoltMessages();
        this._connection.registerMessages(this._messages);
    }

    public async init(): Promise<void>
    {
        // Store callback for cleanup
        this._socketClosedCallback = () =>
        {
            this.stopPong();
        };
        GetEventDispatcher().addEventListener(VoltEventType.SOCKET_CLOSED, this._socketClosedCallback);

        // The server spent the ticket the session logged in with, and the client has no way to get a
        // new one, so a reconnected socket cannot log in again: the session ends.
        this._socketReconnectedCallback = () =>
        {
            VoltLogger.warn('[CommunicationManager] Socket reconnected without a ticket, ending the session');

            this._connection.reauthenticationFailed();
        };
        GetEventDispatcher().addEventListener(VoltEventType.SOCKET_RECONNECTED, this._socketReconnectedCallback);

        return new Promise((resolve, reject) =>
        {
            // Store callback for cleanup
            this._socketOpenedCallback = () =>
            {
                if(GetConfiguration().getValue<boolean>('system.pong.manually', false)) this.startPong();

                void this.sendHandshake();
            };
            GetEventDispatcher().addEventListener(VoltEventType.SOCKET_OPENED, this._socketOpenedCallback);

            // Store callback for cleanup
            this._socketErrorCallback = () =>
            {
                if(!this._initResolved) reject(new Error('Socket error before init resolved'));
            };
            GetEventDispatcher().addEventListener(VoltEventType.SOCKET_ERROR, this._socketErrorCallback);

            // Store message events for cleanup
            const pingEvent = new ClientPingEvent((event: ClientPingEvent) => this.sendPong());
            const authEvent = new AuthenticatedEvent((event: AuthenticatedEvent) =>
            {
                const isReconnect = this._initResolved;

                VoltLogger.log('[CommunicationManager] AuthenticatedEvent received (isReconnect=' + isReconnect + ')');

                this._connection.authenticated();

                if(!this._initResolved)
                {
                    this._initResolved = true;
                    resolve();
                }

                // A reconnect while the client is still loading waits for its first ready() like the first login.
                if(isReconnect && this._connection.hasBeenReady)
                {
                    this._connection.ready();
                }

                event.connection.send(new InfoRetrieveMessageComposer());

                if(isReconnect)
                {
                    VoltLogger.log('[CommunicationManager] Dispatching SOCKET_REAUTHENTICATED');
                    GetEventDispatcher().dispatchEvent(new SocketReauthenticatedEvent(
                        VoltEventType.SOCKET_REAUTHENTICATED,
                        false,
                        0));
                }
            });

            const disconnectEvent = new DisconnectReasonEvent((event: DisconnectReasonEvent) =>
            {
                const reason = event.getParser()?.reason ?? -1;

                VoltLogger.log('[CommunicationManager] Server disconnect reason ' + reason);

                this._connection.serverDisconnected(reason);
            });

            this._messageEvents.push(pingEvent, authEvent, disconnectEvent);
            this._connection.addMessageEvent(pingEvent);
            this._connection.addMessageEvent(authEvent);
            this._connection.addMessageEvent(disconnectEvent);

            this._connection.init(GetConfiguration().getValue<string>('socket.url'));
        });
    }

    public dispose(): void
    {
        // Stop pong interval
        this.stopPong();

        // Remove event dispatcher listeners
        if(this._socketClosedCallback)
        {
            GetEventDispatcher().removeEventListener(VoltEventType.SOCKET_CLOSED, this._socketClosedCallback);
            this._socketClosedCallback = null;
        }

        if(this._socketOpenedCallback)
        {
            GetEventDispatcher().removeEventListener(VoltEventType.SOCKET_OPENED, this._socketOpenedCallback);
            this._socketOpenedCallback = null;
        }

        if(this._socketErrorCallback)
        {
            GetEventDispatcher().removeEventListener(VoltEventType.SOCKET_ERROR, this._socketErrorCallback);
            this._socketErrorCallback = null;
        }

        if(this._socketReconnectedCallback)
        {
            GetEventDispatcher().removeEventListener(VoltEventType.SOCKET_RECONNECTED, this._socketReconnectedCallback);
            this._socketReconnectedCallback = null;
        }

        // Remove message events
        for(const event of this._messageEvents)
        {
            this._connection.removeMessageEvent(event);
        }
        this._messageEvents = [];
    }

    protected startPong(): void
    {
        if(this._pongInterval) this.stopPong();

        this._pongInterval = setInterval(() => this.sendPong(), GetConfiguration().getValue<number>('system.pong.interval.ms', 20000));
    }

    protected stopPong(): void
    {
        if(!this._pongInterval) return;

        clearInterval(this._pongInterval);

        this._pongInterval = null;
    }

    protected sendPong(): void
    {
        this._connection?.send(new PongMessageComposer());
    }

    public registerMessageEvent(event: IMessageEvent): IMessageEvent
    {
        if(this._connection) this._connection.addMessageEvent(event);

        return event;
    }

    public removeMessageEvent(event: IMessageEvent): void
    {
        if(!this._connection) return;

        this._connection.removeMessageEvent(event);
    }

    public subscribeMessage<T extends IMessageEvent>(eventCtor: new (callback: (event: T) => void) => T, handler: (event: T) => void): () => void
    {
        if(!eventCtor || !handler) return () =>
        {};

        const event = new eventCtor(handler);

        this.registerMessageEvent(event);

        return () => this.removeMessageEvent(event);
    }

    public get connection(): IConnection
    {
        return this._connection;
    }
}
