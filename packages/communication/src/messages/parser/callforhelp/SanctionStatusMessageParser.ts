import { IMessageDataWrapper, IMessageParser } from '@volt/api';

export interface ISanctionStatusType
{
    name: string;
    lengthHours: number;
    probationDays: number;
}

export interface ISanctionStatusEntry
{
    sanction: ISanctionStatusType;
    reason: string;
    isGradual: boolean;
    probationHoursLeft: number;
    nextSanction: ISanctionStatusType;
}

// AIR WIN63-202610151745-318700621 package_58/class_2526.as:24
export class SanctionStatusMessageParser implements IMessageParser
{
    private _sanctions: ISanctionStatusEntry[];

    public flush(): boolean
    {
        this._sanctions = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._sanctions = [];

        let count = wrapper.readInt();

        while(count > 0)
        {
            const sanction = this.readSanctionType(wrapper);
            const reason = wrapper.readString();
            const isGradual = wrapper.readBoolean();
            const probationHoursLeft = wrapper.readInt();
            const nextSanction = this.readSanctionType(wrapper);

            this._sanctions.push({ sanction, reason, isGradual, probationHoursLeft, nextSanction });

            count--;
        }

        return true;
    }

    private readSanctionType(wrapper: IMessageDataWrapper): ISanctionStatusType
    {
        const name = wrapper.readString();
        const lengthHours = wrapper.readInt();
        const probationDays = wrapper.readInt();

        return { name, lengthHours, probationDays };
    }

    public get sanctions(): ISanctionStatusEntry[]
    {
        return this._sanctions;
    }
}
