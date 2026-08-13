import type { ActionJournal, CasClinique, ContexteExamen, ExamenCas, ExamenId } from './types';

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
