import type { ActionJournal, CasClinique, ConditionsExamen, ContexteExamen, ExamenCas, ExamenId, OptionsExamen } from './types';

/** Cle stable pour indexer les mesures par combinaison de conditions. */
export function cleConditions(c: ConditionsExamen): string {
  if (c.loupesPlus3) return 'asc+3';
  return c.correction;
}

/** Combinaisons SC / ASC / ASC+3 a mesurer pour les reflets et cover tests. */
export function conditionsMesureAttendues(
  options: OptionsExamen,
  distance?: 'pres' | 'loin',
): ConditionsExamen[] {
  const combos: ConditionsExamen[] = [];
  if (options.choixCorrection) {
    combos.push({ correction: 'sc' });
    combos.push({ correction: 'asc' });
  }
  if (options.choixLoupesPlus3 && distance !== 'loin') {
    combos.push({ correction: 'asc', loupesPlus3: true });
  }
  return combos;
}

export function libelleConditionsMesure(c: ConditionsExamen): string {
  if (c.loupesPlus3) return 'ASC + loupes +3';
  return c.correction === 'asc' ? 'Avec correction (ASC)' : 'Sans correction (SC)';
}

/** Examens qui rompent la binocularité avant un TNO fiable. */
export const EXAMENS_DISSOCIANTS: ExamenId[] = [
  'coverPres',
  'coverLoin',
  'worth',
  'bagolini',
  'verreRouge',
  'bielschowsky',
  'motilite',
];

export const conditionsParDefaut = (): ContexteExamen['conditions'] => ({ correction: 'asc' });

export function examensDissociantsAvant(
  journal: ActionJournal[],
  indexCourant: number,
): ExamenId[] {
  return journal
    .slice(0, indexCourant)
    .filter((a): a is Extract<ActionJournal, { type: 'examen' }> => a.type === 'examen')
    .map((a) => a.id)
    .filter((id) => EXAMENS_DISSOCIANTS.includes(id));
}

export function examenResolu(
  cas: CasClinique,
  ctx: ContexteExamen,
): ExamenCas | undefined {
  const resolu = cas.resoudreExamen?.(ctx);
  if (resolu) return resolu;
  return cas.examens[ctx.examenId];
}

export function libelleConditions(conditions: ContexteExamen['conditions']): string {
  const parties = [conditions.correction === 'asc' ? 'ASC' : 'SC'];
  if (conditions.loupesPlus3) parties.push('+3 VP');
  return parties.join(', ');
}
