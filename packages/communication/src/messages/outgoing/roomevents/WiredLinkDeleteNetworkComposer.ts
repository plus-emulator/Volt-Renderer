import { IMessageComposer } from '@volt/api';

/** Deletes a WIRED Link network, package_129.class_3622 (out 2731 in WIN63-202610131318). */
export class WiredLinkDeleteNetworkComposer implements IMessageComposer<ConstructorParameters<typeof WiredLinkDeleteNetworkComposer>>
{
    private _data: ConstructorParameters<typeof WiredLinkDeleteNetworkComposer>;

    constructor(furniId: number, networkId: string)
    {
        this._data = [ furniId, networkId ];
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
