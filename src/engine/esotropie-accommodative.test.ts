import { beforeEach, describe, expect, it } from 'vitest';
import { esotropieAccommodative } from '../cases/esotropie-accommodative';
import { conditionsCorrespond } from '../engine/scoring';
import { useSession } from '../engine/session';
import type { ConditionsExamen, ExamenId } from '../engine/types';
import { interpretationsExamen } from '../engine/types';

const session = () => useSession.getState();

const ORDRE_ANAMNESE_MAXIME = [
  'motif',
  'mettre-lunettes',
  'correction-portee',
  'depuis-quand',
  'constance',
  'amblyopie',
  'diplopie',
] as const;

function poserAnamneseEtAntecedents() {
  const { cas, poserQuestion } = session();
  for (const id of ORDRE_ANAMNESE_MAXIME) poserQuestion(id);
  for (const q of cas.questions) {
    if (q.rubrique === 'antecedents' && q.poids > 0) poserQuestion(q.id);
  }
}

function mettreLunettesSiBesoin(conditions: ConditionsExamen) {
  if (conditions.correction === 'asc' && session().correctionPortee === 'sc') {
    session().poserQuestion('mettre-lunettes');
  }
}

function realiser(
  id: ExamenId,
  conditions: ConditionsExamen = { correction: 'asc' },
  mesure?: number,
) {
  mettreLunettesSiBesoin(conditions);
  const { cas, lancerExamen, definirConditionsExamen } = session();
  lancerExamen(id);
  definirConditionsExamen(conditions);
  const ctx = {
    examenId: id,
    conditions,
    journal: session().journal,
    indexJournal: session().journal.length,
  };
  const examen = cas.resoudreExamen?.(ctx) ?? cas.examens[id];
  const interpretationIds: Record<string, string> = {};
  if (examen) {
    for (const interp of interpretationsExamen(examen)) {
      const bonne = interp.options.find((o) => o.correct)?.id;
      if (bonne) interpretationIds[interp.id] = bonne;
    }
  }
  session().validerExamen({
    mesure,
    interpretationIds: Object.keys(interpretationIds).length ? interpretationIds : undefined,
  });
}

function bilanMaximeParfait() {
  const { validerSynthese } = session();
  poserAnamneseEtAntecedents();
  realiser('refraction');
  realiser('acuite');
  realiser('lang', { correction: 'asc', loupesPlus3: true });
  realiser('tno', { correction: 'asc', loupesPlus3: true });
  realiser('motilite');
  realiser('hirschberg', { correction: 'asc' }, 15);
  realiser('krimsky', { correction: 'asc' }, 15);
  realiser('coverPres', { correction: 'asc' }, 15);
  realiser('coverPres', { correction: 'sc' }, 40);
  realiser('coverPres', { correction: 'asc', loupesPlus3: true }, 0);
  realiser('krimskyLoin', { correction: 'asc' }, 6);
  realiser('coverLoin', { correction: 'asc' }, 6);
  realiser('coverLoin', { correction: 'sc' }, 10);
  validerSynthese({
    'type-strabisme': 'accommodative',
    conduite: 'correction',
    'signes-cles': 'Lang ASC +3 positif, angle majore SC, orthotropie +3, accommodatif',
    chirurgie: 'non',
  });
}

beforeEach(() => {
  session().demarrer(esotropieAccommodative, 'entrainement');
});

describe('conditions examen', () => {
  it('identifie les combinaisons ASC/SC et +3', () => {
    expect(conditionsCorrespond({ correction: 'asc' }, { correction: 'asc' })).toBe(true);
    expect(
      conditionsCorrespond(
        { correction: 'asc', loupesPlus3: true },
        { correction: 'asc', loupesPlus3: true },
      ),
    ).toBe(true);
    expect(
      conditionsCorrespond({ correction: 'asc' }, { correction: 'asc', loupesPlus3: true }),
    ).toBe(false);
  });
});

describe('cas Maxime — esotropie accommodative', () => {
  it('arrive sans lunettes', () => {
    expect(session().correctionPortee).toBe('sc');
  });

  it('remet les lunettes quand on le lui demande', () => {
    session().poserQuestion('mettre-lunettes');
    expect(session().correctionPortee).toBe('asc');
  });

  it('bonus anamnese si les questions essentielles sont dans le bon ordre', () => {
    bilanMaximeParfait();
    const ligne = session()
      .resultat()
      .lignes.find((l) => l.libelle.startsWith('Conduite de l\'anamnèse'))!;
    expect(ligne.points).toBe(5);
    expect(ligne.nature).toBe('bonus');
  });

  it('pas de bonus anamnese si lunettes demandees apres l historique optique', () => {
    session().poserQuestion('motif');
    session().poserQuestion('depuis-quand');
    session().poserQuestion('mettre-lunettes');
    const ligne = session()
      .resultat()
      .lignes.find((l) => l.libelle.startsWith('Conduite de l\'anamnèse'))!;
    expect(ligne.points).toBe(0);
  });

  it('Lang positif seulement en ASC + loupes +3', () => {
    realiser('lang', { correction: 'asc', loupesPlus3: true });
    expect(session().bilan.at(-1)!.contenu).toMatch(/positif/i);
    realiser('lang', { correction: 'asc' });
    expect(session().bilan.at(-1)!.contenu).toMatch(/negatif|aucune figure/i);
    realiser('lang', { correction: 'sc' });
    expect(session().bilan.at(-1)!.contenu).toMatch(/negatif|aucune figure/i);
  });

  it('TNO positif seulement en ASC + loupes avant dissociation', () => {
    realiser('tno', { correction: 'asc', loupesPlus3: true });
    expect(session().bilan.at(-1)!.contenu).toMatch(/120/);
    session().demarrer(esotropieAccommodative, 'entrainement');
    realiser('coverPres', { correction: 'asc' }, 15);
    realiser('tno', { correction: 'asc', loupesPlus3: true });
    expect(session().bilan.at(-1)!.contenu).toMatch(/aucune plage/i);
  });

  it('TNO negatif en ASC seul sans loupes +3', () => {
    realiser('tno', { correction: 'asc' });
    expect(session().bilan.at(-1)!.contenu).toMatch(/aucune plage/i);
  });

  it('cover +3 montre orthotropie de pres', () => {
    realiser('coverPres', { correction: 'asc', loupesPlus3: true }, 0);
    expect(session().bilan.at(-1)!.contenu).toMatch(/O't|paralleles|orthotropie/i);
  });

  it('attribue le score maximal a un bilan mene correctement', () => {
    bilanMaximeParfait();
    const resultat = session().resultat();
    expect(resultat.total).toBe(resultat.max);
    expect(resultat.pourcentage).toBe(100);
  });
});
