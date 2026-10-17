import { Rectangle, Texture } from 'pixi.js';
import { IRoomGeometry } from '../../IRoomGeometry';
import { IRoomObject } from '../IRoomObject';
import { IObjectVisualizationData } from './IRoomObjectVisualizationData';

export interface IRoomObjectVisualization
{
    initialize(data: IObjectVisualizationData): boolean;
    dispose(): void;
    // visible: false when none of the object's sprites made it on screen last frame.
    update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean, visible?: boolean): void;
    getBoundingRectangle(): Rectangle;
    getImage(): Texture;
    instanceId: number;
    object: IRoomObject;
    image: Texture;
    updateSpriteCounter: number;
}
