import { describe, expect, it, beforeEach } from 'vitest';
import { esotropiePrecoce } from '../cases/esotropie-precoce';
import {
  ajouterQuestion,
  ajouterQuestionSynthese,
  ajouterVarianteSynthese,
  appliquerOverrides,
  criteresOuvertsQuestion,
  overridesCas,
  reinitialiserCriteresSynthese,
  reinitialiserOverrides,
  retirerQuestion,
  retirerQuestionSynthese,
  retirerVarianteBaseSynthese,
  retirerVarianteSynthese,
  enregistrerCriteresSynthese,
  verifierMotDePasse,
} from './admin';
import { criteresCouvert, evaluerQuestionSynthese } from './scoring';

beforeEach(() => {
  reinitialiserOverrides();
});

describe('admin', () => {
  it('accepte le mot de passe administrateur', () => {
    expect(verifierMotDePasse('ortho2026')).toBe(true);
    expect(verifierMotDePasse('faux')).toBe(false);
  });

  it('ajoute des questions anamnese au cas', () => {
    ajouterQuestion(esotropiePrecoce.id, {
      rubrique: 'anamnese',
      libelle: 'Question admin test',
      reponse: 'Reponse admin',
      poids: 0,
    });
    const fusionne = appliquerOverrides(esotropiePrecoce, overridesCas(esotropiePrecoce.id));
    expect(fusionne.questions.some((q) => q.libelle === 'Question admin test')).toBe(true);
  });

  it('retire une question ajoutee par l admin', () => {
    const q = ajouterQuestion(esotropiePrecoce.id, {
      rubrique: 'antecedents',
      libelle: 'ATCD admin',
      reponse: 'Reponse',
      poids: -1,
    });
    retirerQuestion(esotropiePrecoce.id, q.id);
    expect(overridesCas(esotropiePrecoce.id).questions).toHaveLength(0);
  });

  it('accepte une variante admin dans une reponse ouverte de synthese', () => {
    ajouterVarianteSynthese(
      esotropiePrecoce.id,
      'signes-pathognomoniques',
      'nml',
      'nystagmus latent',
    );
    const fusionne = appliquerOverrides(esotropiePrecoce, overridesCas(esotropiePrecoce.id));
    const question = fusionne.synthese.questions.find((q) => q.id === 'signes-pathognomoniques')!;
    expect(question.type).toBe('ouverte');
    if (question.type !== 'ouverte') return;
    const nml = question.criteres!.find((c) => c.id === 'nml')!;
    expect(criteresCouvert('presence de nystagmus latent', [nml])).toHaveLength(1);
  });

  it('retire une variante admin', () => {
    ajouterVarianteSynthese(esotropiePrecoce.id, 'technique-operatoire', 'geste', 'myotomie');
    retirerVarianteSynthese(esotropiePrecoce.id, 'technique-operatoire', 'geste', 'myotomie');
    expect(overridesCas(esotropiePrecoce.id).syntheseVariantes['technique-operatoire']).toBeUndefined();
  });

  it('retire une variante de base', () => {
    retirerVarianteBaseSynthese(esotropiePrecoce.id, 'signes-pathognomoniques', 'nml', 'nml');
    const fusionne = appliquerOverrides(esotropiePrecoce, overridesCas(esotropiePrecoce.id));
    const question = fusionne.synthese.questions.find((q) => q.id === 'signes-pathognomoniques')!;
    if (question.type !== 'ouverte') return;
    const nml = question.criteres!.find((c) => c.id === 'nml')!;
    expect(nml.variantes).not.toContain('nml');
  });

  it('liste les criteres des questions avec alternatives', () => {
    const question = esotropiePrecoce.synthese.questions.find((q) => q.id === 'technique-operatoire')!;
    const criteres = criteresOuvertsQuestion(question);
    expect(criteres.some((c) => c.critereId === 'dose-bilaterale')).toBe(true);
    expect(criteres.length).toBeGreaterThan(4);
  });

  it('ajoute une question de synthese', () => {
    ajouterQuestionSynthese(esotropiePrecoce.id, {
      type: 'ouverte',
      question: 'Question admin synthese',
      poids: 2,
      explication: 'Explication test',
      reponseAttendue: 'Reponse test',
      criteres: [{ id: 'mot-cle', variantes: ['alpha', 'beta'] }],
      seuil: 1,
    });
    const fusionne = appliquerOverrides(esotropiePrecoce, overridesCas(esotropiePrecoce.id));
    const ajoutee = fusionne.synthese.questions.find((q) => q.question === 'Question admin synthese')!;
    expect(ajoutee).toBeDefined();
    const evaluation = evaluerQuestionSynthese(ajoutee, 'reponse avec alpha');
    expect(evaluation.juste).toBe(true);
  });

  it('retire une question de synthese ajoutee', () => {
    const q = ajouterQuestionSynthese(esotropiePrecoce.id, {
      type: 'ouiNon',
      question: 'Test oui non',
      poids: 1,
      explication: 'Explication',
      correct: true,
    });
    retirerQuestionSynthese(esotropiePrecoce.id, q.id);
    expect(overridesCas(esotropiePrecoce.id).syntheseQuestions).toHaveLength(0);
  });

  it('modifie les criteres d une question de synthese de base', () => {
    enregistrerCriteresSynthese(esotropiePrecoce.id, 'signes-pathognomoniques', {
      seuil: 1,
      criteres: [{ id: 'nml', variantes: ['nml', 'nystagmus'] }],
    });
    const fusionne = appliquerOverrides(esotropiePrecoce, overridesCas(esotropiePrecoce.id));
    const question = fusionne.synthese.questions.find((q) => q.id === 'signes-pathognomoniques')!;
    if (question.type !== 'ouverte') return;
    expect(question.seuil).toBe(1);
    expect(question.criteres).toHaveLength(1);
    const evaluation = evaluerQuestionSynthese(question, 'presence de nystagmus');
    expect(evaluation.juste).toBe(true);
  });

  it('reinitialise les criteres modifies', () => {
    enregistrerCriteresSynthese(esotropiePrecoce.id, 'signes-pathognomoniques', {
      seuil: 1,
      criteres: [{ id: 'nml', variantes: ['nml'] }],
    });
    reinitialiserCriteresSynthese(esotropiePrecoce.id, 'signes-pathognomoniques');
    const fusionne = appliquerOverrides(esotropiePrecoce, overridesCas(esotropiePrecoce.id));
    const question = fusionne.synthese.questions.find((q) => q.id === 'signes-pathognomoniques')!;
    if (question.type !== 'ouverte') return;
    expect(question.seuil).toBe(2);
    expect(question.criteres!.length).toBeGreaterThan(1);
  });
});
