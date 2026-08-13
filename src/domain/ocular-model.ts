import { degreesToPrism, prismToDegrees, reflexOffsetMm } from './prism';

export type Eye = 'OD' | 'OG';

export const EYES: readonly Eye[] = ['OD', 'OG'];

export const autreOeil = (eye: Eye): Eye => (eye === 'OD' ? 'OG' : 'OD');

/**
 * Repere patient : un azimut positif signifie que le patient regarde vers sa droite.
 * L'oeil droit adduit donc vers les azimuts negatifs, l'oeil gauche vers les positifs.
 */
export const signeAdduction = (eye: Eye): number => (eye === 'OD' ? -1 : 1);

const enRadians = (deg: number): number => (deg * Math.PI) / 180;
const enDegres = (rad: number): number => (rad * 180) / Math.PI;

/** Distance d'examen de pres, en centimetres. */
export const DISTANCE_PRES_CM = 33;

/** Distance d'examen de loin, en centimetres : la mire y est hors du champ visible. */
export const DISTANCE_LOIN_CM = 500;

/** Au-dela de deux metres, la fixation est consideree comme etant de loin. */
export const SEUIL_VISION_LOIN_CM = 200;

export const enVisionDeLoin = (etat: EtatExamen): boolean =>
  etat.distanceFixationCm >= SEUIL_VISION_LOIN_CM;

/** Demi-ecart pupillaire, en centimetres. */
export const DEMI_ECART_PUPILLAIRE_CM = 2.8;

export type Refraction = { sphere: number; cylindre?: number; axe?: number };

export type Fixation = { mode: 'alternante' } | { mode: 'preferee'; oeil: Eye };

export type Nystagmus = {
  type: 'manifeste-latent';
  /** Amplitude en degres, oeil non occlus. */
  amplitudeDeg: number;
  frequenceHz: number;
};

/**
 * Facteur de majoration du nystagmus manifeste latent lorsqu'un oeil est occlus.
 * C'est le signe cardinal : il se reveille a la rupture de la binocularite.
 */
export const MAJORATION_NYSTAGMUS_SOUS_OCCLUSION = 4;

/** Azimut au-dela duquel l'hyperaction en adduction est consideree maximale. */
export const PLATEAU_ADDUCTION_DEG = 25;

export type Deviation = { horizontal: number; vertical: number };

export type ParametresOculaires = {
  /** En dioptries prismatiques. Horizontal positif = esotropie, vertical positif = hypertropie. */
  deviation: Deviation;
  /**
   * Deviation en vision de loin, si elle differe de celle de pres. L'ecart entre les deux
   * signe une composante accommodative ; son absence, un angle stable, est au contraire
   * un argument pour un strabisme precoce. Par defaut, l'angle ne varie pas avec la distance.
   */
  deviationLoin?: Deviation;
  /** Deviation sans correction optique (SC), en vision de pres. */
  deviationSansCorrection?: Deviation;
  /** Deviation sans correction optique (SC), en vision de loin. */
  deviationLoinSansCorrection?: Deviation;
  /**
   * En ASC avec loupes +3 en VP, l'accommodation est saturee et la deviation de pres
   * devient orthotropique (O't) : la stéréoscopie existe mais n'est pas manifeste sans ce test.
   */
  orthotropieVpSurcorrection?: boolean;
  fixation: Fixation;
  /** Elevation en adduction, en DP, par oeil. Un upshoot bilateral se note sur les deux. */
  upshoot: Record<Eye, number>;
  /** Deviation verticale dissociee, en DP : l'oeil occlus s'eleve. */
  dvd: number;
  nystagmus?: Nystagmus;
  /** Angle kappa en DP. A zero, le reflet traduit directement l'angle objectif. */
  kappa: Record<Eye, number>;
  correction: Record<Eye, Refraction>;
  acuite: Record<Eye, string>;
};

export type Gaze = { azimuthDeg: number; elevationDeg: number };

export type Occlusion = 'aucune' | Eye;

export type BasePrisme = 'temporale' | 'nasale' | 'superieure' | 'inferieure';

export type Prisme = { puissance: number; base: BasePrisme };

export type EtatExamen = {
  /** Position de la cible de fixation. */
  gaze: Gaze;
  /** Distance de la mire, en centimetres : 33 cm de pres, 5 metres de loin. */
  distanceFixationCm: number;
  occlusion: Occlusion;
  oeilFixateur: Eye;
  prismes: Partial<Record<Eye, Prisme>>;
  /** Temps ecoule en secondes, utilise pour l'oscillation du nystagmus. */
  tempsS: number;
};

export type EtatOeil = {
  azimuthDeg: number;
  elevationDeg: number;
  /** Decentrement du reflet corneen en millimetres, dans le repere patient. */
  reflet: { xMm: number; yMm: number };
  /** Deviation de cet oeil par rapport a la direction de la lampe, en DP. */
  deviationLampeDp: { horizontal: number; vertical: number };
  occlus: boolean;
};

export const etatExamenInitial = (
  oeilFixateur: Eye,
  distanceFixationCm = DISTANCE_PRES_CM,
): EtatExamen => ({
  gaze: { azimuthDeg: 0, elevationDeg: 0 },
  distanceFixationCm,
  occlusion: 'aucune',
  oeilFixateur,
  prismes: {},
  tempsS: 0,
});

/**
 * Direction sous laquelle un oeil donne voit la mire, en azimut et elevation.
 *
 * La mire etant a distance finie, chaque oeil la voit sous un angle different : c'est
 * ce qui impose la convergence, d'environ 4,8 degres par oeil a 33 cm, contre 0,3 degre
 * seulement a 5 metres. Les axes visuels d'un sujet normal ne sont donc jamais paralleles
 * en vision de pres, et l'oeil fixateur n'est jamais exactement droit. C'est aussi la
 * direction de la lampe, que le praticien tient sur la mire : les reflets se lisent par
 * rapport a elle.
 */
export function directionMire(eye: Eye, gaze: Gaze, distanceCm = DISTANCE_PRES_CM): Gaze {
  const az = enRadians(gaze.azimuthDeg);
  const el = enRadians(gaze.elevationDeg);

  // Repere local a la tete : lateral compte vers la droite du patient, avant vers la mire.
  const lateralMire = distanceCm * Math.sin(az) * Math.cos(el);
  const avantMire = distanceCm * Math.cos(az) * Math.cos(el);
  const hauteurMire = distanceCm * Math.sin(el);

  // L'oeil droit est du cote droit du patient, celui ou signeAdduction vaut -1.
  const lateral = lateralMire + signeAdduction(eye) * DEMI_ECART_PUPILLAIRE_CM;

  return {
    azimuthDeg: enDegres(Math.atan2(lateral, avantMire)),
    elevationDeg: enDegres(Math.atan2(hauteurMire, Math.hypot(lateral, avantMire))),
  };
}

/**
 * Part d'adduction de l'oeil dans la position du regard courante, entre 0 et 1.
 */
export function ratioAdduction(eye: Eye, azimuthDeg: number): number {
  const adduction = signeAdduction(eye) * azimuthDeg;
  return Math.min(1, Math.max(0, adduction / PLATEAU_ADDUCTION_DEG));
}

/**
 * Effet d'un prisme devant un oeil, exprime en DP dans la convention interne
 * (horizontal positif = adduction requise, vertical positif = elevation requise).
 * L'image vue a travers un prisme se deplace vers son arete : l'oeil tourne donc
 * vers la base pour reprendre la fixation.
 */
export function effetPrisme(prisme: Prisme | undefined): { horizontal: number; vertical: number } {
  if (!prisme) return { horizontal: 0, vertical: 0 };
  switch (prisme.base) {
    case 'temporale':
      return { horizontal: prisme.puissance, vertical: 0 };
    case 'nasale':
      return { horizontal: -prisme.puissance, vertical: 0 };
    case 'superieure':
      return { horizontal: 0, vertical: prisme.puissance };
    case 'inferieure':
      return { horizontal: 0, vertical: -prisme.puissance };
  }
}

/** Version laterale au-dela de laquelle le fixateur bascule vers le cote du regard. */
export const SEUIL_FIXATION_LATERALE_DEG = 10;

/**
 * Oeil qui fixe reellement, compte tenu de la position du regard et de l'occlusion.
 *
 * En fixation alternante, regard a droite → OD fixe ; regard a gauche → OG fixe.
 * La fixation croisee (oeil en adduction) n'est pas simulee en motilite.
 */
export function oeilFixateurEffectif(params: ParametresOculaires, etat: EtatExamen): Eye {
  let souhaite = etat.oeilFixateur;
  if (params.fixation.mode === 'alternante') {
    if (etat.gaze.azimuthDeg > SEUIL_FIXATION_LATERALE_DEG) souhaite = 'OD';
    else if (etat.gaze.azimuthDeg < -SEUIL_FIXATION_LATERALE_DEG) souhaite = 'OG';
  }
  return etat.occlusion === souhaite ? autreOeil(souhaite) : souhaite;
}

/**
 * Calcule la position des deux yeux et le decentrement de leurs reflets corneens.
 * Tous les examens de reflets, de motilite et d'occlusion se lisent sur ce resultat :
 * les signes cliniques ne sont pas ecrits en dur, ils emergent de ce calcul.
 */
export function etatOculaire(
  params: ParametresOculaires,
  etat: EtatExamen,
  conditions?: ConditionsCorrection,
): Record<Eye, EtatOeil> {
  const fixateur = oeilFixateurEffectif(params, etat);

  // L'oeil fixateur tourne pour compenser le prisme place devant lui ; par la loi de
  // Hering, l'autre oeil suit du meme mouvement de version.
  const prismeFixateur = effetPrisme(etat.prismes[fixateur]);
  const versionDeg = signeAdduction(fixateur) * prismToDegrees(prismeFixateur.horizontal);
  const versionVerticaleDeg = prismToDegrees(prismeFixateur.vertical);

  const nystagmusDeg = amplitudeNystagmus(params, etat);
  const deviation = deviationEffective(params, etat, conditions);

  const resultat = {} as Record<Eye, EtatOeil>;

  for (const eye of EYES) {
    const estFixateur = eye === fixateur;
    const occlus = etat.occlusion === eye;

    // Deviation propre de l'oeil non fixateur.
    const devHorizontaleDp = estFixateur ? 0 : deviation.horizontal;
    let devVerticaleDp = estFixateur ? 0 : deviation.vertical;

    // L'hyperaction en adduction se lit sur l'oeil qui adduit, quel qu'il soit.
    devVerticaleDp += params.upshoot[eye] * ratioAdduction(eye, etat.gaze.azimuthDeg);

    // Deviation verticale dissociee : l'oeil prive de fixation s'eleve.
    if (occlus) devVerticaleDp += params.dvd;

    // Point de depart : la direction dans laquelle cet oeil doit tourner pour prendre
    // la mire. Elle inclut la convergence propre a la distance d'examen.
    const mire = directionMire(eye, etat.gaze, etat.distanceFixationCm);

    const azimuthDeg =
      mire.azimuthDeg +
      versionDeg +
      signeAdduction(eye) * prismToDegrees(devHorizontaleDp) +
      nystagmusDeg;

    const elevationDeg =
      mire.elevationDeg + versionVerticaleDeg + prismToDegrees(devVerticaleDp);

    // Deviation par rapport a la direction de la lampe, que le praticien tient sur la
    // mire : un oeil qui fixe reellement la mire ne montre donc aucun decentrement.
    const horizontalLampeDp = degreesToPrism(azimuthDeg - mire.azimuthDeg);
    const verticalLampeDp = degreesToPrism(elevationDeg - mire.elevationDeg);

    // La lumiere observee traverse le prisme a l'aller comme au retour : la rotation
    // que le prisme impose a l'oeil est donc compensee dans la position du reflet.
    // C'est ce qui fait converger Krimsky vers zero a la neutralisation, que le prisme
    // soit place devant l'oeil fixateur ou devant l'oeil devie.
    const prismeDevantCetOeil = effetPrisme(etat.prismes[eye]);
    const refletHorizontalDp =
      horizontalLampeDp -
      signeAdduction(eye) * prismeDevantCetOeil.horizontal +
      signeAdduction(eye) * params.kappa[eye];
    const refletVerticalDp = verticalLampeDp - prismeDevantCetOeil.vertical;

    resultat[eye] = {
      azimuthDeg,
      elevationDeg,
      // Le reflet se decentre a l'oppose de la rotation de l'oeil : un oeil en
      // esotropie montre un reflet deporte du cote temporal.
      reflet: {
        xMm: -reflexOffsetMm(refletHorizontalDp),
        yMm: -reflexOffsetMm(refletVerticalDp),
      },
      deviationLampeDp: { horizontal: horizontalLampeDp, vertical: verticalLampeDp },
      occlus,
    };
  }

  return resultat;
}

/**
 * Angle a retenir pour la distance de fixation courante. Un angle qui se majore de pres
 * traduit une composante accommodative ; c'est la comparaison des deux qui l'etablit.
 */
export function deviationALaDistance(params: ParametresOculaires, etat: EtatExamen): Deviation {
  return enVisionDeLoin(etat) && params.deviationLoin ? params.deviationLoin : params.deviation;
}

export type ConditionsCorrection = {
  correction: 'asc' | 'sc';
  loupesPlus3?: boolean;
};

/**
 * Deviation effective selon correction portee, distance et eventuelle sur-correction +3 en VP.
 */
export function deviationEffective(
  params: ParametresOculaires,
  etat: EtatExamen,
  conditions?: ConditionsCorrection,
): Deviation {
  const asc = !conditions || conditions.correction === 'asc';
  const plus3 = Boolean(conditions?.loupesPlus3 && !enVisionDeLoin(etat));

  if (asc && plus3 && params.orthotropieVpSurcorrection) {
    return { horizontal: 0, vertical: 0 };
  }

  const deLoin = enVisionDeLoin(etat);

  if (!asc) {
    if (deLoin) {
      return (
        params.deviationLoinSansCorrection ??
        params.deviationSansCorrection ??
        params.deviationLoin ??
        params.deviation
      );
    }
    return params.deviationSansCorrection ?? params.deviation;
  }

  return deviationALaDistance(params, etat);
}

/** Oscillation conjuguee du nystagmus, majoree des qu'un oeil est occlus. */
export function amplitudeNystagmus(params: ParametresOculaires, etat: EtatExamen): number {
  const n = params.nystagmus;
  if (!n) return 0;
  const facteur = etat.occlusion === 'aucune' ? 1 : MAJORATION_NYSTAGMUS_SOUS_OCCLUSION;
  return n.amplitudeDeg * facteur * Math.sin(2 * Math.PI * n.frequenceHz * etat.tempsS);
}

/**
 * Nouvel oeil fixateur apres une manoeuvre d'occlusion.
 * En fixation alternante, l'oeil qui a pris la fixation la conserve au decache :
 * c'est ce que l'etudiant doit observer au cover test alterne. Avec une preference
 * de fixation, l'oeil dominant reprend la main des qu'il est decouvert.
 */
export function fixationApresDecache(params: ParametresOculaires, fixateurActuel: Eye): Eye {
  return params.fixation.mode === 'alternante' ? fixateurActuel : params.fixation.oeil;
}
