/**
 * Conversions entre dioptries prismatiques, degres et reperes de lecture clinique.
 */

/** Une dioptrie prismatique deplace l'image de 1 cm a 1 m. */
export function prismToDegrees(dp: number): number {
  return (Math.atan(dp / 100) * 180) / Math.PI;
}

export function degreesToPrism(deg: number): number {
  return Math.tan((deg * Math.PI) / 180) * 100;
}

/**
 * Repere de Hirschberg tel qu'il est enseigne : 1 mm de decentrement du reflet
 * correspond a environ 15 dioptries prismatiques (soit environ 7 degres).
 *
 * Cette equivalence est une approximation clinique : 7 degres valent en realite
 * 12,3 DP. Le rendu de la scene est deliberement calibre sur la forme en DP,
 * pour que la mesure lue par l'etudiant a l'ecran corresponde exactement au
 * repere qu'on lui apprend et aux valeurs attendues du cas.
 */
export const PRISM_DIOPTERS_PER_MM_REFLEX = 15;

/** Decentrement du reflet corneen, en millimetres, pour une deviation donnee. */
export function reflexOffsetMm(dp: number): number {
  return dp / PRISM_DIOPTERS_PER_MM_REFLEX;
}

/** Lecture inverse : estimation en DP a partir d'un decentrement observe. */
export function prismFromReflexMm(mm: number): number {
  return mm * PRISM_DIOPTERS_PER_MM_REFLEX;
}
