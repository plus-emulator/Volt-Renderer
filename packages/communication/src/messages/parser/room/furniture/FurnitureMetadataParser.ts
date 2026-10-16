import { IFurnitureMetadataEntry, IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * Plus-only furniture metadata batch (header 5120): `int count [ int itemId, int stackable, int isSeat, int isBed,
 * int walkable, int width, int length, int teleportTargetId ]`. The AIR furni entries do not carry these values.
 */
export class FurnitureMetadataParser implements IMessageParser
{
    private _entries: IFurnitureMetadataEntry[];

    public flush(): boolean
    {
        this._entries = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._entries = [];

        let totalItems = wrapper.readInt();

        while(totalItems > 0)
        {
            this._entries.push({
                itemId: wrapper.readInt(),
                allowStack: (wrapper.readInt() === 1),
                allowSit: (wrapper.readInt() === 1),
                allowLay: (wrapper.readInt() === 1),
                allowWalk: (wrapper.readInt() === 1),
                dimensionsX: wrapper.readInt(),
                dimensionsY: wrapper.readInt(),
                teleportTargetId: wrapper.readInt()
            });

            totalItems--;
        }

        return true;
    }

    public get entries(): IFurnitureMetadataEntry[]
    {
        return this._entries;
    }
}
