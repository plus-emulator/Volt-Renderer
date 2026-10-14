import { BumpTextureContentVersion } from './TextureContentVersion';
import { AutoDetectOptions, Renderer, Texture, autoDetectRenderer } from 'pixi.js';

let renderer: Renderer = null;

const patchGlTextureSystem = (r: Renderer): void =>
{
    const textureSystem = (r as any).texture;

    if(!textureSystem) return;

    const proto = Object.getPrototypeOf(textureSystem);

    if(!proto) return;

    const origUpdateStyle = proto.updateStyle;

    if(origUpdateStyle && !proto.__patchedUpdateStyle)
    {
        proto.updateStyle = function(source: any, firstCreation: boolean)
        {
            if(!source || source.destroyed || !source.style) return;

            return origUpdateStyle.call(this, source, firstCreation);
        };

        proto.__patchedUpdateStyle = true;
    }

    const origBindSource = proto.bindSource;

    if(origBindSource && !proto.__patchedBindSource)
    {
        proto.bindSource = function(source: any, location = 0)
        {
            if(!source || source.destroyed || !source.style)
            {
                source = Texture.EMPTY.source;
            }

            return origBindSource.call(this, source, location);
        };

        proto.__patchedBindSource = true;
    }
};

// Pixi's filter push looks up a resolution in the stack slot it has just taken, before giving that slot
// its new input texture. The slot still holds the input of whatever pass used it last, which the texture
// pool may have destroyed since (it drops idle screen-sized textures on every resize), and the read then
// throws and leaves the filter stack unbalanced for the rest of the page. A slot handed out empty gets
// what a never-used slot gets.
const patchFilterStackSlots = (r: Renderer): void =>
{
    const filterSystem = (r as any).filter;
    const proto = filterSystem && Object.getPrototypeOf(filterSystem);

    if(!proto || !proto._pushFilterData || proto.__patchedPushFilterData) return;

    const origPushFilterData = proto._pushFilterData;

    proto._pushFilterData = function()
    {
        const filterData = origPushFilterData.call(this);

        filterData.inputTexture = null;

        return filterData;
    };

    proto.__patchedPushFilterData = true;
};

const patchResizeSkip = (r: Renderer): void =>
{
    const origResize = r.resize.bind(r);

    r.resize = ((width: number, height: number, resolution?: number): void =>
    {
        origResize(width, height, resolution);

        const view = (r as any).view;
        const source = view?.texture?.source;

        if(!source) return;

        source.resizeCanvas?.();
        source.emit('resize', source);

        if(view.screen)
        {
            view.screen.width = source.width;
            view.screen.height = source.height;
        }
    });
};

export const PrepareRenderer = async (options: Partial<AutoDetectOptions>): Promise<Renderer> =>
{
    renderer = await autoDetectRenderer(options);

    const render = renderer.render.bind(renderer);
    renderer.render = ((options: any, ...args: any[]) =>
    {
        const result = render(options, ...args);
        if(options?.target) BumpTextureContentVersion(options.target);
        return result;
    }) as typeof renderer.render;

    renderer.events?.destroy();

    patchGlTextureSystem(renderer);
    patchFilterStackSlots(renderer);
    patchResizeSkip(renderer);

    return renderer;
};

export const GetRenderer = () => renderer;
