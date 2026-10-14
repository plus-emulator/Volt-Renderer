import { PrepareRenderer, Vector3d, GetTexturePool } from '@volt/utils';
import { RoomPlane } from '@volt/room';
import { GetAssetManager } from '@volt/assets';
import { PlaneMaskManager } from '../packages/room/src/object/visualization/room/mask/PlaneMaskManager';
import { RoomGeometry } from '@volt/room';
import { RoomPlaneDisplay } from '../packages/room/src/renderer/utils/RoomPlaneDisplay';
import { RoomPlaneContainsPoint } from '../packages/room/src/renderer/utils/RoomPlaneHitTest';
import { Container, Rectangle, RenderTexture, Sprite, Texture, TextureSource, TextureStyle, VERSION } from 'pixi.js';

const result = document.getElementById('result')!;
const results: unknown[] = [];
const query = new URLSearchParams(location.search);
const run = async () => {
    const renderer = await PrepareRenderer({ width: 1200, height: 900, preference: 'webgl', antialias: false, backgroundAlpha: 0 });
    document.body.appendChild(renderer.canvas as HTMLCanvasElement);
    const geometry = new RoomGeometry(64, new Vector3d(-135, 30, 0), new Vector3d(11, 11, 5));
    const tile = document.createElement('canvas');
    tile.width = 32; tile.height = 32;
    const context = tile.getContext('2d')!;
    context.fillStyle = '#b5956b'; context.fillRect(0, 0, 32, 32);
    context.fillStyle = '#506f88'; context.fillRect(0, 0, 16, 16); context.fillRect(16, 16, 16, 16);
    const texture = Texture.from(tile);
    const planeData = { planes: [{ id: 'check', visualizations: [{ size: 64, allLayers: [{ materialId: 'check-tile', color: 0xd0e0f0 }] }] }] };
    GetAssetManager().createCollection({ name: 'room', roomVisualization: { floorData: planeData, wallData: planeData } } as any, null).addAsset('check-tile', texture, false);
    const floor = () => new RoomPlane(new Vector3d(), new Vector3d(0, 0, 0), new Vector3d(36, 0, 0), new Vector3d(0, 29, 0), RoomPlane.TYPE_FLOOR, true, [], 1);
    const wall = () => new RoomPlane(new Vector3d(), new Vector3d(), new Vector3d(36, 0, 0), new Vector3d(0, 0, -4), RoomPlane.TYPE_WALL, true, [], 1);
    for (const scenario of ['floor', 'masked-wall'] as const) {
    if (query.has('scenario') && query.get('scenario') !== scenario) continue;
    const create = () => {
        const plane = scenario === 'floor' ? floor() : wall();
        plane.id = 'check';
        plane.maskManager = new PlaneMaskManager();
        if (scenario === 'masked-wall') plane.addRectangleMask(12, 1, 3, 2);
        return plane;
    };
    for (const sampling of ['nearest', 'linear'] as const) {
        if (query.has('sampling') && query.get('sampling') !== sampling) continue;
        texture.source.scaleMode = sampling;
        texture.source.style.update();
        TextureSource.defaultOptions.scaleMode = sampling;
        TextureStyle.defaultOptions.scaleMode = sampling;
        for (const zoom of [0.5, 1, 2]) {
            if (query.has('zoom') && Number(query.get('zoom')) !== zoom) continue;
            RoomPlane.DIRECT_DRAW = false;
            const baked = create();
            baked.update(geometry, 1000, true);
            if (!baked.planeTexture) throw new Error('No baked plane');
            baked.planeTexture.source.scaleMode = sampling;
            baked.planeTexture.source.style.update();
            const stage = new Container();
            const root = stage.addChild(new Container());
            const sprite = root.addChild(new Sprite(baked.planeTexture));
            root.scale.set(zoom);
            const frame = new Rectangle(0, 0, Math.ceil(baked.planeTexture.width * zoom), Math.ceil(baked.planeTexture.height * zoom));
            const output = RenderTexture.create({ width: frame.width, height: frame.height });
            renderer.render({ container: stage, target: output, clear: true });
            const before = renderer.extract.pixels(output);
            if (query.has('capture')) (window as any).__before = renderer.extract.canvas(output).toDataURL();
            root.removeChild(sprite);
            RoomPlane.DIRECT_DRAW = true;
            const direct = create();
            direct.update(geometry, 1000, true);
            if (direct.planeTexture || !direct.drawData) throw new Error('Direct floor allocated a full texture');
            const mesh = root.addChild(new RoomPlaneDisplay());
            mesh.setData(direct.drawData);
            renderer.render({ container: stage, target: output, clear: true });
            const after = renderer.extract.pixels(output);
            if (query.has('capture')) (window as any).__after = renderer.extract.canvas(output).toDataURL();
            let maximum = 0, changed = 0, coverage = 0;
            const differences: unknown[] = [];
            for (let i = 0; i < before.pixels.length; i++) {
                const delta = Math.abs(before.pixels[i] - after.pixels[i]);
                maximum = Math.max(maximum, delta);
                if (delta > 1) { changed++; if (differences.length < 8) differences.push({ x: Math.floor(i / 4) % before.width, y: Math.floor(i / 4 / before.width), channel: i % 4, before: before.pixels[i], after: after.pixels[i] }); }
                if (i % 4 === 3 && delta) coverage++;
            }
            // At nearest 0.5x, sprite batching and mesh interpolation can choose opposite sides
            // of an exact texel boundary. Permit only a one-output-pixel phase difference, in
            // both directions; full size and linear sampling still require channel parity.
            let unmatchedPixels = 0;
            const allowNearestTies = sampling === 'nearest' && zoom < 1;
            const matches = (a: Uint8Array | Uint8ClampedArray, b: Uint8Array | Uint8ClampedArray, index: number) => {
                const x = (index / 4) % before.width, y = Math.floor(index / 4 / before.width);
                const radius = allowNearestTies ? 1 : 0;
                for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
                    const xx = x + dx, yy = y + dy;
                    if (xx < 0 || yy < 0 || xx >= before.width || yy >= before.height) continue;
                    const j = (yy * before.width + xx) * 4;
                    if ([0, 1, 2, 3].every(c => Math.abs(a[index + c] - b[j + c]) <= 1)) return true;
                }
                return false;
            };
            for (let i = 0; i < before.pixels.length; i += 4) {
                if (!matches(before.pixels, after.pixels, i) || !matches(after.pixels, before.pixels, i)) unmatchedPixels++;
            }
            results.push({ scenario, sampling, zoom, maximum, changed, coverage, unmatchedPixels, pixels: before.width * before.height, differences, patches: direct.drawData.patches.map(p => ({ x: p.x, y: p.y, width: p.width, height: p.height })),
                avoidedBytes: baked.planeTexture.source.pixelWidth * baked.planeTexture.source.pixelHeight * 4,
                centerPick: RoomPlaneContainsPoint(direct.drawData, direct.drawData.width / 2, direct.drawData.height / 2, 128),
                outsidePick: RoomPlaneContainsPoint(direct.drawData, 0, 0, 128) });
            // Rare intersections of the isometric edge and a tile boundary can differ in
            // both colour and coverage. Bound those to 0.02% of the minified image.
            const unmatchedLimit = allowNearestTies ? Math.floor(before.width * before.height * 0.0002) : 0;
            if (unmatchedPixels > unmatchedLimit) throw new Error(`Pixel mismatch: ${JSON.stringify(results.at(-1))}`);
            const revision = direct.drawData.version;
            if (direct.update(geometry, 1001) || direct.drawData.version !== revision) throw new Error('Static plane rebuilt');
            if (scenario === 'masked-wall') {
                const patch = direct.drawData.patches[0];
                if (!patch || RoomPlaneContainsPoint(direct.drawData, patch.x + patch.width / 2, patch.y + patch.height / 2, 128)) throw new Error('Mask hole intercepts clicks');
            }
            direct.canBeVisible = false;
            direct.update(geometry, 1002);
            if (direct.drawData.patches.length) throw new Error('Hidden plane retained patches');
            direct.canBeVisible = true;
            if (!direct.update(geometry, 1003) || !direct.visible) throw new Error('Hidden plane failed to return');
            mesh.setData(direct.drawData);
            renderer.render(stage);
            output.destroy(true);
            stage.destroy({ children: true });
            sprite.destroy();
            baked.dispose();
            direct.dispose();
            GetTexturePool().flushReleased();
            GetTexturePool().flushReleased();
        }
    }
    }
    return { pixi: VERSION, results };
};
(window as any).__planeCheck = run().then(value => { result.textContent = JSON.stringify(value, null, 2); return value; }).catch(error => {
    result.textContent = JSON.stringify({ error: String(error), stack: error.stack, results }, null, 2);
    return { error: String(error), results };
});
