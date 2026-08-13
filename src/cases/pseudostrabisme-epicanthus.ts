import type { CasClinique } from '../engine/types';

/**
 * Cas 3 : pseudo-strabisme chez un nourrisson asiatique avec épicanthus.
 *
 * Orthotropie réelle (deviation 0) mais angle kappa positif : les reflets
 * suggèrent une esotropie alors que le cover test est négatif — piège classique.
 */
export const pseudostrabismeEpicanthus: CasClinique = {
  id: 'pseudostrabisme-epicanthus',
  titre: 'Mei, 5 mois, adressée par son pédiatre pour un avis orthoptique',
  resume: 'Mei, 5 mois, adressée par son pédiatre pour un avis orthoptique.',
  patient: {
    prenom: 'Mei',
    age: 0,
    ageLibelle: '5 mois',
    sexe: 'F',
    motif:
      "Les parents s'inquiètent d'un regard « croisé » remarqué depuis la naissance, surtout sur les photos.",
  },

  oculaire: {
    deviation: { horizontal: 0, vertical: 0 },
    deviationLoin: { horizontal: 0, vertical: 0 },
    fixation: { mode: 'alternante' },
    upshoot: { OD: 0, OG: 0 },
    dvd: 0,
    /** Angle kappa positif : reflets temporalisés mimant une esotropie au Hirschberg. */
    kappa: { OD: 12, OG: 12 },
    correction: { OD: { sphere: 1.5 }, OG: { sphere: 1.5 } },
    acuite: { OD: 'fixation OK', OG: 'fixation OK' },
  },

  questions: [
    {
      id: 'motif',
      rubrique: 'anamnese',
      libelle: "Pourquoi consultez-vous aujourd'hui ?",
      reponse:
        "On nous a dit que Mei avait les yeux croisés. On s'inquiète depuis qu'elle est née, surtout sur les photos de famille.",
      poids: 4,
      commentaire:
        "Poser le motif parental oriente vers une inquiétude esthétique plutôt qu'un strabisme fonctionnel avéré.",
    },
    {
      id: 'depuis-quand',
      rubrique: 'anamnese',
      libelle: "Depuis quand observez-vous cet aspect ?",
      reponse:
        "Dès la naissance. Les grands-parents l'ont remarqué tout de suite. Ça ne semble pas s'aggraver.",
      poids: 4,
      commentaire:
        "Un pseudo-strabisme est souvent remarqué très tôt ; l'absence d'aggravation est rassurante.",
    },
    {
      id: 'photos-regard',
      rubrique: 'anamnese',
      libelle: "L'aspect est-il constant ou surtout visible sur certaines photos ou en regard latéral ?",
      reponse:
        "C'est surtout flagrant sur les photos et quand elle regarde sur le côté. De face, parfois on ne voit rien.",
      poids: 5,
      commentaire:
        "L'épicanthus et le pont nasal large accentuent l'illusion en regard latéral : argument clé pour le pseudo-strabisme.",
    },
    {
      id: 'morphologie',
      rubrique: 'anamnese',
      libelle: "Y a-t-il des particularités du visage ou des paupières ?",
      reponse:
        "Elle a des plis des paupières vers le nez, un peu comme dans la famille. Le médecin a parlé d'épicanthus.",
      poids: 5,
      commentaire:
        "L'épicanthus masque le blanc scléral médial et donne une fausse impression de convergent.",
    },
    {
      id: 'alternance',
      rubrique: 'anamnese',
      libelle: "Avez-vous l'impression qu'un œil reste toujours tourné vers l'intérieur ?",
      reponse:
        "Non, ce n'est pas toujours le même œil. Parfois on ne voit rien du tout quand elle nous fixe.",
      poids: 3,
      commentaire:
        "Pas de strabisme fixe unilatéral : l'aspect fluctuant selon la position du regard oriente vers un piège morphologique.",
    },
    {
      id: 'developpement',
      rubrique: 'anamnese',
      libelle: "Le développement moteur et visuel semble-t-il normal ?",
      reponse:
        "Oui, elle suit bien des objets et des visages, sourit en contact, développe psychomoteur normal pour son âge.",
      poids: 4,
      commentaire:
        "Fixation et poursuite conservées : pas d'alarme neurologique ni de strabisme manifeste fonctionnel.",
    },
    {
      id: 'correction',
      rubrique: 'anamnese',
      libelle: 'Porte-t-elle des lunettes ?',
      reponse: "Non, pas encore. Personne ne nous en a parlé.",
      poids: 2,
      commentaire: "À 5 mois, pas de correction habituelle ; l'hypermétropie physiologique ne justifie pas de verres.",
    },
    {
      id: 'familiaux',
      rubrique: 'antecedents',
      libelle: "Y a-t-il des antécédents familiaux de strabisme ou d'épicanthus ?",
      reponse:
        "La mère et la grand-mère ont les mêmes plis des paupières. Pas de strabisme opéré dans la famille.",
      poids: 3,
      commentaire:
        "L'épicanthus est souvent familial ; l'absence de vrai strabisme familial est rassurante.",
    },
    {
      id: 'grossesse',
      rubrique: 'antecedents',
      libelle: "Comment s'est déroulée la grossesse et la naissance ?",
      reponse: 'Grossesse normale, naissance à terme, poids de naissance normal.',
      poids: 2,
    },
    {
      id: 'general',
      rubrique: 'antecedents',
      libelle: 'Y a-t-il une pathologie générale connue ?',
      reponse: 'Non, aucune.',
      poids: 2,
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
      commentaire: 'Hors sujet pour un bilan orthoptique.',
    },
    {
      id: 'metier-parents',
      rubrique: 'antecedents',
      libelle: 'Quelle est la profession des parents ?',
      reponse: 'Le père est informaticien, la mère est designer.',
      poids: -2,
      commentaire: 'Sans lien avec la déviation apparente.',
    },
  ],

  examens: {
    motilite: {
      poids: 6,
      resultat:
        'Poursuite horizontale et verticale complète, sans limitation. Pas de surélévation en adduction. Réflexes pupillaires normaux.',
      interpretation: {
        question: 'Que concluez-vous de la motilité ?',
        options: [
          {
            id: 'normale',
            libelle: 'Motilité normale, sans signe de paralysie ni de strabisme précoce',
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
        explication:
          "Une motilité libre et symétrique écarte un strabisme paralytique ou précoce ; elle est compatible avec une orthotropie réelle.",
      },
    },
    hirschberg: {
      poids: 6,
      attendu: { min: 10, max: 15, unite: 'DP' },
      resultat:
        "Reflets cornéens déportés vers la tempe des deux côtés, donnant l'impression d'une esotropie d'environ 10 à 15 DP.",
      interpretation: {
        question: 'Comment interpréter ces reflets en position primaire ?',
        options: [
          {
            id: 'piège-kappa',
            libelle:
              "Piège possible : reflets faussement convergents (angle kappa positif) ; le cover test est indispensable pour trancher",
            correct: true,
          },
          {
            id: 'eso-certaine',
            libelle: 'Esotropie certaine de 10 à 15 DP',
            correct: false,
          },
          {
            id: 'exo',
            libelle: 'Exotropie',
            correct: false,
          },
        ],
        explication:
          "Un reflet temporalisé peut traduire un angle kappa positif et non une vraie esotropie. Devant un épicanthus, ne jamais conclure sans cover test.",
      },
    },
    krimsky: {
      poids: 4,
      attendu: { min: 10, max: 15, unite: 'DP' },
      resultat:
        "Les reflets se recentrent avec des prismes base temporale d'environ 10 à 15 DP, concordant avec le Hirschberg.",
      interpretation: {
        question: 'Le Krimsky confirme-t-il une esotropie ?',
        options: [
          {
            id: 'non-sans-cover',
            libelle:
              "Non isolément : il mesure le décalage des reflets, qui peut être dû à l'angle kappa ; seul le cover test objectivise une tropie",
            correct: true,
          },
          {
            id: 'eso-prouvee',
            libelle: 'Oui, esotropie prouvée',
            correct: false,
          },
          {
            id: 'exo',
            libelle: 'Exotropie prouvée',
            correct: false,
          },
        ],
        explication:
          "Krimsky et Hirschberg explorent la position des reflets, pas la tropie réelle. Un angle kappa positif fausse la mesure.",
      },
    },
    krimskyLoin: {
      poids: 3,
      attendu: { min: 10, max: 15, unite: 'DP' },
      resultat:
        "Sur lumière lointaine, même décalage des reflets qu'à 33 cm : pas de variation accommodative.",
    },
    coverPres: {
      poids: 10,
      attendu: { min: 0, max: 2, unite: 'DP' },
      resultat:
        "Cover unilatéral et alterné : aucun mouvement de restitution, pas de reprise de fixation latérale. Orthotropie de près.",
      interpretation: {
        question: 'Que concluez-vous de ce cover test de près ?',
        options: [
          {
            id: 'orthotropie',
            libelle: 'Orthotropie : pas de tropie, malgré les reflets faussement convergents',
            correct: true,
          },
          {
            id: 'esophorie',
            libelle: 'Esophorie décompensée',
            correct: false,
          },
          {
            id: 'eso-tropie',
            libelle: 'Esotropie manifeste confirmée',
            correct: false,
          },
        ],
        explication:
          "Le cover test est l'examen clé : absence de mouvement = pas de strabisme. C'est ce qui distingue le pseudo-strabisme d'une vraie esotropie.",
      },
    },
    coverLoin: {
      poids: 5,
      attendu: { min: 0, max: 2, unite: 'DP' },
      resultat: 'Cover test de loin : orthotropie, aucun mouvement de restitution.',
      interpretation: {
        question: 'La comparaison près / loin est-elle utile ici ?',
        options: [
          {
            id: 'orthotropie-stable',
            libelle: 'Orthotropie stable de près comme de loin : pas de composante accommodative',
            correct: true,
          },
          {
            id: 'accommodative',
            libelle: 'Esotropie accommodative',
            correct: false,
          },
          {
            id: 'exces-convergence',
            libelle: 'Excès de convergence',
            correct: false,
          },
        ],
        explication:
          "Orthotropie à toutes distances : pas de strabisme caché. L'illusion venait des reflets et de la morphologie palpébrale.",
      },
    },
    refraction: {
      poids: 3,
      resultat:
        'Réfraction sous cycloplégie : +1.50 D sphérique aux deux yeux. Hypermétropie physiologique du nourrisson, sans correction indiquée à cet âge.',
      interpretation: {
        question: 'Comment interpréter cette réfraction ?',
        options: [
          {
            id: 'physiologique',
            libelle:
              'Hypermétropie physiologique du nourrisson, sans lien avec le pseudo-strabisme ; pas de lunettes à prescrire',
            correct: true,
          },
          {
            id: 'accommodative',
            libelle: 'Esotropie accommodative nécessitant une correction immédiate',
            correct: false,
          },
          {
            id: 'sans-interet',
            libelle: 'Réfraction sans intérêt chez un nourrisson',
            correct: false,
          },
        ],
        explication:
          "L'hypermétropie modérée est normale à 5 mois. Elle n'explique pas l'aspect « croisé » et ne justifie pas de verres ni de chirurgie.",
      },
    },
    acuite: {
      poids: 3,
      resultat:
        "Fixation et poursuite binoculaires normales pour l'âge. Pas de test d'acuité chiffré possible à 5 mois.",
      interpretation: {
        question: "Que retenir de l'examen visuel à cet âge ?",
        options: [
          {
            id: 'fixation-normale',
            libelle: "Fixation et poursuite normales, sans signe d'amblyopie ni de préférence pathologique",
            correct: true,
          },
          {
            id: 'amblyopie',
            libelle: 'Amblyopie unilatérale',
            correct: false,
          },
          {
            id: 'acuite-basse',
            libelle: 'Acuité visuelle pathologiquement basse',
            correct: false,
          },
        ],
        explication:
          "À 5 mois, l'évaluation repose sur la fixation et la poursuite : ici normales, cohérentes avec une orthotropie.",
      },
    },

    lang: {
      poids: -2,
      resultat: 'Test non réalisable de façon fiable à 5 mois.',
      justificationMalus:
        "Le Lang n'est pas indiqué avant 2–3 ans. À cet âge, il n'apporte rien au diagnostic de pseudo-strabisme.",
    },
    tno: {
      poids: -2,
      resultat: 'Test non réalisable de façon fiable à 5 mois.',
      justificationMalus:
        "Le TNO n'est pas indiqué avant 3–4 ans. Réaliser ce test dissocie inutilement et n'éclaire pas la conduite.",
    },
    worth: {
      poids: -2,
      resultat: 'Test non interprétable de façon fiable à cet âge.',
      justificationMalus: 'Épreuve dissociante non contributive chez un nourrisson de 5 mois.',
    },
    bagolini: {
      poids: -1,
      resultat: 'Coopération insuffisante pour une interprétation fiable.',
      justificationMalus: 'Dissociation inutile et non fiable à cet âge.',
    },
    verreRouge: {
      poids: -2,
      resultat: 'Test non réalisable de façon fiable.',
      justificationMalus: 'Hors indication à 5 mois.',
    },
    bielschowsky: {
      poids: -2,
      resultat: "Pas de modification à l'inclinaison de la tête.",
      justificationMalus: 'Manœuvre des cyclo-verticaux sans indication devant une motilité normale.',
    },
    deviometrie: {
      poids: 0,
      nonContributifSiPresente: true,
      malusSiPresente: -1,
      resultat: 'Examen non réalisable de façon fiable à cet âge.',
      justificationMalus: 'Synoptophore inadapté à 5 mois.',
    },
    biprisme: {
      poids: 0,
      nonContributifSiPresente: true,
      malusSiPresente: -2,
      resultat: 'Examen non contributif.',
      justificationMalus: 'Biprisme de Bagolini inadapté chez un nourrisson.',
    },
  },

  ordreAttendu: [
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
    'Motilité et cover tests en priorité ; reflets avec prudence (angle kappa) ; pas de tests stéréoscopiques à cet âge ; acuité et réfraction en fin de bilan.',

  ordreAnamneseAttendu: [
    'motif',
    'depuis-quand',
    'photos-regard',
    'morphologie',
    'alternance',
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
            id: 'pseudostrabisme',
            libelle: "Pseudo-strabisme (pseudostrabismus) lié à l'épicanthus et à l'angle kappa",
            correct: true,
          },
          {
            id: 'esotropie',
            libelle: 'Esotropie infantile',
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
          "Cover test négatif + reflets faussement convergents + épicanthus + angle kappa positif = pseudo-strabisme. Pas de vraie tropie.",
      },
      {
        id: 'signes-cles',
        type: 'ouverte',
        question: 'Quels éléments vous ont orientés vers ce diagnostic ?',
        poids: 4,
        seuil: 3,
        criteres: [
          {
            id: 'cover',
            variantes: ['cover', 'occlusion', 'orthotrop', 'pas de mouvement', 'negatif', 'négatif'],
          },
          {
            id: 'epicanthus',
            variantes: ['epicanthus', 'épicanthus', 'plis', 'paupier', 'pont nasal', 'sclere', 'blanc'],
          },
          {
            id: 'kappa',
            variantes: ['kappa', 'angle kappa', 'reflet', 'hirschberg', 'fausse', 'pseudo', 'illusion'],
          },
          {
            id: 'regard',
            variantes: ['photo', 'lateral', 'latéral', 'regard', 'morpholog'],
          },
        ],
        reponseAttendue:
          'Cover test négatif (orthotropie), épicanthus / pont nasal large, reflets faussement convergents (angle kappa positif), aspect accentué en regard latéral ou sur photos.',
        explication:
          "La triade diagnostique est : illusion morphologique (épicanthus), reflets trompeurs (kappa), cover test normal.",
      },
      {
        id: 'conduite',
        type: 'qcm',
        question: 'Quelle conduite à tenir ?',
        poids: 4,
        options: [
          {
            id: 'rassurance',
            libelle: 'Rassurer les parents, pas de chirurgie ni de lunettes ; surveillance à la croissance du pont nasal',
            correct: true,
          },
          {
            id: 'chirurgie',
            libelle: 'Chirurgie des droits médiaux en urgence',
            correct: false,
          },
          {
            id: 'lunettes',
            libelle: 'Prescrire immédiatement des lunettes correctrices',
            correct: false,
          },
          {
            id: 'occlusion',
            libelle: 'Occlusion anti-amblyopique',
            correct: false,
          },
        ],
        explication:
          "Le pseudo-strabisme ne se traite pas : réassurance et surveillance. L'aspect s'améliore souvent avec la croissance du pont nasal.",
      },
      {
        id: 'chirurgie',
        type: 'ouiNon',
        question: 'Faut-il opérer Mei ?',
        poids: 2,
        correct: false,
        explication:
          "Non : pas de strabisme réel. Une chirurgie serait iatrogène. L'épicanthus isolé ne justifie une chirurgie esthétique que sur demande familiale tardive, pas en urgence.",
      },
    ],
  },

  compteRenduExpert: [
    "Mei, 5 mois, adressée par le pédiatre pour un regard « croisé » remarqué dès la naissance, surtout sur photos et en regard latéral. Épicanthus bilatéral familial. Développement normal, fixation et poursuite conservées.",
    "Examen morphologique : plis palpébraux médiaux (épicanthus), pont nasal large masquant le sclère interne.",
    "Motilité : poursuite complète, sans limitation ni upshoot.",
    "Reflets : Hirschberg et Krimsky autour de 10–15 DP, reflets temporalisés des deux côtés — fausse impression d'esotropie (angle kappa positif).",
    "Cover test VP et VL : orthotropie, aucun mouvement de restitution — pas de strabisme.",
    "Réfraction sous cycloplégie : +1.50 D aux deux yeux, hypermétropie physiologique. Pas de correction optique indiquée.",
    "Conclusion : pseudo-strabisme sur épicanthus avec angle kappa positif. Rassurance parentale, surveillance ; pas de chirurgie strabologique.",
  ],
};
