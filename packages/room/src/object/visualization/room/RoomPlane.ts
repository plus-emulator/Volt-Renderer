import { IAssetPlaneVisualizationAnimatedLayer, IAssetPlaneVisualizationLayer, IAssetRoomVisualizationData, IRoomGeometry, IRoomPlane, IVector3D } from '@volt/api';
import { GetAssetManager } from '@volt/assets';
import { GetRenderer, GetTexturePool, PlaneMaskFilter, Vector3d } from '@volt/utils';
import { Container, Filter, Graphics, Matrix, Point, Rectangle, RenderTexture, Sprite, Texture, TilingSprite } from 'pixi.js';
import { RoomGeometry } from '../../../utils/RoomGeometry';
import { PlaneVisualizationAnimationLayer } from './animated';
import { RoomPlaneBitmapMask } from './RoomPlaneBitmapMask';
import { RoomPlaneRectangleMask } from './RoomPlaneRectangleMask';
import { PlaneMaskManager } from './mask';
import { MAX_ROOM_PLANE_PATCHES } from '../../../renderer/utils/RoomPlaneDisplay';
import { RoomPlaneDrawData } from './RoomPlaneDrawData';
import { IsRoomPlaneTileOpaque } from '../../../renderer/utils/RoomPlaneHitTest';
import { Randomizer } from './utils';

export class RoomPlane implements IRoomPlane
{
    public static HORIZONTAL_ANGLE_DEFAULT: number = 45;
    public static VERTICAL_ANGLE_DEFAULT: number = 30;
    public static PLANE_GEOMETRY: { [index: number]: IRoomGeometry } = {
        '32': new RoomGeometry(32, new Vector3d(RoomPlane.HORIZONTAL_ANGLE_DEFAULT, RoomPlane.VERTICAL_ANGLE_DEFAULT), new Vector3d(-10, 0, 0)),
        '64': new RoomGeometry(64, new Vector3d(RoomPlane.HORIZONTAL_ANGLE_DEFAULT, RoomPlane.VERTICAL_ANGLE_DEFAULT), new Vector3d(-10, 0, 0))
    };
    // The canvas draws planes straight from their tile (RoomPlaneDisplay) instead of a render texture the
    // size of the plane's bounding box (78 MB for a 100x100 floor, ~200 MB per big room). Only the area
    // around door/window masks, and the landscape behind them, is still baked, as small patches.
    // False is the old full-plane bake (renderer-config room.planes.direct, VoltDevTools.setPlaneRenderMode).
    public static DIRECT_DRAW: boolean = true;
    // Mask art drawn through the skew bleeds into the next pixel with linear filtering.
    private static PATCH_PADDING: number = 2;
    private static ANIMATION_UPDATE_INTERVAL: number = 500;
    private static EMPTY_CLEAR_CONTAINER: Container = new Container();
    private static LANDSCAPE_DEFAULT_BACKGROUND_COLOR: number = 0x84C6DF;

    public static TYPE_UNDEFINED: number = 0;
    public static TYPE_WALL: number = 1;
    public static TYPE_FLOOR: number = 2;
    public static TYPE_LANDSCAPE: number = 3;
    private static _uniqueIdCounter: number = 1;

    private _disposed: boolean = false;
    private _randomSeed: number;
    private _origin: IVector3D = new Vector3d();
    private _location: IVector3D = new Vector3d();
    private _leftSide: IVector3D = new Vector3d();
    private _rightSide: IVector3D = new Vector3d();
    private _normal: IVector3D = null;
    private _secondaryNormals: IVector3D[] = [];
    private _type: number;
    private _isVisible: boolean = false;
    private _offset: Point = new Point();
    private _relativeDepth: number = 0;
    private _color: number = 0;
    private _maskManager: PlaneMaskManager = null;
    private _id: string = null;
    private _uniqueId: number;
    private _cornerA: IVector3D = new Vector3d();
    private _cornerB: IVector3D = new Vector3d();
    private _cornerC: IVector3D = new Vector3d();
    private _cornerD: IVector3D = new Vector3d();
    private _textureOffsetX: number;
    private _textureOffsetY: number;
    private _textureMaxX: number;
    private _textureMaxY: number;
    private _width: number = 0;
    private _height: number = 0;
    private _hasTexture: boolean = true;
    private _canBeVisible: boolean = true;
    private _geometryUpdateId: number = -1;
    private _extraDepth: number = 0;
    private _isHighlighter: boolean = false;

    private _useMask: boolean;
    private _bitmapMasks: RoomPlaneBitmapMask[] = [];
    private _rectangleMasks: RoomPlaneRectangleMask[] = [];
    private _maskChanged: boolean = false;
    private _bitmapMasksOld: RoomPlaneBitmapMask[] = [];
    private _rectangleMasksOld: RoomPlaneRectangleMask[] = [];

    private _planeSprite: TilingSprite = null;
    private _planeTexture: Texture = null;
    private _maskFilter: Filter = null;

    private _animationLayers: PlaneVisualizationAnimationLayer[] = [];
    private _isAnimated: boolean = false;
    private _lastAnimationUpdate: number = 0;
    private _animationRenderTime: number = -1;
    private _animationCanvasWidth: number = 0;
    private _animationCanvasHeight: number = 0;
    private _landscapeRenderWidth: number = 0;
    private _landscapeRenderHeight: number = 0;
    private _landscapeOffsetX: number = 0;
    private _landscapeOffsetY: number = 0;
    private _landscapeBackgroundTexture: Texture = null;
    private _landscapeBackgroundTint: number = 0xffffff;
    private _landscapeForegroundTexture: Texture = null;
    private _landscapeForegroundTint: number = 0xffffff;
    private _landscapeBaseAlignBottom: boolean = false;
    private _landscapeForegroundAlignBottom: boolean = false;
    private _landscapeBackgroundColor: number = null;
    private _lastLandscapeDebugSignature: string = null;
    private _hasWindowMask: boolean = false;
    private _roomId: string = null;
    private _animationCanvas: RenderTexture = null;

    private _drawData: RoomPlaneDrawData = null;
    private _planeMatrix: Matrix = null;
    // Per patch: the plane pixels it covers and their baked texels.
    private _patchRects: Rectangle[] = [];
    private _patchSources: RenderTexture[] = [];
    private _patchLayoutId: number = 0;
    // A landscape is only seen through the holes of the wall in front of it, so it bakes just those areas.
    private _occluder: RoomPlane = null;
    private _occluderUsable: boolean = true;
    private _occluderLayoutId: number = -1;

    private _renderTarget: Texture = null;
    private _renderTransform: Matrix = null;

    constructor(origin: IVector3D, location: IVector3D, leftSide: IVector3D, rightSide: IVector3D, type: number, usesMask: boolean, secondaryNormals: IVector3D[], randomSeed: number, textureOffsetX: number = 0, textureOffsetY: number = 0, textureMaxX: number = 0, textureMaxY: number = 0)
    {
        this._randomSeed = randomSeed;
        this._origin.assign(origin);
        this._location.assign(location);
        this._leftSide.assign(leftSide);
        this._rightSide.assign(rightSide);
        this._normal = Vector3d.crossProduct(this._leftSide, this._rightSide);

        if(this._normal.length > 0) this._normal.multiply((1 / this._normal.length));

        if(secondaryNormals != null)
        {
            for(const entry of secondaryNormals)
            {
                if(!entry) continue;

                const vector = new Vector3d();

                vector.assign(entry);

                this._secondaryNormals.push(vector);
            }
        }

        this._type = type;
        this._textureOffsetX = textureOffsetX;
        this._textureOffsetY = textureOffsetY;
        this._textureMaxX = textureMaxX;
        this._textureMaxY = textureMaxY;
        this._useMask = usesMask;
        this._uniqueId = ++RoomPlane._uniqueIdCounter;
    }

    public dispose(): void
    {
        this._location = null;
        this._origin = null;
        this._leftSide = null;
        this._rightSide = null;
        this._normal = null;
        this._cornerA = null;
        this._cornerB = null;
        this._cornerC = null;
        this._cornerD = null;

        if(this._planeSprite) this._planeSprite.destroy({ children: true });

        if(this._planeTexture)
        {
            GetTexturePool().putTexture(this._planeTexture);

            this._planeTexture = null;
        }

        this.setPatchRects([]);
        this._drawData = null;
        this._renderTarget = null;

        if(this._animationLayers)
        {
            for(const layer of this._animationLayers)
            {
                if(layer) layer.dispose();
            }
            this._animationLayers = [];
        }

        if(this._animationCanvas)
        {
            this._animationCanvas.destroy(true);

            this._animationCanvas = null;
        }

        if(this._maskFilter)
        {
            this._maskFilter.destroy();
            this._maskFilter = null;
        }

        this._disposed = true;
    }

    public update(geometry: IRoomGeometry, timeSinceStartMs: number, needsUpdate: boolean = false): boolean
    {
        if(!geometry || this._disposed) return false;

        if(this._geometryUpdateId !== geometry.updateId)
        {
            this._geometryUpdateId = geometry.updateId;

            needsUpdate = true;
        }

        if(!this._canBeVisible)
        {
            this.releasePlaneTexture();
            return false;
        }

        const needsAnimationUpdate = this._isAnimated && this._type === RoomPlane.TYPE_LANDSCAPE &&
            (timeSinceStartMs - this._lastAnimationUpdate) >= RoomPlane.ANIMATION_UPDATE_INTERVAL;

        if(!needsUpdate && !needsAnimationUpdate)
        {
            if(!this._canBeVisible || !this.visible)
            {
                this.releasePlaneTexture();
                return false;
            }
        }

        if(needsUpdate)
        {
            let cosAngle = 0;

            cosAngle = Vector3d.cosAngle(geometry.directionAxis, this.normal);

            if(cosAngle > -0.001)
            {
                if(this._isVisible)
                {
                    this._isVisible = false;

                    this.releasePlaneTexture();

                    return true;
                }

                return false;
            }

            let i = 0;

            while(i < this._secondaryNormals.length)
            {
                cosAngle = Vector3d.cosAngle(geometry.directionAxis, this._secondaryNormals[i]);

                if(cosAngle > -0.001)
                {
                    if(this._isVisible)
                    {
                        this._isVisible = false;
                        this.releasePlaneTexture();
                        return true;
                    }

                    return false;
                }

                i++;
            }

            this.updateCorners(geometry);

            let relativeDepth = (Math.max(this._cornerA.z, this._cornerB.z, this._cornerC.z, this._cornerD.z) - geometry.getScreenPosition(this._origin).z);

            switch(this._type)
            {
                case RoomPlane.TYPE_FLOOR: {
                    relativeDepth = (relativeDepth - ((this._location.z + Math.min(0, this._leftSide.z, this._rightSide.z)) * 8));
                    break;
                }
                case RoomPlane.TYPE_LANDSCAPE:
                    relativeDepth = (relativeDepth + 0.02);
                    break;
            }

            this._relativeDepth = relativeDepth;
            this._isVisible = true;

            Randomizer.setSeed(this._randomSeed);

            const planeGeometry = RoomPlane.PLANE_GEOMETRY[geometry.scale];
            let width = (this._leftSide.length * geometry.scale);
            let height = (this._rightSide.length * geometry.scale);
            const normal = geometry.getCoordinatePosition(this._normal);

            const getTextureAndColorForPlane = (planeId: string, planeType: number, planeNormal: IVector3D) =>
            {
                const dataType: keyof IAssetRoomVisualizationData = (planeType === RoomPlane.TYPE_FLOOR) ? 'floorData' : (planeType === RoomPlane.TYPE_WALL) ? 'wallData' : 'landscapeData';

                const roomCollection = GetAssetManager().getCollection('room');
                let planeVisualizationData = roomCollection?.data?.roomVisualization?.[dataType];
                let plane = planeVisualizationData?.planes?.find(plane => (plane.id === planeId));
                let assetCollection = roomCollection;

                if(!plane && planeType === RoomPlane.TYPE_LANDSCAPE)
                {
                    const landscapeCollection = GetAssetManager().getCollection('landscape');
                    if(landscapeCollection?.data?.roomVisualization?.landscapeData)
                    {
                        planeVisualizationData = landscapeCollection.data.roomVisualization.landscapeData;
                        plane = planeVisualizationData?.planes?.find(p => (p.id === planeId));
                        if(plane) assetCollection = landscapeCollection;
                    }
                }

                if(!plane && planeType === RoomPlane.TYPE_LANDSCAPE)
                {
                    const roomCollection2 = GetAssetManager().getCollection('room');
                    const defaultPlaneData = roomCollection2?.data?.roomVisualization?.landscapeData;
                    plane = defaultPlaneData?.planes?.find(p => (p.id === 'default'));
                    if(plane)
                    {
                        planeVisualizationData = defaultPlaneData;
                        assetCollection = roomCollection2;
                    }
                }

                const pickVisualizationForScale = <T extends { size?: number }>(list: T[] | null | undefined): T | null =>
                {
                    if(!list || !list.length) return null;

                    const getVisualizationSize = (visualization: T) => (visualization.size ?? planeGeometry.scale);
                    const exact = list.find(visualization => (getVisualizationSize(visualization) === planeGeometry.scale));

                    if(exact) return exact;

                    let nearest = list[0];
                    let nearestDiff = Math.abs(getVisualizationSize(nearest) - planeGeometry.scale);

                    for(const visualization of list)
                    {
                        const diff = Math.abs(getVisualizationSize(visualization) - planeGeometry.scale);

                        if(diff < nearestDiff)
                        {
                            nearest = visualization;
                            nearestDiff = diff;
                        }
                    }

                    return nearest;
                };

                let planeVisualization = null;
                if(dataType === 'landscapeData')
                {
                    planeVisualization = (pickVisualizationForScale(plane?.animatedVisualization) ?? pickVisualizationForScale(plane?.visualizations));
                }
                else
                {
                    planeVisualization = pickVisualizationForScale(plane?.visualizations);
                }

                const layers = planeVisualization?.allLayers ?? [];
                const colorLayer = layers.find(layer => (layer as IAssetPlaneVisualizationLayer)?.color !== undefined) as IAssetPlaneVisualizationLayer;
                const materialLayers = layers.filter(layer => (layer as IAssetPlaneVisualizationLayer)?.materialId) as IAssetPlaneVisualizationLayer[];
                const planeColor = colorLayer?.color;
                const baseMaterialId = materialLayers[0]?.materialId;
                const foregroundMaterialId = materialLayers[1]?.materialId;
                const baseAlignBottom = materialLayers[0]?.align === 'bottom';
                const foregroundAlignBottom = materialLayers[1]?.align === 'bottom';

                const backgroundMaterialId = materialLayers[0]?.materialId;
                const hasDirectBackgroundColor = !!materialLayers[0]?.backgroundColor;
                let backgroundColorStr = materialLayers[0]?.backgroundColor;

                if(!backgroundColorStr && backgroundMaterialId)
                {
                    const findBackgroundColorByMaterial = () =>
                    {
                        for(const candidatePlane of planeVisualizationData?.planes ?? [])
                        {
                            const candidateVisualizations = [
                                ...(candidatePlane.visualizations ?? []),
                                ...(candidatePlane.animatedVisualization ?? [])
                            ];

                            for(const candidateVisualization of candidateVisualizations)
                            {
                                if(candidateVisualization?.size !== (planeVisualization?.size ?? planeGeometry.scale)) continue;

                                const candidateMaterialLayers = (candidateVisualization.allLayers ?? []).filter(layer => (layer as IAssetPlaneVisualizationLayer)?.materialId) as IAssetPlaneVisualizationLayer[];
                                const candidateBackgroundLayer = candidateMaterialLayers[0];

                                if(candidateBackgroundLayer?.materialId !== backgroundMaterialId) continue;

                                if(candidateBackgroundLayer.backgroundColor) return candidateBackgroundLayer.backgroundColor;
                            }
                        }

                        return null;
                    };

                    backgroundColorStr = findBackgroundColorByMaterial();
                }

                let backgroundColor: number = null;
                if(backgroundColorStr)
                {
                    backgroundColor = parseInt(backgroundColorStr.replace('#', ''), 16);
                }

                const backgroundColorSource = hasDirectBackgroundColor ? 'direct' : (backgroundColor !== null ? 'fallback-material' : 'none');

                const selectMaterialMatrixForNormal = (matrices = [], normal = null) =>
                {
                    if(!matrices.length) return null;
                    if(!normal) return matrices[0];

                    const matchesNormal = (matrix) =>
                    {
                        const minX = (matrix.normalMinX !== undefined) ? matrix.normalMinX : -1;
                        const maxX = (matrix.normalMaxX !== undefined) ? matrix.normalMaxX : 1;
                        const minY = (matrix.normalMinY !== undefined) ? matrix.normalMinY : -1;
                        const maxY = (matrix.normalMaxY !== undefined) ? matrix.normalMaxY : 1;

                        return ((normal.x >= minX) && (normal.x <= maxX) && (normal.y >= minY) && (normal.y <= maxY));
                    };

                    return matrices.find(matchesNormal) ?? matrices[0];
                };

                const selectBitmapForNormal = (bitmaps = [], normal = null) =>
                {
                    if(!bitmaps.length) return null;
                    if(!normal) return bitmaps[0];

                    const matchesNormal = (bitmap) =>
                    {
                        const minX = (bitmap.normalMinX !== undefined) ? bitmap.normalMinX : -1;
                        const maxX = (bitmap.normalMaxX !== undefined) ? bitmap.normalMaxX : 1;
                        const minY = (bitmap.normalMinY !== undefined) ? bitmap.normalMinY : -1;
                        const maxY = (bitmap.normalMaxY !== undefined) ? bitmap.normalMaxY : 1;

                        return ((normal.x >= minX) && (normal.x <= maxX) && (normal.y >= minY) && (normal.y <= maxY));
                    };

                    return bitmaps.find(matchesNormal) ?? bitmaps[0];
                };
                const getCollectionTexture = (name: string) =>
                {
                    if(!name || !assetCollection) return null;

                    return assetCollection.getTexture(name) ?? assetCollection.getTexture(`${ assetCollection.name }_${ name }`);
                };

                const resolveTextureForMaterial = (materialId: string) =>
                {
                    if(!materialId || !assetCollection) return null;

                    const planeTextureById = planeVisualizationData?.textures?.find(texture => (texture.id === materialId));
                    const planeMaterial = planeVisualizationData?.materials?.find(material => (material.id === materialId));
                    const planeMaterialMatrix = selectMaterialMatrixForNormal(planeMaterial?.matrices, planeNormal);
                    const planeMaterialTextureId = planeMaterialMatrix?.columns?.[0]?.cells?.[0]?.textureId ?? null;
                    const planeTexture = planeTextureById ?? planeVisualizationData?.textures?.find(texture => (texture.id === planeMaterialTextureId));
                    const planeBitmap = selectBitmapForNormal(planeTexture?.bitmaps, planeNormal);
                    const planeAssetName = planeBitmap?.assetName;

                    if(planeAssetName)
                    {
                        return assetCollection.getAsset(planeAssetName)?.texture ?? getCollectionTexture(planeAssetName);
                    }

                    if(planeMaterialTextureId)
                    {
                        return assetCollection.getAsset(planeMaterialTextureId)?.texture ?? getCollectionTexture(planeMaterialTextureId);
                    }

                    return assetCollection.getAsset(materialId)?.texture ?? getCollectionTexture(materialId);
                };

                const texture = resolveTextureForMaterial(baseMaterialId);
                const foregroundTexture = resolveTextureForMaterial(foregroundMaterialId);

                const animationLayers: PlaneVisualizationAnimationLayer[] = [];
                if(planeType === RoomPlane.TYPE_LANDSCAPE && planeVisualization?.allLayers)
                {
                    const animationAssetCollection = roomCollection;
                    for(const layer of planeVisualization.allLayers)
                    {
                        const animatedLayer = layer as IAssetPlaneVisualizationAnimatedLayer;
                        if(animatedLayer?.items && animatedLayer.items.length > 0)
                        {
                            const animLayer = new PlaneVisualizationAnimationLayer(animatedLayer.items, animationAssetCollection);
                            if(animLayer.hasItems) animationLayers.push(animLayer);
                        }
                    }
                }

                return { texture, foregroundTexture, color: planeColor, baseAlignBottom, foregroundAlignBottom, animationLayers, backgroundColor, backgroundColorSource, visualizationSize: (planeVisualization?.size ?? planeGeometry.scale) };
            };

            const planeData = getTextureAndColorForPlane(this._id, this._type, normal);
            const texture = this._hasTexture ? planeData.texture ?? Texture.WHITE : Texture.WHITE;

            const planeTileScale = ((planeData.visualizationSize > 0) ? (planeGeometry.scale / planeData.visualizationSize) : 1);

            // Geometry or material changes replace the tiling sprite and its owned mask children.
            if(this._planeSprite) this._planeSprite.destroy({ children: true });

            switch(this._type)
            {
                case RoomPlane.TYPE_FLOOR: {
                    const screenOrigin = planeGeometry.getScreenPoint(new Vector3d(0, 0, 0));
                    const screenHeightPoint = planeGeometry.getScreenPoint(new Vector3d(0, (height / planeGeometry.scale), 0));
                    const screenWidthPoint = planeGeometry.getScreenPoint(new Vector3d((width / planeGeometry.scale), 0, 0));

                    let x = 0;
                    let y = 0;

                    if(screenOrigin && screenHeightPoint && screenWidthPoint)
                    {
                        width = Math.round(Math.abs((screenOrigin.x - screenWidthPoint.x)));
                        height = Math.round(Math.abs((screenOrigin.x - screenHeightPoint.x)));

                        const pixelsPerUnit = (screenOrigin.x - planeGeometry.getScreenPoint(new Vector3d(1, 0, 0)).x);

                        x = (this._textureOffsetX * Math.trunc(Math.abs(pixelsPerUnit)));
                        y = (this._textureOffsetY * Math.trunc(Math.abs(pixelsPerUnit)));
                    }

                    if((x !== 0) || (y !== 0))
                    {
                        while(x < 0) x += texture.width;

                        while(y < 0) y += texture.height;
                    }

                    this._planeSprite = new TilingSprite({
                        texture,
                        width,
                        height,
                        tint: planeData.color,
                        tilePosition: {
                            x: (x % texture.width) + (this._textureOffsetX * texture.width),
                            y: (y % texture.height) + (this._textureOffsetY * texture.height)
                        }
                    });

                    this._planeSprite.tileScale.set(planeTileScale, planeTileScale);

                    break;
                }
                case RoomPlane.TYPE_WALL: {
                    const screenOrigin = planeGeometry.getScreenPoint(new Vector3d(0, 0, 0));
                    const screenHeightPoint = planeGeometry.getScreenPoint(new Vector3d(0, 0, (height / planeGeometry.scale)));
                    const screenWidthPoint = planeGeometry.getScreenPoint(new Vector3d(0, (width / planeGeometry.scale), 0));

                    if(screenOrigin && screenHeightPoint && screenWidthPoint)
                    {
                        width = Math.round(Math.abs((screenOrigin.x - screenWidthPoint.x)));
                        height = Math.round(Math.abs((screenOrigin.y - screenHeightPoint.y)));
                    }

                    this._planeSprite = new TilingSprite({
                        texture,
                        width,
                        height,
                        tint: planeData.color,
                        tilePosition: {
                            x: (this._textureOffsetX * texture.width),
                            y: (this._textureOffsetY * texture.height)
                        }
                    });

                    this._planeSprite.tileScale.set(planeTileScale, planeTileScale);

                    break;
                }
                case RoomPlane.TYPE_LANDSCAPE: {
                    const screenOrigin = planeGeometry.getScreenPoint(new Vector3d(0, 0, 0));
                    const screenDepthPoint = planeGeometry.getScreenPoint(new Vector3d(0, 0, 1));
                    const screenWidthPoint = planeGeometry.getScreenPoint(new Vector3d(0, 1, 0));

                    if(screenOrigin && screenDepthPoint && screenWidthPoint)
                    {
                        width = Math.round(Math.abs((((screenOrigin.x - screenWidthPoint.x) * width) / planeGeometry.scale)));
                        height = Math.round(Math.abs((((screenOrigin.y - screenDepthPoint.y) * height) / planeGeometry.scale)));
                    }

                    const renderMaxX = Math.trunc(this._textureMaxX * Math.abs((screenOrigin.x - screenWidthPoint.x)));
                    const renderMaxY = Math.trunc(this._textureMaxY * Math.abs((screenOrigin.y - screenDepthPoint.y)));
                    const renderOffsetX = Math.trunc(this._textureOffsetX * Math.abs((screenOrigin.x - screenWidthPoint.x)));
                    const renderOffsetY = Math.trunc(this._textureOffsetY * Math.abs((screenOrigin.y - screenDepthPoint.y)));

                    this._landscapeRenderWidth = width;
                    this._landscapeRenderHeight = height;
                    this._animationCanvasWidth = renderMaxX || width;
                    this._animationCanvasHeight = height;
                    this._landscapeOffsetX = renderOffsetX;
                    this._landscapeOffsetY = renderOffsetY;

                    if(this._animationLayers)
                    {
                        for(const layer of this._animationLayers)
                        {
                            if(layer) layer.dispose();
                        }
                    }
                    this._animationLayers = planeData.animationLayers || [];
                    this._isAnimated = this._animationLayers.length > 0;

                    this._landscapeBackgroundTexture = planeData.texture ?? null;
                    this._landscapeBackgroundTint = planeData.color ?? 0xffffff;
                    this._landscapeForegroundTexture = planeData.foregroundTexture ?? null;
                    const landscapeTint = planeData.color ?? this._color ?? 0xffffff;
                    this._landscapeForegroundTint = landscapeTint;
                    this._landscapeBaseAlignBottom = planeData.baseAlignBottom ?? false;
                    this._landscapeForegroundAlignBottom = planeData.foregroundAlignBottom ?? false;
                    this._landscapeBackgroundColor = planeData.backgroundColor ?? null;

                    const landscapeDebugPayload = {
                        planeId: this._id,
                        backgroundColor: this._landscapeBackgroundColor,
                        backgroundColorSource: planeData.backgroundColorSource,
                        backgroundTexture: this._landscapeBackgroundTexture?.label ?? this._landscapeBackgroundTexture?.source?.label ?? null,
                        foregroundTexture: this._landscapeForegroundTexture?.label ?? this._landscapeForegroundTexture?.source?.label ?? null,
                        hasCloudAnimation: this._isAnimated
                    };
                    const landscapeDebugSignature = JSON.stringify(landscapeDebugPayload);

                    if(this._lastLandscapeDebugSignature !== landscapeDebugSignature)
                    {
                        this._lastLandscapeDebugSignature = landscapeDebugSignature;
                    }

                    this._planeSprite = new TilingSprite({
                        texture: Texture.WHITE,
                        width,
                        height,
                        tilePosition: {
                            x: renderOffsetX,
                            y: renderOffsetY
                        },
                        tint: landscapeTint
                    });
                    this._landscapeBackgroundTint = landscapeTint;
                    break;
                }
                default: {
                    this._planeSprite = new TilingSprite({
                        texture: Texture.WHITE,
                        width: width,
                        height: height
                    });
                }
            }

            this._planeSprite.allowChildren = true;
        }

        if(needsUpdate || this._maskChanged)
        {
            this.updateMask(this._planeSprite, geometry);

            needsUpdate = true;
        }

        if(RoomPlane.DIRECT_DRAW) return this.updatePatches(needsUpdate, timeSinceStartMs, geometry);

        const previousTexture = this._planeTexture;

        if(this._planeTexture)
        {
            if(this._planeTexture.width !== this._width || this._planeTexture.height !== this._height)
            {
                GetTexturePool().putTexture(this._planeTexture);

                this._planeTexture = null;
            }
        }

        if(!this._planeTexture) this._planeTexture = GetTexturePool().getTexture(this._width, this._height);

        this._planeTexture.source.label = `room_plane_${ this._uniqueId.toString() }`;

        let animationUpdate = false;
        if(this._isAnimated && this._type === RoomPlane.TYPE_LANDSCAPE)
        {
            const timeSinceLastUpdate = timeSinceStartMs - this._lastAnimationUpdate;
            if((timeSinceLastUpdate >= RoomPlane.ANIMATION_UPDATE_INTERVAL) || (this._animationRenderTime < 0))
            {
                animationUpdate = true;
                this._lastAnimationUpdate = timeSinceStartMs;
                this._animationRenderTime = timeSinceStartMs;
            }
            else if(needsUpdate)
            {
                animationUpdate = true;
            }
        }

        const textureChanged = previousTexture !== this._planeTexture;

        if(needsUpdate || animationUpdate || textureChanged) this.renderPlaneBase(this._planeTexture, this.getPlaneMatrix(), geometry, timeSinceStartMs);

        return needsUpdate || animationUpdate || textureChanged;
    }

    private updatePatches(needsUpdate: boolean, timeSinceStartMs: number, geometry: IRoomGeometry): boolean
    {
        if(!this._planeSprite) return false;

        let layoutChanged = false;

        if(needsUpdate || (this._occluder && (this._occluder.patchLayoutId !== this._occluderLayoutId)))
        {
            layoutChanged = this.updateDrawData();
            needsUpdate = true;
        }

        let animationUpdate = false;

        if(this._isAnimated && (this._type === RoomPlane.TYPE_LANDSCAPE) && this._patchSources.length)
        {
            if(((timeSinceStartMs - this._lastAnimationUpdate) >= RoomPlane.ANIMATION_UPDATE_INTERVAL) || (this._animationRenderTime < 0))
            {
                animationUpdate = true;
                this._lastAnimationUpdate = timeSinceStartMs;
                this._animationRenderTime = timeSinceStartMs;
            }
        }

        if(needsUpdate || animationUpdate)
        {

            for(let i = 0; i < this._patchSources.length; i++)
            {
                const rect = this._patchRects[i];
                const transform = this._planeMatrix.clone().translate(-(rect.x), -(rect.y));

                this.renderPlaneBase(this._patchSources[i], transform, geometry, timeSinceStartMs);
            }
        }

        // An animation frame redraws the patches in place: the canvas already shows them.
        return (needsUpdate || layoutChanged);
    }

    private updateDrawData(): boolean
    {
        const width = this._width;
        const height = this._height;
        const sprite = this._planeSprite;
        const isLandscape = (this._type === RoomPlane.TYPE_LANDSCAPE);

        this._planeMatrix = this.getPlaneMatrix();

        if(!this._drawData) this._drawData = new RoomPlaneDrawData();

        const data = this._drawData;

        let direct = (!isLandscape && (width > 0) && (height > 0));
        let rects: Rectangle[] = [];

        if((width > 0) && (height > 0))
        {
            if(isLandscape)
            {
                rects = this.getLandscapePatchRects(width, height);
            }
            else if(sprite.children.length)
            {
                rects = this.getMaskPatchRects(width, height);

                if(!rects)
                {
                    direct = false;
                    rects = [ new Rectangle(0, 0, width, height) ];
                }
            }
        }

        data.width = width;
        data.height = height;
        data.direct = direct;
        // updateMask put PlaneMaskFilter on the sprite: the bake turned every pure black pixel transparent.
        data.blackIsTransparent = !!(sprite.filters && sprite.filters.length);

        if(direct) data.setTiling(sprite, this._planeMatrix);

        const layoutChanged = this.setPatchRects(rects);

        data.patches = this._patchRects.map((rect, index) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, texture: this._patchSources[index] }));
        data.version++;

        return layoutChanged;
    }

    // The bake's pixels differ from the plain tiling only under the mask sprites; each one's bounds, through
    // the plane matrix, become a patch. Null when there are too many to cut out: the whole plane is baked.
    private getMaskPatchRects(width: number, height: number): Rectangle[]
    {
        const matrix = new Matrix();
        const point = new Point();
        const rects: Rectangle[] = [];
        const padding = RoomPlane.PATCH_PADDING;

        for(const child of this._planeSprite.children)
        {
            if(!(child instanceof Sprite) || !child.texture) continue;

            child.updateLocalTransform();

            matrix.copyFrom(this._planeMatrix).append(child.localTransform);

            const orig = child.texture.orig;

            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            for(const [ x, y ] of [ [ 0, 0 ], [ orig.width, 0 ], [ orig.width, orig.height ], [ 0, orig.height ] ])
            {
                matrix.apply(point.set(x, y), point);

                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            }

            const left = Math.max(0, (Math.floor(minX) - padding));
            const top = Math.max(0, (Math.floor(minY) - padding));
            const right = Math.min(width, (Math.ceil(maxX) + padding));
            const bottom = Math.min(height, (Math.ceil(maxY) + padding));

            if((right <= left) || (bottom <= top)) continue;

            rects.push(new Rectangle(left, top, (right - left), (bottom - top)));
        }

        // Overlapping or touching patches become one: the shader reads at most MAX_ROOM_PLANE_PATCHES.
        let merged = true;

        while(merged)
        {
            merged = false;

            for(let i = 0; (i < rects.length) && !merged; i++)
            {
                for(let j = (i + 1); j < rects.length; j++)
                {
                    const a = rects[i];
                    const b = rects[j];

                    if((a.x > b.right) || (b.x > a.right) || (a.y > b.bottom) || (b.y > a.bottom)) continue;

                    const left = Math.min(a.x, b.x);
                    const top = Math.min(a.y, b.y);

                    rects[i] = new Rectangle(left, top, (Math.max(a.right, b.right) - left), (Math.max(a.bottom, b.bottom) - top));
                    rects.splice(j, 1);

                    merged = true;

                    break;
                }
            }
        }

        if(rects.length > MAX_ROOM_PLANE_PATCHES) return null;

        return rects;
    }

    // Behind an opaque wall only the wall's own patches can show the landscape. Anything else (walls
    // hidden, a see-through wall tile, a wall baked whole) bakes the landscape whole, as before.
    private getLandscapePatchRects(width: number, height: number): Rectangle[]
    {
        const occluder = this._occluder;

        this._occluderLayoutId = (occluder ? occluder.patchLayoutId : -1);

        if(occluder && this._occluderUsable && occluder.coversLandscape(width, height)) return occluder.patchRects.map(rect => rect.clone());

        return [ new Rectangle(0, 0, width, height) ];
    }

    private coversLandscape(width: number, height: number): boolean
    {
        const data = this._drawData;

        if(!this.visible || !data || !data.direct) return false;

        if((this._width !== width) || (this._height !== height)) return false;

        return IsRoomPlaneTileOpaque(data);
    }

    // Returns true when the patch layout changed (textures were replaced).
    private setPatchRects(rects: Rectangle[]): boolean
    {
        const sameRect = (a: Rectangle, b: Rectangle) => ((a.x === b.x) && (a.y === b.y) && (a.width === b.width) && (a.height === b.height));

        if((rects.length === this._patchRects.length) && rects.every((rect, index) => sameRect(rect, this._patchRects[index]))) return false;

        // Deferred a frame: a canvas display may still read them until it picks up the new draw data.
        for(const source of this._patchSources) GetTexturePool().releaseTexture(source, true);

        this._patchRects = rects;
        this._patchSources = rects.map((rect, index) =>
        {
            const source = RenderTexture.create({ width: rect.width, height: rect.height });

            source.source.label = `room_plane_${ this._uniqueId }_${ index }`;

            return source;
        });

        this._patchLayoutId++;

        return true;
    }

    private getPlaneMatrix(): Matrix
    {
        if(this._type === RoomPlane.TYPE_LANDSCAPE) return this.getMatrixForDimensions(this._landscapeRenderWidth, this._landscapeRenderHeight);

        return this.getMatrixForDimensions(this._planeSprite.width, this._planeSprite.height);
    }

    private releasePlaneTexture(): void
    {
        if(this._planeTexture)
        {
            GetTexturePool().putTexture(this._planeTexture);

            this._planeTexture = null;
        }

        if(this._patchRects.length)
        {
            this.setPatchRects([]);

            if(this._drawData)
            {
                this._drawData.patches = [];
                this._drawData.version++;
            }
        }
    }


    private renderPlaneBase(target: Texture, transform: Matrix, geometry: IRoomGeometry, timeSinceStartMs: number): void
    {
        if(!this._planeSprite || !target) return;

        this._renderTarget = target;
        this._renderTransform = transform;

        const isLandscape = (this._type === RoomPlane.TYPE_LANDSCAPE);
        const hasLandscapeLayeredRendering = (isLandscape && (this._landscapeBackgroundTexture !== null || this._landscapeForegroundTexture !== null || this._animationLayers.length > 0 || this._landscapeBackgroundColor !== null));

        if(hasLandscapeLayeredRendering)
        {
            if(this._landscapeBackgroundColor !== null)
            {
                this.renderBackgroundColor();
            }
            else
            {
                this.clearPlaneTexture();
            }
        }
        else
        {
            GetRenderer().render({
                target: this._renderTarget,
                container: this._planeSprite,
                transform: this._renderTransform,
                clear: true
            });
        }

        if(isLandscape && this._landscapeBackgroundTexture)
        {
            this.renderLandscapeLayer(this._landscapeBackgroundTexture, this._landscapeBackgroundTint, this._landscapeBaseAlignBottom);
        }

        if(this._isAnimated && isLandscape && this._animationLayers.length > 0)
        {
            this.renderAnimationLayers(((this._animationRenderTime >= 0) ? this._animationRenderTime : timeSinceStartMs), geometry);
        }

        if(isLandscape && this._landscapeForegroundTexture)
        {
            this.renderLandscapeLayer(this._landscapeForegroundTexture, this._landscapeForegroundTint, this._landscapeForegroundAlignBottom);
        }
    }

    private renderAnimationLayers(timeSinceStartMs: number, geometry: IRoomGeometry): void
    {
        if(!this._renderTarget || this._animationCanvasWidth <= 0 || this._animationCanvasHeight <= 0) return;

        const canvasWidth = this._landscapeRenderWidth;
        const canvasHeight = this._landscapeRenderHeight;

        if(canvasWidth <= 0 || canvasHeight <= 0) return;

        if(this._animationCanvas && ((this._animationCanvas.width !== canvasWidth) || (this._animationCanvas.height !== canvasHeight)))
        {
            this._animationCanvas.destroy(true);

            this._animationCanvas = null;
        }

        if(!this._animationCanvas) this._animationCanvas = RenderTexture.create({ width: canvasWidth, height: canvasHeight, scaleMode: 'nearest' });

        const animationCanvas = this._animationCanvas;

        GetRenderer().render({
            target: animationCanvas,
            container: RoomPlane.EMPTY_CLEAR_CONTAINER,
            clear: true
        });

        for(const layer of this._animationLayers)
        {
            if(!layer) continue;

            layer.render(
                animationCanvas,
                this._landscapeOffsetX,
                this._landscapeOffsetY,
                this._animationCanvasWidth,
                this._animationCanvasHeight,
                this._textureMaxX,
                this._textureMaxY,
                timeSinceStartMs
            );
        }

        const animContainer = new Container();
        const animSprite = new Sprite(animationCanvas);
        animContainer.addChild(animSprite);

        if(this._maskFilter)
        {
            animContainer.filters = [this._maskFilter];
        }

        if(this._planeSprite && this._planeSprite.children)
        {
            for(const child of this._planeSprite.children)
            {
                if(child instanceof Sprite)
                {
                    const maskClone = new Sprite(child.texture);
                    maskClone.position.copyFrom(child.position);
                    maskClone.scale.copyFrom(child.scale);
                    animContainer.addChild(maskClone);
                }
            }
        }

        const transform = this._renderTransform;

        GetRenderer().render({
            target: this._renderTarget,
            container: animContainer,
            transform,
            clear: false
        });

        animContainer.destroy({ children: true });
    }

    private renderLandscapeLayer(texture: Texture, tint: number, alignBottom: boolean): void
    {
        if(!this._renderTarget || !texture) return;

        const canvasWidth = this._landscapeRenderWidth;
        const canvasHeight = this._landscapeRenderHeight;

        if(canvasWidth <= 0 || canvasHeight <= 0) return;

        const layerHeight = Math.min(texture.height, canvasHeight);
        const layerPositionY = alignBottom ? (canvasHeight - layerHeight) : 0;
        const verticalCropOffset = (alignBottom && texture.height > layerHeight)
            ? (texture.height - layerHeight)
            : 0;

        const layerSprite = new TilingSprite({
            texture,
            width: canvasWidth,
            height: layerHeight,
            tilePosition: {
                x: this._landscapeOffsetX,
                y: this._landscapeOffsetY - verticalCropOffset
            },
            tint
        });
        layerSprite.y = layerPositionY;

        const layerContainer = new Container();
        layerContainer.addChild(layerSprite);

        if(this._maskFilter)
        {
            layerContainer.filters = [this._maskFilter];
        }

        if(this._planeSprite && this._planeSprite.children)
        {
            for(const child of this._planeSprite.children)
            {
                if(child instanceof Sprite)
                {
                    const maskClone = new Sprite(child.texture);
                    maskClone.position.copyFrom(child.position);
                    maskClone.scale.copyFrom(child.scale);
                    layerContainer.addChild(maskClone);
                }
            }
        }

        const transform = this._renderTransform;

        GetRenderer().render({
            target: this._renderTarget,
            container: layerContainer,
            transform,
            clear: false
        });

        layerContainer.destroy({ children: true });
    }

    private applyPlaneSpriteMasksTo(container: Container): void
    {
        if(!this._planeSprite || !this._planeSprite.children) return;

        for(const child of this._planeSprite.children)
        {
            if(child instanceof Sprite)
            {
                const maskClone = new Sprite(child.texture);
                maskClone.position.copyFrom(child.position);
                maskClone.scale.copyFrom(child.scale);
                container.addChild(maskClone);
            }
        }

        if(this._maskFilter && (container.children.length > 1)) container.filters = [this._maskFilter];
    }

    private renderBackgroundColor(): void
    {
        if(!this._renderTarget || this._landscapeBackgroundColor === null) return;

        const canvasWidth = this._landscapeRenderWidth;
        const canvasHeight = this._landscapeRenderHeight;

        if(canvasWidth <= 0 || canvasHeight <= 0) return;

        const colorGraphics = new Graphics();
        colorGraphics.rect(0, 0, canvasWidth, canvasHeight);
        colorGraphics.fill(this._landscapeBackgroundColor);

        const colorContainer = new Container();
        colorContainer.addChild(colorGraphics);

        this.applyPlaneSpriteMasksTo(colorContainer);

        const transform = this._renderTransform;

        GetRenderer().render({
            target: this._renderTarget,
            container: colorContainer,
            transform,
            clear: true
        });

        colorContainer.destroy({ children: true });
    }

    private clearPlaneTexture(): void
    {
        if(!this._renderTarget) return;

        const canvasWidth = this._landscapeRenderWidth;
        const canvasHeight = this._landscapeRenderHeight;

        if(canvasWidth <= 0 || canvasHeight <= 0)
        {
            const emptyContainer = new Container();

            GetRenderer().render({
                target: this._renderTarget,
                container: emptyContainer,
                clear: true
            });

            emptyContainer.destroy();

            return;
        }

        const colorGraphics = new Graphics();
        colorGraphics.rect(0, 0, canvasWidth, canvasHeight);
        colorGraphics.fill(RoomPlane.LANDSCAPE_DEFAULT_BACKGROUND_COLOR);

        const colorContainer = new Container();
        colorContainer.addChild(colorGraphics);

        this.applyPlaneSpriteMasksTo(colorContainer);

        const transform = this._renderTransform;

        GetRenderer().render({
            target: this._renderTarget,
            container: colorContainer,
            transform,
            clear: true
        });

        colorContainer.destroy({ children: true });
    }

    private updateCorners(geometry: IRoomGeometry): void
    {
        this._cornerA.assign(geometry.getScreenPosition(this._location));
        this._cornerB.assign(geometry.getScreenPosition(Vector3d.sum(this._location, this._rightSide)));
        this._cornerC.assign(geometry.getScreenPosition(Vector3d.sum(Vector3d.sum(this._location, this._leftSide), this._rightSide)));
        this._cornerD.assign(geometry.getScreenPosition(Vector3d.sum(this._location, this._leftSide)));

        this._offset = geometry.getScreenPoint(this._origin);

        this._cornerA.x = Math.round(this._cornerA.x);
        this._cornerA.y = Math.round(this._cornerA.y);
        this._cornerB.x = Math.round(this._cornerB.x);
        this._cornerB.y = Math.round(this._cornerB.y);
        this._cornerC.x = Math.round(this._cornerC.x);
        this._cornerC.y = Math.round(this._cornerC.y);
        this._cornerD.x = Math.round(this._cornerD.x);
        this._cornerD.y = Math.round(this._cornerD.y);
        this._offset.x = Math.round(this._offset.x);
        this._offset.y = Math.round(this._offset.y);

        const minX = Math.min(this._cornerA.x, this._cornerB.x, this._cornerC.x, this._cornerD.x);
        const maxX = Math.max(this._cornerA.x, this._cornerB.x, this._cornerC.x, this._cornerD.x) - minX;
        const minY = Math.min(this._cornerA.y, this._cornerB.y, this._cornerC.y, this._cornerD.y);
        const maxY = Math.max(this._cornerA.y, this._cornerB.y, this._cornerC.y, this._cornerD.y) - minY;

        this._offset.x = (this._offset.x - minX);
        this._cornerA.x = (this._cornerA.x - minX);
        this._cornerB.x = (this._cornerB.x - minX);
        this._cornerC.x = (this._cornerC.x - minX);
        this._cornerD.x = (this._cornerD.x - minX);

        this._offset.y = (this._offset.y - minY);
        this._cornerA.y = (this._cornerA.y - minY);
        this._cornerB.y = (this._cornerB.y - minY);
        this._cornerC.y = (this._cornerC.y - minY);
        this._cornerD.y = (this._cornerD.y - minY);

        this._width = maxX;
        this._height = maxY;

    }

    private getMatrixForDimensions(width: number, height: number): Matrix
    {
        let a: number = (this._cornerD.x - this._cornerC.x);
        let b: number = (this._cornerD.y - this._cornerC.y);
        let c: number = (this._cornerB.x - this._cornerC.x);
        let d: number = (this._cornerB.y - this._cornerC.y);

        if((this._type === RoomPlane.TYPE_WALL) || (this._type === RoomPlane.TYPE_LANDSCAPE))
        {
            if(Math.abs((c - width)) <= 1) c = width;

            if(Math.abs((d - width)) <= 1) d = width;

            if(Math.abs((a - height)) <= 1) a = height;

            if(Math.abs((b - height)) <= 1) b = height;
        }

        const xScale: number = (c / width);
        const ySkew: number = (d / width);
        const xSkew: number = (a / height);
        const yScale: number = (b / height);

        const matrix = new Matrix(xScale, ySkew, xSkew, yScale);

        matrix.translate(this._cornerC.x, this._cornerC.y);

        return matrix;
    }

    public resetBitmapMasks(): void
    {
        this._hasWindowMask = false;

        if(this._disposed || !this._useMask || !this._bitmapMasks.length) return;

        this._maskChanged = true;
        this._bitmapMasks = [];
    }

    public addBitmapMask(maskType: string, leftSideLoc: number, rightSideLoc: number): boolean
    {
        if(!this._useMask) return false;

        for(const mask of this._bitmapMasks)
        {
            if(!mask) continue;

            if((((mask.type === maskType) && (mask.leftSideLoc === leftSideLoc)) && (mask.rightSideLoc === rightSideLoc))) return false;
        }

        const mask = new RoomPlaneBitmapMask(maskType, leftSideLoc, rightSideLoc);

        this._bitmapMasks.push(mask);
        this._maskChanged = true;

        return true;
    }

    public addWindowMask(leftSideLoc: number, rightSideLoc: number): void
    {
        this._hasWindowMask = true;
    }

    public resetRectangleMasks(): void
    {
        if(!this._useMask || !this._rectangleMasks.length) return;

        this._maskChanged = true;
        this._rectangleMasks = [];
    }

    public addRectangleMask(leftLocation: number, rightLocation: number, leftLength: number, rightLength: number): boolean
    {
        if(this._useMask)
        {
            for(const mask of this._rectangleMasks)
            {
                if(!mask) continue;

                if((((mask.leftSideLoc === leftLocation) && (mask.rightSideLoc === rightLocation)) && (mask.leftSideLength === leftLength)) && (mask.rightSideLength === rightLength)) return false;
            }

            this._rectangleMasks.push(new RoomPlaneRectangleMask(leftLocation, rightLocation, leftLength, rightLength));
            this._maskChanged = true;

            return true;
        }

        return false;
    }

    private updateMask(container: Container, geometry: IRoomGeometry): boolean
    {
        if(container?.children.length)
        {
            for(const child of container.removeChildren()) child.destroy({ children: true });
        }

        this._maskChanged = false;
        if(container?.filters?.length) container.filters = null;

        if(!container || !geometry || !this._useMask || (!this._bitmapMasks.length && !this._rectangleMasks.length) || !this._maskManager) return false;

        const normal = geometry.getCoordinatePosition(this._normal);

        let type: string = null;
        let posX = 0;
        let posY = 0;
        let i = 0;

        while(i < this._bitmapMasks.length)
        {
            const mask = this._bitmapMasks[i];

            if(mask)
            {
                type = mask.type;
                posX = (container.width - ((container.width * mask.leftSideLoc) / this._leftSide.length));
                posY = (container.height - ((container.height * mask.rightSideLoc) / this._rightSide.length));

                this._maskManager.addMaskToContainer(container, type, geometry.scale, normal, posX, posY);
            }

            i++;
        }

        i = 0;

        while(i < this._rectangleMasks.length)
        {
            const rectMask = this._rectangleMasks[i];

            if(rectMask)
            {
                posX = (container.width - ((container.width * rectMask.leftSideLoc) / this._leftSide.length));
                posY = (container.height - ((container.height * rectMask.rightSideLoc) / this._rightSide.length));

                const wd = ((container.width * rectMask.leftSideLength) / this._leftSide.length);
                const ht = ((container.height * rectMask.rightSideLength) / this._rightSide.length);

                const maskSprite = new Sprite(Texture.WHITE);

                maskSprite.tint = 0x000000;
                maskSprite.width = wd;
                maskSprite.height = ht;
                maskSprite.position.set(Math.trunc((posX - wd)), Math.trunc((posY - ht)));

                container.addChild(maskSprite);
            }

            i++;
        }

        this._maskChanged = false;

        if(!this._maskFilter) this._maskFilter = new PlaneMaskFilter({});

        if(!container.filters) container.filters = [ this._maskFilter ];

        return true;
    }

    public get canBeVisible(): boolean
    {
        return this._canBeVisible;
    }

    public set canBeVisible(flag: boolean)
    {
        if(flag === this._canBeVisible) return;

        this._canBeVisible = flag;
        this._geometryUpdateId = -1;
    }

    public get visible(): boolean
    {
        return (this._isVisible && this._canBeVisible);
    }

    public get offset(): Point
    {
        return this._offset;
    }

    public get relativeDepth(): number
    {
        return (this._relativeDepth + this._extraDepth);
    }

    public set extraDepth(value: number)
    {
        this._extraDepth = value;
    }

    public get color(): number
    {
        return this._color;
    }

    public set color(value: number)
    {
        this._color = value;
    }

    public get type(): number
    {
        return this._type;
    }

    public get leftSide(): IVector3D
    {
        return this._leftSide;
    }

    public get rightSide(): IVector3D
    {
        return this._rightSide;
    }

    public get location(): IVector3D
    {
        return this._location;
    }

    public get normal(): IVector3D
    {
        return this._normal;
    }

    public set id(value: string)
    {
        if(value === this._id) return;

        this._id = value;
    }

    public set maskManager(value: PlaneMaskManager)
    {
        this._maskManager = value;
    }

    public set roomId(value: string)
    {
        this._roomId = value;
    }

    public get uniqueId(): number
    {
        return this._uniqueId;
    }

    public get planeTexture(): Texture
    {
        return this._planeTexture;
    }

    // What the canvas draws when DIRECT_DRAW is on; null for the full-plane bake (planeTexture).
    public get drawData(): RoomPlaneDrawData
    {
        return (RoomPlane.DIRECT_DRAW ? this._drawData : null);
    }

    public get patchLayoutId(): number
    {
        return this._patchLayoutId;
    }

    public get patchRects(): Rectangle[]
    {
        return this._patchRects;
    }

    public set occluder(plane: RoomPlane)
    {
        this._occluder = plane;
    }

    public set occluderUsable(flag: boolean)
    {
        this._occluderUsable = flag;
    }

    public set hasTexture(flag: boolean)
    {
        this._hasTexture = flag;
    }

    public get isHighlighter(): boolean
    {
        return this._isHighlighter;
    }

    public set isHighlighter(flag: boolean)
    {
        this._isHighlighter = flag;
    }

    public get hasWindowMask(): boolean
    {
        return this._hasWindowMask;
    }

    public set hasWindowMask(flag: boolean)
    {
        this._hasWindowMask = flag;
    }
}
