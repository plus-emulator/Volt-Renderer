import { IMessageDataWrapper } from '@volt/api';

export class CraftingResultObjectParser
{
    private _recipeName: string;
    private _productCode: string;
    private _itemName: string;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._recipeName = wrapper.readString();
        this._productCode = wrapper.readString();
        this._itemName = wrapper.readString();
    }

    public get recipeName(): string
    {
        return this._recipeName;
    }

    public get productCode(): string
    {
        return this._productCode;
    }

    public get itemName(): string
    {
        return this._itemName;
    }
}
