import type { CasClinique } from '../engine/types';
import { casAvecOverrides } from '../engine/admin';
import { esotropieAccommodative } from './esotropie-accommodative';
import { esotropiePrecoce } from './esotropie-precoce';
import { rihanna } from './rihanna';

/** Ajouter un cas consiste a ecrire son fichier de donnees et a l inscrire ici. */
export const CAS_DISPONIBLES: CasClinique[] = [esotropiePrecoce, esotropieAccommodative, rihanna];

export function casCliniqueParId(id: string): CasClinique {
  const base = CAS_DISPONIBLES.find((c) => c.id === id);
  if (!base) throw new Error(`Cas inconnu : ${id}`);
  return casAvecOverrides(base);
}

export function casCliniquePrepare(cas: CasClinique): CasClinique {
  const base = CAS_DISPONIBLES.find((c) => c.id === cas.id) ?? cas;
  return casAvecOverrides(base);
}

export { esotropieAccommodative, esotropiePrecoce, rihanna };
