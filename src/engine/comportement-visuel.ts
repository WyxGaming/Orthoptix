/** Épreuves composant l'examen « Comportement visuel » chez le nourrisson. */
export type EtapeComportementVisuelId =
  | 'lumiereMono'
  | 'lumiereBino'
  | 'objetMono'
  | 'objetBino';

export const RETOUR_ETAPE_COMPORTEMENT_VISUEL = 'Comportement normal';

export const ETAPES_COMPORTEMENT_VISUEL: Record<
  EtapeComportementVisuelId,
  { libelle: string; ordre: number }
> = {
  lumiereMono: { libelle: 'Suivi lumière en monoculaire', ordre: 0 },
  lumiereBino: { libelle: 'Suivi lumière en binoculaire', ordre: 1 },
  objetMono: { libelle: 'Suivi objet en monoculaire', ordre: 2 },
  objetBino: { libelle: 'Suivi objet en binoculaire', ordre: 3 },
};

export const ORDRE_ETAPES_COMPORTEMENT_VISUEL: EtapeComportementVisuelId[] = [
  'lumiereMono',
  'lumiereBino',
  'objetMono',
  'objetBino',
];

export function ordreComportementVisuelRespecte(
  etapes: EtapeComportementVisuelId[],
  attendu: readonly EtapeComportementVisuelId[] = ORDRE_ETAPES_COMPORTEMENT_VISUEL,
): boolean {
  if (etapes.length !== attendu.length) return false;
  return etapes.every((e, i) => e === attendu[i]);
}

export function estEtapeComportementVisuel(id: string): id is EtapeComportementVisuelId {
  return id in ETAPES_COMPORTEMENT_VISUEL;
}
