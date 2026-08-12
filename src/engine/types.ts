import type { ParametresOculaires } from '../domain/ocular-model';

export type Rubrique =
  | 'anamnese'
  | 'antecedents'
  | 'refraction'
  | 'sensoriel'
  | 'moteur'
  | 'reflets'
  | 'occlusion';

export type ExamenId =
  | 'acuite'
  | 'refraction'
  | 'lang'
  | 'tno'
  | 'worth'
  | 'bagolini'
  | 'verreRouge'
  | 'motilite'
  | 'bielschowsky'
  | 'hirschberg'
  | 'krimsky'
  | 'krimskyLoin'
  | 'coverPres'
  | 'coverLoin'
  | 'deviometrie'
  | 'biprisme';

/**
 * Ce que le praticien manipule dans la scene 3D pendant l'examen.
 * Un examen de type presentation n'a pas d'interaction : on montre un test au patient
 * et on recueille sa reponse.
 */
export type ModeInteraction = 'presentation' | 'reflets' | 'motilite' | 'occlusion';

export type DefinitionExamen = {
  id: ExamenId;
  nom: string;
  rubrique: Rubrique;
  /** Ce que fait l'examen, affiche avant de le lancer. */
  description: string;
  interaction: ModeInteraction;
  /** L'examen demande une mesure chiffree en dioptries prismatiques. */
  saisieMesure?: boolean;
  /** La boite de prismes est mise a disposition pendant l'examen. */
  prismes?: boolean;
  /** Distance de fixation imposee par l'examen. De pres par defaut. */
  distance?: 'pres' | 'loin';
};

export type QuestionAnamnese = {
  id: string;
  rubrique: 'anamnese' | 'antecedents';
  libelle: string;
  reponse: string;
  /** Positif si la question est essentielle, negatif si elle est hors sujet. */
  poids: number;
  commentaire?: string;
};

export type Intervalle = { min: number; max: number; unite: string };

export type OptionQcm = { id: string; libelle: string; correct: boolean };

export type Interpretation = {
  question: string;
  options: OptionQcm[];
  explication: string;
};

/** Un critere d'une reponse ouverte : au moins une variante doit apparaitre. */
export type CritereOuvert = {
  id: string;
  /** Formes acceptees, comparees apres normalisation (accents, casse). */
  variantes: string[];
};

export type NiveauPedagogique = 'L1' | 'L2' | 'L3';

/**
 * Question de la synthese diagnostique. QCM, oui/non ou reponse ouverte evaluee
 * par mots-cles (les signes pathognomoniques, la technique chirurgicale…).
 */
export type QuestionSynthese = {
  id: string;
  question: string;
  poids: number;
  explication: string;
  niveau?: NiveauPedagogique;
} & (
  | { type: 'qcm'; options: OptionQcm[] }
  | { type: 'ouiNon'; correct: boolean }
  | {
      type: 'ouverte';
      /** Criteres a retrouver dans la reponse libre. */
      criteres: CritereOuvert[];
      /** Nombre de criteres requis pour le score plein. Par defaut : tous. */
      seuil?: number;
      /** Formulation expert, affichee au debriefing. */
      reponseAttendue: string;
    }
);

export type SyntheseCas = {
  questions: QuestionSynthese[];
};

/** Reponses saisies a la synthese : id de question → choix QCM, « oui »/« non », ou texte libre. */
export type ReponsesSynthese = Record<string, string>;

export type ExamenCas = {
  /** Points de la realisation du geste. Negatif pour un examen non contributif. */
  poids: number;
  /** Compte rendu remis au praticien une fois l'examen realise. */
  resultat: string;
  /** Fourchette de reponse acceptee pour les examens chiffres. */
  attendu?: Intervalle;
  /** Pourquoi cet examen n'apporte rien dans ce cas precis. */
  justificationMalus?: string;
  interpretation?: Interpretation;
  /**
   * Examen utile mais non requis : s'il n'est pas fait, il n'apparait pas au bareme ;
   * s'il est fait, la realisation et l'interpretation comptent (et doivent etre justes).
   */
  optionnel?: boolean;
};

/** Trace ordonnee de ce que le praticien a fait, seule source du score. */
export type ActionJournal =
  | { type: 'question'; id: string }
  | { type: 'examen'; id: ExamenId; mesure?: number; interpretationId?: string };

export type CasClinique = {
  id: string;
  titre: string;
  resume: string;
  patient: { prenom: string; age: number; sexe: 'F' | 'M'; motif: string };
  oculaire: ParametresOculaires;
  questions: QuestionAnamnese[];
  examens: Partial<Record<ExamenId, ExamenCas>>;
  /** Ordre attendu des examens essentiels, utilise pour le bonus de conduite du bilan. */
  ordreAttendu: ExamenId[];
  synthese: SyntheseCas;
  /** Compte rendu tel que l'aurait redige un orthoptiste experimente. */
  compteRenduExpert: string[];
};
