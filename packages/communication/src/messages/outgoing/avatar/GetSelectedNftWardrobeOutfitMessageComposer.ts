import { IMessageComposer } from '@volt/api';

/** AIR package_34/class_3910.as:10: the avatar editor asks which avatar collectible the user wears (no fields). */
export class GetSelectedNftWardrobeOutfitMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetSelectedNftWardrobeOutfitMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetSelectedNftWardrobeOutfitMessageComposer>;

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
