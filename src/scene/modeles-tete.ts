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
    // Orbites extraites automatiquement (Sphere_0 + mesh visage) dans TetePatient.
    credit: {
      titre: 'April',
      auteur: 'RubenBuchholz644c9d600cf24bcb',
      url: 'https://sketchfab.com/3d-models/april-4027a613edc14aacb3751c878a08d46e',
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
