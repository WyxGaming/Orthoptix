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
import { calculerScore, dansIntervalle, conditionsCorrespond, type Resultat } from './scoring';
import { examenResolu, libelleConditions } from './examen-resolver';
import type {
  ActionJournal,
  CasClinique,
  ConditionsExamen,
  ExamenId,
  QuestionAnamnese,
  ReponsesSynthese,
} from './types';
import type { EtapeComportementVisuelId } from './comportement-visuel';
import { ordreComportementVisuelRespecte } from './comportement-visuel';
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
  /** Conditions ASC/SC et loupes +3 choisies pour l'examen en cours. */
  conditionsExamen: ConditionsExamen;
  /** Lunettes portées par le patient (distinct du choix ASC/SC par examen). */
  correctionPortee: 'asc' | 'sc';
  reponsesSynthese: ReponsesSynthese | null;
  messages: Message[];

  demarrer: (cas: CasClinique, mode: Mode) => void;
  ouvrirAdmin: () => void;
  quitterAdmin: () => void;
  poserQuestion: (id: string) => void;
  lancerExamen: (id: ExamenId) => void;
  definirConditionsExamen: (conditions: ConditionsExamen) => void;
  validerExamen: (saisie?: {
    mesure?: number;
    interpretationId?: string;
    interpretationIds?: Record<string, string>;
    /** Plusieurs conditions consignees en une fois (SC / ASC / ASC+3). */
    passages?: Array<{
      conditions: ConditionsExamen;
      mesure?: number;
      interpretationId?: string;
      interpretationIds?: Record<string, string>;
    }>;
    /** Etapes consignees pour l examen comportement visuel. */
    etapesComportementVisuel?: EtapeComportementVisuelId[];
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
  /** Nombre de realisations d un examen (permet les repetitions avec conditions differentes). */
  nombreRealisations: (id: ExamenId) => number;
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
  conditionsExamen: { correction: 'asc' },
  correctionPortee: 'asc',
  reponsesSynthese: null,
  messages: [],

  demarrer: (cas, mode) => {
    const prepare = casCliniquePrepare(cas);
    const sansLunettes = Boolean(prepare.debutSansCorrection);
    set({
      cas: prepare,
      questionsOrdre: melangeAleatoire(prepare.questions),
      mode,
      phase: 'bilan',
      journal: [],
      bilan: [],
      etat: etatExamenInitial(oeilFixateurInitial(prepare)),
      examenEnCours: null,
      conditionsExamen: { correction: sansLunettes ? 'sc' : 'asc' },
      correctionPortee: sansLunettes ? 'sc' : 'asc',
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
    const { cas, journal, bilan, mode, aDejaPose, correctionPortee } = get();
    if (aDejaPose(id)) return;
    const question = cas.questions.find((q) => q.id === id);
    if (!question) return;

    const messages: Message[] = [];
    if (mode === 'entrainement') {
      messages.push({
        id: ++compteurMessages,
        texte:
          question.poids > 0
            ? `Question pertinente. ${question.commentaire ?? ''}`.trim()
            : question.poids < 0
              ? `Cette question n'apporte rien ici. ${question.commentaire ?? ''}`.trim()
              : 'Question neutre : ni utile ni pénalisante.',
        ton: question.poids > 0 ? 'positif' : question.poids < 0 ? 'negatif' : 'neutre',
      });
    }
    if (question.activeCorrection && correctionPortee === 'sc') {
      if (mode === 'entrainement') {
        messages.push({
          id: ++compteurMessages,
          texte: `${cas.patient.prenom} remet ses lunettes. Les examens sous correction (ASC) deviennent possibles.`,
          ton: 'positif',
        });
      }
    }

    set({
      journal: [...journal, { type: 'question', id }],
      bilan: [...bilan, { id: `q-${id}`, titre: question.libelle, contenu: question.reponse }],
      messages: [...get().messages, ...messages],
      ...(question.activeCorrection ? { correctionPortee: 'asc' as const } : {}),
    });
  },

  lancerExamen: (id) => {
    const definition = CATALOGUE_EXAMENS[id];
    const { cas, correctionPortee } = get();
    const options = cas.optionsExamen?.[id];
    set({
      examenEnCours: id,
      conditionsExamen: {
        correction: options?.choixCorrection ? correctionPortee : correctionPortee,
      },
      etat: etatExamenInitial(
        get().etat.oeilFixateur,
        definition.distance === 'loin' ? DISTANCE_LOIN_CM : DISTANCE_PRES_CM,
      ),
    });
    if (get().mode === 'entrainement' && !cas.examens[id] && !cas.resoudreExamen) {
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

  definirConditionsExamen: (conditions) => set({ conditionsExamen: conditions }),

  abandonnerExamen: () =>
    set({ examenEnCours: null, etat: etatExamenInitial(get().etat.oeilFixateur) }),

  validerExamen: (saisie) => {
    const { examenEnCours, cas, journal, bilan, mode, conditionsExamen } = get();
    if (!examenEnCours) return;
    const definition = CATALOGUE_EXAMENS[examenEnCours];
    const options = cas.optionsExamen?.[examenEnCours];

    type PassageSaisie = {
      conditions: ConditionsExamen;
      mesure?: number;
      interpretationId?: string;
      interpretationIds?: Record<string, string>;
      etapesComportementVisuel?: EtapeComportementVisuelId[];
    };

    const passages: PassageSaisie[] = saisie?.passages?.length
      ? saisie.passages
      : [
          {
            conditions:
              options?.choixCorrection || options?.choixLoupesPlus3
                ? conditionsExamen
                : { correction: 'asc' as const },
            mesure: saisie?.mesure,
            interpretationId: saisie?.interpretationId,
            interpretationIds: saisie?.interpretationIds,
            etapesComportementVisuel: saisie?.etapesComportementVisuel,
          },
        ];

    const dejaConsigne = (conditions: ConditionsExamen) =>
      journal.some(
        (a) =>
          a.type === 'examen' &&
          a.id === examenEnCours &&
          conditionsCorrespond(a.conditions ?? { correction: 'asc' }, conditions),
      );

    const nouveauxPassages = passages.filter((p) => !dejaConsigne(p.conditions));
    if (nouveauxPassages.length === 0) {
      set({
        examenEnCours: null,
        conditionsExamen: { correction: get().correctionPortee },
        etat: etatExamenInitial(get().etat.oeilFixateur),
      });
      return;
    }

    let journalCourant = journal;
    let bilanCourant = bilan;
    const messages: Message[] = [];

    for (const passage of nouveauxPassages) {
      const conditions =
        options?.choixCorrection || options?.choixLoupesPlus3 ? passage.conditions : undefined;

      const ctx = {
        examenId: examenEnCours,
        conditions: conditions ?? { correction: 'asc' as const },
        journal: journalCourant,
        indexJournal: journalCourant.length,
      };
      const examenStatique = cas.examens[examenEnCours];
      const examen = examenResolu(cas, ctx) ?? examenStatique;

      const action: ActionJournal = {
        type: 'examen',
        id: examenEnCours,
        conditions,
        mesure: passage.mesure,
        interpretationId: passage.interpretationId,
        interpretationIds: passage.interpretationIds,
        etapesComportementVisuel: passage.etapesComportementVisuel,
      };

      if (mode === 'entrainement' && examen) {
        if (
          examenEnCours === 'comportementVisuel' &&
          passage.etapesComportementVisuel?.length &&
          examen.etapesComportementVisuelAttendues?.length
        ) {
          const ordreOk = ordreComportementVisuelRespecte(
            passage.etapesComportementVisuel,
            examen.etapesComportementVisuelAttendues,
          );
          messages.push({
            id: ++compteurMessages,
            texte: ordreOk
              ? 'Ordre des épreuves correct (lumière mono → bino, objet mono → bino).'
              : 'Ordre attendu : lumière monoculaire, lumière binoculaire, objet monoculaire, objet binoculaire.',
            ton: ordreOk ? 'positif' : 'negatif',
          });
        }
        if (examen.nonContributifSiPresente && examen.justificationMalus) {
          messages.push({ id: ++compteurMessages, texte: examen.justificationMalus, ton: 'negatif' });
        } else if (examen.poids < 0 && examen.justificationMalus) {
          messages.push({ id: ++compteurMessages, texte: examen.justificationMalus, ton: 'negatif' });
        }
        if (examen.attendu && passage.mesure !== undefined) {
          const juste = dansIntervalle(passage.mesure, examen.attendu);
          messages.push({
            id: ++compteurMessages,
            texte: juste
              ? `Mesure coherente (${libelleConditions(ctx.conditions)}).`
              : `${libelleConditions(ctx.conditions)} : valeur attendue entre ${examen.attendu.min} et ${examen.attendu.max} ${examen.attendu.unite}.`,
            ton: juste ? 'positif' : 'negatif',
          });
        }
        for (const interp of interpretationsExamen(examen)) {
          const choix =
            passage.interpretationIds?.[interp.id] ??
            (interpretationsExamen(examen).length === 1 ? passage.interpretationId : undefined);
          if (choix === undefined) continue;
          const juste = interp.options.find((o) => o.correct)?.id === choix;
          messages.push({
            id: ++compteurMessages,
            texte: juste
              ? `Interprétation correcte (${libelleConditions(ctx.conditions)}).`
              : interp.explication,
            ton: juste ? 'positif' : 'negatif',
          });
        }
      }

      const libelleCond = conditions ? ` (${libelleConditions(conditions)})` : '';
      const contenu = [
        examen?.resultat ?? 'Examen réalisé, sans élément notable pour ce cas.',
        passage.mesure !== undefined ? `Mesure notee : ${passage.mesure} DP.` : null,
      ]
        .filter(Boolean)
        .join(' ');

      journalCourant = [...journalCourant, action];
      if (!examenStatique?.nonContributifSiPresente) {
        bilanCourant = [
          ...bilanCourant,
          {
            id: `e-${examenEnCours}-${journalCourant.length - 1}`,
            titre: `${definition.nom}${libelleCond}`,
            contenu,
          },
        ];
      }
    }

    set({
      journal: journalCourant,
      bilan: bilanCourant,
      examenEnCours: null,
      conditionsExamen: { correction: get().correctionPortee },
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
  nombreRealisations: (id) =>
    get().journal.filter((a) => a.type === 'examen' && a.id === id).length,
  aDejaPose: (id) => get().journal.some((a) => a.type === 'question' && a.id === id),
}));
