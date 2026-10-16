// Furniture id bands, observed on AIR WIN63-202610131318-860371703 com/sulake/habbo/utils/class_1846.as:21-34.
export const TEMPORARY_FURNI_ID_MIN = 2147401728;
export const TEMPORARY_FURNI_ID_MAX = 2147418111;
export const BUILDERS_CLUB_FURNI_ID_MIN = 2147418112;
export const BUILDERS_CLUB_FURNI_ID_MAX = 2147483647;

export const IsTemporaryFurniId = (id: number): boolean => ((id >= TEMPORARY_FURNI_ID_MIN) && (id <= TEMPORARY_FURNI_ID_MAX));

export const IsBuildersClubFurniId = (id: number): boolean => ((id >= BUILDERS_CLUB_FURNI_ID_MIN) && (id <= BUILDERS_CLUB_FURNI_ID_MAX));
