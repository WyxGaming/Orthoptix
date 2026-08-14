import { beforeEach, describe, expect, it } from 'vitest';
import { esotropiePrecoce } from '../cases/esotropie-precoce';
import { useSession } from './session';
import type { ExamenId } from './types';
import { interpretationsExamen } from './types';

const session = () => useSession.getState();

/** Realise un examen en repondant juste a la mesure comme a l'interpretation. */
function realiser(id: ExamenId) {
  const { cas, lancerExamen } = session();
  lancerExamen(id);
  const examen = cas.examens[id];
  const milieu = examen?.attendu
    ? (examen.attendu.min + examen.attendu.max) / 2
    : undefined;
  const interpretationIds: Record<string, string> = {};
  if (examen) {
    for (const interp of interpretationsExamen(examen)) {
      const bonne = interp.options.find((o) => o.correct)?.id;
      if (bonne) interpretationIds[interp.id] = bonne;
    }
  }
  const interpretationId =
    Object.keys(interpretationIds).length === 1
      ? Object.values(interpretationIds)[0]
      : undefined;
  session().validerExamen({ mesure: milieu, interpretationId, interpretationIds });
}

/** Reponses de synthese qui saturent le bareme du cas. */
function reponsesSyntheseParfaites() {
  return {
    'type-strabisme': 'esotropie-precoce',
    'signes-pathognomoniques': "NML, upshoot, E't",
    'indication-chirurgicale': 'oui',
    'technique-operatoire': 'Recul des droits mediaux OD et OG de 5 mm',
  };
}

function bilanParfait() {
  const { cas, poserQuestion, validerSynthese } = session();
  if (cas.questionObligatoireEnPremier) {
    poserQuestion(cas.questionObligatoireEnPremier);
  }
  for (const q of cas.questions) {
    if (q.poids > 0 && q.id !== cas.questionObligatoireEnPremier) poserQuestion(q.id);
  }
  for (const id of cas.ordreAttendu) {
    const examen = cas.examens[id];
    if (examen && examen.poids < 0) continue;
    if (examen?.nonContributifSiPresente) continue;
    realiser(id);
  }
  validerSynthese(reponsesSyntheseParfaites());
}

beforeEach(() => {
  session().demarrer(esotropiePrecoce, 'entrainement');
});

describe('conduite de la session', () => {
  it('consigne la reponse du patient dans le cahier de bilan', () => {
    session().poserQuestion('age-apparition');
    const ligne = session().bilan.at(-1)!;
    expect(ligne.titre).toContain('âge le strabisme');
    expect(ligne.contenu).toContain('3 mois');
  });

  it('ignore une question deja posee', () => {
    session().poserQuestion('familiaux');
    session().poserQuestion('familiaux');
    expect(session().journal.filter((a) => a.type === 'question')).toHaveLength(1);
  });

  it('commente immediatement en mode entrainement, jamais en evaluation', () => {
    session().poserQuestion('groupe-sanguin');
    expect(session().messages.at(-1)!.ton).toBe('negatif');

    session().demarrer(esotropiePrecoce, 'evaluation');
    session().poserQuestion('groupe-sanguin');
    expect(session().messages).toHaveLength(0);
  });

  it('melange les questions a chaque nouveau bilan', () => {
    const ordres = new Set<string>();
    for (let i = 0; i < 24; i++) {
      session().demarrer(esotropiePrecoce, 'entrainement');
      ordres.add(session().questionsOrdre.map((q) => q.id).join('|'));
    }
    expect(ordres.size).toBeGreaterThan(1);
    expect(session().questionsOrdre).toHaveLength(esotropiePrecoce.questions.length);
  });
});

describe('manoeuvres d occlusion', () => {
  it('fait passer la fixation a l oeil decouvert, qui la conserve au decache', () => {
    expect(session().etat.oeilFixateur).toBe('OD');
    session().occlure('OD');
    expect(session().etat.oeilFixateur).toBe('OG');
    session().occlure('aucune');
    expect(session().etat.oeilFixateur).toBe('OG');
  });

  it('alterne d un oeil a l autre au fil des caches', () => {
    session().occlure('OD');
    session().occlure('OG');
    expect(session().etat.oeilFixateur).toBe('OD');
  });

  it('retire cache et prismes a la fin de chaque examen', () => {
    session().lancerExamen('coverPres');
    session().occlure('OD');
    session().poserPrisme('OG', { puissance: 20, base: 'temporale' });
    session().validerExamen({ mesure: 40 });
    expect(session().etat.occlusion).toBe('aucune');
    expect(session().etat.prismes).toEqual({});
  });
});

describe('conclusion du bilan', () => {
  it('ne nomme le diagnostic nulle part avant la synthese', () => {
    const { cas } = session();
    const avantConclusion = [cas.titre, cas.resume, cas.patient.motif].join(' ').toLowerCase();
    expect(avantConclusion).not.toContain('precoce');
  });

  it('inscrit les reponses de synthese en fin de cahier de bilan', () => {
    bilanParfait();
    const lignes = session().bilan.filter((l) => l.id.startsWith('synthese-'));
    expect(lignes).toHaveLength(4);
    expect(lignes[0]!.contenu).toContain('Esotropie précoce');
    expect(lignes[2]!.contenu).toBe('Oui');
    expect(lignes.at(-1)!.contenu).toMatch(/droits mediaux/i);
  });
});

describe('distance de fixation', () => {
  it('place la mire a 5 metres pour un examen de loin, et la ramene ensuite', () => {
    session().lancerExamen('coverLoin');
    expect(session().etat.distanceFixationCm).toBe(500);
    session().validerExamen({ mesure: 40 });
    expect(session().etat.distanceFixationCm).toBe(33);
  });

  it('examine de pres par defaut', () => {
    session().lancerExamen('coverPres');
    expect(session().etat.distanceFixationCm).toBe(33);
  });
});

describe('bareme', () => {
  it('donne la totalite des points a un bilan mene correctement', () => {
    bilanParfait();
    const resultat = session().resultat();
    expect(resultat.total).toBe(resultat.max);
    expect(resultat.pourcentage).toBe(100);
  });

  it('penalise un examen non contributif et en explique la raison', () => {
    bilanParfait();
    const reference = session().resultat().total;

    session().demarrer(esotropiePrecoce, 'evaluation');
    bilanParfait();
    realiser('tno');
    const resultat = session().resultat();

    expect(resultat.total).toBeLessThan(reference);
    const ligne = resultat.lignes.find((l) => l.libelle.startsWith('TNO'))!;
    expect(ligne.nature).toBe('malus');
    expect(ligne.commentaire).toMatch(/aucun intérêt/i);
  });

  it('retire le bonus de conduite si l ordre des examens essentiels est inverse', () => {
    realiser('coverPres');
    realiser('motilite');
    const ligne = session()
      .resultat()
      .lignes.find((l) => l.libelle.startsWith('Conduite du bilan'))!;
    expect(ligne.points).toBe(0);
    expect(ligne.commentaire).toMatch(/motilité/i);
  });

  it('penalise le Lang realise sur Léa', () => {
    bilanParfait();
    const reference = session().resultat().total;

    session().demarrer(esotropiePrecoce, 'evaluation');
    bilanParfait();
    realiser('lang');
    const ligne = session()
      .resultat()
      .lignes.find((l) => l.libelle.startsWith('Test de Lang'))!;
    expect(ligne.nature).toBe('malus');
    expect(ligne.points).toBe(-2);
    expect(ligne.commentaire).toMatch(/grand angle/i);
    expect(session().resultat().total).toBeLessThan(reference);
  });

  it('accepte le Worth ou le verre rouge comme examen sensoriel optionnel', () => {
    bilanParfait();
    expect(session().resultat().lignes.some((l) => l.libelle.startsWith('Test de Worth'))).toBe(
      false,
    );

    session().demarrer(esotropiePrecoce, 'evaluation');
    bilanParfait();
    realiser('worth');
    const lignes = session().resultat().lignes.filter((l) => l.libelle.includes('Worth'));
    expect(lignes.some((l) => l.nature === 'acquis' && l.points === 2)).toBe(true);
    expect(session().resultat().pourcentage).toBe(100);
  });

  it('penalise d un point si le motif nest pas demande en premier', () => {
    session().poserQuestion('age-apparition');
    session().poserQuestion('motif');
    const ligne = session()
      .resultat()
      .lignes.find((l) => l.libelle.startsWith('Motif de consultation'))!;
    expect(ligne.points).toBe(-1);
    expect(ligne.nature).toBe('malus');
    expect(ligne.commentaire).toMatch(/motif de consultation/i);
  });

  it('refuse une mesure hors de la fourchette attendue', () => {
    const { lancerExamen } = session();
    lancerExamen('hirschberg');
    session().validerExamen({ mesure: 15 });
    const ligne = session()
      .resultat()
      .lignes.find((l) => l.libelle.includes('mesure'))!;
    expect(ligne.points).toBe(0);
    expect(ligne.commentaire).toContain('35');
  });

  it('laisse le synoptophore optionnel, mais exige la bonne justification s il est fait', () => {
    bilanParfait();
    expect(session().resultat().lignes.some((l) => l.libelle.includes('synoptophore'))).toBe(
      false,
    );

    session().demarrer(esotropiePrecoce, 'evaluation');
    bilanParfait();
    // bilanParfait clot la session : on repart pour tester le synoptophore seul.
    session().demarrer(esotropiePrecoce, 'evaluation');
    realiser('deviometrie');
    const lignes = session().resultat().lignes.filter((l) => l.libelle.includes('synoptophore'));
    expect(lignes.length).toBeGreaterThan(0);
    expect(lignes.every((l) => l.nature === 'acquis')).toBe(true);

    session().demarrer(esotropiePrecoce, 'evaluation');
    session().lancerExamen('deviometrie');
    session().lancerExamen('deviometrie');
    session().validerExamen({
      interpretationIds: {
        'pourquoi-synoptophore': 'stereoscopie',
        'correspondance-patiente': 'normale',
      },
    });
    const mauvaiseReponse = session()
      .resultat()
      .lignes.find((l) => l.libelle.includes('correspondance rétinienne de la patiente'))!;
    expect(mauvaiseReponse.points).toBe(0);
    expect(mauvaiseReponse.commentaire).toMatch(/anormale/i);
  });
});
