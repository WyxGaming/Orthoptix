import { describe, expect, it } from 'vitest';
import { rihanna } from '../cases/rihanna';
import {
  evaluerQuestionSynthese,
  examensComplementairesDetectes,
} from './scoring';

describe('examensComplementairesDetectes', () => {
  const question = rihanna.synthese.questions.find((q) => q.id === 'examens-complementaires');
  if (question?.type !== 'examensComplementaires') {
    throw new Error('Question examens-complementaires introuvable');
  }

  it('detecte fond d oeil, IRM et PL dans une prescription libre', () => {
    const detectes = examensComplementairesDetectes(
      "Fond d'œil, IRM encéphale et ponction lombaire",
      question.examens,
    );
    expect(detectes.map((e) => e.id)).toEqual(['fo', 'irm', 'pl']);
  });

  it('detecte un bilan sanguin et des examens optionnels', () => {
    const detectes = examensComplementairesDetectes(
      'FO, IRM, PL, bilan sanguin avec TSH, PEV',
      question.examens,
    );
    expect(detectes.map((e) => e.id)).toEqual(['fo', 'irm', 'pl', 'bilan-sanguin', 'pev']);
  });

  it('detecte le test de Lancaster', () => {
    const detectes = examensComplementairesDetectes('Test de Lancaster', question.examens);
    expect(detectes.map((e) => e.id)).toEqual(['lancaster']);
    expect(detectes[0]?.imageResultat).toBe('/examens/rihanna-lancaster.png');
  });

  it('attribue le score plein si au moins deux examens essentiels sont prescrits', () => {
    const evaluation = evaluerQuestionSynthese(
      question,
      "FO, IRM cérébrale, ponction lombaire",
    );
    expect(evaluation.juste).toBe(true);
    expect(evaluation.points).toBe(question.poids);
  });
});

describe('synthese Rihanna — étiologie et symptômes', () => {
  const question = rihanna.synthese.questions.find((q) => q.id === 'etiologie-symptomes');
  if (question?.type !== 'ouverte') {
    throw new Error('Question etiologie-symptomes introuvable');
  }

  it('accepte une réponse mentionnant HTIC, céphalées et diplopie', () => {
    const evaluation = evaluerQuestionSynthese(
      question,
      'HTIC idiopathique avec céphalées, diplopie horizontale et papilloedème',
    );
    expect(evaluation.juste).toBe(true);
    expect(evaluation.points).toBe(question.poids);
  });
});
