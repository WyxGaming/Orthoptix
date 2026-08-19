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
  | 'biprisme'
  | 'lancaster';

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
  /** Pose la correction du patient (lunettes remises). */
  activeCorrection?: boolean;
};

export type Intervalle = { min: number; max: number; unite: string };

export type OptionQcm = { id: string; libelle: string; correct: boolean };

export type Interpretation = {
  /** Identifiant stable quand plusieurs questions d interpretation sur un meme examen. */
  id?: string;
  question: string;
  options: OptionQcm[];
  explication: string;
};

/** Toutes les questions d interpretation d un examen (une ou plusieurs). */
export function interpretationsExamen(
  examen: Pick<ExamenCas, 'interpretation' | 'interpretations'>,
): (Interpretation & { id: string })[] {
  if (examen.interpretations?.length) {
    return examen.interpretations.map((interp, index) => ({
      ...interp,
      id: interp.id ?? `q${index}`,
    }));
  }
  if (examen.interpretation) {
    return [{ ...examen.interpretation, id: examen.interpretation.id ?? 'unique' }];
  }
  return [];
}

/** Un critere d'une reponse ouverte : au moins une variante doit apparaitre. */
export type CritereOuvert = {
  id: string;
  /** Formes acceptees, comparees apres normalisation (accents, casse). */
  variantes: string[];
};

export type NiveauPedagogique = 'L1' | 'L2' | 'L3';

/** Examen complementaire prescrit en synthese : detecte par mots-cles, retour simule. */
export type ExamenComplementairePrescrit = {
  id: string;
  libelle: string;
  /** Formes acceptees dans la prescription (normalisation identique aux reponses ouvertes). */
  variantes: string[];
  /** Compte rendu texte (si pas d'image). */
  resultat?: string;
  /** Chemin public vers une image de resultat (ex. /examens/lancaster.png). */
  imageResultat?: string;
  /** Legende sous l'image et dans le cahier de bilan. */
  legendeImage?: string;
  /** Compte pour le seuil de prescription (defaut : true). */
  essentiel?: boolean;
};

/** Groupe de criteres : une reponse valide si le seuil est atteint dans ce groupe. */
export type AlternativeOuverte = {
  id?: string;
  criteres: CritereOuvert[];
  /** Nombre de criteres requis dans ce groupe. Par defaut : tous. */
  seuil?: number;
};

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
      /** Criteres a retrouver (mode simple). */
      criteres?: CritereOuvert[];
      /** Groupes alternatifs : la reponse est valide si l un d eux atteint son seuil. */
      alternatives?: AlternativeOuverte[];
      /** Criteres optionnels qui ajoutent un bonus si presents. */
      bonusCriteres?: CritereOuvert[];
      bonusPoints?: number;
      /** Nombre de criteres requis pour le score plein (mode simple). Par defaut : tous. */
      seuil?: number;
      /** Formulation expert, affichee au debriefing. */
      reponseAttendue: string;
    }
  | {
      type: 'examensComplementaires';
      examens: ExamenComplementairePrescrit[];
      /** Nombre d'examens essentiels a prescrire pour le score plein. Par defaut : 2. */
      seuil?: number;
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
  /** Image affichee a la place du texte (ex. test de Lancaster). */
  imageResultat?: string;
  /** Legende sous l'image. */
  legendeImage?: string;
  /** Fourchette de reponse acceptee pour les examens chiffres. */
  attendu?: Intervalle;
  /** Pourquoi cet examen n'apporte rien dans ce cas precis. */
  justificationMalus?: string;
  interpretation?: Interpretation;
  /** Plusieurs questions d interpretation pour un meme examen (ex. synoptophore). */
  interpretations?: Interpretation[];
  /**
   * Examen utile mais non requis : s'il n'est pas fait, il n'apparait pas au bareme ;
   * s'il est fait, la realisation et l'interpretation comptent (et doivent etre justes).
   */
  optionnel?: boolean;
  /**
   * Examen accessible mais inutile dans ce cas : absent du bareme tant qu'il n'est pas
   * presente ; un malus s'applique des la presentation (ex. synoptophore, biprisme).
   */
  nonContributifSiPresente?: boolean;
  /** Points retires si l'examen non contributif est presente. */
  malusSiPresente?: number;
};

/** Conditions choisies par l'étudiant au lancement d'un examen (ASC/SC, loupes +3). */
export type ConditionsExamen = {
  correction: 'asc' | 'sc';
  /** Sur-correction sphérique +3 en VP pour le test accommodatif. */
  loupesPlus3?: boolean;
};

/** Options de conditions disponibles pour un examen donné dans un cas. */
export type OptionsExamen = {
  choixCorrection?: boolean;
  choixLoupesPlus3?: boolean;
};

export type ContexteExamen = {
  examenId: ExamenId;
  conditions: ConditionsExamen;
  journal: ActionJournal[];
  indexJournal: number;
};

/** Realisation attendue avec conditions precises (ex. cover ASC puis SC puis +3). */
export type RealisationAttendue = {
  examenId: ExamenId;
  conditions: ConditionsExamen;
  poids: number;
  attendu?: Intervalle;
  /** Pour le TNO : doit etre realise avant tout examen dissociant. */
  avantDissociation?: boolean;
  libelle?: string;
};

/** Trace ordonnee de ce que le praticien a fait, seule source du score. */
export type ActionJournal =
  | { type: 'question'; id: string }
  | {
      type: 'examen';
      id: ExamenId;
      conditions?: ConditionsExamen;
      mesure?: number;
      interpretationId?: string;
      interpretationIds?: Record<string, string>;
    };

export type CasClinique = {
  id: string;
  titre: string;
  resume: string;
  patient: { prenom: string; age: number; sexe: 'F' | 'M'; motif: string };
  oculaire: ParametresOculaires;
  /** Le patient arrive sans lunettes ; le praticien doit les lui redemander. */
  debutSansCorrection?: boolean;
  questions: QuestionAnamnese[];
  examens: Partial<Record<ExamenId, ExamenCas>>;
  /** Examens pour lesquels l'étudiant choisit ASC/SC et éventuellement les loupes +3. */
  optionsExamen?: Partial<Record<ExamenId, OptionsExamen>>;
  /**
   * Résout le résultat, la fourchette attendue et les interprétations selon les conditions
   * choisies et l'ordre du bilan (ex. TNO avant dissociation).
   */
  resoudreExamen?: (ctx: ContexteExamen) => ExamenCas | null;
  /**
   * Realisations attendues avec conditions (cover ASC/SC/+3, TNO precoce…).
   * Quand present, le bareme score chaque combinaison separement.
   */
  realisationsAttendues?: RealisationAttendue[];
  /** Ordre attendu des examens essentiels, utilise pour le bonus de conduite du bilan. */
  ordreAttendu: ExamenId[];
  /** Message de debriefing si le bonus conduite du bilan n est pas obtenu. */
  commentaireConduiteBilan?: string;
  /**
   * Ordre relatif attendu des questions d anamnese (ids), pour le bonus de conduite
   * de l interrogatoire. Seules ces questions comptent ; les autres peuvent s intercaler.
   */
  ordreAnamneseAttendu?: string[];
  /** Question d anamnese qui doit etre posee en tout premier (malus si une autre est posee avant). */
  questionObligatoireEnPremier?: string;
  synthese: SyntheseCas;
  /** Compte rendu tel que l'aurait redige un orthoptiste experimente. */
  compteRenduExpert: string[];
};
