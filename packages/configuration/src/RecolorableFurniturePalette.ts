import { GetConfiguration } from './GetConfiguration';
import { IConfigurationManager } from './IConfigurationManager';

const trim = (value: string): string => value.replace(/^\s+|\s+$/g, '');

/**
 * AIR WIN63-202610131318-860371703 `room/object/data/class_3492.as:13` `getColors`: the palette a recolorable furni
 * class may use. `recolorable_bc.palette_to_furni` (`<palette>=<class>,<class>;...`) picks the palette, falling back
 * to `default`; `recolorable_bc.palette.<palette>` lists its 6-digit hex colours. A missing palette key means no colours.
 */
export const GetRecolorableFurnitureColors = (className: string, configuration: IConfigurationManager = GetConfiguration()): number[] =>
{
    if(!configuration) return [];

    let paletteName = 'default';

    const paletteToFurni = configuration.getValue<string>('recolorable_bc.palette_to_furni', null);

    if(paletteToFurni && paletteToFurni.length)
    {
        for(const mapping of paletteToFurni.split(';'))
        {
            const parts = mapping.split('=');

            if(parts.length !== 2) continue;

            for(const furni of parts[1].split(','))
            {
                if(trim(furni) === className) paletteName = trim(parts[0]);
            }
        }
    }

    const palette = configuration.getValue<string>(`recolorable_bc.palette.${ paletteName }`, null);

    if((palette === null) || (palette === undefined)) return [];

    const colors: number[] = [];

    for(const entry of String(palette).split(','))
    {
        const hex = trim(entry);

        if(/^[0-9a-fA-F]{6}$/.test(hex)) colors.push(parseInt(hex, 16));
    }

    return colors;
};
