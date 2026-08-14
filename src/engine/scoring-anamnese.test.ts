import { describe, expect, it } from 'vitest';
import { esotropieAccommodative } from '../cases/esotropie-accommodative';
import { esotropiePrecoce } from '../cases/esotropie-precoce';
import {
  BONUS_CONDUITE_ANAMNESE,
  conduiteAnamneseRespectee,
  ordreAnamneseRespecte,
} from './scoring';
import type { ActionJournal } from './types';

describe('ordreAnamneseRespecte', () => {
  const journal = (...ids: string[]): ActionJournal[] =>
    ids.map((id) => ({ type: 'question', id }));

  it('accepte l ordre attendu pour Maxime', () => {
    expect(
      ordreAnamneseRespecte(
        esotropieAccommodative,
        journal(
          'motif',
          'mettre-lunettes',
          'correction-portee',
          'depuis-quand',
          'constance',
          'amblyopie',
          'diplopie',
        ),
      ),
    ).toBe(true);
  });

  it('accepte une question intercalée sans casser l ordre relatif', () => {
    expect(
      ordreAnamneseRespecte(
        esotropieAccommodative,
        journal('motif', 'sport', 'mettre-lunettes', 'correction-portee', 'depuis-quand', 'constance', 'amblyopie', 'diplopie'),
      ),
    ).toBe(true);
  });

  it('refuse si les lunettes sont demandées trop tard', () => {
    expect(
      ordreAnamneseRespecte(
        esotropieAccommodative,
        journal('motif', 'depuis-quand', 'mettre-lunettes', 'correction-portee', 'constance', 'amblyopie', 'diplopie'),
      ),
    ).toBe(false);
  });

  it('expose un bonus de 5 points', () => {
    expect(BONUS_CONDUITE_ANAMNESE).toBe(5);
  });
});

describe('conduiteAnamneseRespectee', () => {
  const journal = (...ids: string[]): ActionJournal[] =>
    ids.map((id) => ({ type: 'question', id }));

  it('exige le motif en premier pour Léa', () => {
    expect(
      conduiteAnamneseRespectee(esotropiePrecoce, journal('motif', 'age-apparition', 'constance')),
    ).toBe(true);
    expect(
      conduiteAnamneseRespectee(esotropiePrecoce, journal('age-apparition', 'motif')),
    ).toBe(false);
  });

  it('accepte un ordre libre apres le motif pour Léa', () => {
    expect(
      conduiteAnamneseRespectee(
        esotropiePrecoce,
        journal('motif', 'familiaux', 'correction', 'chirurgie'),
      ),
    ).toBe(true);
  });
});
