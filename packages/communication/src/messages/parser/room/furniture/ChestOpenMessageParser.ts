import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * The user used a chest furni: int chestId. AIR WIN63-202610121709 id 3966 (package_112/class_3066). The client
 * answers with ChestOpen (1595), like AIR WiredChestController.onOpenChest.
 */
export class ChestOpenMessageParser implements IMessageParser
{
    private _chestId: number = 0;

    public flush(): boolean
    {
        this._chestId = 0;
        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chestId = wrapper.readInt();
        return true;
    }

    public get chestId(): number
    {
        return this._chestId;
    }
}
