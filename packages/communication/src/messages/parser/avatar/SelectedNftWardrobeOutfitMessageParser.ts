import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR package_213/class_4241.as:28: the worn avatar collectible and the look to fall back to outside the collectibles tab. */
export class SelectedNftWardrobeOutfitMessageParser implements IMessageParser
{
    private _currentTokenId: string = null;
    private _fallbackFigureString: string = '';
    private _fallbackFigureGender: string = '';

    public flush(): boolean
    {
        this._fallbackFigureString = '';
        this._fallbackFigureGender = '';

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._currentTokenId = wrapper.readString();
        this._fallbackFigureString = wrapper.readString();
        this._fallbackFigureGender = wrapper.readString();

        return true;
    }

    public get currentTokenId(): string
    {
        return this._currentTokenId;
    }

    public get fallbackFigureString(): string
    {
        return this._fallbackFigureString;
    }

    public get fallbackFigureGender(): string
    {
        return this._fallbackFigureGender;
    }
}
