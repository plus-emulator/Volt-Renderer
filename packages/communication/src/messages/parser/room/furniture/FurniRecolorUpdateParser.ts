import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** One official `RecolorUpdateData`: furni that now share one colour. */
export interface IFurniRecolorUpdate
{
    furniIds: number[];
    red: number;
    green: number;
    blue: number;
}

/**
 * October `package_71.class_4153` (3469): `int count [ int idCount [ int id ] short r, short g, short b ]`.
 * Answers a recolor request and is also pushed to the other users in the room.
 */
export class FurniRecolorUpdateParser implements IMessageParser
{
    private _updates: IFurniRecolorUpdate[];

    public flush(): boolean
    {
        this._updates = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        let totalUpdates = wrapper.readInt();

        while(totalUpdates > 0)
        {
            const furniIds: number[] = [];

            let totalIds = wrapper.readInt();

            while(totalIds > 0)
            {
                furniIds.push(wrapper.readInt());

                totalIds--;
            }

            this._updates.push({ furniIds, red: wrapper.readShort(), green: wrapper.readShort(), blue: wrapper.readShort() });

            totalUpdates--;
        }

        return true;
    }

    public get updates(): IFurniRecolorUpdate[]
    {
        return this._updates;
    }
}
