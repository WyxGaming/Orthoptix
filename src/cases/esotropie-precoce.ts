import type { CasClinique } from '../engine/types';

/**
 * Cas 1 : esotropie précoce alternante.
 *
 * Tout ce qui suit est de la donnée : les signes cliniques observables en 3D sont
 * dérivés du bloc `oculaire` par le modèle oculomoteur, et le barème est porté par
 * les poids déclarés ici. Aucun de ces éléments n'est codé dans le moteur.
 *
 * Le titre et le résumé ne nomment pas le diagnostic : ils ne disent que ce qu'un
 * courrier d'adressage contiendrait. C'est à l'étudiant de conclure, en fin de bilan.
 */
export const esotropiePrecoce: CasClinique = {
  id: 'esotropie-precoce',
  titre: 'Strabisme convergent chez une adolescente de 16 ans',
  resume:
    "Léa, adressée par son ophtalmologiste pour bilan orthoptique. La déviation convergente est connue, son type reste à établir.",
  patient: {
    prenom: 'Léa',
    age: 16,
    sexe: 'F',
    motif:
      "Bilan orthoptique de contrôle d'un strabisme convergent, en vue d'une éventuelle prise en charge chirurgicale.",
  },

  oculaire: {
    deviation: { horizontal: 40, vertical: 0 },
    // Angle strictement identique de loin : c'est ce qui écarte la part accommodative
    // que laisserait craindre l'hypermétropie de +4.00.
    deviationLoin: { horizontal: 40, vertical: 0 },
    fixation: { mode: 'alternante' },
    upshoot: { OD: 20, OG: 20 },
    dvd: 0,
    nystagmus: { type: 'manifeste-latent', amplitudeDeg: 0.6, frequenceHz: 3 },
    kappa: { OD: 0, OG: 0 },
    correction: { OD: { sphere: 4 }, OG: { sphere: 4 } },
    acuite: { OD: '10/10 P2', OG: '9/10 P2' },
  },

  questions: [
    {
      id: 'motif',
      rubrique: 'anamnese',
      libelle: "Quel est le motif de la consultation aujourd'hui ?",
      reponse:
        "Les parents viennent pour un bilan de contrôle. On leur a parlé d'une possible opération, ils souhaitent un avis.",
      poids: 3,
      commentaire: 'Poser le cadre de la consultation oriente toute la suite du bilan.',
    },
    {
      id: 'age-apparition',
      rubrique: 'anamnese',
      libelle: 'À quel âge le strabisme est-il apparu ?',
      reponse: "Les parents l'ont remarqué vers l'âge de 3 mois, sur des photos de famille.",
      poids: 4,
      commentaire:
        "Une apparition avant 6 mois définit le strabisme précoce et fait redouter d'emblée l'absence de binocularité.",
    },
    {
      id: 'constance',
      rubrique: 'anamnese',
      libelle: 'La déviation est-elle permanente ou intermittente ?',
      reponse: "Elle est présente en permanence, les parents n'ont jamais vu les yeux droits.",
      poids: 3,
      commentaire:
        'Le caractère constant sépare la tropie de la phorie et pèse sur le pronostic sensoriel.',
    },
    {
      id: 'alternance-observee',
      rubrique: 'anamnese',
      libelle: 'Est-ce toujours le même œil qui dévie ?',
      reponse: "Non, tantôt l'un tantôt l'autre, selon les moments de la journée.",
      poids: 3,
      commentaire:
        "L'alternance spontanée annonce l'absence de préférence de fixation et explique une acuité conservée aux deux yeux.",
    },
    {
      id: 'correction',
      rubrique: 'anamnese',
      libelle: 'Porte-t-elle une correction optique, et depuis quand ?',
      reponse:
        'Oui, des lunettes depuis le diagnostic, portées en permanence et bien tolérées.',
      poids: 4,
      commentaire:
        "Le port effectif de la correction conditionne l'interprétation de toutes les mesures d'angle.",
    },
    {
      id: 'amblyotherapie',
      rubrique: 'anamnese',
      libelle: "Un traitement de l'amblyopie a-t-il été entrepris ?",
      reponse:
        'Oui, des occlusions par pansement dans la petite enfance, suivies et respectées selon les parents.',
      poids: 4,
      commentaire:
        "Une amblyothérapie bien conduite explique l'acuité quasi symétrique retrouvée à l'examen.",
    },
    {
      id: 'diplopie',
      rubrique: 'anamnese',
      libelle: 'Se plaint-elle de voir double ?',
      reponse: 'Jamais.',
      poids: 2,
      commentaire:
        "L'absence de diplopie dans un angle aussi large témoigne d'une neutralisation installée de longue date.",
    },
    {
      id: 'torticolis',
      rubrique: 'anamnese',
      libelle: 'Observez-vous un torticolis ou une position de tête inhabituelle ?',
      reponse: 'Non, la tête est droite.',
      poids: 2,
      commentaire:
        'Un torticolis orienterait vers une paralysie ou vers un blocage du nystagmus dans une position donnée.',
    },
    {
      id: 'chirurgie',
      rubrique: 'antecedents',
      libelle: 'A-t-elle déjà été opérée des yeux ?',
      reponse: 'Non, aucune chirurgie oculaire.',
      poids: 3,
      commentaire:
        "Un antécédent chirurgical changerait complètement la lecture de la motilité et de l'angle.",
    },
    {
      id: 'grossesse',
      rubrique: 'antecedents',
      libelle: "Comment se sont déroulés la grossesse et l'accouchement ?",
      reponse: 'Grossesse sans particularité, naissance à terme, pas de prématurité.',
      poids: 3,
      commentaire:
        'La prématurité et la souffrance néonatale sont des facteurs de risque classiques de strabisme précoce.',
    },
    {
      id: 'general',
      rubrique: 'antecedents',
      libelle: 'Y a-t-il une pathologie générale ou un retard de développement ?',
      reponse: 'Aucun, développement psychomoteur normal, scolarité ordinaire.',
      poids: 3,
      commentaire:
        'Une atteinte neurologique associée modifierait le pronostic et la conduite thérapeutique.',
    },
    {
      id: 'familiaux',
      rubrique: 'antecedents',
      libelle: "Y a-t-il des antécédents familiaux de strabisme ou d'amblyopie ?",
      reponse: 'La mère présente un strabisme convergent depuis sa naissance.',
      poids: 4,
      commentaire:
        "L'hérédité est nette dans les strabismes précoces et renforce la cohérence du tableau.",
    },

    {
      id: 'ecrans',
      rubrique: 'anamnese',
      libelle: 'Combien de temps passe-t-elle devant les écrans ?',
      reponse: 'Environ une heure par jour.',
      poids: 0,
      commentaire:
        'Question souvent posée, sans conséquence sur un strabisme apparu à 3 mois : ni utile ni pénalisante.',
    },
    {
      id: 'cephalees',
      rubrique: 'anamnese',
      libelle: 'A-t-elle des maux de tête en fin de journée ?',
      reponse: 'Pas particulièrement.',
      poids: 0,
      commentaire:
        "Pertinente devant une asthénopie, elle n'apporte rien dans une déviation constante et neutralisée.",
    },
    {
      id: 'lateralite',
      rubrique: 'anamnese',
      libelle: 'Est-elle droitière ou gauchère ?',
      reponse: 'Droitière.',
      poids: 0,
    },
    {
      id: 'groupe-sanguin',
      rubrique: 'antecedents',
      libelle: 'Quel est son groupe sanguin ?',
      reponse: "Les parents ne s'en souviennent pas.",
      poids: -2,
      commentaire: 'Aucun rapport avec un bilan orthoptique.',
    },
    {
      id: 'metier-parents',
      rubrique: 'antecedents',
      libelle: 'Quelle est la profession des parents ?',
      reponse: 'Le père est menuisier, la mère infirmière.',
      poids: -2,
      commentaire: 'Sans lien avec la déviation oculaire.',
    },
    {
      id: 'otites',
      rubrique: 'antecedents',
      libelle: 'A-t-elle eu des otites à répétition ?',
      reponse: 'Deux ou trois otites banales en crèche.',
      poids: -2,
      commentaire: 'Hors du champ du bilan orthoptique.',
    },
  ],

  examens: {
    refraction: {
      poids: 3,
      resultat:
        'Correction portée : +4.00 dioptries sphériques aux deux yeux, hypermétropie moyenne, verres portés en permanence.',
      interpretation: {
        question: 'Comment cette hypermétropie intervient-elle dans le tableau ?',
        options: [
          {
            id: 'a-corriger-mais-insuffisante',
            libelle:
              "Elle doit être corrigée intégralement, mais ne suffit pas à expliquer un angle apparu à 3 mois",
            correct: true,
          },
          {
            id: 'explique-tout',
            libelle: 'Elle explique à elle seule la déviation, qui est donc purement accommodative',
            correct: false,
          },
          {
            id: 'sans-interet',
            libelle: "Elle n'a aucun intérêt dans un strabisme précoce",
            correct: false,
          },
        ],
        explication:
          "Une esotropie purement accommodative se réduirait franchement sous correction totale. Ici l'angle reste large malgré des verres portés en permanence : l'hypermétropie est à corriger, mais la déviation ne lui est pas imputable.",
      },
    },
    acuite: {
      poids: 4,
      resultat: 'Avec correction : OD 10/10 P2, OG 9/10 P2.',
      interpretation: {
        question: 'Que concluez-vous de ces acuités ?',
        options: [
          {
            id: 'pas-amblyopie',
            libelle: "Pas d'amblyopie résiduelle significative, acuités quasi symétriques",
            correct: true,
          },
          { id: 'amblyopie-og', libelle: "Amblyopie profonde de l'œil gauche", correct: false },
          { id: 'amblyopie-od', libelle: "Amblyopie de l'œil droit", correct: false },
        ],
        explication:
          "Une ligne d'écart n'est pas une amblyopie. Ce résultat est cohérent avec l'alternance spontanée et avec une amblyothérapie bien conduite : aucun œil n'a été durablement négligé.",
      },
    },
    lang: {
      poids: 5,
      resultat:
        "Test de Lang négatif : Léa ne reconnaît aucune des figures en relief et ne cherche pas à les saisir.",
      interpretation: {
        question: 'Que traduit ce résultat ?',
        options: [
          {
            id: 'pas-de-stereoscopie',
            libelle: 'Absence de vision stéréoscopique, donc absence de binocularité normale',
            correct: true,
          },
          { id: 'stereo-reduite', libelle: 'Une stéréoscopie simplement diminuée', correct: false },
          { id: 'defaut-comprehension', libelle: 'Un simple défaut de compréhension de la consigne', correct: false },
        ],
        explication:
          "À 16 ans la consigne est comprise. Un Lang négatif dans un strabisme apparu à 3 mois signe l'absence de vision binoculaire, ce qui est la règle dans le strabisme précoce.",
      },
    },
    motilite: {
      poids: 5,
      resultat:
        "Poursuite complète dans toutes les directions, sans limitation. Élévation franche de l'œil en adduction, retrouvée des deux côtés. Nystagmus manifeste latent léger, nettement majoré dès qu'un œil est occlus.",
      interpretation: {
        question: "Comment interprétez-vous l'élévation observée en adduction ?",
        options: [
          {
            id: 'hyperaction-oi',
            libelle: 'Hyperaction des obliques inférieurs',
            correct: true,
          },
          {
            id: 'paralysie-droits-mediaux',
            libelle: 'Paralysie bilatérale des droits médiaux',
            correct: false,
          },
          { id: 'dvd', libelle: 'Déviation verticale dissociée', correct: false },
        ],
        explication:
          "L'élévation apparaît quand l'œil adduit et se retrouve symétriquement des deux côtés : c'est une hyperaction des obliques inférieurs, association classique du strabisme précoce. Une DVD s'exprimerait à l'occlusion, indépendamment de la position du regard, ce qui n'est pas le cas ici.",
      },
    },
    hirschberg: {
      poids: 5,
      attendu: { min: 35, max: 45, unite: 'DP' },
      resultat:
        "Reflet cornéen centré sur l'œil fixateur et nettement déporté en temporal sur l'œil dévié.",
      interpretation: {
        question: 'Quel est le sens de la déviation ?',
        options: [
          { id: 'eso', libelle: 'Esotropie : déviation convergente', correct: true },
          { id: 'exo', libelle: 'Exotropie : déviation divergente', correct: false },
          { id: 'hyper', libelle: 'Déviation verticale isolée', correct: false },
        ],
        explication:
          "Le reflet se déplace à l'opposé de la rotation du globe. Un reflet déporté du côté temporal correspond à un œil tourné en dedans, donc à une esotropie.",
      },
    },
    krimsky: {
      poids: 4,
      attendu: { min: 30, max: 50, unite: 'DP' },
      resultat:
        "Le reflet de l'œil dévié se recentre par interposition de prismes base temporale de puissance croissante.",
    },
    krimskyLoin: {
      poids: 3,
      attendu: { min: 30, max: 50, unite: 'DP' },
      resultat:
        "Sur lumière lointaine, le reflet se recentre avec la même puissance qu'à 33 cm : la mesure aux reflets confirme un angle indépendant de la distance.",
    },
    coverPres: {
      poids: 8,
      attendu: { min: 35, max: 45, unite: 'DP' },
      resultat:
        "Cover unilatéral : mouvement de restitution de dedans en dehors à l'occlusion de chaque œil ; au décache, l'œil qui prend la fixation la conserve, sans préférence. Cover alterné : déviation totale libérée, abolie vers 40 DP de prismes base temporale, sans différence entre les deux yeux. Le nystagmus se majore pendant l'occlusion.",
      interpretation: {
        question: 'Que conclure de ce cover test de près ?',
        options: [
          { id: 'eso-alternante', libelle: 'Esotropie alternante, sans préférence de fixation', correct: true },
          { id: 'esophorie', libelle: 'Esophorie décompensée', correct: false },
          {
            id: 'eso-unilaterale',
            libelle: "Esotropie de l'œil gauche avec fixation préférentielle de l'œil droit",
            correct: false,
          },
        ],
        explication:
          "Le mouvement de restitution apparaît dès le premier caché : il s'agit d'une tropie et non d'une phorie. Et comme chaque œil garde la fixation après le décache, il n'y a pas de dominance : la fixation est alternante.",
      },
    },
    coverLoin: {
      poids: 5,
      attendu: { min: 35, max: 45, unite: 'DP' },
      resultat:
        "Sur mire lointaine, le mouvement s'abolit avec la même puissance qu'à 33 cm : l'angle ne varie pas avec la distance.",
      interpretation: {
        question: 'Que conclure de la comparaison des angles de près et de loin ?',
        options: [
          { id: 'non-accommodative', libelle: 'Esotropie non accommodative', correct: true },
          { id: 'accommodative', libelle: 'Esotropie accommodative', correct: false },
          { id: 'exces-convergence', libelle: 'Excès de convergence', correct: false },
        ],
        explication:
          "Les deux mesures se superposent : l'angle ne varie pas avec la distance. Chez une hypermétrope de +4.00, c'est le point décisif — ce n'est ni une esotropie accommodative ni un excès de convergence. La correction optique ne redressera pas les yeux.",
      },
    },

    tno: {
      poids: -2,
      resultat: 'Aucune plage perçue en relief.',
      justificationMalus:
        "L'absence de stéréoscopie est déjà établie par le test de Lang. Quantifier un seuil inexistant ne change ni le diagnostic ni la conduite à tenir.",
    },
    worth: {
      poids: -2,
      resultat: 'Perception de deux points seulement.',
      justificationMalus:
        'Le Worth ne fait que confirmer une neutralisation déjà prévisible devant un angle de 40 DP avec Lang négatif.',
    },
    bagolini: {
      poids: -1,
      resultat: "Perception d'une seule striure.",
      justificationMalus:
        'Intéressant pour préciser une correspondance rétinienne anormale, mais non essentiel ici : avec un angle large et constant, la neutralisation est acquise.',
    },
    verreRouge: {
      poids: -2,
      resultat: 'Un seul point perçu.',
      justificationMalus:
        "La recherche de diplopie est sans objet dans un strabisme précoce neutralisé depuis l'enfance.",
    },
    bielschowsky: {
      poids: -2,
      resultat: "Pas de majoration de déviation verticale à l'inclinaison de la tête.",
      justificationMalus:
        'Cette manœuvre explore les paralysies cyclo-verticales. La motilité ne montre aucune paralysie mais une hyperaction bilatérale et symétrique : la manœuvre était prévisiblement négative.',
    },
    biprisme: {
      poids: -2,
      resultat: 'Examen difficile à interpréter, sans élément utilisable.',
      justificationMalus:
        "Le biprisme sert à démasquer une microtropie. Un angle de 40 DP l'exclut d'emblée.",
    },
    deviometrie: {
      // Utile pour la correspondance rétinienne, mais non obligatoire au barème.
      poids: 2,
      optionnel: true,
      resultat: 'AO différent de AS.',
      interpretations: [
        {
          id: 'pourquoi-synoptophore',
          question: 'Pourquoi avez-vous demandé le synoptophore ?',
          options: [
            {
              id: 'correspondance',
              libelle: 'Pour découvrir la correspondance rétinienne',
              correct: true,
            },
            {
              id: 'stereoscopie',
              libelle: 'Pour quantifier la vision stéréoscopique',
              correct: false,
            },
          ],
          explication:
            "L'intérêt du synoptophore ici est sensoriel : découvrir la correspondance rétinienne, pas quantifier la stéréoscopie.",
        },
        {
          id: 'correspondance-patiente',
          question: 'Quelle est la correspondance rétinienne de la patiente ?',
          options: [
            { id: 'normale', libelle: 'Normale', correct: false },
            { id: 'anormale', libelle: 'Anormale', correct: true },
          ],
          explication:
            "AO différent de AS traduit une correspondance rétinienne anormale, attendue dans une esotropie précoce à grand angle.",
        },
      ],
    },
  },

  ordreAttendu: [
    'lang',
    'tno',
    'motilite',
    'hirschberg',
    'krimsky',
    'krimskyLoin',
    'coverLoin',
    'coverPres',
    'acuite',
    'refraction',
  ],

  commentaireConduiteBilan:
    'Lang en tête de bilan, puis motilité et mesures ; cover VL avant cover VP ; acuité et réfraction en fin de bilan.',

  synthese: {
    questions: [
      {
        id: 'type-strabisme',
        type: 'qcm',
        question: 'Quel type de strabisme est présenté ici ?',
        poids: 4,
        options: [
          {
            id: 'esotropie-precoce',
            libelle: 'Esotropie précoce (strabisme précoce)',
            correct: true,
          },
          {
            id: 'accommodative',
            libelle: 'Esotropie accommodative pure',
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
          "Apparition avant 6 mois, angle large et stable de près comme de loin, absence de stéréoscopie, alternance : c'est une esotropie précoce, non une forme accommodative ni tardive.",
      },
      {
        id: 'signes-pathognomoniques',
        type: 'ouverte',
        question:
          'Avez-vous retrouvé des signes pathognomoniques de ce type de strabisme ? Lesquels ?',
        poids: 3,
        seuil: 2,
        criteres: [
          {
            id: 'nml',
            variantes: ['nml', 'nystagmus manifeste latent', 'nystagmus manifeste-latent'],
          },
          {
            id: 'upshoot',
            variantes: [
              'upshoot',
              'up shoot',
              'hyperaction des obliques',
              'oblique inferieur',
              'obliques inferieurs',
            ],
          },
          {
            id: 'et',
            variantes: ["e't", 'et ', 'esotropie', 'strabisme convergent', 'angle'],
          },
        ],
        reponseAttendue: "NML, upshoot (hyperaction des obliques inférieurs), E't",
        explication:
          "Les signes qui orientent vers le strabisme précoce sont le nystagmus manifeste latent, l'upshoot par hyperaction des obliques inférieurs, et l'esotropie (E't) à grand angle.",
      },
      {
        id: 'indication-chirurgicale',
        type: 'ouiNon',
        question: 'Est-ce un bon patient à opérer ?',
        poids: 2,
        correct: true,
        explication:
          "Oui : angle stable, fixation alternante, pas d'amblyopie résiduelle significative, correction optique déjà portée sans réduction de l'angle. L'indication chirurgicale est pertinente.",
      },
      {
        id: 'technique-operatoire',
        type: 'ouverte',
        niveau: 'L3',
        question: 'Quelle technique opératoire et sur quel(s) muscle(s) va-t-on opérer ?',
        poids: 4,
        seuil: 3,
        criteres: [
          {
            id: 'geste',
            // Recul = geste attendu ; « resection » est aussi accepté (formulation fréquente).
            variantes: ['recul', 'recession', 'resection', 'résection'],
          },
          {
            id: 'muscle',
            variantes: [
              'droit medial',
              'droits mediaux',
              'medial',
              'droits internes',
              'droit interne',
            ],
          },
          {
            id: 'dose',
            variantes: ['5 mm', '5mm', 'environ 5'],
          },
          {
            id: 'cote',
            variantes: ['od', 'og', 'bilateral', 'deux yeux', 'odg', 'bilaterale'],
          },
        ],
        reponseAttendue:
          "Recul des droits médiaux OD et OG d'environ 5 mm (loi : 1 mm ≈ 4 DP, soit ~40 DP pour 5 mm bilatéraux).",
        explication:
          "Sur une esotropie précoce d'environ 40 DP, le geste de référence est un recul bilatéral des droits médiaux d'environ 5 mm, selon la règle 1 mm ≈ 4 dioptries prismatiques.",
      },
    ],
  },

  compteRenduExpert: [
    "Léa, 16 ans. Strabisme convergent apparu vers 3 mois, correction optique portée depuis, amblyothérapie par occlusion bien suivie dans la petite enfance. Mère porteuse d'un strabisme convergent de naissance.",
    "Correction portée : +4.00 sphérique aux deux yeux. Acuité avec correction OD 10/10 P2, OG 9/10 P2 : pas d'amblyopie résiduelle significative.",
    'Examen sensoriel : test de Lang négatif, absence de vision stéréoscopique.',
    "Motilité : poursuite complète, élévation en adduction bilatérale et marquée par hyperaction des obliques inférieurs, nystagmus manifeste latent léger majoré à l'occlusion.",
    "Reflets : Hirschberg autour de 40 DP, reflet temporalisé sur l'œil dévié. Krimsky concordant, entre 30 et 50 DP, et retrouvé identique sur lumière lointaine.",
    'Occlusion : cover test en VP positif, esotropie alternante sans préférence de fixation, angle total de 35 à 45 DP. Cover test en VL : même angle, donc sans composante accommodative.',
    "Conclusion : esotropie précoce alternante d'environ 40 DP, avec hyperaction des obliques inférieurs et nystagmus manifeste latent, sans amblyopie. Dossier à orienter vers une discussion chirurgicale, après vérification de la stabilité de l'angle sur deux mesures espacées.",
  ],
};
