import type { CasClinique, ConditionsExamen, ExamenId } from './types';

/** Correction optique effective pour le rendu 3D et le moteur oculaire. */
export function correctionEffective(
  cas: CasClinique,
  examenEnCours: ExamenId | null,
  conditionsExamen: ConditionsExamen,
  correctionPortee: 'asc' | 'sc',
): ConditionsExamen {
  const options = examenEnCours ? cas.optionsExamen?.[examenEnCours] : undefined;
  if (options?.choixCorrection || options?.choixLoupesPlus3) {
    return conditionsExamen;
  }
  return { correction: correctionPortee };
}
