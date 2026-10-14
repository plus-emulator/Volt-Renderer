import { defineConfig } from 'vite';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
export default defineConfig({
    root,
    resolve: { alias: Object.fromEntries(['api', 'assets', 'avatar', 'camera', 'communication', 'configuration', 'events', 'localization', 'room', 'session', 'sound', 'utils'].map(name => [`@volt/${name}`, resolve(root, `packages/${name}/src/index.ts`)])) },
    server: { host: '0.0.0.0', port: 5184, strictPort: true }
});
