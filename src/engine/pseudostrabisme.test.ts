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
  'constance',
  'alternance',
  'photos-regard',
  'developpement',
  'morphologie',
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
  realiser('acuite');
  realiser('reactionOcclusion');
  realiser('hirschberg', 0);
  realiser('lang');
  validerSynthese({
    diagnostic: 'pseudostrabisme',
    'signes-cles':
      'Suivi lumiere objet symetrique, reaction occlusion symetrique, reflets centres epicanthus regard lateral',
    conduite: 'rassurance',
    chirurgie: 'non',
  });
}

describe('pseudostrabisme-epicanthus', () => {
  beforeEach(() => {
    useSession.getState().demarrer(pseudostrabismeEpicanthus, 'evaluation');
  });

  it('a des reflets centres en position primaire (orthotropie)', () => {
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
    expect(Math.abs(prismFromReflexMm(-o.OG.reflet.xMm))).toBeLessThan(2);
  });

  it('bonus anamnese si les questions essentielles sont dans le bon ordre', () => {
    poserAnamneseEssentielle();
    const bonus = session()
      .resultat()
      .lignes.find((l) => l.libelle.includes('anamnèse'));
    expect(bonus?.points).toBe(5);
  });

  it('bonus conduite du bilan si comportement visuel en tete', () => {
    poserAnamneseEssentielle();
    realiser('acuite');
    realiser('reactionOcclusion');
    realiser('hirschberg', 0);
    realiser('lang');
    const bonus = session()
      .resultat()
      .lignes.find((l) => l.libelle.toLowerCase().includes('conduite du bilan'));
    expect(bonus?.points).toBe(5);
  });

  it('malus si cover test insiste malgre la cooperation limitee', () => {
    poserAnamneseEssentielle();
    realiser('coverPres');
    const malus = session()
      .resultat()
      .lignes.find((l) => l.libelle.toLowerCase().includes('cover'));
    expect(malus?.nature).toBe('malus');
  });

  it('lang realisable sans malus a 5 mois', () => {
    poserAnamneseEssentielle();
    realiser('lang');
    const lang = session()
      .resultat()
      .lignes.find((l) => l.libelle.toLowerCase().includes('lang'));
    expect(lang?.nature).not.toBe('malus');
  });

  it('exige le terme epicanthus dans la synthese ouverte', () => {
    poserAnamneseEssentielle();
    realiser('acuite');
    realiser('reactionOcclusion');
    realiser('hirschberg', 0);
    session().validerSynthese({
      diagnostic: 'pseudostrabisme',
      'signes-cles':
        'Suivi lumiere symetrique, reaction occlusion symetrique, reflets centres, plis paupieres regard lateral',
      conduite: 'rassurance',
      chirurgie: 'non',
    });
    const signes = session()
      .resultat()
      .lignes.find((l) => l.libelle.includes('signes-cles') || l.libelle.includes('objectifs'));
    expect(signes?.points).toBeLessThan(4);
  });

  it('score eleve pour un bilan complet et correct', () => {
    bilanMeiParfait();
    const { total, max, pourcentage } = session().resultat();
    expect(total).toBeGreaterThan(max * 0.75);
    expect(pourcentage).toBeGreaterThanOrEqual(75);
  });
});
