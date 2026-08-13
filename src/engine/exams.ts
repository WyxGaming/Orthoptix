import type { DefinitionExamen, ExamenId, Rubrique } from './types';

/**
 * Catalogue generique des examens disponibles au cabinet. Il ne depend d'aucun cas :
 * c'est le cas clinique qui declare le resultat obtenu et le bareme de chacun.
 */
export const CATALOGUE_EXAMENS: Record<ExamenId, DefinitionExamen> = {
  acuite: {
    id: 'acuite',
    nom: 'Acuite visuelle',
    rubrique: 'refraction',
    description: 'Mesure de l acuite de loin et de pres, oeil par oeil, avec la correction portee.',
    interaction: 'presentation',
  },
  refraction: {
    id: 'refraction',
    nom: 'Refraction / correction portee',
    rubrique: 'refraction',
    description: 'Releve de la correction optique portee et de la refraction objective.',
    interaction: 'presentation',
  },
  lang: {
    id: 'lang',
    nom: 'Test de Lang',
    rubrique: 'sensoriel',
    description:
      'Test stereoscopique avec correction optique, presente a 40 cm. Depistage rapide de la vision du relief.',
    interaction: 'presentation',
  },
  tno: {
    id: 'tno',
    nom: 'TNO',
    rubrique: 'sensoriel',
    description:
      'Test stereoscopique aleatoire avec lunettes rouge-vert, quantifie le seuil de stereoscopie.',
    interaction: 'presentation',
  },
  worth: {
    id: 'worth',
    nom: 'Test de Worth',
    rubrique: 'sensoriel',
    description: 'Recherche de fusion et de neutralisation a l aide de quatre points colores.',
    interaction: 'presentation',
  },
  bagolini: {
    id: 'bagolini',
    nom: 'Verres stries de Bagolini',
    rubrique: 'sensoriel',
    description:
      'Etude de la correspondance retinienne en conditions peu dissociantes, a l aide de deux verres stries.',
    interaction: 'presentation',
  },
  verreRouge: {
    id: 'verreRouge',
    nom: 'Verre rouge',
    rubrique: 'sensoriel',
    description: 'Recherche de diplopie et de la correspondance retinienne sous filtre rouge.',
    interaction: 'presentation',
  },
  motilite: {
    id: 'motilite',
    nom: 'Motilite oculaire',
    rubrique: 'moteur',
    description:
      'Poursuite de la mire, tenue a 33 cm, dans les neuf positions du regard, a la recherche d une hyper ou d une hypoaction.',
    interaction: 'motilite',
  },
  bielschowsky: {
    id: 'bielschowsky',
    nom: 'Manoeuvre de Bielschowsky',
    rubrique: 'moteur',
    description:
      'Inclinaison de la tete sur chaque epaule, pour explorer une paralysie d un muscle cyclovertical.',
    interaction: 'presentation',
  },
  hirschberg: {
    id: 'hirschberg',
    nom: 'Reflets de Hirschberg',
    rubrique: 'reflets',
    description:
      'Lampe tenue a 33 cm dans l axe visuel : estimation de l angle par le decentrement du reflet corneen.',
    interaction: 'reflets',
    saisieMesure: true,
  },
  krimsky: {
    id: 'krimsky',
    nom: 'Test de Krimsky',
    rubrique: 'reflets',
    description:
      'Prismes interposes, lampe a 33 cm, jusqu a recentrer le reflet corneen de l oeil devie : quantifie l angle.',
    interaction: 'reflets',
    saisieMesure: true,
    prismes: true,
  },
  krimskyLoin: {
    id: 'krimskyLoin',
    nom: 'Test de Krimsky de loin',
    rubrique: 'reflets',
    description:
      'Meme neutralisation par prismes, mais sur une lumiere placee a 5 metres : l enfant n accommode plus. Utile quand la cooperation ne permet pas le cover test.',
    interaction: 'reflets',
    saisieMesure: true,
    prismes: true,
    distance: 'loin',
  },
  coverPres: {
    id: 'coverPres',
    nom: 'Cover test en VP',
    rubrique: 'occlusion',
    description:
      'Cover test unilateral puis alterne, sur mire a 33 cm : depiste la tropie, precise la fixation, puis quantifie l angle total aux prismes.',
    interaction: 'occlusion',
    saisieMesure: true,
    prismes: true,
  },
  coverLoin: {
    id: 'coverLoin',
    nom: 'Cover test en VL',
    rubrique: 'occlusion',
    description:
      'Meme epreuve sur une mire a 5 metres : l enfant n accommode plus. Comparer les deux angles fait la part de l accommodation dans la deviation.',
    interaction: 'occlusion',
    saisieMesure: true,
    prismes: true,
    distance: 'loin',
  },
  deviometrie: {
    id: 'deviometrie',
    nom: 'Deviometrie au synoptophore',
    rubrique: 'occlusion',
    description:
      'Mesure objective et subjective de l angle, et surtout etude de la correspondance retinienne au synoptophore.',
    interaction: 'presentation',
  },
  biprisme: {
    id: 'biprisme',
    nom: 'Biprisme de Gracis',
    rubrique: 'occlusion',
    description: 'Recherche d une microtropie et de la correspondance retinienne au biprisme.',
    interaction: 'presentation',
  },
};

export const LIBELLES_RUBRIQUES: Record<Rubrique, string> = {
  anamnese: 'Anamnese',
  antecedents: 'Antecedents',
  refraction: 'Refraction et acuite',
  sensoriel: 'Examen sensoriel',
  moteur: 'Motilite',
  reflets: 'Etude des reflets',
  occlusion: 'Epreuves d occlusion',
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
