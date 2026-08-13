import { create } from 'zustand';
import {
  autreOeil,
  DISTANCE_LOIN_CM,
  DISTANCE_PRES_CM,
  etatExamenInitial,
  fixationApresDecache,
  type EtatExamen,
  type Eye,
  type Gaze,
  type Occlusion,
  type Prisme,
} from '../domain/ocular-model';
import { CATALOGUE_EXAMENS } from './exams';
import { casCliniquePrepare } from '../cases';
import { calculerScore, dansIntervalle, type Resultat } from './scoring';
import type { ActionJournal, CasClinique, ExamenId, QuestionAnamnese, ReponsesSynthese } from './types';
import { interpretationsExamen } from './types';

/** Melange Fisher-Yates : ordre different a chaque visite / nouveau bilan. */
export function melangeAleatoire<T>(items: readonly T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copie[i]!;
    copie[i] = copie[j]!;
    copie[j] = tmp;
  }
  return copie;
}

export type Mode = 'entrainement' | 'evaluation';
export type Phase = 'accueil' | 'admin' | 'bilan' | 'synthese' | 'debriefing';

export type Message = {
  id: number;
  texte: string;
  ton: 'positif' | 'negatif' | 'neutre';
};

/** Ligne du cahier de bilan, telle qu'elle s'affiche au praticien. */
export type LigneBilan = {
  id: string;
  titre: string;
  contenu: string;
};

type SessionState = {
  cas: CasClinique;
  /** Questions anamnese + antecedents, melangees au demarrage du bilan. */
  questionsOrdre: QuestionAnamnese[];
  mode: Mode;
  phase: Phase;
  journal: ActionJournal[];
  bilan: LigneBilan[];
  etat: EtatExamen;
  examenEnCours: ExamenId | null;
  reponsesSynthese: ReponsesSynthese | null;
  messages: Message[];

  demarrer: (cas: CasClinique, mode: Mode) => void;
  ouvrirAdmin: () => void;
  quitterAdmin: () => void;
  poserQuestion: (id: string) => void;
  lancerExamen: (id: ExamenId) => void;
  validerExamen: (saisie?: {
    mesure?: number;
    interpretationId?: string;
    interpretationIds?: Record<string, string>;
  }) => void;
  abandonnerExamen: () => void;
  passerALaSynthese: () => void;
  validerSynthese: (reponses: ReponsesSynthese) => void;
  rejouer: () => void;

  deplacerCible: (gaze: Gaze) => void;
  occlure: (occlusion: Occlusion) => void;
  poserPrisme: (oeil: Eye, prisme: Prisme | null) => void;
  retirerInstruments: () => void;

  resultat: () => Resultat;
  aDejaFait: (id: ExamenId) => boolean;
  aDejaPose: (id: string) => boolean;
};

let compteurMessages = 0;

const oeilFixateurInitial = (cas: CasClinique): Eye =>
  cas.oculaire.fixation.mode === 'preferee' ? cas.oculaire.fixation.oeil : 'OD';

export const useSession = create<SessionState>((set, get) => ({
  cas: undefined as unknown as CasClinique,
  questionsOrdre: [],
  mode: 'entrainement',
  phase: 'accueil',
  journal: [],
  bilan: [],
  etat: etatExamenInitial('OD'),
  examenEnCours: null,
  reponsesSynthese: null,
  messages: [],

  demarrer: (cas, mode) => {
    const prepare = casCliniquePrepare(cas);
    set({
      cas: prepare,
      questionsOrdre: melangeAleatoire(prepare.questions),
      mode,
      phase: 'bilan',
      journal: [],
      bilan: [],
      etat: etatExamenInitial(oeilFixateurInitial(prepare)),
      examenEnCours: null,
      reponsesSynthese: null,
      messages: [],
    });
  },

  rejouer: () => {
    const { cas, mode, demarrer } = get();
    demarrer(cas, mode);
  },

  ouvrirAdmin: () => set({ phase: 'admin' }),
  quitterAdmin: () => set({ phase: 'accueil' }),

  poserQuestion: (id) => {
    const { cas, journal, bilan, mode, aDejaPose } = get();
    if (aDejaPose(id)) return;
    const question = cas.questions.find((q) => q.id === id);
    if (!question) return;

    const messages: Message[] =
      mode === 'entrainement'
        ? [
            {
              id: ++compteurMessages,
              texte:
                question.poids > 0
                  ? `Question pertinente. ${question.commentaire ?? ''}`.trim()
                  : question.poids < 0
                    ? `Cette question n'apporte rien ici. ${question.commentaire ?? ''}`.trim()
                    : 'Question neutre : ni utile ni pénalisante.',
              ton: question.poids > 0 ? 'positif' : question.poids < 0 ? 'negatif' : 'neutre',
            },
          ]
        : [];

    set({
      journal: [...journal, { type: 'question', id }],
      bilan: [...bilan, { id: `q-${id}`, titre: question.libelle, contenu: question.reponse }],
      messages: [...get().messages, ...messages],
    });
  },

  lancerExamen: (id) => {
    const definition = CATALOGUE_EXAMENS[id];
    const { cas } = get();
    // Chaque examen part d'un patient sans cache ni prisme, en position primaire, et a la
    // distance de fixation qu'il impose.
    set({
      examenEnCours: id,
      etat: etatExamenInitial(
        get().etat.oeilFixateur,
        definition.distance === 'loin' ? DISTANCE_LOIN_CM : DISTANCE_PRES_CM,
      ),
    });
    if (get().mode === 'entrainement' && !cas.examens[id]) {
      set({
        messages: [
          ...get().messages,
          {
            id: ++compteurMessages,
            texte: "Cet examen n'est pas renseigné pour ce cas : il ne rapportera aucun point.",
            ton: 'neutre',
          },
        ],
      });
    }
  },

  abandonnerExamen: () =>
    set({ examenEnCours: null, etat: etatExamenInitial(get().etat.oeilFixateur) }),

  validerExamen: (saisie) => {
    const { examenEnCours, cas, journal, bilan, mode } = get();
    if (!examenEnCours) return;
    const definition = CATALOGUE_EXAMENS[examenEnCours];
    const examen = cas.examens[examenEnCours];

    const action: ActionJournal = {
      type: 'examen',
      id: examenEnCours,
      mesure: saisie?.mesure,
      interpretationId: saisie?.interpretationId,
      interpretationIds: saisie?.interpretationIds,
    };

    const messages: Message[] = [];
    if (mode === 'entrainement' && examen) {
      if (examen.poids < 0 && examen.justificationMalus) {
        messages.push({ id: ++compteurMessages, texte: examen.justificationMalus, ton: 'negatif' });
      }
      if (examen.attendu && saisie?.mesure !== undefined) {
        const juste = dansIntervalle(saisie.mesure, examen.attendu);
        messages.push({
          id: ++compteurMessages,
          texte: juste
            ? 'Mesure coherente avec ce que montre le patient.'
            : `Mesure éloignée : on attend entre ${examen.attendu.min} et ${examen.attendu.max} ${examen.attendu.unite}.`,
          ton: juste ? 'positif' : 'negatif',
        });
      }
      for (const interp of interpretationsExamen(examen)) {
        const choix =
          saisie?.interpretationIds?.[interp.id] ??
          (interpretationsExamen(examen).length === 1 ? saisie?.interpretationId : undefined);
        if (choix === undefined) continue;
        const juste = interp.options.find((o) => o.correct)?.id === choix;
        messages.push({
          id: ++compteurMessages,
          texte: juste ? 'Interprétation correcte.' : interp.explication,
          ton: juste ? 'positif' : 'negatif',
        });
      }
    }

    const contenu = [
      examen?.resultat ?? 'Examen réalisé, sans élément notable pour ce cas.',
      saisie?.mesure !== undefined ? `Mesure notee : ${saisie.mesure} DP.` : null,
    ]
      .filter(Boolean)
      .join(' ');

    set({
      journal: [...journal, action],
      bilan: [...bilan, { id: `e-${examenEnCours}-${journal.length}`, titre: definition.nom, contenu }],
      examenEnCours: null,
      etat: etatExamenInitial(get().etat.oeilFixateur),
      messages: [...get().messages, ...messages],
    });
  },

  passerALaSynthese: () => set({ phase: 'synthese', examenEnCours: null }),

  validerSynthese: (reponses) => {
    const { cas, bilan } = get();
    // Chaque reponse de synthese s'inscrit en fin de cahier : c'est le seul endroit
    // du jeu ou le diagnostic et la conduite chirurgicale sont nommes.
    const lignesSynthese = cas.synthese.questions.map((question, index) => {
      const brute = reponses[question.id]?.trim() ?? '';
      let contenu = brute || 'Sans réponse.';
      if (question.type === 'qcm') {
        contenu = question.options.find((o) => o.id === brute)?.libelle ?? contenu;
      } else if (question.type === 'ouiNon') {
        contenu = brute === 'oui' ? 'Oui' : brute === 'non' ? 'Non' : contenu;
      }
      return {
        id: `synthese-${question.id}`,
        titre: `Synthèse ${index + 1}`,
        contenu,
      };
    });
    set({
      reponsesSynthese: reponses,
      phase: 'debriefing',
      bilan: [...bilan, ...lignesSynthese],
    });
  },

  deplacerCible: (gaze) => set({ etat: { ...get().etat, gaze } }),

  occlure: (occlusion) => {
    const { etat, cas } = get();
    let oeilFixateur = etat.oeilFixateur;
    if (occlusion !== 'aucune' && occlusion === oeilFixateur) {
      oeilFixateur = autreOeil(oeilFixateur);
    }
    if (occlusion === 'aucune') {
      oeilFixateur = fixationApresDecache(cas.oculaire, oeilFixateur);
    }
    set({ etat: { ...etat, occlusion, oeilFixateur } });
  },

  poserPrisme: (oeil, prisme) => {
    const { etat } = get();
    const prismes = { ...etat.prismes };
    if (prisme) prismes[oeil] = prisme;
    else delete prismes[oeil];
    set({ etat: { ...etat, prismes } });
  },

  retirerInstruments: () =>
    set({
      etat: { ...get().etat, occlusion: 'aucune', prismes: {}, gaze: { azimuthDeg: 0, elevationDeg: 0 } },
    }),

  resultat: () => {
    const { cas, journal, reponsesSynthese } = get();
    return calculerScore(cas, journal, reponsesSynthese);
  },

  aDejaFait: (id) => get().journal.some((a) => a.type === 'examen' && a.id === id),
  aDejaPose: (id) => get().journal.some((a) => a.type === 'question' && a.id === id),
}));
