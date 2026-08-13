import type { CasClinique, ContexteExamen, ExamenCas } from '../engine/types';
import { examensDissociantsAvant } from '../engine/examen-resolver';

const OPTIONS_EXAMEN = {
  lang: { choixCorrection: true },
  tno: { choixCorrection: true, choixLoupesPlus3: true },
  hirschberg: { choixCorrection: true, choixLoupesPlus3: true },
  krimsky: { choixCorrection: true, choixLoupesPlus3: true },
  krimskyLoin: { choixCorrection: true },
  coverPres: { choixCorrection: true, choixLoupesPlus3: true },
  coverLoin: { choixCorrection: true },
} as const;

function resoudreExamenMaxime(ctx: ContexteExamen): ExamenCas | null {
  const { examenId, conditions, journal, indexJournal } = ctx;
  const dissociationFaite = examensDissociantsAvant(journal, indexJournal).length > 0;
  const asc = conditions.correction === 'asc';
  const plus3 = Boolean(conditions.loupesPlus3);

  switch (examenId) {
    case 'lang':
      if (asc) {
        return {
          poids: 0,
          resultat:
            'Test de Lang positif : Maxime identifie les deux figures en relief et les décrit correctement.',
          interpretation: {
            question: 'Que traduit ce résultat avec correction ?',
            options: [
              {
                id: 'stereo-presente',
                libelle: 'Vision stéréoscopique présente sous correction optique totale',
                correct: true,
              },
              {
                id: 'pas-stereo',
                libelle: 'Absence de vision stéréoscopique malgré la correction',
                correct: false,
              },
              {
                id: 'defaut-comprehension',
                libelle: 'Simple défaut de compréhension de la consigne',
                correct: false,
              },
            ],
            explication:
              'Sous correction totale, le Lang positif prouve qu une vision stéréoscopique existe : la binocularité sensorielle est conservée malgré la tropie manifeste.',
          },
        };
      }
      return {
        poids: 0,
        resultat:
          'Test de Lang négatif sans correction : aucune figure perçue en relief.',
        interpretation: {
          question: 'Que concluez-vous du Lang sans correction ?',
          options: [
            {
              id: 'angle-sc',
              libelle:
                "L angle sans correction est trop large pour permettre la fusion ; ce n est pas une preuve d absence de stéréoscopie sous ASC",
              correct: true,
            },
            {
              id: 'pas-stereo',
              libelle: 'Absence définitive de vision stéréoscopique',
              correct: false,
            },
            {
              id: 'esophorie',
              libelle: 'Esophorie décompensée sans correction',
              correct: false,
            },
          ],
          explication:
            'Sans correction, l hypermétropie non compensée majore l esotropie : le Lang devient négatif. Il faut le comparer au Lang ASC, qui reste positif ici.',
        },
      };

    case 'tno': {
      const conditionsIdeales = asc && plus3 && !dissociationFaite;
      if (conditionsIdeales) {
        return {
          poids: 0,
          resultat:
            'TNO : plages perçues jusqu à 120″ (2/2), stéréoscopie fine retrouvée avec correction et loupes +3.',
          interpretation: {
            question: 'Comment interpréter ce TNO précoce avec ASC et loupes +3 ?',
            options: [
              {
                id: 'stereo-latente',
                libelle:
                  'Stéréoscopie présente mais non manifeste en conditions habituelles ; le test +3 la révèle',
                correct: true,
              },
              {
                id: 'stereo-absente',
                libelle: 'Stéréoscopie absente malgré le test',
                correct: false,
              },
              {
                id: 'artifact',
                libelle: 'Artefact de test sans valeur clinique',
                correct: false,
              },
            ],
            explication:
              'Le TNO doit être réalisé tôt, en ASC avec loupes +3, avant toute dissociation. Ici il confirme une stéréoscopie existante lorsque l accommodation est saturée.',
          },
        };
      }
      return {
        poids: 0,
        resultat: 'Aucune plage perçue en relief au TNO dans ces conditions.',
        interpretation: {
          question: 'Pourquoi le TNO est-il négatif ici ?',
          options: [
            {
              id: 'conditions',
              libelle:
                'Conditions inadaptées : il faut ASC + loupes +3, en début de bilan avant les épreuves dissociantes',
              correct: true,
            },
            {
              id: 'absence-definitive',
              libelle: 'Absence définitive de stéréoscopie chez ce patient',
              correct: false,
            },
            {
              id: 'mauvaise-cooperation',
              libelle: 'Mauvaise coopération du patient',
              correct: false,
            },
          ],
          explication:
            'Sans loupes +3, ou après cover test et autres épreuves dissociantes, le TNO est négatif même en ASC : la dissociation préalable ou l absence de saturation accommodative masque la stéréoscopie.',
        },
      };
    }

    case 'hirschberg':
    case 'krimsky': {
      if (asc && plus3) {
        return {
          poids: 0,
          resultat:
            'Reflets centrés des deux côtés en position primaire : orthotropie de près (O\'t) avec loupes +3.',
          attendu: { min: 0, max: 2, unite: 'DP' },
          interpretation: {
            question: 'Que signifie l orthotropie de près avec les loupes +3 ?',
            options: [
              {
                id: 'stereo-existe',
                libelle:
                  'Une vision stéréoscopique existe si l accommodation est totalement saturée ; la tropie de près est accommodative',
                correct: true,
              },
              {
                id: 'gueri',
                libelle: 'Le patient est orthophorique et n a plus de strabisme',
                correct: false,
              },
              {
                id: 'esophorie',
                libelle: 'Esophorie simplement décompensée',
                correct: false,
              },
            ],
            explication:
              'O\'t sous +3 montre que la composante accommodative peut être neutralisée : la stéréoscopie existe mais n est pas manifeste au quotidien sans ce test.',
          },
        };
      }
      if (asc) {
        return {
          poids: 0,
          resultat:
            'Reflet temporalisé sur l œil dévié : esotropie de près d environ 15 DP avec correction portée.',
          attendu: { min: 12, max: 18, unite: 'DP' },
        };
      }
      return {
        poids: 0,
        resultat:
          'Reflet nettement temporalisé : esotropie de près d environ 40 DP sans correction.',
        attendu: { min: 35, max: 45, unite: 'DP' },
      };
    }

    case 'krimskyLoin': {
      if (asc) {
        return {
          poids: 0,
          resultat: 'En vision de loin avec correction : esotropie d environ 6 DP.',
          attendu: { min: 4, max: 8, unite: 'DP' },
        };
      }
      return {
        poids: 0,
        resultat: 'Sans correction : esotropie de loin d environ 10 DP.',
        attendu: { min: 8, max: 12, unite: 'DP' },
      };
    }

    case 'coverPres': {
      if (asc && plus3) {
        return {
          poids: 0,
          resultat:
            'Cover test de près avec loupes +3 : pas de mouvement de restitution, yeux parallèles (O\'t).',
          attendu: { min: 0, max: 2, unite: 'DP' },
          interpretation: {
            question: 'Que démontre le cover test de près avec +3 ?',
            options: [
              {
                id: 'composante-accommodative',
                libelle:
                  'Composante accommodative majeure : la tropie disparaît quand l accommodation est saturée',
                correct: true,
              },
              {
                id: 'phorie',
                libelle: 'Esophorie simplement décompensée',
                correct: false,
              },
              {
                id: 'guerison',
                libelle: 'Absence de strabisme',
                correct: false,
              },
            ],
            explication:
              'L orthotropie sous +3 prouve qu une vision stéréoscopique existe et que l angle de près est lié à l effort accommodatif.',
          },
        };
      }
      if (asc) {
        return {
          poids: 0,
          resultat:
            "Cover unilatéral positif : mouvement de restitution de dedans en dehors, esotropie de près d'environ 15 DP (E't) avec correction.",
          attendu: { min: 12, max: 18, unite: 'DP' },
          interpretation: {
            question: 'Que conclure du cover test de près avec correction ?',
            options: [
              {
                id: 'tropie',
                libelle: 'Tropie manifeste (E\'t), jamais de phorie seule',
                correct: true,
              },
              {
                id: 'phorie',
                libelle: 'Esophorie décompensée',
                correct: false,
              },
              {
                id: 'ortho',
                libelle: 'Orthotropie de près',
                correct: false,
              },
            ],
            explication:
              'Le mouvement dès le premier caché signe une tropie. Avec correction, l angle reste modéré (~15 DP) mais manifeste.',
          },
        };
      }
      return {
        poids: 0,
        resultat:
          'Sans correction : cover test très positif, esotropie de près d environ 40 DP.',
        attendu: { min: 35, max: 45, unite: 'DP' },
        interpretation: {
          question: 'Que montre la comparaison SC / ASC au cover test de près ?',
          options: [
            {
              id: 'accommodative',
              libelle:
                'Angle nettement plus large sans correction : composante accommodative évidente',
              correct: true,
            },
            {
              id: 'stable',
              libelle: 'Angle identique avec ou sans correction',
              correct: false,
            },
            {
              id: 'phorie',
              libelle: 'Esophorie décompensée sans correction seulement',
              correct: false,
            },
          ],
          explication:
            'L écart entre ~15 DP en ASC et ~40 DP en SC est l argument central de l esotropie accommodative.',
        },
      };
    }

    case 'coverLoin': {
      if (asc) {
        return {
          poids: 0,
          resultat:
            'Cover test de loin avec correction : esotropie d environ 6 DP (Et), tropie manifeste.',
          attendu: { min: 4, max: 8, unite: 'DP' },
          interpretation: {
            question: 'Que conclure du cover test de loin avec correction ?',
            options: [
              {
                id: 'et-residuel',
                libelle: 'Esotropie de loin résiduelle (Et) malgré la correction totale',
                correct: true,
              },
              {
                id: 'ortho',
                libelle: 'Orthotropie de loin sous correction',
                correct: false,
              },
              {
                id: 'phorie',
                libelle: 'Esophorie de loin',
                correct: false,
              },
            ],
            explication:
              'Même parfaitement corrigé optiquement, Maxime reste en esotropie de loin (~6 DP) : ce n est pas une forme purement accommodative.',
          },
        };
      }
      return {
        poids: 0,
        resultat: 'Sans correction : esotropie de loin d environ 10 DP.',
        attendu: { min: 8, max: 12, unite: 'DP' },
        interpretation: {
          question: 'Comment interpréter l angle de loin sans correction ?',
          options: [
            {
              id: 'part-accommodative',
              libelle:
                'Angle plus large sans correction qu avec : part accommodative aussi en vision de loin',
              correct: true,
            },
            {
              id: 'identique',
              libelle: 'Angle identique avec ou sans correction',
              correct: false,
            },
            {
              id: 'exophorie',
              libelle: 'Exophorie décompensée',
              correct: false,
            },
          ],
          explication:
            'L angle de loin augmente aussi sans correction (6 → 10 DP), traduisant l influence de l hypermétropie non compensée même au loin.',
        },
      };
    }

    default:
      return null;
  }
}

/**
 * Cas 2 : esotropie accommodative chez un jeune adulte hypermétrope.
 *
 * L etudiant choisit ASC/SC et les loupes +3 pour Lang, TNO, reflets et cover test.
 * Le TNO n est positif qu en debut de bilan, ASC + loupes +3.
 */
export const esotropieAccommodative: CasClinique = {
  id: 'esotropie-accommodative',
  titre: 'Déviation convergente chez un jeune adulte de 23 ans',
  resume:
    'Maxime consulte seul pour un bilan orthoptique. Il est arrivé sans lunettes ; la nature exacte de sa déviation reste à préciser.',
  patient: {
    prenom: 'Maxime',
    age: 23,
    sexe: 'M',
    motif:
      'Bilan orthoptique pour déviation oculaire convergente, à la demande de son ophtalmologiste.',
  },

  debutSansCorrection: true,

  oculaire: {
    deviation: { horizontal: 15, vertical: 0 },
    deviationLoin: { horizontal: 6, vertical: 0 },
    deviationSansCorrection: { horizontal: 40, vertical: 0 },
    deviationLoinSansCorrection: { horizontal: 10, vertical: 0 },
    orthotropieVpSurcorrection: true,
    fixation: { mode: 'preferee', oeil: 'OD' },
    upshoot: { OD: 0, OG: 0 },
    dvd: 0,
    kappa: { OD: 0, OG: 0 },
    correction: { OD: { sphere: 5 }, OG: { sphere: 7 } },
    acuite: { OD: '10/10 P2', OG: '10/10 P2' },
  },

  optionsExamen: OPTIONS_EXAMEN,
  resoudreExamen: resoudreExamenMaxime,

  questions: [
    {
      id: 'motif',
      rubrique: 'anamnese',
      libelle: 'Pourquoi consultez-vous aujourd hui ?',
      reponse:
        'Mon ophtalmologiste m a adressé pour un bilan. Je ne sais pas trop ce qu il cherche, je viens faire ce qu on me demande.',
      poids: 2,
      commentaire: 'Poser le cadre même si le patient est vague : il consulte seul et est un peu perdu.',
    },
    {
      id: 'mettre-lunettes',
      rubrique: 'anamnese',
      libelle: 'Pouvez-vous mettre vos lunettes, s il vous plaît ?',
      reponse:
        'Ah oui, pardon — les voici. Je les avais enlevées en entrant dans la salle d attente.',
      poids: 4,
      activeCorrection: true,
      commentaire:
        'Maxime arrive sans lunettes : les lui redemander avant tout examen sous correction (ASC).',
    },
    {
      id: 'depuis-quand',
      rubrique: 'anamnese',
      libelle: 'Depuis quand portez-vous des lunettes ?',
      reponse: 'Depuis que j ai environ 3 ans. Je les porte en permanence.',
      poids: 4,
      commentaire: 'Correction précoce et port effectif : essentiel pour interpréter ASC vs SC.',
    },
    {
      id: 'constance',
      rubrique: 'anamnese',
      libelle: 'Vos yeux dévient-ils par moments ou en permanence ?',
      reponse:
        'Je crois que c est plutôt permanent… en tout cas on me l a toujours dit. Je ne vois pas vraiment quand ça va mieux.',
      poids: 3,
      commentaire: 'Tropie permanente, jamais de phorie seule chez Maxime.',
    },
    {
      id: 'diplopie',
      rubrique: 'anamnese',
      libelle: 'Voyez-vous double ?',
      reponse: 'Non, jamais à ma connaissance.',
      poids: 2,
      commentaire: 'Pas de diplopie : neutralisation installée depuis l enfance.',
    },
    {
      id: 'amblyopie',
      rubrique: 'anamnese',
      libelle: 'Avez-vous eu un traitement pour une amblyopie ou un œil paresseux ?',
      reponse: 'Non, jamais. On m a dit que mes deux yeux voyaient pareil.',
      poids: 3,
      commentaire: 'Pas d amblyothérapie, acuités symétriques malgré l anisométropie.',
    },
    {
      id: 'correction-portee',
      rubrique: 'anamnese',
      libelle: 'Portez-vous bien votre correction actuelle au quotidien ?',
      reponse:
        'Oui, en général tout le temps. Là je les avais juste enlevées en arrivant.',
      poids: 3,
      commentaire: 'Port effectif au quotidien ; ne confond pas avec l absence de lunettes à l accueil.',
    },
    {
      id: 'chirurgie',
      rubrique: 'antecedents',
      libelle: 'Avez-vous déjà été opéré des yeux ?',
      reponse: 'Non, jamais.',
      poids: 2,
    },
    {
      id: 'familiaux',
      rubrique: 'antecedents',
      libelle: 'Y a-t-il des antécédents familiaux de strabisme ou d amblyopie ?',
      reponse: 'Pas que je sache, non.',
      poids: 1,
    },
    {
      id: 'general',
      rubrique: 'antecedents',
      libelle: 'Avez-vous une maladie générale ou prenez-vous un traitement ?',
      reponse: 'Non, rien de particulier.',
      poids: 1,
    },
    {
      id: 'groupe-sanguin',
      rubrique: 'antecedents',
      libelle: 'Quel est votre groupe sanguin ?',
      reponse: 'Je ne sais pas.',
      poids: -2,
      commentaire: 'Hors sujet pour un bilan orthoptique.',
    },
    {
      id: 'sport',
      rubrique: 'anamnese',
      libelle: 'Quel sport pratiquez-vous ?',
      reponse: 'Un peu de running de temps en temps.',
      poids: 0,
    },
  ],

  examens: {
    refraction: {
      poids: 4,
      resultat:
        'Réfraction : +5.00 D sph OD, +7.00 D sph OG. Hypermétropie modérée avec anisométropie de 2 D entre les deux yeux.',
      interpretation: {
        question: 'Comment interprétez-vous cette réfraction ?',
        options: [
          {
            id: 'anisometropie-accommodative',
            libelle:
              'Hypermétropie avec anisométropie ; une correction totale est indispensable pour compenser l effort accommodatif',
            correct: true,
          },
          {
            id: 'myopie',
            libelle: 'Myopie simple ne nécessitant pas de correction stricte',
            correct: false,
          },
          {
            id: 'sans-interet',
            libelle: 'Réfraction sans lien avec la déviation',
            correct: false,
          },
        ],
        explication:
          'L anisométropie (+2 D entre les yeux) impose une correction équilibrée. L hypermétropie non compensée favorise l esotropie accommodative.',
      },
    },
    acuite: {
      poids: 4,
      resultat: 'Avec correction : OD 10/10 P2, OG 10/10 P2 — acuités symétriques.',
      interpretation: {
        question: 'Que concluez-vous de ces acuités ?',
        options: [
          {
            id: 'pas-amblyopie',
            libelle: 'Pas d amblyopie, acuités symétriques malgré l anisométropie',
            correct: true,
          },
          {
            id: 'amblyopie-og',
            libelle: 'Amblyopie de l œil le plus hypermétrope',
            correct: false,
          },
          {
            id: 'amblyopie-od',
            libelle: 'Amblyopie de l œil droit',
            correct: false,
          },
        ],
        explication:
          'Acuités identiques aux deux yeux : pas d amblyopie, cohérent avec l absence d amblyothérapie.',
      },
    },
    motilite: {
      poids: 3,
      resultat: 'Poursuite complète dans toutes les directions, sans limitation ni surélévation en adduction.',
      interpretation: {
        question: 'Que concluez-vous de la motilité ?',
        options: [
          {
            id: 'normale',
            libelle: 'Motilité normale, sans signe de paralysie',
            correct: true,
          },
          {
            id: 'paralysie',
            libelle: 'Paralysie oculomotrice',
            correct: false,
          },
          {
            id: 'upshoot',
            libelle: 'Hyperaction bilatérale des obliques inférieurs',
            correct: false,
          },
        ],
        explication: 'Motilité libre : oriente vers une esotropie accommodative, pas un strabisme précoce.',
      },
    },
    worth: {
      poids: -1,
      resultat: 'Deux points perçus.',
      justificationMalus:
        'Le Worth confirme une suppression déjà prévisible ; il dissocie et peut fausser un TNO ultérieur.',
    },
    bagolini: {
      poids: -1,
      resultat: 'Une seule striure perçue.',
      justificationMalus: 'Épreuve dissociante non essentielle ici ; à réserver après le sensoriel non dissociant.',
    },
    verreRouge: {
      poids: -1,
      resultat: 'Un seul point perçu.',
      justificationMalus: 'Dissociation inutile à ce stade et préjudiciable au TNO.',
    },
    bielschowsky: {
      poids: -2,
      resultat: 'Pas de modification à l inclinaison de la tête.',
      justificationMalus: 'Manœuvre des cyclo-verticaux, sans indication devant une motilité normale.',
    },
    deviometrie: {
      poids: -1,
      resultat: 'Mesure difficile, sans élément décisif.',
      justificationMalus: 'Le synoptophore n est pas prioritaire : le Lang ASC et le TNO précoce suffisent.',
    },
    biprisme: {
      poids: -2,
      resultat: 'Examen non contributif.',
      justificationMalus: 'Le biprisme explore la microtropie ; les angles ici sont trop larges.',
    },
    tno: { poids: 0, resultat: '' },
    lang: { poids: 0, resultat: '' },
    hirschberg: { poids: 0, resultat: '' },
    krimsky: { poids: 0, resultat: '' },
    krimskyLoin: { poids: 0, resultat: '' },
    coverPres: { poids: 0, resultat: '' },
    coverLoin: { poids: 0, resultat: '' },
  },

  realisationsAttendues: [
    {
      examenId: 'lang',
      conditions: { correction: 'asc' },
      poids: 4,
      libelle: 'Test de Lang (ASC)',
    },
    {
      examenId: 'tno',
      conditions: { correction: 'asc', loupesPlus3: true },
      poids: 5,
      avantDissociation: true,
      libelle: 'TNO (ASC + loupes +3, en début de bilan)',
    },
    {
      examenId: 'hirschberg',
      conditions: { correction: 'asc' },
      poids: 3,
      attendu: { min: 12, max: 18, unite: 'DP' },
      libelle: 'Hirschberg VP (ASC)',
    },
    {
      examenId: 'krimsky',
      conditions: { correction: 'asc' },
      poids: 3,
      attendu: { min: 12, max: 18, unite: 'DP' },
    },
    {
      examenId: 'coverPres',
      conditions: { correction: 'asc' },
      poids: 4,
      attendu: { min: 12, max: 18, unite: 'DP' },
    },
    {
      examenId: 'coverPres',
      conditions: { correction: 'sc' },
      poids: 4,
      attendu: { min: 35, max: 45, unite: 'DP' },
    },
    {
      examenId: 'coverPres',
      conditions: { correction: 'asc', loupesPlus3: true },
      poids: 4,
      attendu: { min: 0, max: 2, unite: 'DP' },
      libelle: 'Cover test VP (ASC + loupes +3)',
    },
    {
      examenId: 'krimskyLoin',
      conditions: { correction: 'asc' },
      poids: 3,
      attendu: { min: 4, max: 8, unite: 'DP' },
    },
    {
      examenId: 'coverLoin',
      conditions: { correction: 'asc' },
      poids: 4,
      attendu: { min: 4, max: 8, unite: 'DP' },
    },
    {
      examenId: 'coverLoin',
      conditions: { correction: 'sc' },
      poids: 3,
      attendu: { min: 8, max: 12, unite: 'DP' },
    },
  ],

  ordreAttendu: [
    'refraction',
    'acuite',
    'lang',
    'tno',
    'motilite',
    'hirschberg',
    'krimsky',
    'coverPres',
    'krimskyLoin',
    'coverLoin',
  ],

  synthese: {
    questions: [
      {
        id: 'type-strabisme',
        type: 'qcm',
        question: 'Quel diagnostic retenez-vous ?',
        poids: 5,
        options: [
          {
            id: 'accommodative',
            libelle: 'Esotropie accommodative (partiellement accommodative)',
            correct: true,
          },
          {
            id: 'precoce',
            libelle: 'Esotropie précoce',
            correct: false,
          },
          {
            id: 'normosensorielle',
            libelle: 'Esotropie tardive normosensorielle',
            correct: false,
          },
          {
            id: 'microtropie',
            libelle: 'Microtropie',
            correct: false,
          },
        ],
        explication:
          'Angle qui augmente sans correction et en VP, orthotropie sous +3, Lang positif en ASC, stéréoscopie révélée par TNO précoce : esotropie accommodative.',
      },
      {
        id: 'conduite',
        type: 'qcm',
        question: 'Quelle conduite à tenir ?',
        poids: 4,
        options: [
          {
            id: 'correction',
            libelle: 'Renforcer le port de la correction totale ; pas d indication chirurgicale en première intention',
            correct: true,
          },
          {
            id: 'chirurgie',
            libelle: 'Indication chirurgicale immédiate des droits médiaux',
            correct: false,
          },
          {
            id: 'occlusion',
            libelle: 'Occlusion anti-amblyopique prolongée',
            correct: false,
          },
          {
            id: 'sans-correction',
            libelle: 'Arrêt de la correction optique',
            correct: false,
          },
        ],
        explication:
          'Stéréoscopie conservée, pas d amblyopie : la priorité est une correction totale bien portée. La chirurgie n est pas indiquée en première intention.',
      },
      {
        id: 'signes-cles',
        type: 'ouverte',
        question: 'Quels signes vous ont orientés vers ce diagnostic ?',
        poids: 4,
        seuil: 3,
        criteres: [
          {
            id: 'angle-sc',
            variantes: ['sans correction', 'sc ', '40', 'aggravation', 'majoration'],
          },
          {
            id: 'plus3',
            variantes: ['+3', 'plus 3', 'loupes', 'orthotropie', "o't", 'ot '],
          },
          {
            id: 'lang',
            variantes: ['lang', 'stereo', 'stereoscop', 'relief'],
          },
          {
            id: 'accommodatif',
            variantes: ['accommodatif', 'accommodative', 'accommodation'],
          },
        ],
        reponseAttendue:
          'Angle majore sans correction, orthotropie sous +3, Lang positif en ASC, composante accommodative.',
        explication:
          'Les arguments clés sont l écart ASC/SC, l O\'t sous +3, le Lang ASC positif et le TNO précoce avec loupes.',
      },
      {
        id: 'chirurgie',
        type: 'ouiNon',
        question: 'Faut-il opérer Maxime en première intention ?',
        poids: 2,
        correct: false,
        explication:
          'Non : esotropie accommodative avec stéréoscopie conservée — correction optique et surveillance, pas de chirurgie en premier recours.',
      },
    ],
  },

  compteRenduExpert: [
    'Maxime, 23 ans, consulte seul. Lunettes depuis l âge de 3 ans, portées en permanence. Pas d amblyopie, jamais d amblyothérapie. Pas d ATCD familiaux ou généraux.',
    'Correction portée : +5.00 OD, +7.00 OG (correction totale). Acuités symétriques 10/10 P2 aux deux yeux.',
    'Sensoriel : Lang positif en ASC. TNO à 120″ (2/2) réalisé en début de bilan, ASC avec loupes +3 ; stéréoscopie fine confirmée.',
    'Reflets et occlusion VP : E\'t ~15 DP en ASC, ~40 DP en SC, orthotropie (O\'t) en ASC + loupes +3.',
    'Vision de loin : Et ~6 DP en ASC, ~10 DP en SC — tropie permanente, jamais de phorie.',
    'Motilité normale. Conclusion : esotropie accommodative partiellement accommodative, stéréoscopie présente sous correction. Renforcer le port des lunettes ; pas de chirurgie en première intention.',
  ],
};
