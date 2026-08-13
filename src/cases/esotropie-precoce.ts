import type { CasClinique } from '../engine/types';

/**
 * Cas 1 : esotropie precoce alternante.
 *
 * Tout ce qui suit est de la donnee : les signes cliniques observables en 3D sont
 * derives du bloc `oculaire` par le modele oculomoteur, et le bareme est porte par
 * les poids declares ici. Aucun de ces elements n'est code dans le moteur.
 *
 * Le titre et le resume ne nomment pas le diagnostic : ils ne disent que ce qu'un
 * courrier d'adressage contiendrait. C'est a l'etudiant de conclure, en fin de bilan.
 */
export const esotropiePrecoce: CasClinique = {
  id: 'esotropie-precoce',
  titre: 'Strabisme convergent chez une adolescente de 16 ans',
  resume:
    'Lea, adressee par son ophtalmologiste pour bilan orthoptique. La deviation convergente est connue, son type reste a etablir.',
  patient: {
    prenom: 'Lea',
    age: 16,
    sexe: 'F',
    motif:
      'Bilan orthoptique de controle d un strabisme convergent, en vue d une eventuelle prise en charge chirurgicale.',
  },

  oculaire: {
    deviation: { horizontal: 40, vertical: 0 },
    // Angle strictement identique de loin : c'est ce qui ecarte la part accommodative
    // que laisserait craindre l hypermetropie de +4.00.
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
      libelle: 'Quel est le motif de la consultation aujourd hui ?',
      reponse:
        'Les parents viennent pour un bilan de controle. On leur a parle d une possible operation, ils souhaitent un avis.',
      poids: 3,
      commentaire: 'Poser le cadre de la consultation oriente toute la suite du bilan.',
    },
    {
      id: 'age-apparition',
      rubrique: 'anamnese',
      libelle: 'A quel age le strabisme est-il apparu ?',
      reponse: 'Les parents l ont remarque vers l age de 3 mois, sur des photos de famille.',
      poids: 4,
      commentaire:
        'Une apparition avant 6 mois definit le strabisme precoce et fait redouter d emblee l absence de binocularite.',
    },
    {
      id: 'constance',
      rubrique: 'anamnese',
      libelle: 'La deviation est-elle permanente ou intermittente ?',
      reponse: 'Elle est presente en permanence, les parents n ont jamais vu les yeux droits.',
      poids: 3,
      commentaire:
        'Le caractere constant separe la tropie de la phorie et pese sur le pronostic sensoriel.',
    },
    {
      id: 'alternance-observee',
      rubrique: 'anamnese',
      libelle: 'Est-ce toujours le meme oeil qui devie ?',
      reponse: 'Non, tantot l un tantot l autre, selon les moments de la journee.',
      poids: 3,
      commentaire:
        'L alternance spontanee annonce l absence de preference de fixation et explique une acuite conservee aux deux yeux.',
    },
    {
      id: 'correction',
      rubrique: 'anamnese',
      libelle: 'Porte-t-elle une correction optique, et depuis quand ?',
      reponse:
        'Oui, des lunettes depuis le diagnostic, portees en permanence et bien tolerees.',
      poids: 4,
      commentaire:
        'Le port effectif de la correction conditionne l interpretation de toutes les mesures d angle.',
    },
    {
      id: 'amblyotherapie',
      rubrique: 'anamnese',
      libelle: 'Un traitement de l amblyopie a-t-il ete entrepris ?',
      reponse:
        'Oui, des occlusions par pansement dans la petite enfance, suivies et respectees selon les parents.',
      poids: 4,
      commentaire:
        'Une amblyotherapie bien conduite explique l acuite quasi symetrique retrouvee a l examen.',
    },
    {
      id: 'diplopie',
      rubrique: 'anamnese',
      libelle: 'Se plaint-elle de voir double ?',
      reponse: 'Jamais.',
      poids: 2,
      commentaire:
        'L absence de diplopie dans un angle aussi large temoigne d une neutralisation installee de longue date.',
    },
    {
      id: 'torticolis',
      rubrique: 'anamnese',
      libelle: 'Observez-vous un torticolis ou une position de tete inhabituelle ?',
      reponse: 'Non, la tete est droite.',
      poids: 2,
      commentaire:
        'Un torticolis orienterait vers une paralysie ou vers un blocage du nystagmus dans une position donnee.',
    },
    {
      id: 'chirurgie',
      rubrique: 'antecedents',
      libelle: 'A-t-elle deja ete operee des yeux ?',
      reponse: 'Non, aucune chirurgie oculaire.',
      poids: 3,
      commentaire:
        'Un antecedent chirurgical changerait completement la lecture de la motilite et de l angle.',
    },
    {
      id: 'grossesse',
      rubrique: 'antecedents',
      libelle: 'Comment se sont deroules la grossesse et l accouchement ?',
      reponse: 'Grossesse sans particularite, naissance a terme, pas de prematurite.',
      poids: 3,
      commentaire:
        'La prematurite et la souffrance neonatale sont des facteurs de risque classiques de strabisme precoce.',
    },
    {
      id: 'general',
      rubrique: 'antecedents',
      libelle: 'Y a-t-il une pathologie generale ou un retard de developpement ?',
      reponse: 'Aucun, developpement psychomoteur normal, scolarite ordinaire.',
      poids: 3,
      commentaire:
        'Une atteinte neurologique associee modifierait le pronostic et la conduite therapeutique.',
    },
    {
      id: 'familiaux',
      rubrique: 'antecedents',
      libelle: 'Y a-t-il des antecedents familiaux de strabisme ou d amblyopie ?',
      reponse: 'La mere presente un strabisme convergent depuis sa naissance.',
      poids: 4,
      commentaire:
        'L heredite est nette dans les strabismes precoces et renforce la coherence du tableau.',
    },

    {
      id: 'ecrans',
      rubrique: 'anamnese',
      libelle: 'Combien de temps passe-t-elle devant les ecrans ?',
      reponse: 'Environ une heure par jour.',
      poids: 0,
      commentaire:
        'Question souvent posee, sans consequence sur un strabisme apparu a 3 mois : ni utile ni penalisante.',
    },
    {
      id: 'cephalees',
      rubrique: 'anamnese',
      libelle: 'A-t-elle des maux de tete en fin de journee ?',
      reponse: 'Pas particulierement.',
      poids: 0,
      commentaire:
        'Pertinente devant une asthenopie, elle n apporte rien dans une deviation constante et neutralisee.',
    },
    {
      id: 'lateralite',
      rubrique: 'anamnese',
      libelle: 'Est-elle droitiere ou gauchere ?',
      reponse: 'Droitiere.',
      poids: 0,
    },
    {
      id: 'groupe-sanguin',
      rubrique: 'antecedents',
      libelle: 'Quel est son groupe sanguin ?',
      reponse: 'Les parents ne s en souviennent pas.',
      poids: -2,
      commentaire: 'Aucun rapport avec un bilan orthoptique.',
    },
    {
      id: 'metier-parents',
      rubrique: 'antecedents',
      libelle: 'Quelle est la profession des parents ?',
      reponse: 'Le pere est menuisier, la mere infirmiere.',
      poids: -2,
      commentaire: 'Sans lien avec la deviation oculaire.',
    },
    {
      id: 'otites',
      rubrique: 'antecedents',
      libelle: 'A-t-elle eu des otites a repetition ?',
      reponse: 'Deux ou trois otites banales en creche.',
      poids: -2,
      commentaire: 'Hors du champ du bilan orthoptique.',
    },
  ],

  examens: {
    refraction: {
      poids: 3,
      resultat:
        'Correction portee : +4.00 dioptries spheriques aux deux yeux, hypermetropie moyenne, verres portes en permanence.',
      interpretation: {
        question: 'Comment cette hypermetropie intervient-elle dans le tableau ?',
        options: [
          {
            id: 'a-corriger-mais-insuffisante',
            libelle:
              'Elle doit etre corrigee integralement, mais ne suffit pas a expliquer un angle apparu a 3 mois',
            correct: true,
          },
          {
            id: 'explique-tout',
            libelle: 'Elle explique a elle seule la deviation, qui est donc purement accommodative',
            correct: false,
          },
          {
            id: 'sans-interet',
            libelle: 'Elle n a aucun interet dans un strabisme precoce',
            correct: false,
          },
        ],
        explication:
          'Une esotropie purement accommodative se reduirait franchement sous correction totale. Ici l angle reste large malgre des verres portes en permanence : l hypermetropie est a corriger, mais la deviation ne lui est pas imputable.',
      },
    },
    acuite: {
      poids: 4,
      resultat: 'Avec correction : OD 10/10 P2, OG 9/10 P2.',
      interpretation: {
        question: 'Que concluez-vous de ces acuites ?',
        options: [
          {
            id: 'pas-amblyopie',
            libelle: 'Pas d amblyopie residuelle significative, acuites quasi symetriques',
            correct: true,
          },
          { id: 'amblyopie-og', libelle: 'Amblyopie profonde de l oeil gauche', correct: false },
          { id: 'amblyopie-od', libelle: 'Amblyopie de l oeil droit', correct: false },
        ],
        explication:
          'Une ligne d ecart n est pas une amblyopie. Ce resultat est coherent avec l alternance spontanee et avec une amblyotherapie bien conduite : aucun oeil n a ete durablement neglige.',
      },
    },
    lang: {
      poids: 5,
      resultat:
        'Test de Lang negatif : Lea ne reconnait aucune des figures en relief et ne cherche pas a les saisir.',
      interpretation: {
        question: 'Que traduit ce resultat ?',
        options: [
          {
            id: 'pas-de-stereoscopie',
            libelle: 'Absence de vision stereoscopique, donc absence de binocularite normale',
            correct: true,
          },
          { id: 'stereo-reduite', libelle: 'Une stereoscopie simplement diminuee', correct: false },
          { id: 'defaut-comprehension', libelle: 'Un simple defaut de comprehension de la consigne', correct: false },
        ],
        explication:
          'A 16 ans la consigne est comprise. Un Lang negatif dans un strabisme apparu a 3 mois signe l absence de vision binoculaire, ce qui est la regle dans le strabisme precoce.',
      },
    },
    motilite: {
      poids: 5,
      resultat:
        'Poursuite complete dans toutes les directions, sans limitation. Elevation franche de l oeil en adduction, retrouvee des deux cotes. Nystagmus manifeste latent leger, nettement majore des qu un oeil est occlus.',
      interpretation: {
        question: 'Comment interpretez-vous l elevation observee en adduction ?',
        options: [
          {
            id: 'hyperaction-oi',
            libelle: 'Hyperaction des obliques inferieurs',
            correct: true,
          },
          {
            id: 'paralysie-droits-mediaux',
            libelle: 'Paralysie bilaterale des droits mediaux',
            correct: false,
          },
          { id: 'dvd', libelle: 'Deviation verticale dissociee', correct: false },
        ],
        explication:
          'L elevation apparait quand l oeil adduit et se retrouve symetriquement des deux cotes : c est une hyperaction des obliques inferieurs, association classique du strabisme precoce. Une DVD s exprimerait a l occlusion, independamment de la position du regard, ce qui n est pas le cas ici.',
      },
    },
    hirschberg: {
      poids: 5,
      attendu: { min: 35, max: 45, unite: 'DP' },
      resultat:
        'Reflet corneen centre sur l oeil fixateur et nettement deporte en temporal sur l oeil devie.',
      interpretation: {
        question: 'Quel est le sens de la deviation ?',
        options: [
          { id: 'eso', libelle: 'Esotropie : deviation convergente', correct: true },
          { id: 'exo', libelle: 'Exotropie : deviation divergente', correct: false },
          { id: 'hyper', libelle: 'Deviation verticale isolee', correct: false },
        ],
        explication:
          'Le reflet se deplace a l oppose de la rotation du globe. Un reflet deporte du cote temporal correspond a un oeil tourne en dedans, donc a une esotropie.',
      },
    },
    krimsky: {
      poids: 4,
      attendu: { min: 30, max: 50, unite: 'DP' },
      resultat:
        'Le reflet de l oeil devie se recentre par interposition de prismes base temporale de puissance croissante.',
    },
    krimskyLoin: {
      poids: 3,
      attendu: { min: 30, max: 50, unite: 'DP' },
      resultat:
        'Sur lumiere lointaine, le reflet se recentre avec la meme puissance qu a 33 cm : la mesure aux reflets confirme un angle independant de la distance.',
    },
    coverPres: {
      poids: 8,
      attendu: { min: 35, max: 45, unite: 'DP' },
      resultat:
        'Cover unilateral : mouvement de restitution de dedans en dehors a l occlusion de chaque oeil ; au decache, l oeil qui prend la fixation la conserve, sans preference. Cover alterne : deviation totale liberee, abolie vers 40 DP de prismes base temporale, sans difference entre les deux yeux. Le nystagmus se majore pendant l occlusion.',
      interpretation: {
        question: 'Que conclure de ce cover test de pres ?',
        options: [
          { id: 'eso-alternante', libelle: 'Esotropie alternante, sans preference de fixation', correct: true },
          { id: 'esophorie', libelle: 'Esophorie decompensee', correct: false },
          {
            id: 'eso-unilaterale',
            libelle: 'Esotropie de l oeil gauche avec fixation preferentielle de l oeil droit',
            correct: false,
          },
        ],
        explication:
          'Le mouvement de restitution apparait des le premier cache : il s agit d une tropie et non d une phorie. Et comme chaque oeil garde la fixation apres le decache, il n y a pas de dominance : la fixation est alternante.',
      },
    },
    coverLoin: {
      poids: 5,
      attendu: { min: 35, max: 45, unite: 'DP' },
      resultat:
        'Sur mire lointaine, le mouvement s abolit avec la meme puissance qu a 33 cm : l angle ne varie pas avec la distance.',
      interpretation: {
        question: 'Que conclure de la comparaison des angles de pres et de loin ?',
        options: [
          { id: 'non-accommodative', libelle: 'Esotropie non accommodative', correct: true },
          { id: 'accommodative', libelle: 'Esotropie accommodative', correct: false },
          { id: 'exces-convergence', libelle: 'Exces de convergence', correct: false },
        ],
        explication:
          'Les deux mesures se superposent : l angle ne varie pas avec la distance. Chez une hypermetrope de +4.00, c est le point decisif — ce n est ni une esotropie accommodative ni un exces de convergence. La correction optique ne redressera pas les yeux.',
      },
    },

    tno: {
      poids: -2,
      resultat: 'Aucune plage percue en relief.',
      justificationMalus:
        'L absence de stereoscopie est deja etablie par le test de Lang. Quantifier un seuil inexistant ne change ni le diagnostic ni la conduite a tenir.',
    },
    worth: {
      poids: -2,
      resultat: 'Perception de deux points seulement.',
      justificationMalus:
        'Le Worth ne fait que confirmer une neutralisation deja previsible devant un angle de 40 DP avec Lang negatif.',
    },
    bagolini: {
      poids: -1,
      resultat: 'Perception d une seule striure.',
      justificationMalus:
        'Interessant pour preciser une correspondance retinienne anormale, mais non essentiel ici : avec un angle large et constant, la neutralisation est acquise.',
    },
    verreRouge: {
      poids: -2,
      resultat: 'Un seul point percu.',
      justificationMalus:
        'La recherche de diplopie est sans objet dans un strabisme precoce neutralise depuis l enfance.',
    },
    bielschowsky: {
      poids: -2,
      resultat: 'Pas de majoration de deviation verticale a l inclinaison de la tete.',
      justificationMalus:
        'Cette manoeuvre explore les paralysies cyclo-verticales. La motilite ne montre aucune paralysie mais une hyperaction bilaterale et symetrique : la manoeuvre etait previsiblement negative.',
    },
    biprisme: {
      poids: -2,
      resultat: 'Examen difficile a interpreter, sans element utilisable.',
      justificationMalus:
        'Le biprisme sert a demasquer une microtropie. Un angle de 40 DP l exclut d emblee.',
    },
    deviometrie: {
      // Utile pour la correspondance retinienne, mais non obligatoire au bareme.
      poids: 2,
      optionnel: true,
      resultat: 'AO different de AS.',
      interpretations: [
        {
          id: 'pourquoi-synoptophore',
          question: 'Pourquoi avez-vous demande le synoptophore ?',
          options: [
            {
              id: 'correspondance',
              libelle: 'Pour decouvrir la correspondance retinienne',
              correct: true,
            },
            {
              id: 'mesure-angle',
              libelle: 'Pour mesurer l angle objectif, deja connu au cover test',
              correct: false,
            },
            {
              id: 'stereoscopie',
              libelle: 'Pour quantifier la vision stereoscopique',
              correct: false,
            },
          ],
          explication:
            'L angle est deja mesure aux prismes. L interet du synoptophore ici est sensoriel : etudier la correspondance retinienne.',
        },
        {
          id: 'correspondance-patiente',
          question: 'Quelle est la correspondance retinienne de la patiente ?',
          options: [
            { id: 'normale', libelle: 'Normale', correct: false },
            { id: 'anormale', libelle: 'Anormale', correct: true },
          ],
          explication:
            'AO different de AS traduit une correspondance retinienne anormale, attendue dans une esotropie precoce a grand angle.',
        },
      ],
    },
  },

  ordreAttendu: [
    'refraction',
    'acuite',
    'lang',
    'motilite',
    'hirschberg',
    'krimsky',
    'coverPres',
    // On termine par la serie de loin : tout ce qui se fait de pres d abord, puis on
    // reprend les mesures sur mire lointaine.
    'krimskyLoin',
    'coverLoin',
  ],

  synthese: {
    questions: [
      {
        id: 'type-strabisme',
        type: 'qcm',
        question: 'Quel type de strabisme est presente ici ?',
        poids: 4,
        options: [
          {
            id: 'esotropie-precoce',
            libelle: 'Esotropie precoce (strabisme precoce)',
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
          'Apparition avant 6 mois, angle large et stable de pres comme de loin, absence de stereoscopie, alternance : c est une esotropie precoce, non une forme accommodative ni tardive.',
      },
      {
        id: 'signes-pathognomoniques',
        type: 'ouverte',
        question:
          'Avez-vous retrouve des signes pathognomoniques de ce type de strabisme ? Lesquels ?',
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
        reponseAttendue: "NML, upshoot (hyperaction des obliques inferieurs), E't",
        explication:
          'Les signes qui orientent vers le strabisme precoce sont le nystagmus manifeste latent, l upshoot par hyperaction des obliques inferieurs, et l esotropie (E\'t) a grand angle.',
      },
      {
        id: 'indication-chirurgicale',
        type: 'ouiNon',
        question: 'Est-ce un bon patient a operer ?',
        poids: 2,
        correct: true,
        explication:
          'Oui : angle stable, fixation alternante, pas d amblyopie residuelle significative, correction optique deja portee sans reduction de l angle. L indication chirurgicale est pertinente.',
      },
      {
        id: 'technique-operatoire',
        type: 'ouverte',
        niveau: 'L3',
        question: 'Quelle technique operatoire et sur quel(s) muscle(s) va-t-on operer ?',
        poids: 4,
        seuil: 3,
        criteres: [
          {
            id: 'geste',
            // Recul = geste attendu ; « resection » est aussi accepte (formulation frequente).
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
          'Recul des droits mediaux OD et OG d environ 5 mm (loi : 1 mm ≈ 4 DP, soit ~40 DP pour 5 mm bilateraux).',
        explication:
          'Sur une esotropie precoce d environ 40 DP, le geste de reference est un recul bilateral des droits mediaux d environ 5 mm, selon la regle 1 mm ≈ 4 dioptries prismatiques.',
      },
    ],
  },

  compteRenduExpert: [
    'Lea, 16 ans. Strabisme convergent apparu vers 3 mois, correction optique portee depuis, amblyotherapie par occlusion bien suivie dans la petite enfance. Mere porteuse d un strabisme convergent de naissance.',
    'Correction portee : +4.00 spherique aux deux yeux. Acuite avec correction OD 10/10 P2, OG 9/10 P2 : pas d amblyopie residuelle significative.',
    'Examen sensoriel : test de Lang negatif, absence de vision stereoscopique.',
    'Motilite : poursuite complete, elevation en adduction bilaterale et marquee par hyperaction des obliques inferieurs, nystagmus manifeste latent leger majore a l occlusion.',
    'Reflets : Hirschberg autour de 40 DP, reflet temporalise sur l oeil devie. Krimsky concordant, entre 30 et 50 DP, et retrouve identique sur lumiere lointaine.',
    'Occlusion : cover test en VP positif, esotropie alternante sans preference de fixation, angle total de 35 a 45 DP. Cover test en VL : meme angle, donc sans composante accommodative.',
    'Conclusion : esotropie precoce alternante d environ 40 DP, avec hyperaction des obliques inferieurs et nystagmus manifeste latent, sans amblyopie. Dossier a orienter vers une discussion chirurgicale, apres verification de la stabilite de l angle sur deux mesures espacees.',
  ],
};
