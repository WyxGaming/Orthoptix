import { beforeEach, describe, expect, it } from 'vitest';
import { esotropieAccommodative } from '../cases/esotropie-accommodative';
import { conditionsCorrespond } from '../engine/scoring';
import { useSession } from '../engine/session';
import type { ConditionsExamen, ExamenId } from '../engine/types';
import { interpretationsExamen } from '../engine/types';

const session = () => useSession.getState();

function realiser(
  id: ExamenId,
  conditions: ConditionsExamen = { correction: 'asc' },
  mesure?: number,
) {
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
  const { cas, poserQuestion, validerSynthese } = session();
  for (const q of cas.questions) {
    if (q.poids > 0) poserQuestion(q.id);
  }
  realiser('refraction');
  realiser('acuite');
  realiser('lang', { correction: 'asc' });
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
    'signes-cles': 'Lang ASC positif, angle majore SC, orthotropie +3, accommodatif',
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
  it('Lang positif en ASC et negatif en SC', () => {
    realiser('lang', { correction: 'asc' });
    expect(session().bilan.at(-1)!.contenu).toMatch(/positif/i);
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
