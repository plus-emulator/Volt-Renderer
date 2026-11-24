/**
 * Vite injects `import.meta.glob(pattern, options)` at runtime but TS
 * doesn't see it without `vite/client` types — and we don't want to pull
 * the full `vite/client` because it overrides asset module declarations
 * the consumer (`../volt`) owns. Augment `ImportMeta` with just the
 * glob signature.
 *
 * For eager image globs (the only flavor `AssetManager` uses) Vite
 * returns `{ default: <url> }`; the call sites then narrow with
 * `mod.default ?? mod` for back-compat. The return type below covers
 * the eager case directly. Default generic is typed loosely to allow
 * `(mod.default ?? mod) as string` patterns.
 */
interface ImportMeta
{
    glob: <T = { default: string }>(pattern: string, options?: { eager?: boolean; import?: string; query?: string }) => Record<string, T>;
}
