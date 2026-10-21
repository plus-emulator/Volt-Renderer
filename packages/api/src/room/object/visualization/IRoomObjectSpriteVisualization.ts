import { RoomObjectSpriteData } from '../../RoomObjectSpriteData';
import { IRoomObjectGraphicVisualization } from './IRoomObjectGraphicVisualization';
import { IRoomObjectSprite } from './IRoomObjectSprite';

export interface IRoomObjectSpriteVisualization extends IRoomObjectGraphicVisualization
{
    getSprite(index: number): IRoomObjectSprite;
    getSpriteList(): RoomObjectSpriteData[];
    sprites: IRoomObjectSprite[];
    // Drawn after `sprites` but not part of the object's layers, such as a wired highlight glow.
    additionalSprites?: IRoomObjectSprite[];
    updateObjectCounter: number;
    updateModelCounter: number;
}
