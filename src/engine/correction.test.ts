import { describe, expect, it } from 'vitest';
import { correctionEffective } from './correction';
import { esotropieAccommodative } from '../cases/esotropie-accommodative';

describe('correctionEffective', () => {
  it('utilise la correction portee hors examen avec choix ASC/SC', () => {
    expect(
      correctionEffective(esotropieAccommodative, null, { correction: 'asc' }, 'sc'),
    ).toEqual({ correction: 'sc' });
  });

  it('utilise les conditions d examen quand ASC/SC est choisi', () => {
    expect(
      correctionEffective(
        esotropieAccommodative,
        'lang',
        { correction: 'sc' },
        'asc',
      ),
    ).toEqual({ correction: 'sc' });
  });
});
