import { CATALOGUE_EXAMENS } from './exams';
import type {
  ActionJournal,
  CasClinique,
  CritereOuvert,
  ExamenId,
  Intervalle,
  QuestionSynthese,
  ReponsesSynthese,
} from './types';
import { interpretationsExamen } from './types';

export const POINTS_MESURE_JUSTE = 2;
export const POINTS_INTERPRETATION_JUSTE = 2;
export const BONUS_CONDUITE_DU_BILAN = 5;

/** Normalise une chaine pour comparer sans accents ni ponctuation. */
export function normaliserTexte(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9+'.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Criteres dont au moins une variante apparait dans la reponse. */
export function criteresCouvert(reponse: string, criteres: CritereOuvert[]): CritereOuvert[] {
  const texte = normaliserTexte(reponse);
  return criteres.filter((critere) =>
    critere.variantes.some((variante) => texte.includes(normaliserTexte(variante))),
  );
}

export function evaluerQuestionSynthese(
  question: QuestionSynthese,
  reponse: string | undefined,
): { points: number; juste: boolean; commentaire?: string } {
  if (reponse === undefined || reponse.trim() === '') {
    return { points: 0, juste: false, commentaire: question.explication };
  }

  if (question.type === 'qcm') {
    const bonne = question.options.find((o) => o.correct);
    const juste = reponse === bonne?.id;
    return {
      points: juste ? question.poids : 0,
      juste,
      commentaire: juste ? undefined : question.explication,
    };
  }

  if (question.type === 'ouiNon') {
    const attendu = question.correct ? 'oui' : 'non';
    const juste = normaliserTexte(reponse) === attendu;
    return {
      points: juste ? question.poids : 0,
      juste,
      commentaire: juste ? undefined : question.explication,
    };
  }

  const trouves = criteresCouvert(reponse, question.criteres);
  const seuil = question.seuil ?? question.criteres.length;
  const juste = trouves.length >= seuil;
  const points = juste
    ? question.poids
    : Math.round((question.poids * trouves.length) / Math.max(1, seuil));
  return {
    points,
    juste,
    commentaire: juste
      ? undefined
      : `${question.explication} Attendu : ${question.reponseAttendue}`,
  };
}

export type LigneScore = {
  libelle: string;
  points: number;
  max: number;
  /** Explication pedagogique montree au debriefing. */
  commentaire?: string;
  nature: 'acquis' | 'manque' | 'malus' | 'bonus';
};

export type Resultat = {
  lignes: LigneScore[];
  total: number;
  max: number;
  pourcentage: number;
};

export const dansIntervalle = (valeur: number, intervalle: Intervalle): boolean =>
  valeur >= intervalle.min && valeur <= intervalle.max;

const questionsPosees = (journal: ActionJournal[]) =>
  journal.filter((a): a is Extract<ActionJournal, { type: 'question' }> => a.type === 'question');

const examensRealises = (journal: ActionJournal[]) =>
  journal.filter((a): a is Extract<ActionJournal, { type: 'examen' }> => a.type === 'examen');

/**
 * Verifie que les examens essentiels ont ete conduits dans l'ordre attendu.
 * On ne compare que leur ordre relatif : inserer un examen supplementaire entre deux
 * etapes ne casse pas la conduite du bilan, l'inverser oui.
 */
export function ordreRespecte(cas: CasClinique, journal: ActionJournal[]): boolean {
  const realises = examensRealises(journal)
    .map((a) => a.id)
    .filter((id) => cas.ordreAttendu.includes(id));
  const uniques = realises.filter((id, i) => realises.indexOf(id) === i);
  const positions = uniques.map((id) => cas.ordreAttendu.indexOf(id));
  return positions.every((p, i) => i === 0 || p > positions[i - 1]!);
}

export function calculerScore(
  cas: CasClinique,
  journal: ActionJournal[],
  reponsesSynthese: ReponsesSynthese | null,
): Resultat {
  const lignes: LigneScore[] = [];
  const posees = new Set(questionsPosees(journal).map((a) => a.id));

  for (const question of cas.questions) {
    if (question.poids > 0) {
      const obtenu = posees.has(question.id);
      lignes.push({
        libelle: question.libelle,
        points: obtenu ? question.poids : 0,
        max: question.poids,
        commentaire: obtenu ? question.commentaire : `Question essentielle non posee. ${question.commentaire ?? ''}`.trim(),
        nature: obtenu ? 'acquis' : 'manque',
      });
    } else if (question.poids < 0 && posees.has(question.id)) {
      lignes.push({
        libelle: question.libelle,
        points: question.poids,
        max: 0,
        commentaire: question.commentaire,
        nature: 'malus',
      });
    }
  }

  const realises = examensRealises(journal);
  const dejaCompte = new Set<ExamenId>();

  for (const [id, examen] of Object.entries(cas.examens) as [ExamenId, CasClinique['examens'][ExamenId]][]) {
    if (!examen) continue;
    const definition = CATALOGUE_EXAMENS[id];
    const passage = realises.find((a) => a.id === id);

    if (examen.poids > 0) {
      if (passage || !examen.optionnel) {
        lignes.push({
          libelle: definition.nom,
          points: passage ? examen.poids : 0,
          max: examen.poids,
          commentaire: passage
            ? undefined
            : 'Examen essentiel non realise dans ce bilan.',
          nature: passage ? 'acquis' : 'manque',
        });
      }
    } else if (passage) {
      lignes.push({
        libelle: definition.nom,
        points: examen.poids,
        max: 0,
        commentaire: examen.justificationMalus,
        nature: 'malus',
      });
    }
    dejaCompte.add(id);

    if (examen.attendu && (passage || !examen.optionnel)) {
      const mesure = passage?.mesure;
      const juste = mesure !== undefined && dansIntervalle(mesure, examen.attendu);
      lignes.push({
        libelle: `${definition.nom} — mesure`,
        points: juste ? POINTS_MESURE_JUSTE : 0,
        max: POINTS_MESURE_JUSTE,
        commentaire: juste
          ? undefined
          : `Valeur attendue entre ${examen.attendu.min} et ${examen.attendu.max} ${examen.attendu.unite}.`,
        nature: juste ? 'acquis' : 'manque',
      });
    }

    for (const interp of interpretationsExamen(examen)) {
      if (!(passage || !examen.optionnel)) continue;
      const choix =
        passage?.interpretationIds?.[interp.id] ??
        (interpretationsExamen(examen).length === 1 ? passage?.interpretationId : undefined);
      const bonne = interp.options.find((o) => o.correct);
      const juste = choix !== undefined && choix === bonne?.id;
      lignes.push({
        libelle: `${definition.nom} — ${interp.question}`,
        points: juste ? POINTS_INTERPRETATION_JUSTE : 0,
        max: POINTS_INTERPRETATION_JUSTE,
        commentaire: juste ? undefined : interp.explication,
        nature: juste ? 'acquis' : 'manque',
      });
    }
  }

  // Examens lances alors que le cas ne les prevoit pas : ils ne rapportent rien.
  for (const passage of realises) {
    if (!dejaCompte.has(passage.id)) {
      lignes.push({
        libelle: CATALOGUE_EXAMENS[passage.id].nom,
        points: -1,
        max: 0,
        commentaire: 'Examen sans apport pour ce tableau clinique.',
        nature: 'malus',
      });
    }
  }

  for (const [index, question] of cas.synthese.questions.entries()) {
    const evaluation = evaluerQuestionSynthese(question, reponsesSynthese?.[question.id]);
    const niveau = question.niveau ? ` (${question.niveau})` : '';
    lignes.push({
      libelle: `Synthese ${index + 1}${niveau} — ${question.question}`,
      points: evaluation.points,
      max: question.poids,
      commentaire: evaluation.commentaire,
      nature: evaluation.juste ? 'acquis' : 'manque',
    });
  }

  const conduite = ordreRespecte(cas, journal);
  lignes.push({
    libelle: 'Conduite du bilan dans l ordre',
    points: conduite ? BONUS_CONDUITE_DU_BILAN : 0,
    max: BONUS_CONDUITE_DU_BILAN,
    commentaire: conduite
      ? undefined
      : 'Les epreuves dissociantes ont ete conduites avant l evaluation sensorielle, ce qui peut rompre la binocularite avant de l avoir mesuree.',
    nature: conduite ? 'bonus' : 'manque',
  });

  const total = lignes.reduce((s, l) => s + l.points, 0);
  const max = lignes.reduce((s, l) => s + l.max, 0);

  return {
    lignes,
    total,
    max,
    pourcentage: max > 0 ? Math.max(0, Math.round((total / max) * 100)) : 0,
  };
}
