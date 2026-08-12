import type { Eye } from '../domain/ocular-model';
import { DEMI_ECART_PUPILLAIRE, RAYON_GLOBE } from './geometrie';

/** Positions des centres orbitaires, en centimetres, dans l'espace scene. */
export type PositionsOrbites = Record<Eye, [number, number, number]> & {
  /** Rayon du globe a utiliser pour coincider avec l'orbite du mesh. */
  rayon: number;
};

/** Valeur de repli : ecart pupillaire clinique sur la ligne y = 0. */
export const ORBITES_DEFAUT: PositionsOrbites = {
  OD: [-DEMI_ECART_PUPILLAIRE, 0, -0.1],
  OG: [DEMI_ECART_PUPILLAIRE, 0, -0.1],
  rayon: RAYON_GLOBE * 0.5 * 1.25 * 1.15,
};
