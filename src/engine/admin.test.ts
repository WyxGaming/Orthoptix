import { describe, expect, it, beforeEach } from 'vitest';
import { esotropiePrecoce } from '../cases/esotropie-precoce';
import {
  ajouterQuestion,
  ajouterVarianteSynthese,
  appliquerOverrides,
  overridesCas,
  reinitialiserOverrides,
  retirerQuestion,
  retirerVarianteSynthese,
  verifierMotDePasse,
} from './admin';
import { criteresCouvert } from './scoring';

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
    const nml = question.criteres.find((c) => c.id === 'nml')!;
    expect(criteresCouvert('presence de nystagmus latent', [nml])).toHaveLength(1);
  });

  it('retire une variante admin', () => {
    ajouterVarianteSynthese(esotropiePrecoce.id, 'technique-operatoire', 'geste', 'myotomie');
    retirerVarianteSynthese(esotropiePrecoce.id, 'technique-operatoire', 'geste', 'myotomie');
    expect(overridesCas(esotropiePrecoce.id).syntheseVariantes['technique-operatoire']).toBeUndefined();
  });
});
