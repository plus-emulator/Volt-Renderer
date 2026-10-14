import { IMessageComposer } from '@volt/api';

/** Creates a WIRED Link network, package_129.class_3715 (out 2192 in WIN63-202610131318). */
export class WiredLinkCreateNetworkComposer implements IMessageComposer<ConstructorParameters<typeof WiredLinkCreateNetworkComposer>>
{
    private _data: ConstructorParameters<typeof WiredLinkCreateNetworkComposer>;

    constructor(furniId: number, name: string)
    {
        this._data = [ furniId, name ];
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
