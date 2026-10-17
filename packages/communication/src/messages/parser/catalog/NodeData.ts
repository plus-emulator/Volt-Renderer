import { IMessageDataWrapper } from '@volt/api';

// AIR WIN63-202610151745-318700621 package_5/class_3470.as:23
export class NodeData
{
    private _visible: boolean;
    private _icon: number;
    private _pageId: number;
    private _pageName: string;
    private _localization: string;
    private _children: NodeData[];
    private _offerIds: number[];

    constructor(wrapper: IMessageDataWrapper, depth: number = 0)
    {
        if(!wrapper) throw new Error('invalid_wrapper');

        this.flush();
        this.parse(wrapper, depth);
    }

    public flush(): boolean
    {
        this._visible = false;
        this._icon = 0;
        this._pageId = -1;
        this._pageName = null;
        this._localization = null;
        this._children = [];
        this._offerIds = [];

        return true;
    }

    private static readonly MAX_DEPTH: number = 20;
    private static readonly MIN_CHILD_BYTES: number = 21;

    private static requireBytes(wrapper: IMessageDataWrapper, amount: number, field: string): void
    {
        const remaining = wrapper.remainingBytes;

        if((typeof remaining === 'number') && (remaining < amount))
        {
            throw new Error(`Catalog index packet truncated while reading ${ field }`);
        }
    }

    private static readBoolean(wrapper: IMessageDataWrapper, field: string): boolean
    {
        NodeData.requireBytes(wrapper, 1, field);

        return wrapper.readBoolean();
    }

    private static readInt(wrapper: IMessageDataWrapper, field: string): number
    {
        NodeData.requireBytes(wrapper, 4, field);

        return wrapper.readInt();
    }

    private static readString(wrapper: IMessageDataWrapper, field: string): string
    {
        NodeData.requireBytes(wrapper, 2, field);

        const value = wrapper.readString();
        const remaining = wrapper.remainingBytes;

        if((typeof remaining === 'number') && (remaining < 0))
        {
            throw new Error(`Catalog index packet truncated while reading ${ field }`);
        }

        return value;
    }

    public parse(wrapper: IMessageDataWrapper, depth: number = 0): boolean
    {
        if(!wrapper) return false;

        this._visible = NodeData.readBoolean(wrapper, 'node visibility');
        this._icon = NodeData.readInt(wrapper, 'node icon');
        this._pageId = NodeData.readInt(wrapper, 'page id');
        this._pageName = NodeData.readString(wrapper, 'page name');
        this._localization = NodeData.readString(wrapper, 'page localization');

        const totalOffers = NodeData.readInt(wrapper, 'offer count');

        if(totalOffers < 0) throw new Error(`Catalog index offer count ${ totalOffers } is invalid`);

        NodeData.requireBytes(wrapper, (totalOffers * 4) + 4, 'offer id');

        for(let index = 0; index < totalOffers; index++)
        {
            this._offerIds.push(NodeData.readInt(wrapper, 'offer id'));
        }

        const totalChildren = NodeData.readInt(wrapper, 'child count');

        if(totalChildren < 0) throw new Error(`Catalog index child count ${ totalChildren } is invalid`);

        NodeData.requireBytes(wrapper, totalChildren * NodeData.MIN_CHILD_BYTES, 'child node');

        if((totalChildren > 0) && (depth >= NodeData.MAX_DEPTH))
        {
            throw new Error(`Catalog index depth exceeds limit ${ NodeData.MAX_DEPTH }`);
        }

        for(let index = 0; index < totalChildren; index++)
        {
            this._children.push(new NodeData(wrapper, depth + 1));
        }

        return true;
    }

    public get visible(): boolean
    {
        return this._visible;
    }

    public get icon(): number
    {
        return this._icon;
    }

    public get pageId(): number
    {
        return this._pageId;
    }

    public get pageName(): string
    {
        return this._pageName;
    }

    public get localization(): string
    {
        return this._localization;
    }

    public get children(): NodeData[]
    {
        return this._children;
    }

    public get offerIds(): number[]
    {
        return this._offerIds;
    }
}
