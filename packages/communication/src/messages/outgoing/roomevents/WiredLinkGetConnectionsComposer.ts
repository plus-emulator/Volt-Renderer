import { IMessageComposer } from '@volt/api';

/** Asks for the connections of a WIRED Link network, package_129.class_3524 (out 2300 in WIN63-202610131318). */
export class WiredLinkGetConnectionsComposer implements IMessageComposer<ConstructorParameters<typeof WiredLinkGetConnectionsComposer>>
{
    private _data: ConstructorParameters<typeof WiredLinkGetConnectionsComposer>;

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
