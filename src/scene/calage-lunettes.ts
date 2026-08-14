import type { PositionsOrbites } from './orbites';

/** Décalage fin de la monture par rapport au segment inter-orbitaire (cm). */
export const DECALAGE_MONTURE: [number, number, number] = [0, -0.35, 0.45];

/** Du centre monture à la face avant, côté observateur (cm). */
export const DEMI_PROFONDEUR_MONTURE_CM = 0.65;

/** Jeu entre la monture et le disque d'occlusion (cm). */
export const MARGE_CACHE_DEVANT_MONTURE_CM = 0.2;

/** Recul du cache sans monture, par rapport à l'orbite (cm). */
export const AVANCE_CACHE_SANS_LUNETTES_CM = 1.5;

export function zCentreMonture(orbites: PositionsOrbites): number {
  return (orbites.OD[2] + orbites.OG[2]) / 2 + DECALAGE_MONTURE[2];
}

/** Position Z du cache devant la face avant de la monture (cm, axe observateur +). */
export function zCacheDevantMonture(orbites: PositionsOrbites, epaisseurCacheCm: number): number {
  return (
    zCentreMonture(orbites) +
    DEMI_PROFONDEUR_MONTURE_CM +
    MARGE_CACHE_DEVANT_MONTURE_CM +
    epaisseurCacheCm / 2
  );
}
