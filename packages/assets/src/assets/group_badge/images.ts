export const images = import.meta.glob('./images/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true }) as Record<string, unknown>;
