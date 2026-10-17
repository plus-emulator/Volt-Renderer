import { MapDataType, RoomObjectVariable } from '@volt/api';
import { ObjectDataUpdateMessage, RoomObjectUpdateMessage } from '../../../messages';
import { FurnitureMultiStateLogic } from './FurnitureMultiStateLogic';

/**
 * AIR WIN63-202610131318-860371703 `room/object/logic/furniture/class_2297.as:7` (`furniture_recolorable`).
 * The colour travels as the MapData keys `r`, `g` and `b`; anything else paints the furni white.
 */
export class FurnitureRecolorableLogic extends FurnitureMultiStateLogic
{
    public static DEFAULT_COLOR: number = 0xFFFFFF;

    public processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        super.processUpdateMessage(message);

        if(!(message instanceof ObjectDataUpdateMessage) || !message.data || !this.object) return;

        const data = message.data;
        let color = FurnitureRecolorableLogic.DEFAULT_COLOR;

        if(data instanceof MapDataType)
        {
            color = ((FurnitureRecolorableLogic.readChannel(data, 'r') << 16) | (FurnitureRecolorableLogic.readChannel(data, 'g') << 8) | FurnitureRecolorableLogic.readChannel(data, 'b')) >>> 0;
        }

        this.object.model.setValue(RoomObjectVariable.FURNITURE_RECOLORABLE_COLOR, color);
    }

    // class_2297.as:32: one to three digits up to 255, otherwise full channel.
    private static readChannel(data: MapDataType, key: string): number
    {
        const value = data.getValue(key);

        if((value === undefined) || (value === null) || !/^[0-9]{1,3}$/.test(value)) return 255;

        const channel = parseInt(value, 10);

        return (channel > 255) ? 255 : channel;
    }
}
