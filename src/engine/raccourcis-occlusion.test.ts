import { describe, expect, it } from 'vitest';
import { oeilPourRaccourciOcclusion } from './raccourcis-occlusion';

describe('raccourcis occlusion cover test', () => {
  it('associe la fleche gauche a l OD (cote gauche de l ecran)', () => {
    expect(oeilPourRaccourciOcclusion('ArrowLeft')).toBe('OD');
  });

  it('associe la fleche droite a l OG (cote droit de l ecran)', () => {
    expect(oeilPourRaccourciOcclusion('ArrowRight')).toBe('OG');
  });

  it('decouvre avec la fleche basse', () => {
    expect(oeilPourRaccourciOcclusion('ArrowDown')).toBe('aucune');
  });
});
