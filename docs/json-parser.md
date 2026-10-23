# JSON and JSONC parser

Every configuration and game data file the renderer loads goes through `JsonParser.ts` in `@volt/utils`. This covers figuredata, furnidata, productdata, effectmap, avatar actions and more.

## Modes

The host app picks one mode when it builds. It sets the constant `__NITRO_JSON_MODE__`.

| Mode | What it does |
|------|--------------|
| `legacy` | Strict `JSON.parse` only. Comments and trailing commas cause a clear error. |
| `jsonc` | Removes comments and trailing commas, then uses `JSON.parse`. |
| `auto` | Tries strict JSON first, then JSONC. This is the default when the constant is not set. |

A file whose name ends in `.jsonc`, or that is served as `application/jsonc`, always uses JSONC.

Old mode values are not mapped. Change single-quoted strings and unquoted keys to normal JSON.

## Set the mode in a host app

The renderer does not build the constant itself. The host sets it in its bundler. Example for Vite:

```js
// vite.config.mjs in the host
export default defineConfig({
    define: {
        __NITRO_JSON_MODE__: JSON.stringify('jsonc')   // or 'legacy' / 'auto'
    }
});
```

Volt sets it with `yarn configure` or `VOLT_JSON_MODE`. See [Set up the Volt client](https://docs.plusemu.dev/getting-started/volt-client/#json-or-jsonc-files).

## Use the parser directly

```ts
import { parseConfigJson, fetchConfigJson } from '@volt/utils';

const data  = parseConfigJson<MyConfig>(rawText, '/configuration/ui-config.json');
const data2 = await fetchConfigJson<MyConfig>('/configuration/ui-config.jsonc');
```

Errors include the source URL. In `legacy` mode, they also suggest JSONC. This helps you find mistakes in production logs.
