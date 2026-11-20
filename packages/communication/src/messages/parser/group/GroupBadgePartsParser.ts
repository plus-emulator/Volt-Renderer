import { IMessageDataWrapper, IMessageParser } from '@volt/api';

export class GroupBadgePartsParser implements IMessageParser
{
    private _bases: Map<number, string[]>;
    private _symbols: Map<number, string[]>;
    private _partColors: Map<number, string>;
    private _colorsA: Map<number, string>;
    private _colorsB: Map<number, string>;
    private _baseCodeIds: Map<number, number>;
    private _symbolCodeIds: Map<number, number>;

    flush(): boolean
    {
        this._bases = new Map();
        this._symbols = new Map();
        this._partColors = new Map();
        this._colorsA = new Map();
        this._colorsB = new Map();
        this._baseCodeIds = new Map();
        this._symbolCodeIds = new Map();

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        let basesCount = wrapper.readInt();

        while(basesCount > 0)
        {
            const id = wrapper.readInt();
            const valueA = wrapper.readString();
            const valueB = wrapper.readString();

            this._bases.set(id, [valueA, valueB]);
            basesCount--;
        }

        let symbolsCount = wrapper.readInt();

        while(symbolsCount > 0)
        {
            const id = wrapper.readInt();
            const valueA = wrapper.readString();
            const valueB = wrapper.readString();

            this._symbols.set(id, [valueA, valueB]);
            symbolsCount--;
        }

        let partColorsCount = wrapper.readInt();

        while(partColorsCount > 0)
        {
            const id = wrapper.readInt();
            const color = wrapper.readString();

            this._partColors.set(id, color);
            partColorsCount--;
        }

        let colorsACount = wrapper.readInt();

        while(colorsACount > 0)
        {
            const id = wrapper.readInt();
            const color = wrapper.readString();

            this._colorsA.set(id, color);
            colorsACount--;
        }

        let colorsBCount = wrapper.readInt();

        while(colorsBCount > 0)
        {
            const id = wrapper.readInt();
            const color = wrapper.readString();

            this._colorsB.set(id, color);
            colorsBCount--;
        }

        if(!wrapper.bytesAvailable) return true;

        this.readCodeIds(wrapper, [...this._bases.keys()], this._baseCodeIds);
        this.readCodeIds(wrapper, [...this._symbols.keys()], this._symbolCodeIds);

        return true;
    }

    /** Parts are listed by editor id. Their badge code ids follow in the same order. */
    private readCodeIds(wrapper: IMessageDataWrapper, editorIds: number[], codeIds: Map<number, number>): void
    {
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const codeId = wrapper.readInt();

            if(i < editorIds.length) codeIds.set(editorIds[i], codeId);
        }
    }

    public get bases(): Map<number, string[]>
    {
        return this._bases;
    }

    public get symbols(): Map<number, string[]>
    {
        return this._symbols;
    }

    /** Editor id to badge code id for each base; empty when the server sends no code ids. */
    public get baseCodeIds(): Map<number, number>
    {
        return this._baseCodeIds;
    }

    /** Editor id to badge code id for each symbol; empty when the server sends no code ids. */
    public get symbolCodeIds(): Map<number, number>
    {
        return this._symbolCodeIds;
    }

    public get partColors(): Map<number, string>
    {
        return this._partColors;
    }

    public get colorsA(): Map<number, string>
    {
        return this._colorsA;
    }

    public get colorsB(): Map<number, string>
    {
        return this._colorsB;
    }
}
