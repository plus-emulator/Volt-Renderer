import { IMessageComposer } from '@volt/api';

/** AIR package_34/SaveUserNftWardrobeMessageComposer.as:10: wear the avatar collectible with this wardrobe id. */
export class SaveUserNftWardrobeMessageComposer implements IMessageComposer<ConstructorParameters<typeof SaveUserNftWardrobeMessageComposer>>
{
    private _data: ConstructorParameters<typeof SaveUserNftWardrobeMessageComposer>;

    constructor(id: string)
    {
        this._data = [id];
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
