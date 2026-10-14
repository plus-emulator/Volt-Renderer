import { IMessageDataWrapper } from '@volt/api';
import { readWiredCount } from './WiredEditorData';

export const WIRED_LABEL_TYPE_LABEL = 0;
export const WIRED_LABEL_TYPE_REGION = 1;

/** FurnitureLabelData: a speech-bubble label on a wf_label furni. */
export interface IWiredLabelData
{
    type: 0;
    furnitureId: number;
    text: string;
    bubbleColor: number;
    /** 0 everyone, 1 users with wired read rights. */
    visibility: number;
    alwaysOpen: boolean;
}

/** FurnitureRegionData: named rectangles on a furniture_region furni. */
export interface IWiredRegionData
{
    type: 1;
    furnitureId: number;
    title: string;
    description: string;
    xOffset: number;
    yOffset: number;
    minWidth: number;
    minHeight: number;
    color: string;
    areas: { x: number; y: number; width: number; height: number }[];
}

export type WiredLabelOrRegion = IWiredLabelData | IWiredRegionData;

/** class_4102.parse (L9, WIN63-202610131318); any type other than 0 or 1 fails the message. */
export function parseWiredLabelOrRegion(wrapper: IMessageDataWrapper): WiredLabelOrRegion
{
    const type = wrapper.readInt();
    const furnitureId = wrapper.readInt();
    const text = wrapper.readString();

    if(type === WIRED_LABEL_TYPE_LABEL)
    {
        return { type, furnitureId, text, bubbleColor: wrapper.readInt(), visibility: wrapper.readInt(), alwaysOpen: wrapper.readBoolean() };
    }

    if(type === WIRED_LABEL_TYPE_REGION)
    {
        const description = wrapper.readString();
        const xOffset = wrapper.readInt();
        const yOffset = wrapper.readInt();
        const minWidth = wrapper.readInt();
        const minHeight = wrapper.readInt();
        const color = wrapper.readString();
        const areas = Array.from({ length: readWiredCount(wrapper) }, () => ({ x: wrapper.readInt(), y: wrapper.readInt(), width: wrapper.readInt(), height: wrapper.readInt() }));

        return { type, furnitureId, title: text, description, xOffset, yOffset, minWidth, minHeight, color, areas };
    }

    throw new Error('Unsupported Wired label type');
}
