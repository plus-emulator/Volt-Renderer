import { IMessageComposer } from '@volt/api';

/** AIR package_193.class_3888. */
export class GetWiredContractContentsComposer implements IMessageComposer<[number]>
{
    private _data: [number];
    constructor(contractId: number)
    {
        this._data = [contractId];
    }
    public getMessageArray(): [number]
    {
        return this._data;
    }
    public dispose(): void
    { }
}
