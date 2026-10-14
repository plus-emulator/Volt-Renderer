import { IMessageComposer } from '@volt/api';

/** Renames a WIRED Link network, package_129.class_3841 (out 2794 in WIN63-202610131318). */
export class WiredLinkRenameNetworkComposer implements IMessageComposer<ConstructorParameters<typeof WiredLinkRenameNetworkComposer>>
{
    private _data: ConstructorParameters<typeof WiredLinkRenameNetworkComposer>;

    constructor(furniId: number, networkId: string, name: string)
    {
        this._data = [ furniId, networkId, name ];
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
