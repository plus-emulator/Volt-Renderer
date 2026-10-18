import { IMessageComposer } from '@volt/api';

/** AIR package_34/GetUserNftWardrobeMessageComposer.as:10: the avatar editor asks for the user's avatar collectibles (no fields). */
export class GetUserNftWardrobeMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetUserNftWardrobeMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetUserNftWardrobeMessageComposer>;

    constructor()
    {
        this._data = [];
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
