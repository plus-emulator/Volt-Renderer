import { IMessageComposer } from '@octane/api';
import { Byte } from '../../../codec/Byte';

/**
 * AIR 13 GetHotLooks: the avatar editor asks for up to `count` ready-made looks of the user's gender
 * (the official client always sends 20).
 */
export class GetHotLooksComposer implements IMessageComposer<[Byte]>
{
    private _data: [Byte];

    constructor(count: number = 20)
    {
        // package_126.class_2523 wraps the amount in a Byte: the official client sends one byte, not an int.
        this._data = [new Byte(count)];
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
