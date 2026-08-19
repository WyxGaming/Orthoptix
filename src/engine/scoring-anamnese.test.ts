import { describe, expect, it } from 'vitest';
import { esotropieAccommodative } from '../cases/esotropie-accommodative';
import { esotropiePrecoce } from '../cases/esotropie-precoce';
import {
  BONUS_CONDUITE_ANAMNESE,
  calculerScore,
  conduiteAnamneseRespectee,
  MALUS_MOTIF_PAS_EN_PREMIER,
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

  it('penalise d un point si le motif nest pas en premier pour Léa', () => {
    expect(MALUS_MOTIF_PAS_EN_PREMIER).toBe(-1);
    const resultat = calculerScore(
      esotropiePrecoce,
      journal('age-apparition', 'motif'),
      null,
    );
    const ligne = resultat.lignes.find((l) =>
      l.libelle.startsWith('Motif de consultation'),
    )!;
    expect(ligne.points).toBe(-1);
    expect(ligne.nature).toBe('malus');

    const sansMalus = calculerScore(esotropiePrecoce, journal('motif', 'age-apparition'), null);
    expect(
      sansMalus.lignes.some((l) => l.libelle.startsWith('Motif de consultation')),
    ).toBe(false);
  });
});
