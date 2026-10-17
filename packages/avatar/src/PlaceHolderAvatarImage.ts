import { AssetAliasCollection } from './alias';
import { AvatarFigureContainer } from './AvatarFigureContainer';
import { AvatarFigureShare, AvatarImage } from './AvatarImage';
import { AvatarAtlasCompositor } from './cache/AvatarAtlasCompositor';
import { AvatarFrameTextureCache } from './cache/AvatarFrameTextureCache';
import { AvatarStructure } from './AvatarStructure';
import { EffectAssetDownloadManager } from './EffectAssetDownloadManager';

export class PlaceHolderAvatarImage extends AvatarImage
{
    constructor(structure: AvatarStructure, assets: AssetAliasCollection, figure: AvatarFigureContainer, scale: string, effectManager: EffectAssetDownloadManager,
        frameTextures: AvatarFrameTextureCache = null, compositor: AvatarAtlasCompositor = null, figureShare: AvatarFigureShare = null)
    {
        super(structure, assets, figure, scale, effectManager, null, frameTextures, compositor, figureShare);
    }

    public isPlaceholder(): boolean
    {
        return true;
    }
}
