import type { CasClinique } from '../engine/types';
import { casAvecOverrides } from '../engine/admin';
import { esotropiePrecoce } from './esotropie-precoce';

/** Ajouter un cas consiste a ecrire son fichier de donnees et a l inscrire ici. */
export const CAS_DISPONIBLES: CasClinique[] = [esotropiePrecoce];

export function casCliniqueParId(id: string): CasClinique {
  const base = CAS_DISPONIBLES.find((c) => c.id === id);
  if (!base) throw new Error(`Cas inconnu : ${id}`);
  return casAvecOverrides(base);
}

export function casCliniquePrepare(cas: CasClinique): CasClinique {
  const base = CAS_DISPONIBLES.find((c) => c.id === cas.id) ?? cas;
  return casAvecOverrides(base);
}

export { esotropiePrecoce };
