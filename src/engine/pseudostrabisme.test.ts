import { beforeEach, describe, expect, it } from 'vitest';
import { pseudostrabismeEpicanthus } from '../cases/pseudostrabisme-epicanthus';
import { ORDRE_ETAPES_COMPORTEMENT_VISUEL } from '../engine/comportement-visuel';
import { etatOculaire } from '../domain/ocular-model';
import { prismFromReflexMm } from '../domain/prism';
import { useSession } from './session';
import type { ExamenId } from './types';
import type { EtapeComportementVisuelId } from './comportement-visuel';
import { interpretationsExamen } from './types';

const session = () => useSession.getState();

const ORDRE_ANAMNESE_ANGELICA = [
  'motif',
  'depuis-quand',
  'constance',
  'alternance',
  'photos-regard',
  'developpement',
] as const;

const ETAPES_CV: EtapeComportementVisuelId[] = [...ORDRE_ETAPES_COMPORTEMENT_VISUEL];

function poserAnamneseEssentielle() {
  for (const id of ORDRE_ANAMNESE_ANGELICA) session().poserQuestion(id);
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

function realiserComportementVisuel(
  etapes: EtapeComportementVisuelId[] = ETAPES_CV,
) {
  session().lancerExamen('comportementVisuel');
  session().validerExamen({
    etapesComportementVisuel: etapes,
    interpretationIds: { unique: 'fixation-normale' },
  });
}

function bilanAngelicaParfait() {
  const { validerSynthese } = session();
  poserAnamneseEssentielle();
  realiser('lang');
  realiserComportementVisuel();
  realiser('reactionOcclusion');
  realiser('hirschberg', 8);
  validerSynthese({
    diagnostic: 'orthotropie',
    'signes-cles':
      'Suivi lumiere objet symetrique, reaction occlusion symetrique, reflets temporalises kappa positif',
    conduite: 'rassurance',
    chirurgie: 'non',
  });
}

describe('pseudostrabisme-epicanthus', () => {
  beforeEach(() => {
    useSession.getState().demarrer(pseudostrabismeEpicanthus, 'evaluation');
  });

  it('mimique une fausse exotropie au Hirschberg par angle kappa positif', () => {
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
    expect(Math.abs(prismFromReflexMm(-o.OG.reflet.xMm))).toBeCloseTo(8, 1);
  });

  it('bonus anamnese si les questions essentielles sont dans le bon ordre', () => {
    poserAnamneseEssentielle();
    const bonus = session()
      .resultat()
      .lignes.find((l) => l.libelle.includes('anamnèse'));
    expect(bonus?.points).toBe(5);
  });

  it('bonus conduite du bilan si lang puis comportement visuel', () => {
    poserAnamneseEssentielle();
    realiser('lang');
    realiserComportementVisuel();
    realiser('reactionOcclusion');
    realiser('hirschberg', 8);
    const bonus = session()
      .resultat()
      .lignes.find((l) => l.libelle.toLowerCase().includes('conduite du bilan'));
    expect(bonus?.points).toBe(5);
  });

  it('penalise un mauvais ordre de comportement visuel', () => {
    poserAnamneseEssentielle();
    realiserComportementVisuel(['lumiereBino', 'lumiereMono', 'objetBino', 'objetMono']);
    const ordre = session()
      .resultat()
      .lignes.find((l) => l.libelle.includes('ordre des épreuves'));
    expect(ordre?.points).toBe(0);
  });

  it('malus si acuite visuelle tentee a 5 mois', () => {
    poserAnamneseEssentielle();
    realiser('acuite');
    const malus = session()
      .resultat()
      .lignes.find((l) => l.libelle.toLowerCase().includes('acuité'));
    expect(malus?.nature).toBe('malus');
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

  it('valide la synthese ouverte sur les signes objectifs du bilan', () => {
    poserAnamneseEssentielle();
    realiserComportementVisuel();
    session().validerSynthese({
      diagnostic: 'orthotropie',
      'signes-cles':
        'Suivi lumiere symetrique, reaction occlusion symetrique, reflets temporalises angle kappa',
      conduite: 'rassurance',
      chirurgie: 'non',
    });
    const signes = session()
      .resultat()
      .lignes.find((l) => l.libelle.includes('objectifs'));
    expect(signes?.points).toBeGreaterThanOrEqual(3);
  });

  it('score eleve pour un bilan complet et correct', () => {
    bilanAngelicaParfait();
    const { total, max, pourcentage } = session().resultat();
    expect(total).toBeGreaterThan(max * 0.75);
    expect(pourcentage).toBeGreaterThanOrEqual(75);
  });
});
