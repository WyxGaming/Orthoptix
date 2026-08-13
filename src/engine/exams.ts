import type { DefinitionExamen, ExamenId, Rubrique } from './types';

/**
 * Catalogue générique des examens disponibles au cabinet. Il ne dépend d'aucun cas :
 * c'est le cas clinique qui déclare le résultat obtenu et le barème de chacun.
 */
export const CATALOGUE_EXAMENS: Record<ExamenId, DefinitionExamen> = {
  acuite: {
    id: 'acuite',
    nom: 'Acuité visuelle',
    rubrique: 'refraction',
    description: "Mesure de l'acuité de loin et de près, œil par œil, avec la correction portée.",
    interaction: 'presentation',
  },
  refraction: {
    id: 'refraction',
    nom: 'Réfraction / correction portée',
    rubrique: 'refraction',
    description: 'Relevé de la correction optique portée et de la réfraction objective.',
    interaction: 'presentation',
  },
  lang: {
    id: 'lang',
    nom: 'Test de Lang',
    rubrique: 'sensoriel',
    description:
      'Test stéréoscopique avec correction optique, présenté à 40 cm.',
    interaction: 'presentation',
  },
  tno: {
    id: 'tno',
    nom: 'TNO',
    rubrique: 'sensoriel',
    description: 'Test stéréoscopique aléatoire avec lunettes rouge-vert.',
    interaction: 'presentation',
  },
  worth: {
    id: 'worth',
    nom: 'Test de Worth',
    rubrique: 'sensoriel',
    description: 'Quatre points colorés.',
    interaction: 'presentation',
  },
  bagolini: {
    id: 'bagolini',
    nom: 'Verres striés de Bagolini',
    rubrique: 'sensoriel',
    description: 'Deux verres striés, conditions peu dissociantes.',
    interaction: 'presentation',
  },
  verreRouge: {
    id: 'verreRouge',
    nom: 'Verre rouge',
    rubrique: 'sensoriel',
    description: 'Filtre rouge.',
    interaction: 'presentation',
  },
  motilite: {
    id: 'motilite',
    nom: 'Motilité oculaire',
    rubrique: 'moteur',
    description:
      'Poursuite de la mire, tenue à 33 cm, dans les neuf positions du regard.',
    interaction: 'motilite',
  },
  bielschowsky: {
    id: 'bielschowsky',
    nom: 'Manœuvre de Bielschowsky',
    rubrique: 'moteur',
    description: 'Inclinaison de la tête sur chaque épaule.',
    interaction: 'presentation',
  },
  hirschberg: {
    id: 'hirschberg',
    nom: 'Reflets de Hirschberg',
    rubrique: 'reflets',
    description: "Lampe tenue à 33 cm dans l'axe visuel.",
    interaction: 'reflets',
    saisieMesure: true,
  },
  krimsky: {
    id: 'krimsky',
    nom: 'Test de Krimsky',
    rubrique: 'reflets',
    description: 'Prismes interposés, lampe à 33 cm.',
    interaction: 'reflets',
    saisieMesure: true,
    prismes: true,
  },
  krimskyLoin: {
    id: 'krimskyLoin',
    nom: 'Test de Krimsky de loin',
    rubrique: 'reflets',
    description: 'Prismes interposés, lumière à 5 mètres.',
    interaction: 'reflets',
    saisieMesure: true,
    prismes: true,
    distance: 'loin',
  },
  coverPres: {
    id: 'coverPres',
    nom: 'Cover test en VP',
    rubrique: 'occlusion',
    description: 'Cover test unilatéral puis alterné, sur mire à 33 cm.',
    interaction: 'occlusion',
    saisieMesure: true,
    prismes: true,
  },
  coverLoin: {
    id: 'coverLoin',
    nom: 'Cover test en VL',
    rubrique: 'occlusion',
    description: 'Cover test unilatéral puis alterné, sur mire à 5 mètres.',
    interaction: 'occlusion',
    saisieMesure: true,
    prismes: true,
    distance: 'loin',
  },
  reactionOcclusion: {
    id: 'reactionOcclusion',
    nom: "Réaction à l'occlusion",
    rubrique: 'sensoriel',
    description:
      "Occlusion brève de chaque œil : observation du comportement (mouvements de tête, recherche de l'occlusion, préférence fixatrice).",
    interaction: 'presentation',
  },
  deviometrie: {
    id: 'deviometrie',
    nom: 'Déviométrie au synoptophore',
    rubrique: 'occlusion',
    description: 'Mesure au synoptophore.',
    interaction: 'presentation',
  },
  biprisme: {
    id: 'biprisme',
    nom: 'Biprisme de Gracis',
    rubrique: 'occlusion',
    description: 'Biprisme de Gracis.',
    interaction: 'presentation',
  },
};

export const LIBELLES_RUBRIQUES: Record<Rubrique, string> = {
  anamnese: 'Anamnèse',
  antecedents: 'Antécédents',
  refraction: 'Réfraction et acuité',
  sensoriel: 'Examen sensoriel',
  moteur: 'Motilité',
  reflets: 'Étude des reflets',
  occlusion: "Épreuves d'occlusion",
};

export const ORDRE_RUBRIQUES: Rubrique[] = [
  'refraction',
  'sensoriel',
  'moteur',
  'reflets',
  'occlusion',
];

export const examensParRubrique = (rubrique: Rubrique): DefinitionExamen[] =>
  Object.values(CATALOGUE_EXAMENS).filter((e) => e.rubrique === rubrique);
