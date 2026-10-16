import { RoomObjectVisualizationType } from '@volt/api';
import { describe, expect, it } from 'vitest';
import { FurnitureVisualization } from './object';
import { RoomObjectVisualizationFactory } from './RoomObjectVisualizationFactory';

// AIR WIN63-202610131318-860371703 RoomObjectVisualizationFactory.as:180-186: wf_label.hab declares "furniture_label",
// and "furniture_region" exists too; both are plain FurnitureVisualization subclasses (class_1845, class_1848).
describe('RoomObjectVisualizationFactory furniture_label / furniture_region', () =>
{
    it.each([ RoomObjectVisualizationType.FURNITURE_LABEL, RoomObjectVisualizationType.FURNITURE_REGION ])('maps %s to FurnitureVisualization', type =>
    {
        expect(new RoomObjectVisualizationFactory().getVisualizationType(type)).toBe(FurnitureVisualization);
    });
});
