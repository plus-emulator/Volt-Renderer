import { IMessageComposer } from '@volt/api';

/**
 * Claims a free product (AIR WIN63-202610151745-318700621 package_143/class_2610.as:12-21). The choice is only written
 * when it is not -1; the cursed dragon adoption sends 0 for the blue and 1 for the purple package.
 */
export class ClaimProductMessageComposer implements IMessageComposer<(string | number)[]>
{
    private _data: (string | number)[];

    constructor(claimId: string, choice: number = -1)
    {
        this._data = [claimId];

        if (choice !== -1) this._data.push(choice);
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
