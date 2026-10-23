# Split game data loader

`loadGamedata` in `@volt/utils` loads all game data in the renderer. These loaders use it: FurnitureDataLoader, ProductDataLoader, EffectAssetDownloadManager, AvatarRenderManager and LocalizationManager.

It accepts one of two URLs:

- A **file URL**: one big file (the old way).
- A **folder URL**: split files. A trailing slash marks a folder.

For the folder layout, the tiers and the merge rules, see [Split game data](https://docs.plusemu.dev/getting-started/volt-client/#split-game-data).

## Merge function

`mergeGamedata(a, b)` joins two parts. It follows the same rules as the guide. The default id keys are `id`, `classname` and `name`, in this order. Pass `mergeArrayIdKeys` in the options to change them.

## Example

```ts
import { loadGamedata, mergeGamedata } from '@volt/utils';

// The code does not need to know whether the URL is split or not.
const furnidata = await loadGamedata('https://example.com/gamedata/furnidata/');

// Join parts you loaded yourself.
const merged = mergeGamedata(coreData, customData);
```

To split an old single file, use `scripts/split-gamedata.mjs` in the [Volt repository](https://github.com/plus-emulator/Volt).
