import { beforeEach, describe, expect, it } from 'vitest';
import { pseudostrabismeEpicanthus } from '../cases/pseudostrabisme-epicanthus';
import { etatOculaire } from '../domain/ocular-model';
import { prismFromReflexMm } from '../domain/prism';
import { useSession } from './session';
import type { ExamenId } from './types';
import { interpretationsExamen } from './types';

const session = () => useSession.getState();

const ORDRE_ANAMNESE_MEI = [
  'motif',
  'depuis-quand',
  'photos-regard',
  'morphologie',
  'alternance',
  'developpement',
] as const;

function poserAnamneseEssentielle() {
  for (const id of ORDRE_ANAMNESE_MEI) session().poserQuestion(id);
  for (const q of session().cas.questions) {
    if (q.rubrique === 'antecedents' && q.poids > 0) session().poserQuestion(q.id);
  }
}

function realiser(id: ExamenId, mesure?: number) {
  const { cas, lancerExamen, validerExamen } = session();
  lancerExamen(id);
  const examen = cas.examens[id];
  const interpretationIds: Record<string, string> = {};
  if (examen) {
    for (const interp of interpretationsExamen(examen)) {
      const bonne = interp.options.find((o) => o.correct)?.id;
      if (bonne) interpretationIds[interp.id] = bonne;
    }
  }
  validerExamen({
    mesure,
    interpretationIds: Object.keys(interpretationIds).length ? interpretationIds : undefined,
  });
}

function bilanMeiParfait() {
  const { validerSynthese } = session();
  poserAnamneseEssentielle();
  realiser('motilite');
  realiser('hirschberg', 12);
  realiser('krimsky', 12);
  realiser('krimskyLoin', 12);
  realiser('coverLoin', 0);
  realiser('coverPres', 0);
  realiser('acuite');
  realiser('refraction');
  validerSynthese({
    diagnostic: 'pseudostrabisme',
    'signes-cles':
      'Cover test negatif orthotropie, epicanthus pont nasal, angle kappa reflets faussement convergents',
    conduite: 'rassurance',
    chirurgie: 'non',
  });
}

describe('pseudostrabisme-epicanthus', () => {
  beforeEach(() => {
    useSession.getState().demarrer(pseudostrabismeEpicanthus, 'evaluation');
  });

  it('expose une fausse esotropie au Hirschberg mais une orthotropie au cover test', () => {
    const etat = {
      gaze: { azimuthDeg: 0, elevationDeg: 0 },
      distanceFixationCm: 33,
      occlusion: 'aucune' as const,
      oeilFixateur: 'OD' as const,
      prismes: {},
      tempsS: 0,
    };
    const o = etatOculaire(pseudostrabismeEpicanthus.oculaire, etat);
    expect(o.OG.deviationLampeDp.horizontal).toBeCloseTo(0, 6);
    expect(prismFromReflexMm(-o.OG.reflet.xMm)).toBeCloseTo(12, 1);
  });

  it('bonus anamnese si les questions essentielles sont dans le bon ordre', () => {
    poserAnamneseEssentielle();
    const resultat = session().resultat();
    const bonus = resultat.lignes.find((l) => l.libelle.includes('anamnèse'));
    expect(bonus?.points).toBe(5);
  });

  it('bonus conduite du bilan si cover avant refraction', () => {
    poserAnamneseEssentielle();
    realiser('motilite');
    realiser('hirschberg', 12);
    realiser('krimsky', 12);
    realiser('krimskyLoin', 12);
    realiser('coverLoin', 0);
    realiser('coverPres', 0);
    realiser('acuite');
    realiser('refraction');
    const bonus = session()
      .resultat()
      .lignes.find((l) => l.libelle.toLowerCase().includes('conduite du bilan'));
    expect(bonus?.points).toBe(5);
  });

  it('malus si Lang realise a 5 mois', () => {
    poserAnamneseEssentielle();
    realiser('lang');
    const malus = session()
      .resultat()
      .lignes.find((l) => l.libelle.toLowerCase().includes('lang'));
    expect(malus?.nature).toBe('malus');
  });

  it('score eleve pour un bilan complet et correct', () => {
    bilanMeiParfait();
    const { total, max, pourcentage } = session().resultat();
    expect(total).toBeGreaterThan(max * 0.75);
    expect(pourcentage).toBeGreaterThanOrEqual(75);
  });
});
