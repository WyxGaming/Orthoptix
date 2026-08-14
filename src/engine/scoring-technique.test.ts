import { describe, expect, it } from 'vitest';
import { esotropiePrecoce } from '../cases/esotropie-precoce';
import { evaluerQuestionSynthese } from './scoring';

describe('technique operatoire Léa', () => {
  const question = esotropiePrecoce.synthese.questions.find(
    (q) => q.id === 'technique-operatoire',
  )!;

  it('accepte le recul bilaterale des droits mediaux ODG', () => {
    const resultat = evaluerQuestionSynthese(
      question,
      'Recul des droits mediaux OD et OG',
    );
    expect(resultat.juste).toBe(true);
    expect(resultat.points).toBe(4);
  });

  it('accepte le recul DM OG + pli DL OG', () => {
    const resultat = evaluerQuestionSynthese(
      question,
      'Recul du droit medial OG et pliage du droit lateral OG',
    );
    expect(resultat.juste).toBe(true);
    expect(resultat.points).toBe(4);
  });

  it('accorde un bonus si la dose de 5 mm est precisee', () => {
    const resultat = evaluerQuestionSynthese(
      question,
      'Recul des droits mediaux ODG de 5 mm',
    );
    expect(resultat.juste).toBe(true);
    expect(resultat.points).toBe(5);
  });

  it('n exige pas la dose pour valider la technique', () => {
    const resultat = evaluerQuestionSynthese(
      question,
      'Recul DM OG + pliage DL OG',
    );
    expect(resultat.juste).toBe(true);
    expect(resultat.points).toBe(4);
  });
});
