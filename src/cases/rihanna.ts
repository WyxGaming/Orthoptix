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

  debutSansCorrection: true,

  oculaire: {
    // E't ~20 DP en VP, Et ~40 DP en VL (double paralysie du VI, plus marquée de loin).
    deviation: { horizontal: 20, vertical: 0 },
    deviationLoin: { horizontal: 40, vertical: 0 },
    fixation: { mode: 'alternante', alternanceTemporelleS: 5 },
    limitationAbduction: true,
    upshoot: { OD: 0, OG: 0 },
    dvd: 0,
    kappa: { OD: 0, OG: 0 },
    correction: { OD: { sphere: 0 }, OG: { sphere: 0 } },
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
        'Un début brutal évoque un tableau acquis récent à investiguer en urgence, à distinguer d’un strabisme de longue date.',
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
      poids: 2,
      commentaire:
        'Céphalées concomitantes à une diplopie aiguë : signe associé à recouper avec le reste de l’anamnèse, sans présumer l’étiologie.',
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
      id: 'correction',
      rubrique: 'anamnese',
      libelle: 'Portez-vous des lunettes ou des lentilles ?',
      reponse: 'Non, je ne porte pas de correction optique.',
      poids: 2,
      commentaire:
        'Absence de correction portée : le bilan se conduit en SC ; une éventuelle amétropie ne doit pas masquer le tableau moteur aigu.',
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
    {
      id: 'dentiste',
      rubrique: 'anamnese',
      libelle: 'Quand avez-vous vu votre dentiste pour la dernière fois ?',
      reponse: 'Il y a environ six mois, pour un détartrage.',
      poids: -2,
      commentaire: 'Hors sujet : ne retarde pas le bilan oculomoteur urgent.',
    },
    {
      id: 'animal-compagnie',
      rubrique: 'anamnese',
      libelle: 'Avez-vous un animal de compagnie à la maison ?',
      reponse: 'Oui, un chat.',
      poids: -2,
      commentaire: 'Sans rapport avec une diplopie aiguë.',
    },
    {
      id: 'regime-alimentaire',
      rubrique: 'anamnese',
      libelle: 'Suivez-vous un régime alimentaire particulier ?',
      reponse: 'Non, je mange de tout.',
      poids: -1,
      commentaire: 'Peu pertinent dans ce contexte d’urgence oculomotrice.',
    },
    {
      id: 'couleur-yeux',
      rubrique: 'anamnese',
      libelle: 'Quelle est la couleur de vos yeux ?',
      reponse: 'Marron foncé.',
      poids: -2,
      commentaire: 'Constat clinique direct, pas une question d’anamnèse utile ici.',
    },
    {
      id: 'dernier-voyage',
      rubrique: 'antecedents',
      libelle: 'Avez-vous voyagé à l’étranger récemment ?',
      reponse: 'Non, pas depuis l’année dernière.',
      poids: -1,
      commentaire: 'Sans lien avec le début brutal des symptômes oculaires.',
    },
    {
      id: 'heure-coucher',
      rubrique: 'anamnese',
      libelle: 'À quelle heure vous couchez-vous habituellement ?',
      reponse: 'Vers 23 h.',
      poids: 0,
      commentaire: 'Question générale sans impact sur la conduite du bilan orthoptique.',
    },
  ],

  ordreAnamneseAttendu: [
    'motif',
    'depuis-quand',
    'diplopie',
    'distance',
    'strabisme-antérieur',
  ],

  examens: {
    motilite: {
      poids: 5,
      resultat:
        "Versions oculaires : abolition de l'abduction des deux yeux — aucun mouvement latéral temporal en regard droit ou gauche. Adduction, élévations et dépressions conservées. Pas d'hyperaction compensatrice des obliques. Pas de signe de paralysie verticale.",
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
    lancaster: {
      poids: 4,
      resultat: "À vous de l'analyser.",
      imageResultat: '/examens/rihanna-lancaster.png',
      legendeImage: "À vous de l'analyser.",
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
      attendu: { min: 17, max: 23, unite: 'DP' },
      resultat:
        "Reflet cornéen déporté en temporal sur l'œil non fixateur : esotropie de près d'environ 20 DP (E't).",
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
      attendu: { min: 17, max: 23, unite: 'DP' },
      resultat:
        'Recentrage du reflet par prismes base temporale : esotropie de près d’environ 20 DP (E\'t).',
    },
    krimskyLoin: {
      poids: 4,
      attendu: { min: 35, max: 45, unite: 'DP' },
      resultat:
        'En vision de loin, l’angle augmente nettement : esotropie d’environ 40 DP (Et), bien plus marquée qu’à 33 cm.',
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
      attendu: { min: 17, max: 23, unite: 'DP' },
      resultat:
        "Cover test de près positif : mouvement de restitution de dedans en dehors à l'occlusion de chaque œil, esotropie d'environ 20 DP (E't). Alternance spontanée de la fixation toutes les ~5 secondes en position primaire. Diplopie ressentie au décache.",
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
      attendu: { min: 35, max: 45, unite: 'DP' },
      resultat:
        'Cover test de loin : esotropie manifeste d’environ 40 DP (Et), nettement plus large qu’à 33 cm, concordante avec la gêne déclarée de loin.',
    },
    acuite: {
      poids: 3,
      resultat: 'Sans correction optique : OD 10/10, OG 10/10.',
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
      resultat: 'Emmétropie aux deux yeux : plan sphérique OD et OG.',
      interpretation: {
        question: 'Cette réfraction explique-t-elle la diplopie aiguë ?',
        options: [
          {
            id: 'non',
            libelle: 'Non : une emmétropie n’explique pas une diplopie horizontale brutale',
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
          'Une patiente emmétrope sans correction portée ne peut pas présenter une diplopie soudaine par amétropie ; il faut chercher une cause neuro-ophtalmologique.',
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
    'lancaster',
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
        type: 'examensComplementaires',
        niveau: 'L2',
        question:
          'Quels examens complémentaires prescrivez-vous pour obtenir un diagnostic et orienter la prise en charge ?',
        poids: 5,
        seuil: 2,
        examens: [
          {
            id: 'fo',
            libelle: 'Fond d’œil',
            variantes: [
              'fond d oeil',
              "fond d'oeil",
              'fond doeil',
              'fo',
              'papille',
              'papilloedeme',
              'papilledeme',
              'oedeme papillaire',
              'œdème papillaire',
            ],
            resultat:
              'Œdème papillaire bilatéral de stade III (Frisén) : élévation papillaire, halo péri-papillaire, oblitération de la cupule, absence de pouls veineux spontané à la papille.',
          },
          {
            id: 'irm',
            libelle: 'IRM cérébrale',
            variantes: [
              'irm',
              'imagerie',
              'irm cerebrale',
              'encéphale',
              'encephale',
              'cerveau',
              'irm encéphale',
            ],
            resultat:
              'Pas de tumeur ni de processus expansif intracrânien. Ventricules de taille normale. Séquences venographiques : sténose bilatérale des sinus latéraux transverses, sans signe de thrombose veineuse cérébrale.',
          },
          {
            id: 'pl',
            libelle: 'Ponction lombaire',
            variantes: [
              'ponction lombaire',
              'pl',
              'lcr',
              'liquide cephalorachidien',
              'pression d ouverture',
              'pression lombaire',
            ],
            resultat:
              'Pression d’ouverture à 32 cmH₂O (normale < 25). LCR clair, protéinorachie et cytologie normales.',
          },
          {
            id: 'bilan-sanguin',
            libelle: 'Bilan sanguin',
            variantes: [
              'bilan sanguin',
              'bilan biologique',
              'biologie',
              'nfs',
              'hemogramme',
              'hémogramme',
              'tsh',
              'thyroide',
              'thyroïde',
              'ionogramme',
              'creatinine',
              'créatinine',
              'vs',
              'vsg',
              'sedimentation',
              'vitamine a',
              'vitamine d',
              'bhcg',
              'beta hcg',
              'β-hcg',
            ],
            resultat:
              'NFS, ionogramme, créatininémie, TSH et VSG normaux. Pas d’anémie, d’insuffisance rénale ni de dysthyroïdie évidente. β-HCG négatif.',
            essentiel: false,
          },
          {
            id: 'pev',
            libelle: 'Potentiels évoqués visuels',
            variantes: [
              'pev',
              'potentiels evoques',
              'potentiels évoqués',
              'potentiel evoque visuel',
              'pev visuel',
            ],
            resultat:
              'Latences P100 allongées bilatéralement avec amplitudes conservées, concordant avec une atteinte de la voie visuelle aiguë liée à l’œdème papillaire.',
            essentiel: false,
          },
          {
            id: 'oct',
            libelle: 'OCT papillaire',
            variantes: ['oct', 'oct papillaire', 'coherence tomographie', 'tomographie coherence'],
            resultat:
              'Épaississement de la couche des fibres nerveuses papillaires bilatéral, concordant avec un œdème papillaire en cours.',
            essentiel: false,
          },
          {
            id: 'cv',
            libelle: 'Champ visuel',
            variantes: ['champ visuel', 'perimetrie', 'perimétrie', 'scotome', 'cv'],
            resultat:
              'Augmentation du scotome blind spot bilatéral, sans defect neurologique périphérique.',
            essentiel: false,
          },
        ],
        reponseAttendue:
          'Fond d’œil (papilloedème), IRM cérébrale (éliminer une cause structurale), ponction lombaire avec mesure de la pression du LCR ; bilan sanguin pour éliminer une cause secondaire.',
        explication:
          'Devant une suspicion d’HTIC : confirmer l’œdème papillaire au fond d’œil, éliminer une cause structurale à l’IRM, documenter l’hyperpression du LCR à la PL. Un bilan sanguin (NFS, ionogramme, fonction rénale, TSH…) recherche les causes secondaires ; champ visuel, OCT ou PEV complètent le bilan fonctionnel.',
      },
      {
        id: 'etiologie-symptomes',
        type: 'ouverte',
        question:
          'Quelle est l’étiologie de cette paralysie et quels sont ses symptômes principaux ?',
        poids: 5,
        seuil: 3,
        criteres: [
          {
            id: 'htic',
            variantes: [
              'htic',
              'hypertension intracrânienne',
              'hypertension intracranienne',
              'pseudotumor',
              'pseudotumeur',
              'iiH',
              'idiopathic intracranial',
            ],
          },
          {
            id: 'cephalees',
            variantes: ['cephalee', 'céphalée', 'mal de tete', 'maux de tete'],
          },
          {
            id: 'diplopie',
            variantes: ['diplopie', 'vision double', 'double'],
          },
          {
            id: 'papilloedeme',
            variantes: [
              'papilloedeme',
              'papilledeme',
              'oedeme papillaire',
              'œdème papillaire',
              'papille',
            ],
          },
          {
            id: 'acouphene',
            variantes: ['acouphene', 'acouphène', 'bourdonnement', 'pulsatile'],
          },
          {
            id: 'vi',
            variantes: [
              'vi',
              'nerf vi',
              '6',
              'six',
              'abducens',
              'abduction',
              'paralysie',
              'paresie',
            ],
          },
        ],
        reponseAttendue:
          'HTIC idiopathique (pseudotumor cérébri) : céphalées, diplopie horizontale par double paralysie du VI, papilloedème, acouphène pulsatile, obscurations visuelles ; prise de poids récente.',
        explication:
          'La double paralysie du VI est ici la manifestation oculomotrice d’une HTIC non encore diagnostiquée. Les symptômes d’HTIC associent céphalées, signes visuels (papilloedème, obscurations) et parfois acouphène pulsatile.',
      },
    ],
  },

  compteRenduExpert: [
    'Rihanna, 38 ans. Consultation en urgence pour diplopie horizontale brutale depuis trois jours, sans antécédent de strabisme. Céphalées oppressives matinales, acouphène pulsatile, prise de poids récente.',
    'Acuités visuelles conservées à 10/10 des deux côtés sans correction optique. Réfraction : emmétropie.',
    'Motilité : limitation nette et symétrique de l’abduction des deux yeux, sans atteinte verticale.',
    'Examen sensoriel : diplopie binoculaire horizontale confirmée (verre rouge, Worth).',
    'Reflets et occlusion : E\'t ~20 DP en vision de près, Et ~40 DP en vision de loin ; alternance spontanée de la fixation toutes les ~5 secondes.',
    'Conclusion : double paralysie du VI chez une femme jeune avec signes d’alarme d’HTIC. Bilan orthoptique complété ; orientation urgente pour fond d’œil à la recherche d’un papilloedème, IRM cérébrale et ponction lombaire avec mesure de la pression du LCR, en coordination neuro-ophtalmologique.',
  ],
};
