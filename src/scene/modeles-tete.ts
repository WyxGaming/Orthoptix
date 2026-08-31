import type { PositionsOrbites } from './orbites';

export type ConfigModeleTete = {
  url: string;
  /** Hauteur cible du visage en centimetres (menton → vertex). */
  hauteurVisageCm?: number;
  /** Decalage fin apres centrage automatique. */
  decalageFin?: [number, number, number];
  /** Noeuds a masquer (lampes Blender, yeux du mesh…). */
  masquer?: RegExp;
  /** Orbites manuelles si le modele n'a pas de meshes « Eye ». */
  orbites?: PositionsOrbites;
  /** Ajustement fin des orbites extraites automatiquement [x, y, z] en cm. */
  decalageOrbites?: [number, number, number];
  /** Centroïdes bruts du mesh Eye (sans reculZ/hausseY), ex. eyes_low Sketchfab. */
  orbitesCentroidesDirects?: boolean;
  /** Retire des cm a l'ecart interpupillaire total (chaque oeil rapproche de la moitie). */
  reductionEcartPupillaireCm?: number;
  /** Facteur d'echelle des globes cliniques (1 = taille extraite du mesh). */
  echelleGlobes?: number;
  /** Ordre de rendu des globes cliniques (defaut : test de profondeur naturel). */
  ordreRenduGlobes?: number;
  credit?: { titre: string; auteur: string; url: string; licence: string };
};

const DECALAGE_ANGELICA: [number, number, number] = [0, 1.2, 1.8];

export const MODELE_TETE_DEFAUT = 'esotropie-precoce';

export const MODELES_TETE: Record<string, ConfigModeleTete> = {
  'esotropie-precoce': {
    url: '/models/angelica/lea.glb',
    hauteurVisageCm: 22,
    decalageFin: DECALAGE_ANGELICA,
    credit: {
      titre: 'Angelica',
      auteur: 'NikZava284',
      url: 'https://sketchfab.com/3d-models/angelica-27f75fa94c384000bb6a79a3000f8e80',
      licence: 'CC-BY-4.0',
    },
  },
  'esotropie-accommodative': {
    url: '/models/april/maxime.glb',
    hauteurVisageCm: 22,
    decalageFin: [0, 0.6, 1.2],
    masquer: /^(Lamp|Sphere)/i,
    decalageOrbites: [0, 3, -1.5],
    reductionEcartPupillaireCm: 1,
    // Orbites extraites automatiquement dans TetePatient, puis decalageOrbites.
    credit: {
      titre: 'April',
      auteur: 'RubenBuchholz644c9d600cf24bcb',
      url: 'https://sketchfab.com/3d-models/april-4027a613edc14aacb3751c878a08d46e',
      licence: 'CC-BY-4.0',
    },
  },
  /** Cas 3 — Jessica, 38 ans. */
  jessica: {
    url: '/models/rihanna_head_model/rihanna.glb',
    hauteurVisageCm: 22,
    decalageFin: [0, 0.55, 1.15],
    masquer: /^lashes/i,
    orbitesCentroidesDirects: true,
    /** Ajustement fin X/Y/Z (cm) après centroïdes eyes_low. */
    decalageOrbites: [0, -0.17, -0.22],
    /** +2 mm écart interpupillaire (valeur négative = écartement). */
    reductionEcartPupillaireCm: -0.2,
    /** Réduit pour rentrer les bords temporaux sous la paupière inférieure. */
    echelleGlobes: 0.50,
    credit: {
      titre: 'Rihanna Head Model',
      auteur: 'oYummi',
      url: 'https://sketchfab.com/3d-models/rihanna-head-model-a5c312e6a56d4566af4b848159e8b541',
      licence: 'CC-BY-4.0',
    },
  },
};

export function configModeleTete(casId: string): ConfigModeleTete {
  return MODELES_TETE[casId] ?? MODELES_TETE[MODELE_TETE_DEFAUT]!;
}

/** Prechargement des visages au demarrage de l app. */
export function urlsModelesTete(): string[] {
  return [...new Set(Object.values(MODELES_TETE).map((m) => m.url))];
}
