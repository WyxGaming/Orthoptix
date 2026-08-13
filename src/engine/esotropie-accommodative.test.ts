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

function realiserMulti(
  id: ExamenId,
  passages: Array<{ conditions: ConditionsExamen; mesure: number }>,
) {
  mettreLunettesSiBesoin({ correction: 'asc' });
  session().lancerExamen(id);
  session().validerExamen({
    passages: passages.map((p) => ({
      conditions: p.conditions,
      mesure: p.mesure,
      interpretationIds:
        id === 'coverPres' && p.conditions.correction === 'asc' && !p.conditions.loupesPlus3
          ? { unique: 'non' }
          : undefined,
    })),
  });
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
  realiser('lang', { correction: 'asc', loupesPlus3: true });
  realiser('tno', { correction: 'asc', loupesPlus3: true });
  realiser('motilite');
  realiserMulti('hirschberg', [
    { conditions: { correction: 'asc' }, mesure: 15 },
    { conditions: { correction: 'sc' }, mesure: 40 },
    { conditions: { correction: 'asc', loupesPlus3: true }, mesure: 0 },
  ]);
  realiserMulti('krimsky', [
    { conditions: { correction: 'asc' }, mesure: 15 },
    { conditions: { correction: 'sc' }, mesure: 40 },
    { conditions: { correction: 'asc', loupesPlus3: true }, mesure: 0 },
  ]);
  realiserMulti('krimskyLoin', [
    { conditions: { correction: 'asc' }, mesure: 6 },
    { conditions: { correction: 'sc' }, mesure: 10 },
  ]);
  realiserMulti('coverLoin', [
    { conditions: { correction: 'asc' }, mesure: 6 },
    { conditions: { correction: 'sc' }, mesure: 10 },
  ]);
  realiserMulti('coverPres', [
    { conditions: { correction: 'asc' }, mesure: 15 },
    { conditions: { correction: 'sc' }, mesure: 40 },
    { conditions: { correction: 'asc', loupesPlus3: true }, mesure: 0 },
  ]);
  realiser('acuite');
  realiser('refraction');
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
    realiserMulti('coverPres', [
      { conditions: { correction: 'asc', loupesPlus3: true }, mesure: 0 },
    ]);
    expect(session().bilan.at(-1)!.contenu).toMatch(/O't|paralleles|orthotropie/i);
  });

  it('consigne les trois mesures VP en une fois', () => {
    realiserMulti('hirschberg', [
      { conditions: { correction: 'asc' }, mesure: 15 },
      { conditions: { correction: 'sc' }, mesure: 40 },
      { conditions: { correction: 'asc', loupesPlus3: true }, mesure: 0 },
    ]);
    const passages = session().journal.filter(
      (a) => a.type === 'examen' && a.id === 'hirschberg',
    );
    expect(passages).toHaveLength(3);
    expect(passages.map((a) => (a.type === 'examen' ? a.mesure : undefined))).toEqual([
      15, 40, 0,
    ]);
  });

  it('penalise la presentation du synoptophore ou du biprisme', () => {
    session().lancerExamen('deviometrie');
    session().validerExamen();
    let ligne = session()
      .resultat()
      .lignes.find((l) => l.libelle.startsWith('Déviométrie'))!;
    expect(ligne.nature).toBe('malus');
    expect(ligne.points).toBe(-1);
    expect(session().bilan.some((l) => l.titre.includes('synoptophore'))).toBe(false);

    session().demarrer(esotropieAccommodative, 'entrainement');
    session().lancerExamen('biprisme');
    session().validerExamen();
    ligne = session()
      .resultat()
      .lignes.find((l) => l.libelle.startsWith('Biprisme'))!;
    expect(ligne.nature).toBe('malus');
    expect(ligne.points).toBe(-2);
    expect(session().bilan.some((l) => l.titre.includes('Biprisme'))).toBe(false);
  });

  it('n affiche rien au barème si synoptophore et biprisme non presentes', () => {
    poserAnamneseEtAntecedents();
    const lignes = session()
      .resultat()
      .lignes.filter((l) => l.libelle.includes('synoptophore') || l.libelle.includes('Biprisme'));
    expect(lignes).toHaveLength(0);
  });

  it('attribue le score maximal a un bilan mene correctement', () => {
    bilanMaximeParfait();
    const resultat = session().resultat();
    expect(resultat.total).toBe(resultat.max);
    expect(resultat.pourcentage).toBe(100);
  });
});
