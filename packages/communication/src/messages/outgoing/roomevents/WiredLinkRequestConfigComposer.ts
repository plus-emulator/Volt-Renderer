import { IMessageComposer } from '@volt/api';

/** Asks for the configuration of an owned WIRED Link, package_129.class_2716 (out 3208 in WIN63-202610131318). */
export class WiredLinkRequestConfigComposer implements IMessageComposer<ConstructorParameters<typeof WiredLinkRequestConfigComposer>>
{
    private _data: ConstructorParameters<typeof WiredLinkRequestConfigComposer>;

    constructor(furniId: number)
    {
        this._data = [ furniId ];
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
