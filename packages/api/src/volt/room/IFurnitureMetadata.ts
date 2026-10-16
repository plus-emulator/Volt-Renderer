/** Plus-only furniture metadata batch (header 5120), keyed by item id. */
export interface IFurnitureMetadata
{
    allowStack: boolean;
    allowSit: boolean;
    allowLay: boolean;
    allowWalk: boolean;
    dimensionsX: number;
    dimensionsY: number;
    teleportTargetId: number;
}

export interface IFurnitureMetadataEntry extends IFurnitureMetadata
{
    itemId: number;
}
