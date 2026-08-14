/**
 * Cas 3 — Rihanna, 38 ans.
 *
 * Fichier stub : le contenu clinique (pathologie, barème, examens) sera ajouté
 * une fois le scénario validé. Le modèle 3D Sketchfab est branché via modeles-tete.ts.
 */
import type { CasClinique } from '../engine/types';

export const rihannaStub: Partial<CasClinique> & {
  id: string;
  patient: CasClinique['patient'];
} = {
  id: 'rihanna',
  titre: 'Rihanna, 38 ans — bilan orthoptique (cas en préparation)',
  resume: 'Rihanna, 38 ans. Scénario clinique à définir.',
  patient: {
    prenom: 'Rihanna',
    age: 38,
    sexe: 'F',
    motif: 'Bilan orthoptique — motif à préciser.',
  },
};
