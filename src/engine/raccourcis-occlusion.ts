import type { Occlusion } from '../domain/ocular-model';

/**
 * Raccourcis cover test, du point de vue de l'écran (comme en consultation face au patient) :
 * œil gauche à l'écran = OD · œil droit à l'écran = OG.
 */
export function oeilPourRaccourciOcclusion(touche: string): Occlusion | null {
  switch (touche) {
    case 'ArrowLeft':
      return 'OD';
    case 'ArrowRight':
      return 'OG';
    case 'ArrowDown':
      return 'aucune';
    default:
      return null;
  }
}

export function estSaisieClavier(cible: EventTarget | null): boolean {
  return (
    cible instanceof HTMLInputElement ||
    cible instanceof HTMLTextAreaElement ||
    cible instanceof HTMLSelectElement ||
    (cible instanceof HTMLElement && cible.isContentEditable)
  );
}
