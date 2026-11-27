import { IMessageDataWrapper, IMessageParser } from '@volt/api';

export class RoomWalkPreviewParser implements IMessageParser
{
    public requestId: number;
    public roomId: number;
    public x: number;
    public y: number;
    public originX: number;
    public originY: number;
    public route: { x: number; y: number }[] | null = null;

    public flush(): boolean
    {
        this.route = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this.requestId = wrapper.readInt();
        this.roomId = wrapper.readInt();
        this.x = wrapper.readInt();
        this.y = wrapper.readInt();
        this.originX = wrapper.readInt();
        this.originY = wrapper.readInt();

        const count = wrapper.readInt();

        if(count === -1) return true;
        if(count < 0 || count > 512 || (wrapper.remainingBytes !== undefined && wrapper.remainingBytes < count * 8)) return false;

        this.route = [];

        for(let i = 0; i < count; i++) this.route.push({ x: wrapper.readInt(), y: wrapper.readInt() });

        return true;
    }
}
