import type { CasClinique } from '../engine/types';

/**
 * Cas 3 : diplopie horizontale aiguë chez une adulte jeune.
 *
 * Tableau final : paralysie bilatérale du VI révélatrice d'une hypertension
 * intracrânienne (HTIC) pas encore diagnostiquée. L'étudiant doit orienter vers
 * les examens complémentaires de l'HTIC en synthèse.
 */
export const rihanna: CasClinique = {
  id: 'rihanna',
  titre: 'Rihanna, 38 ans, consulte en urgence pour une vision double',
  resume: 'Rihanna, 38 ans, consulte en urgence pour une vision double apparue brutalement.',
  patient: {
    prenom: 'Rihanna',
    age: 38,
    sexe: 'F',
    motif:
      'Vision double horizontale apparue brutalement depuis trois jours, sans antécédent oculaire.',
  },

  oculaire: {
    // Esotropie par déficit d'abduction bilatéral : plus marquée de loin (VI).
    deviation: { horizontal: 22, vertical: 0 },
    deviationLoin: { horizontal: 32, vertical: 0 },
    fixation: { mode: 'alternante' },
    upshoot: { OD: 0, OG: 0 },
    dvd: 0,
    kappa: { OD: 0, OG: 0 },
    correction: { OD: { sphere: -0.5 }, OG: { sphere: -0.5 } },
    acuite: { OD: '10/10', OG: '10/10' },
  },

  questions: [
    {
      id: 'motif',
      rubrique: 'anamnese',
      libelle: "Quel est le motif de la consultation aujourd'hui ?",
      reponse:
        'Je vois double depuis trois jours. C’est apparu d’un coup, je suis très inquiète.',
      poids: 4,
      commentaire:
        'Une diplopie aiguë impose d’emblée un bilan moteur urgent et une recherche étiologique neuro-ophtalmologique.',
    },
    {
      id: 'depuis-quand',
      rubrique: 'anamnese',
      libelle: 'Depuis quand la vision double est-elle présente ?',
      reponse: 'Depuis exactement trois jours, sans signe avant-coureur.',
      poids: 4,
      commentaire:
        'Un début brutal oriente vers une cause acquise récente (vasculaire, compressive, inflammatoire, HTIC…) et non un strabisme de longue date.',
    },
    {
      id: 'diplopie',
      rubrique: 'anamnese',
      libelle: 'Décrivez votre vision double : horizontale, verticale, oblique ?',
      reponse:
        'Horizontale, comme si j’avais deux images côte à côte. Elle est là en permanence.',
      poids: 4,
      commentaire:
        'Une diplopie horizontale constante évoque surtout une atteinte des muscles horizontaux ou de leurs nerfs moteurs oculaires.',
    },
    {
      id: 'distance',
      rubrique: 'anamnese',
      libelle: 'La vision double est-elle plus gênante de loin ou de près ?',
      reponse: 'Nettement plus gênante de loin, surtout en conduisant ou en regardant au loin.',
      poids: 3,
      commentaire:
        'Une majoration de loin est classique dans les atteintes du VI, surtout lorsque l’abduction est demandée.',
    },
    {
      id: 'cephalees',
      rubrique: 'anamnese',
      libelle: 'Avez-vous des céphalées en même temps que la vision double ?',
      reponse:
        'Oui, des maux de tête oppressifs, surtout le matin et en fin de journée, plus intenses depuis trois jours.',
      poids: 4,
      commentaire:
        'Céphalées associées à une diplopie aiguë : penser HTIC, processus intracrânien, migraine ophtalmique…',
    },
    {
      id: 'strabisme-antérieur',
      rubrique: 'anamnese',
      libelle: 'Avez-vous déjà eu un strabisme ou une opération des yeux ?',
      reponse: 'Non, jamais. Mes yeux étaient droits avant ces trois jours.',
      poids: 3,
      commentaire:
        'Absence d’antécédent oculomoteur : tableau acquis, à ne pas interpréter comme un strabisme précoce ou accommodatif.',
    },
    {
      id: 'acuite-recente',
      rubrique: 'anamnese',
      libelle: 'Avez-vous remarqué une baisse de vision récente ou des obscurations visuelles ?',
      reponse:
        'Par moments des « voiles » passagers, surtout en me levant vite, mais je vois encore bien les lettres.',
      poids: 3,
      commentaire:
        'Obscurations visuelles transitoires peuvent accompagner une HTIC avant une baisse d’acuité franche.',
    },
    {
      id: 'acouphenes',
      rubrique: 'anamnese',
      libelle: 'Entendez-vous un bruit dans les oreilles, pulsatile ou en syncope avec le pouls ?',
      reponse: 'Oui, un bourdonnement pulsatile à l’oreille droite depuis quelques semaines.',
      poids: 3,
      commentaire: 'Acouphène pulsatile : signe d’alerte en faveur d’une HTIC ou d’une pathologie vasculaire intracrânienne.',
    },
    {
      id: 'poids',
      rubrique: 'anamnese',
      libelle: 'Avez-vous pris ou perdu du poids récemment ?',
      reponse: 'J’ai pris environ 8 kg en un an, sans changement alimentaire majeur.',
      poids: 3,
      commentaire:
        'Prise de poids récente chez une femme jeune : facteur de risque classique d’HTIC idiopathique.',
    },
    {
      id: 'correction',
      rubrique: 'anamnese',
      libelle: 'Portez-vous des lunettes ou des lentilles ?',
      reponse: 'Des lunettes légères pour la télévision, portées de temps en temps seulement.',
      poids: 2,
      commentaire:
        'Une faible myopie n’explique pas une diplopie aiguë ; elle n’oriente pas le diagnostic moteur.',
    },
    {
      id: 'nausees',
      rubrique: 'anamnese',
      libelle: 'Avez-vous des nausées ou des vomissements associés aux céphalées ?',
      reponse: 'Quelques nausées le matin, pas de vomissements.',
      poids: 2,
      commentaire: 'Nausées matinales renforcent le soupçon d’hypertension intracrânienne.',
    },
    {
      id: 'contraception',
      rubrique: 'antecedents',
      libelle: 'Prenez-vous une contraception hormonale ou d’autres médicaments ?',
      reponse: 'Pilule oestroprogestative depuis cinq ans, pas d’autre traitement.',
      poids: 2,
      commentaire: 'Contraception oestroprogestative : cofacteur possible d’HTIC chez la femme jeune.',
    },
    {
      id: 'generaux',
      rubrique: 'antecedents',
      libelle: 'Avez-vous une maladie générale connue (HTA, diabète, migraine, thyroïde…) ?',
      reponse: 'RAS. Pas de migraine habituelle, tension artérielle normale au dernier contrôle.',
      poids: 2,
      commentaire: 'Rechercher une cause générale ou iatrogène d’HTIC secondaire.',
    },
    {
      id: 'chirurgie',
      rubrique: 'antecedents',
      libelle: 'Avez-vous déjà été opérée des yeux ou du cerveau ?',
      reponse: 'Non, aucune chirurgie.',
      poids: 2,
      commentaire: 'Antécédent chirurgical cranio-oculaire absent : tableau purement acquis.',
    },
    {
      id: 'familiaux',
      rubrique: 'antecedents',
      libelle: 'Y a-t-il des antécédents familiaux de strabisme ou de maladie neurologique ?',
      reponse: 'Non, rien de particulier dans la famille.',
      poids: 1,
    },
    {
      id: 'lateralite',
      rubrique: 'anamnese',
      libelle: 'Êtes-vous droitière ou gauchère ?',
      reponse: 'Droitière.',
      poids: 0,
    },
    {
      id: 'sport',
      rubrique: 'anamnese',
      libelle: 'Pratiquez-vous un sport régulièrement ?',
      reponse: 'Marche deux fois par semaine.',
      poids: 0,
    },
    {
      id: 'groupe-sanguin',
      rubrique: 'antecedents',
      libelle: 'Quel est votre groupe sanguin ?',
      reponse: 'Je ne le connais pas.',
      poids: -2,
      commentaire: 'Hors sujet dans une diplopie aiguë.',
    },
    {
      id: 'metier-parents',
      rubrique: 'antecedents',
      libelle: 'Quelle est la profession de vos parents ?',
      reponse: 'Ma mère est aide-soignante, mon père chauffeur routier.',
      poids: -2,
      commentaire: 'Sans lien avec le tableau oculomoteur aigu.',
    },
  ],

  ordreAnamneseAttendu: [
    'motif',
    'depuis-quand',
    'diplopie',
    'distance',
    'cephalees',
    'strabisme-antérieur',
    'acuite-recente',
  ],

  examens: {
    motilite: {
      poids: 5,
      resultat:
        "Versions oculaires : limitation nette et symétrique de l'abduction des deux yeux, avec impossibilité d'atteindre la position latérale extrême. Adduction, élévations et dépressions conservées. Pas d'hyperaction compensatrice des obliques. Pas de signe de paralysie verticale. Poursuite directe difficile latéralement à cause de la diplopie.",
      interpretation: {
        question: 'Comment interprétez-vous cette motilité ?',
        options: [
          {
            id: 'vi-bilateral',
            libelle: 'Paralysie bilatérale (ou paresie bilatérale) du VI',
            correct: true,
          },
          {
            id: 'iii-unilateral',
            libelle: 'Paralysie unilatérale du III',
            correct: false,
          },
          {
            id: 'hyperaction-oi',
            libelle: 'Hyperaction bilatérale des obliques inférieurs (strabisme précoce)',
            correct: false,
          },
        ],
        explication:
          "Une limitation d'abduction bilatérale et symétrique, sans atteinte verticale, oriente vers une double paralysie du VI. Ce n'est pas un tableau de strabisme précoce ni une paralysie du III.",
      },
    },
    verreRouge: {
      poids: 5,
      resultat:
        'Deux images perçues, rouge et claire, séparées horizontalement. La séparation augmente en regard latéral et de loin.',
      interpretation: {
        question: 'Que confirme ce test ?',
        options: [
          {
            id: 'diplopie-binoculaire',
            libelle: 'Diplopie binoculaire horizontale, non neutralisée',
            correct: true,
          },
          {
            id: 'suppression',
            libelle: 'Suppression monoculaire sans diplopie réelle',
            correct: false,
          },
          {
            id: 'diplopie-monoculaire',
            libelle: 'Diplopie monoculaire',
            correct: false,
          },
        ],
        explication:
          'Deux images distinctes au test rouge traduisent une diplopie binoculaire persistante, cohérente avec une déviation récente non adaptée.',
      },
    },
    worth: {
      poids: 3,
      resultat: 'Perception de cinq points : deux rouges, trois verts, disposés horizontalement.',
      interpretation: {
        question: 'Comment interpréter ce résultat ?',
        options: [
          {
            id: 'diplopie',
            libelle: 'Diplopie binoculaire horizontale',
            correct: true,
          },
          {
            id: 'suppression',
            libelle: 'Suppression d’un œil',
            correct: false,
          },
          {
            id: 'fusion',
            libelle: 'Fusion normale',
            correct: false,
          },
        ],
        explication:
          'Cinq points séparés confirment l’absence de fusion et une diplopie manifeste, attendue dans un strabisme ou une paralysie récente.',
      },
    },
    hirschberg: {
      poids: 4,
      attendu: { min: 18, max: 28, unite: 'DP' },
      resultat:
        "Reflet cornéen déporté en temporal sur l'œil non fixateur : esotropie en position primaire.",
      interpretation: {
        question: 'Quel est le sens de la déviation ?',
        options: [
          { id: 'eso', libelle: 'Esotropie', correct: true },
          { id: 'exo', libelle: 'Exotropie', correct: false },
          { id: 'hyper', libelle: 'Hypertropie isolée', correct: false },
        ],
        explication:
          "Reflet temporalisé sur l'œil dévié : l'œil est tourné en dedans, donc esotropie, cohérente avec un déficit d'abduction bilatéral.",
      },
    },
    krimsky: {
      poids: 4,
      attendu: { min: 18, max: 28, unite: 'DP' },
      resultat:
        'Recentrage du reflet par prismes base temporale, concordant avec une esotropie de près d’environ 22 DP.',
    },
    krimskyLoin: {
      poids: 4,
      attendu: { min: 28, max: 38, unite: 'DP' },
      resultat:
        'En vision de loin, l’angle augmente : esotropie d’environ 32 DP, plus marquée qu’à 33 cm.',
      interpretation: {
        question: 'Que suggère cette majoration de loin ?',
        options: [
          {
            id: 'vi',
            libelle: 'Atteinte du VI (déficit d’abduction), typiquement plus gênante de loin',
            correct: true,
          },
          {
            id: 'accommodative',
            libelle: 'Composante accommodative',
            correct: false,
          },
          {
            id: 'dvd',
            libelle: 'Déviation verticale dissociée',
            correct: false,
          },
        ],
        explication:
          'Une esotropie majorée de loin, avec limitation d’abduction, renforce l’hypothèse de paralysie(s) du VI plutôt qu’une déviation accommodative.',
      },
    },
    coverPres: {
      poids: 5,
      attendu: { min: 18, max: 28, unite: 'DP' },
      resultat:
        "Cover test de près positif : mouvement de restitution de dedans en dehors à l'occlusion de chaque œil. Pas de préférence nette de fixation. Diplopie ressentie au décache.",
      interpretation: {
        question: 'Que concluez-vous de ce cover test de près ?',
        options: [
          {
            id: 'eso-recente',
            libelle: 'Esotropie manifeste récente, sans neutralisation',
            correct: true,
          },
          { id: 'esophorie', libelle: 'Esophorie seule', correct: false },
          {
            id: 'microtropie',
            libelle: 'Microtropie ancienne neutralisée',
            correct: false,
          },
        ],
        explication:
          'Mouvement de restitution dès la première occlusion : tropie manifeste. La diplopie persistante et l’absence d’antécédent orientent vers un tableau acquis récent.',
      },
    },
    coverLoin: {
      poids: 5,
      attendu: { min: 28, max: 38, unite: 'DP' },
      resultat:
        'Cover test de loin : esotropie plus large qu’à 33 cm, autour de 32 DP, concordante avec la gêne déclarée de loin.',
    },
    acuite: {
      poids: 3,
      resultat: 'Sans correction : OD 10/10, OG 10/10. Avec correction légère : identique.',
      interpretation: {
        question: 'Que retenez-vous de ces acuités ?',
        options: [
          {
            id: 'conservees',
            libelle: 'Acuités conservées ; la plainte est surtout motrice / diplopique',
            correct: true,
          },
          {
            id: 'amblyopie',
            libelle: 'Amblyopie unilatérale',
            correct: false,
          },
          {
            id: 'baisse-severe',
            libelle: 'Baisse sévère d’acuité expliquant seule la plainte',
            correct: false,
          },
        ],
        explication:
          'Des acuités à 10/10 n’éliminent pas une HTIC débutante ni une paralysie oculomotrice ; elles indiquent surtout que le trouble est binoculaire/moteur.',
      },
    },
    refraction: {
      poids: 2,
      resultat: 'Légère myopie faible bilatérale : −0,50 D sphérique de chaque côté.',
      interpretation: {
        question: 'Cette réfraction explique-t-elle la diplopie aiguë ?',
        options: [
          {
            id: 'non',
            libelle: 'Non : une faible myopie n’explique pas une diplopie horizontale brutale',
            correct: true,
          },
          {
            id: 'oui-accommodative',
            libelle: 'Oui : esotropie accommodative',
            correct: false,
          },
          {
            id: 'oui-anisometropie',
            libelle: 'Oui : par anisométropie majeure',
            correct: false,
          },
        ],
        explication:
          'Une faible myopie bilatérale symétrique n’entraîne pas une diplopie soudaine à 38 ans ; il faut chercher une cause neuro-ophtalmologique.',
      },
    },
    bagolini: {
      poids: 2,
      optionnel: true,
      resultat: 'Deux stries perpendiculaires non superposées, séparées horizontalement.',
      interpretation: {
        question: 'Que traduit ce résultat ?',
        options: [
          {
            id: 'diplopie',
            libelle: 'Diplopie binoculaire',
            correct: true,
          },
          {
            id: 'suppression',
            libelle: 'Suppression monoculaire',
            correct: false,
          },
          {
            id: 'correspondance-anormale',
            libelle: 'Correspondance rétinienne anormale ancienne',
            correct: false,
          },
        ],
        explication:
          'Deux stries séparées confirment l’absence de fusion, cohérent avec une déviation récente.',
      },
    },
    lang: {
      poids: -1,
      resultat: 'Test de Lang négatif : aucune figure perçue en relief.',
      justificationMalus:
        'Devant une diplopie manifeste et une paralysie récente, l’absence de stéréoscopie est attendue ; le Lang n’apporte pas d’information décisionnelle supplémentaire.',
    },
    tno: {
      poids: -2,
      resultat: 'Aucune stéréoscopie mesurable.',
      justificationMalus:
        'Le TNO est redondant ici : la diplopie et l’absence de fusion sont déjà documentées par des tests plus adaptés à l’urgence.',
    },
    bielschowsky: {
      poids: -2,
      resultat: 'Pas de majoration de déviation verticale à l’inclinaison de la tête.',
      justificationMalus:
        'Manœuvre utile pour une paralysie cycloverticale ; la motilité ne montre aucune atteinte verticale : test non contributif.',
    },
    deviometrie: {
      poids: -2,
      resultat: 'Mesure difficile, non reproductible dans ce contexte aigu.',
      justificationMalus:
        'Le synoptophore sert surtout à explorer une correspondance rétinienne dans les déviations anciennes, pas une paralysie aiguë du VI.',
    },
    biprisme: {
      poids: -2,
      resultat: 'Examen non interprétable dans ce contexte.',
      justificationMalus:
        'Le biprisme recherche une microtropie ; l’angle est manifeste et la plainte est récente.',
    },
  },

  ordreAttendu: [
    'motilite',
    'verreRouge',
    'worth',
    'hirschberg',
    'krimsky',
    'krimskyLoin',
    'coverLoin',
    'coverPres',
    'acuite',
    'refraction',
  ],

  commentaireConduiteBilan:
    'Devant une diplopie aiguë : motilité et confirmation de la diplopie en premier ; reflets et cover tests (VL avant VP si la gêne est surtout de loin) ; acuité et réfraction en fin de bilan.',

  synthese: {
    questions: [
      {
        id: 'diagnostic-moteur',
        type: 'qcm',
        question: 'Quel diagnostic oculomoteur retenez-vous ?',
        poids: 4,
        options: [
          {
            id: 'vi-bilateral',
            libelle: 'Paralysie bilatérale du VI (double paralysie du VI)',
            correct: true,
          },
          {
            id: 'esotropie-precoce',
            libelle: 'Esotropie précoce alternante',
            correct: false,
          },
          {
            id: 'esotropie-accommodative',
            libelle: 'Esotropie accommodative',
            correct: false,
          },
          {
            id: 'iii-unilateral',
            libelle: 'Paralysie unilatérale du III',
            correct: false,
          },
        ],
        explication:
          'Limitation d’abduction bilatérale, esotropie majorée de loin, diplopie horizontale aiguë : le tableau est celui d’une double paralysie du VI.',
      },
      {
        id: 'etiologie',
        type: 'qcm',
        question: 'Quelle étiologie générale doit être évoquée en priorité devant ce tableau chez cette patiente ?',
        poids: 4,
        options: [
          {
            id: 'htic',
            libelle: 'Hypertension intracrânienne (HTIC / pseudotumor cérébri)',
            correct: true,
          },
          {
            id: 'amblyopie',
            libelle: 'Amblyopie de l’enfance non traitée',
            correct: false,
          },
          {
            id: 'accommodative',
            libelle: 'Décompensation d’une esotropie accommodative',
            correct: false,
          },
          {
            id: 'myopie',
            libelle: 'Myopie simple',
            correct: false,
          },
        ],
        explication:
          'Femme jeune, surpoids récent, céphalées, acouphène pulsatile, diplopie aiguë par double VI : l’HTIC idiopathique doit être évoquée en urgence jusqu’à preuve du contraire.',
      },
      {
        id: 'signes-retrouves',
        type: 'ouverte',
        question:
          'Quels signes cliniques vous ont orientés vers ce diagnostic ? Citez-en au moins deux.',
        poids: 3,
        seuil: 2,
        criteres: [
          {
            id: 'abduction',
            variantes: [
              'abduction',
              'abduc',
              'limitation',
              'deficit abduction',
              'vi',
              'nerf vi',
              '6',
              'six',
            ],
          },
          {
            id: 'diplopie',
            variantes: ['diplopie', 'double', 'vision double', 'verre rouge', 'worth'],
          },
          {
            id: 'eso',
            variantes: ['esotropie', 'convergent', 'dedans', 'eso'],
          },
          {
            id: 'loin',
            variantes: ['loin', 'distance', 'de loin', 'vl'],
          },
        ],
        reponseAttendue:
          'Limitation d’abduction bilatérale, diplopie horizontale aiguë, esotropie majorée de loin.',
        explication:
          'La triade limitation d’abduction bilatérale + diplopie horizontale + majoration de loin est très suggestive d’une atteinte bilatérale du VI.',
      },
      {
        id: 'examens-complementaires',
        type: 'ouverte',
        niveau: 'L2',
        question:
          'Quels examens complémentaires prescrivez-vous pour confirmer l’HTIC et orienter la prise en charge ?',
        poids: 5,
        seuil: 2,
        criteres: [
          {
            id: 'fond-oeil',
            variantes: [
              'fond d oeil',
              'fond d\'oeil',
              'fond doeil',
              'papille',
              'papilloedeme',
              'papilledeme',
              'oedeme papillaire',
              'œdème papillaire',
            ],
          },
          {
            id: 'irm',
            variantes: ['irm', 'imagerie', 'scanner', 'tdc', 'encéphale', 'encephale', 'cerveau'],
          },
          {
            id: 'pl',
            variantes: [
              'ponction lombaire',
              'pl',
              'lcr',
              'pression',
              'pression d ouverture',
              'hypertension intracrânienne',
              'htic',
            ],
          },
          {
            id: 'oct',
            variantes: ['oct', 'coherence tomographie', 'papillaire'],
          },
          {
            id: 'cv',
            variantes: ['champ visuel', 'perimetrie', 'perimétrie', 'scotome'],
          },
        ],
        reponseAttendue:
          'Fond d’œil (recherche de papilloedème), IRM cérébrale, ponction lombaire avec mesure de la pression du LCR ; OCT papillaire et champ visuel en complément.',
        explication:
          'Devant une HTIC suspectée : confirmer l’œdème papillaire au fond d’œil, éliminer une cause structurale à l’IRM, documenter l’HTIC à la PL (pression d’ouverture élevée). OCT et champ visuel aident au suivi.',
      },
      {
        id: 'urgence',
        type: 'ouiNon',
        question:
          'Faut-il orienter la patiente en urgence vers un service hospitalier (neuro-ophtalmologie / neurologie) ?',
        poids: 3,
        correct: true,
        explication:
          'Diplopie aiguë + double paralysie du VI + signes d’HTIC : orientation hospitalière urgente pour imagerie, fond d’œil spécialisé et prise en charge étiologique (ne pas se limiter à un bilan orthoptique ambulatoire).',
      },
    ],
  },

  compteRenduExpert: [
    'Rihanna, 38 ans. Consultation en urgence pour diplopie horizontale brutale depuis trois jours, sans antécédent de strabisme. Céphalées oppressives matinales, acouphène pulsatile, prise de poids récente.',
    'Acuités visuelles conservées à 10/10 des deux côtés. Réfraction : faible myopie (−0,50 D), sans lien avec le tableau aigu.',
    'Motilité : limitation nette et symétrique de l’abduction des deux yeux, sans atteinte verticale.',
    'Examen sensoriel : diplopie binoculaire horizontale confirmée (verre rouge, Worth).',
    'Reflets et occlusion : esotropie manifeste, environ 22 DP de près et 32 DP de loin, sans préférence nette de fixation.',
    'Conclusion : double paralysie du VI chez une femme jeune avec signes d’alarme d’HTIC. Bilan orthoptique complété ; orientation urgente pour fond d’œil à la recherche d’un papilloedème, IRM cérébrale et ponction lombaire avec mesure de la pression du LCR, en coordination neuro-ophtalmologique.',
  ],
};
