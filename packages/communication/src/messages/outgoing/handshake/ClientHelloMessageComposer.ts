import { ClientDeviceCategoryEnum, ClientPlatformEnum, IMessageComposer } from '@volt/api';

export class ClientHelloMessageComposer implements IMessageComposer<ConstructorParameters<typeof ClientHelloMessageComposer>>
{
    public static readonly BUILD = 'WIN63-202610121709-785561319';

    private _data: ConstructorParameters<typeof ClientHelloMessageComposer>;

    constructor(releaseVersion: string, type: string, platform: number, category: number)
    {
        this._data = [
            releaseVersion || ClientHelloMessageComposer.BUILD,
            type || 'HTML5',
            platform ?? ClientPlatformEnum.HTML5,
            category ?? ClientDeviceCategoryEnum.BROWSER
        ];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
