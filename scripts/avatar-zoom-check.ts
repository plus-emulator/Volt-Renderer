import { Container, ImageSource, Rectangle, RenderTexture, Sprite, Texture } from 'pixi.js';
import { PrepareRenderer } from '@volt/utils';
import { AvatarScaleTextureCache } from '../packages/avatar/src/cache/AvatarScaleTextureCache';

const run = async () => {
    const renderer = await PrepareRenderer({ preference: 'webgl', width: 256, height: 256, resolution: 1 });
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
        ctx.fillStyle = `rgba(${x * 4},${y * 4},${(x + y) * 2},${((x + y) % 5) / 4})`;
        ctx.fillRect(x, y, 1, 1);
    }
    const img = new Image(); img.src = canvas.toDataURL(); await img.decode();
    const source = new ImageSource({ resource: img, scaleMode: 'nearest' });
    const results = [];
    for (const size of [16, 17, 31]) for (const trimmed of [false, true]) for (const flip of [false, true]) {
        const original = new Texture({ source, frame: new Rectangle(3, 5, size, size + 2),
            orig: new Rectangle(0, 0, size + (trimmed ? 4 : 0), size + 2 + (trimmed ? 6 : 0)),
            trim: trimmed ? new Rectangle(1, 2, size, size + 2) : undefined });
        const half = AvatarScaleTextureCache.acquire(original);
        const baked = RenderTexture.create({ width: half.width, height: half.height, scaleMode: 'nearest' });
        const temp = new Sprite(original); temp.width = half.width; temp.height = half.height;
        renderer.render({ container: temp, target: baked, clear: true });
        const stage = new Container();
        const sprite = stage.addChild(new Sprite(baked));
        sprite.x = flip ? half.width : 0; sprite.scale.x = flip ? -1 : 1;
        const output = RenderTexture.create({ width: half.width, height: half.height });
        renderer.render({ container: stage, target: output, clear: true });
        const before = renderer.extract.pixels(output).pixels;
        sprite.texture = half;
        renderer.render({ container: stage, target: output, clear: true });
        const after = renderer.extract.pixels(output).pixels;
        let maximum = 0, changed = 0;
        for (let i = 0; i < before.length; i++) { const d = Math.abs(before[i] - after[i]); maximum = Math.max(maximum, d); if (d > 1) changed++; }
        results.push({ size, trimmed, flip, maximum, changed });
        stage.destroy({ children: true }); temp.destroy(); baked.destroy(true); output.destroy(true);
        AvatarScaleTextureCache.release(half); original.destroy(false);
    }
    source.destroy();
    return { pass: results.every(r => !r.changed), results };
};
(window as any).__avatarZoomCheck = run().then(value => { document.querySelector('#result')!.textContent = JSON.stringify(value); return value; }).catch(e => ({error: String(e), stack:e.stack}));
