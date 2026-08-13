import type { CasClinique } from '../engine/types';

/**
 * Cas 3 : inquiétude parentale chez un nourrisson de 5 mois.
 *
 * Piège pédagogique : les parents suspectent une exotropie, les reflets au
 * Hirschberg peuvent sembler temporalisés (angle kappa positif), mais le
 * bilan fonctionnel est normal. Le cover test n'est pas réalisable à 5 mois.
 */
export const pseudostrabismeEpicanthus: CasClinique = {
  id: 'pseudostrabisme-epicanthus',
  titre: 'Angelica, 5 mois, adressée par son pédiatre pour un avis orthoptique',
  resume: 'Angelica, 5 mois, adressée par son pédiatre pour un avis orthoptique.',
  patient: {
    prenom: 'Angelica',
    age: 0,
    ageLibelle: '5 mois',
    sexe: 'F',
    motif:
      "Les parents ont l'impression que ses yeux divergent, surtout quand elle est fatiguée. Le pédiatre les a un peu rassurés, mais ils veulent un avis avant qu'il ne soit « trop tard ».",
  },

  oculaire: {
    deviation: { horizontal: 0, vertical: 0 },
    deviationLoin: { horizontal: 0, vertical: 0 },
    fixation: { mode: 'alternante' },
    upshoot: { OD: 0, OG: 0 },
    dvd: 0,
    kappa: { OD: 8, OG: 8 },
    correction: { OD: { sphere: 1.5 }, OG: { sphere: 1.5 } },
    acuite: { OD: 'fixation OK', OG: 'fixation OK' },
  },

  messageExamens:
    "Angelica a 5 mois : commencer par le Lang, puis le comportement visuel (suivi lumière/objet) et la réaction à l'occlusion dans la rubrique Réfraction et acuité. Le cover test prolongé est impossible.",

  questions: [
    {
      id: 'motif',
      rubrique: 'anamnese',
      libelle: "Qu'est-ce qui vous amène à consulter aujourd'hui ? (question aux parents)",
      reponse:
        "On a l'impression que ses yeux partent sur les côtés, qu'ils ne regardent pas droit. Le pédiatre nous a dit d'attendre, mais on s'inquiète.",
      poids: 4,
      commentaire:
        "Les parents sont convaincus de ce qu'ils voient : ne pas prendre leur récit pour une confirmation clinique.",
    },
    {
      id: 'depuis-quand',
      rubrique: 'anamnese',
      libelle: 'Depuis quand ses yeux vous semblent-ils diverger ? (parents)',
      reponse:
        "Dès les premières semaines. Comme les photos d'exotropie qu'on trouve en ligne — pour nous ça ne s'est jamais corrigé.",
      poids: 5,
      commentaire:
        "Un début très précoce dans le récit parental oriente vers une X't — piège anamnestique fréquent.",
    },
    {
      id: 'constance',
      rubrique: 'anamnese',
      libelle: 'La déviation vous paraît-elle permanente ? (parents)',
      reponse:
        "Plutôt intermittente : parfois frappant, parfois on se demande si on exagère. Mais quand c'est visible, ça nous inquiète beaucoup.",
      poids: 4,
      commentaire:
        "Un récit intermittent peut faire penser à une X't — à confronter au comportement visuel et aux reflets.",
    },
    {
      id: 'alternance',
      rubrique: 'anamnese',
      libelle: "Est-ce toujours le même œil, ou les deux ? (parents)",
      reponse:
        "Les deux yeux nous semblent concernés à un moment ou à un autre. On ne sait plus très bien, mais ça diverge, c'est sûr.",
      poids: 4,
      commentaire:
        "Un récit bilatéral ou fluctuant peut faire penser à une alternance — piège anamnestique fréquent.",
    },
    {
      id: 'photos-regard',
      rubrique: 'anamnese',
      libelle: "Quand l'aspect est-il le plus frappant ? (parents)",
      reponse:
        "Sur les photos surtout, quand elle est fatiguée ou qu'elle regarde au loin. De face, parfois on doute.",
      poids: 5,
      commentaire:
        "Photos et fatigue : l'impression peut être accentuée sans qu'il y ait de tropie objectivable.",
    },
    {
      id: 'developpement',
      rubrique: 'anamnese',
      libelle: 'Comment se comporte-t-elle visuellement au quotidien ? (parents)',
      reponse:
        "Elle suit bien notre regard et les jouets, sourit quand on lui parle, attrape les objets. Le pédiatre dit que c'est normal.",
      poids: 4,
      commentaire:
        "Comportement visuel conservé : discordance avec un vrai strabisme manifeste non neutralisé.",
    },
    {
      id: 'correction',
      rubrique: 'anamnese',
      libelle: 'Porte-t-elle des lunettes ? (parents)',
      reponse: 'Non, personne ne nous en a parlé.',
      poids: 1,
    },
    {
      id: 'familiaux',
      rubrique: 'antecedents',
      libelle: 'Y a-t-il des antécédents familiaux de strabisme ou d amblyopie ? (parents)',
      reponse:
        "Non, personne dans la famille n'a eu de strabisme ni d'œil paresseux. Pas d'opération des yeux non plus.",
      poids: 4,
      commentaire: "Absence d'ATCD familiaux de strabisme ou d'amblyopie.",
    },
    {
      id: 'grossesse',
      rubrique: 'antecedents',
      libelle: 'Grossesse et accouchement ? (parents)',
      reponse: 'Grossesse normale, naissance à terme.',
      poids: 2,
    },
    {
      id: 'general',
      rubrique: 'antecedents',
      libelle: 'Maladie ou traitement en cours ? (parents)',
      reponse: 'Non.',
      poids: 1,
    },
    {
      id: 'ecrans',
      rubrique: 'anamnese',
      libelle: 'Exposition aux écrans ?',
      reponse: 'Non, elle est trop petite.',
      poids: 0,
    },
    {
      id: 'groupe-sanguin',
      rubrique: 'antecedents',
      libelle: 'Quel est son groupe sanguin ?',
      reponse: 'On ne sait pas.',
      poids: -2,
      commentaire: 'Hors sujet.',
    },
    {
      id: 'metier-parents',
      rubrique: 'antecedents',
      libelle: 'Profession des parents ?',
      reponse: 'Le père est informaticien, la mère est designer.',
      poids: -2,
      commentaire: 'Hors sujet.',
    },
  ],

  examens: {
    acuite: {
      poids: -2,
      resultat: 'Acuité visuelle chiffrée non réalisable.',
      justificationMalus:
        "L'acuité visuelle chiffrée n'est pas réalisable à 5 mois.",
    },
    comportementVisuel: {
      poids: 0,
      etapesComportementVisuelAttendues: [
        'lumiereMono',
        'lumiereBino',
        'objetMono',
        'objetBino',
      ],
      resultat:
        "Suivi lumière en monoculaire : comportement normal. Suivi lumière en binoculaire : comportement normal. Suivi objet en monoculaire : comportement normal. Suivi objet en binoculaire : comportement normal. Poursuite symétrique, sans préférence fixatrice manifeste.",
      interpretation: {
        question: "Que concluez-vous de cette étude du comportement visuel ?",
        options: [
          {
            id: 'fixation-normale',
            libelle:
              'Fixation et poursuite normales, symétriques, sans signe de préférence pathologique',
            correct: true,
          },
          {
            id: 'amblyopie',
            libelle: 'Amblyopie unilatérale avec préférence fixatrice',
            correct: false,
          },
          {
            id: 'deficit',
            libelle: 'Déficit visuel profond bilatéral',
            correct: false,
          },
        ],
        explication:
          "À 5 mois, le suivi lumière puis objet, en monoculaire puis binoculaire, remplace l'acuité chiffrée. Ici tout est symétrique et normal.",
      },
    },
    reactionOcclusion: {
      poids: 8,
      resultat:
        "Occlusion brève de l'OD puis de l'OG : Angelica tourne la tête des deux côtés, mouvements comparables. Aucun mouvement oculaire visible pendant l'occlusion.",
    },
    hirschberg: {
      poids: 8,
      attendu: { min: 6, max: 10, unite: 'DP' },
      resultat:
        'Position primaire : reflets cornéens temporalisés des deux côtés, de façon symétrique.',
      interpretation: {
        question: 'Comment interpréter ces reflets ?',
        options: [
          {
            id: 'kappa-positif',
            libelle:
              'Reflets temporalisés symétriques, à confronter au comportement visuel (angle kappa ?)',
            correct: true,
          },
          {
            id: 'exo-certaine',
            libelle: 'Exotropie objectivée au Hirschberg',
            correct: false,
          },
          {
            id: 'reflets-centres',
            libelle: 'Reflets centrés en position primaire',
            correct: false,
          },
        ],
        explication:
          "Des reflets temporalisés peuvent mimiquer une exotropie ; ici le comportement visuel est normal : penser à un angle kappa positif, pas à une vraie X't.",
      },
    },
    lang: {
      poids: 2,
      resultat:
        'Test de Lang présenté : regard fugace porté sur les figures, sans fixation prolongée ni recherche du relief.',
      interpretation: {
        question: 'Comment interpréter cette réaction au Lang ?',
        options: [
          {
            id: 'fixation-fugace',
            libelle: 'Regard fugace, sans recherche du relief',
            correct: true,
          },
          {
            id: 'pas-stereo',
            libelle: 'Absence de vision stéréoscopique',
            correct: false,
          },
          {
            id: 'stereo-presente',
            libelle: 'Figures en relief identifiées et décrites',
            correct: false,
          },
        ],
        explication:
          "Le Lang peut être tenté sans pénalité. Ici : regard fugace, sans fixation prolongée ni recherche du relief.",
      },
    },
    refraction: {
      poids: 2,
      resultat: 'Réfraction sous cycloplégie : +1.50 D sphérique aux deux yeux.',
      interpretation: {
        question: 'Comment interpréter cette réfraction ?',
        options: [
          {
            id: 'hypermétropie-legere',
            libelle: 'Hypermétropie légère bilatérale',
            correct: true,
          },
          {
            id: 'accommodative',
            libelle: 'Hypermétropie nécessitant une correction immédiate',
            correct: false,
          },
          {
            id: 'sans-interet',
            libelle: 'Réfraction non mesurable à cet âge',
            correct: false,
          },
        ],
        explication:
          "Réfraction sous cycloplégie : hypermétropie légère bilatérale (+1.50 D).",
      },
    },

    coverPres: {
      poids: 0,
      nonContributifSiPresente: true,
      malusSiPresente: -2,
      resultat:
        "Cover test non réalisable : Angelica se débat, pleure et refuse l'occlusion. Aucune mesure d'angle par dissociation prolongée.",
      justificationMalus:
        "À 5 mois le cover test est souvent impossible ; insister n'apporte pas de mesure fiable et perturbe l'enfant.",
    },
    coverLoin: {
      poids: 0,
      nonContributifSiPresente: true,
      malusSiPresente: -2,
      resultat: "Cover test de loin non réalisable : même difficulté de coopération.",
      justificationMalus: "Idem cover test VP : non contributif chez ce nourrisson.",
    },
    motilite: {
      poids: 2,
      optionnel: true,
      resultat:
        'Poursuite en neuf positions du regard : complète, sans limitation ni surélévation en adduction.',
      interpretation: {
        question: 'Que concluez-vous de la motilité ?',
        options: [
          {
            id: 'sans-limitation',
            libelle: 'Poursuite complète, sans limitation',
            correct: true,
          },
          {
            id: 'paralysie',
            libelle: 'Limitation d\'abduction',
            correct: false,
          },
          {
            id: 'upshoot',
            libelle: 'Surélévation en adduction',
            correct: false,
          },
        ],
        explication: 'Poursuite complète en neuf positions, sans limitation ni surélévation en adduction.',
      },
    },
    krimsky: {
      poids: 0,
      nonContributifSiPresente: true,
      malusSiPresente: -1,
      resultat: 'Reflets temporalisés en position primaire au Hirschberg.',
      justificationMalus: "Reflets déjà explorés au Hirschberg.",
    },
    krimskyLoin: {
      poids: 0,
      nonContributifSiPresente: true,
      malusSiPresente: -1,
      resultat: 'Reflets temporalisés en position primaire.',
      justificationMalus: 'Idem Krimsky VP.',
    },
    tno: {
      poids: -2,
      resultat: 'Test non interprétable de façon fiable à 5 mois.',
      justificationMalus: "Le TNO n'est pas indiqué avant 3–4 ans.",
    },
    worth: {
      poids: -2,
      resultat: 'Test non interprétable à cet âge.',
      justificationMalus: 'Épreuve dissociante non fiable chez un nourrisson de 5 mois.',
    },
    bagolini: {
      poids: -1,
      resultat: 'Coopération insuffisante.',
      justificationMalus: 'Non fiable à 5 mois.',
    },
    verreRouge: {
      poids: -2,
      resultat: 'Test non réalisable.',
      justificationMalus: 'Hors indication.',
    },
    bielschowsky: {
      poids: -2,
      resultat: "Pas de modification à l'inclinaison de la tête.",
      justificationMalus: 'Sans indication.',
    },
    deviometrie: {
      poids: 0,
      nonContributifSiPresente: true,
      malusSiPresente: -1,
      resultat: 'Examen non réalisable à cet âge.',
      justificationMalus: 'Synoptophore inadapté à 5 mois.',
    },
    biprisme: {
      poids: 0,
      nonContributifSiPresente: true,
      malusSiPresente: -2,
      resultat: 'Examen non contributif.',
      justificationMalus: 'Inadapté chez un nourrisson.',
    },
  },

  ordreAttendu: ['lang', 'comportementVisuel', 'reactionOcclusion', 'hirschberg'],

  commentaireConduiteBilan:
    "Lang en premier, puis comportement visuel (lumière mono → bino, objet mono → bino), réaction à l'occlusion, reflets ; ne pas insister sur le cover test.",

  ordreAnamneseAttendu: [
    'motif',
    'depuis-quand',
    'constance',
    'alternance',
    'photos-regard',
    'developpement',
  ],

  synthese: {
    questions: [
      {
        id: 'diagnostic',
        type: 'qcm',
        question: 'Quel diagnostic retenez-vous ?',
        poids: 5,
        options: [
          {
            id: 'orthotropie',
            libelle: 'Orthotropie — pas de strabisme',
            correct: true,
          },
          {
            id: 'esotropie',
            libelle: 'Esotropie infantile précoce',
            correct: false,
          },
          {
            id: 'accommodative',
            libelle: 'Esotropie accommodative',
            correct: false,
          },
          {
            id: 'exotropie',
            libelle: 'Exotropie intermittente',
            correct: false,
          },
        ],
        explication:
          "Comportement visuel normal, réaction à l'occlusion symétrique : pas de strabisme malgré des reflets temporalisés (angle kappa positif). Le récit parental ne suffit pas.",
      },
      {
        id: 'signes-cles',
        type: 'ouverte',
        question: 'Quels éléments objectifs vous ont orientés ?',
        poids: 4,
        seuil: 3,
        criteres: [
          {
            id: 'comportement',
            variantes: ['suivi', 'lumiere', 'lumière', 'objet', 'fixation', 'poursuite', 'symetri', 'symétri'],
          },
          {
            id: 'occlusion',
            variantes: ['occlusion', 'reaction', 'réaction', 'tete', 'tête', 'symetri', 'symétri', 'pas de preference'],
          },
          {
            id: 'reflets',
            variantes: ['reflet', 'hirschberg', 'temporal', 'kappa', 'lambda', 'orthotrop', 'primaire'],
          },
        ],
        reponseAttendue:
          "Suivi lumière/objet normal et symétrique, réaction à l'occlusion symétrique sans rattrapage, reflets temporalisés expliqués par un angle kappa positif.",
        explication:
          "Le comportement visuel et la réaction à l'occlusion priment sur l'impression au Hirschberg : un angle kappa positif peut mimiquer une exotropie.",
      },
      {
        id: 'conduite',
        type: 'qcm',
        question: 'Quelle conduite à tenir ?',
        poids: 4,
        options: [
          {
            id: 'rassurance',
            libelle: 'Rassurer les parents, pas de chirurgie ni de lunettes ; surveillance habituelle',
            correct: true,
          },
          {
            id: 'chirurgie',
            libelle: 'Chirurgie des droits latéraux en urgence',
            correct: false,
          },
          {
            id: 'lunettes',
            libelle: 'Prescrire immédiatement des lunettes',
            correct: false,
          },
          {
            id: 'occlusion',
            libelle: 'Occlusion anti-amblyopique',
            correct: false,
          },
        ],
        explication:
          "Pas de strabisme : réassurance et surveillance habituelle.",
      },
      {
        id: 'chirurgie',
        type: 'ouiNon',
        question: 'Faut-il opérer Angelica ?',
        poids: 2,
        correct: false,
        explication:
          "Non : orthotropie avec angle kappa positif, pas de tropie objectivable. Chirurgie strabologique non indiquée.",
      },
    ],
  },

  compteRenduExpert: [
    "Angelica, 5 mois, adressée par le pédiatre. Parents inquiets d'une exotropie depuis les premières semaines — récit orientant vers une X't, à ne pas prendre pour une preuve. Pas d'ATCD familiaux de strabisme. À l'examen : alignement oculaire normal, angle kappa positif bilatéral.",
    "Étude du comportement visuel : suivi lumière monoculaire puis binoculaire, suivi objet monoculaire puis binoculaire — symétrique, sans préférence pathologique.",
    "Réaction à l'occlusion : mouvements de tête symétriques OD/OG, sans rattrapage oculaire visible.",
    "Reflets : temporalisés en position primaire, symétriques — fausse impression exotropique (angle kappa positif).",
    "Lang : regard fugace, sans fixation prolongée ni recherche du relief. Cover test non réalisable (coopération).",
    "Réfraction : +1.50 D bilatéral, physiologique. Conclusion : orthotropie, pas de strabisme. Rassurance parentale, surveillance.",
  ],
};
