# Orthoptix

Jeu sérieux de bilan orthoptique sur patient virtuel 3D, destiné aux étudiants en
ophtalmologie et en orthoptie. L'étudiant conduit librement un bilan complet — anamnèse,
antécédents, examen sensoriel, motilité, reflets, épreuves d'occlusion — puis conclut par un
diagnostic, et reçoit un score détaillé comparé au bilan d'un expert.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # tests du modèle oculomoteur et du moteur de session
npm run build    # vérification des types puis build de production
```

Prérequis : Node.js 20 ou plus.

Le visage 3D utilise le modèle [Angelica](https://sketchfab.com/3d-models/angelica-27f75fa94c384000bb6a79a3000f8e80)
par [NikZava284](https://sketchfab.com/NikZava284) (CC-BY-4.0), placé dans `public/models/angelica/`.
Les globes oculaires cliniques (reflets, cover, prismes) restent générés par le moteur Orthoptix.

## Déployer sur Vercel

Le projet est une app Vite/React prête pour Vercel (`vercel.json` : build `npm run build`,
sortie `dist`).

### Via le tableau de bord (recommandé)

1. Poussez le dépôt sur GitHub.
2. Sur [vercel.com/new](https://vercel.com/new), importez le dépôt.
3. Laissez les réglages détectés (Framework : Vite, Build : `npm run build`, Output : `dist`).
4. Deploy — l’URL publique est fournie à la fin.

Chaque push sur `main` / `master` redéploie automatiquement.

**Site à jour (GitHub Pages)** : https://wyxgaming.github.io/Orthoptix/  
(déploiement automatique via GitHub Actions à chaque push sur `master`)

**Vercel** : si vous utilisez https://orthoptix.vercel.app, vérifiez dans le
tableau de bord Vercel que le projet est bien lié au dépôt GitHub et à la branche
`master`, puis lancez un redéploiement manuel si besoin.

### Via la CLI

```bash
npm i -g vercel   # une seule fois
npx vercel        # preview
npx vercel --prod # production
```

Connectez le compte Vercel au premier lancement, puis validez le projet.

## Principe

Le cœur du projet est un **patient virtuel paramétrique**. Un modèle oculomoteur calcule à
chaque image l'orientation des deux globes et la position des reflets cornéens, en fonction
des paramètres du cas, de la position de la cible de fixation, des prismes interposés et de
l'œil occlus.

Les signes cliniques ne sont donc pas écrits en dur : ils **émergent du modèle**. Le reflet de
Hirschberg se décentre parce que l'œil a tourné ; le mouvement de restitution du cover test est
une véritable reprise de fixation animée ; Krimsky se neutralise réellement quand la puissance
du prisme égale la déviation. Le cover test aux prismes en découle sans code supplémentaire :
chaque œil fixant à son tour à travers le prisme placé devant lui, le mouvement s'abolit quand
la puissance interposée égale l'angle, s'inverse au-delà, et les puissances s'additionnent si
on les répartit sur les deux yeux. C'est ce qui permet d'ajouter un cas clinique sans écrire
une ligne de code 3D.

## Organisation du code

| Dossier | Rôle |
| --- | --- |
| `src/domain/` | Modèle oculomoteur et conversions prismatiques. Aucune dépendance à React. |
| `src/engine/` | Catalogue générique des examens, types des cas, session, barème. |
| `src/cases/` | Les cas cliniques, en pur fichier de données. |
| `src/scene/` | Rendu 3D : visage, globes oculaires, cache, prismes, point de fixation. |
| `src/ui/` | Interface : anamnèse, étagère d'examens, cahier de bilan, synthèse, debriefing. |

### Conventions du modèle

Comprendre ces trois conventions suffit à lire tout `src/domain/ocular-model.ts` :

- les déviations sont en **dioptries prismatiques**, un horizontal positif valant une ésotropie ;
- l'**azimut** est exprimé dans le repère du patient, positif quand il regarde vers sa droite.
  L'œil droit adduit donc vers les azimuts négatifs, l'œil gauche vers les positifs ;
- la scène est en **centimètres**, le patient regarde vers `+Z`, donc vers l'observateur, et sa
  droite pointe vers `-X`. Ce qui est à droite du patient apparaît à gauche de l'écran, comme
  en consultation.

Le décentrement du reflet est calibré sur le repère enseigné de **15 dioptries prismatiques par
millimètre** plutôt que sur l'optique exacte de la cornée : la mesure que lit l'étudiant à
l'écran correspond ainsi exactement à la règle qu'on lui apprend.

L'examen se fait **à 33 cm**, la mire étant tenue entre le praticien, placé à 50 cm, et l'enfant.
Chaque œil voit donc la mire sous un angle différent et doit converger d'environ 4,8°, soit 17 Δ
pour les deux yeux. Les positions sont mesurées à partir de cette direction, et non d'un axe
parallèle : `azimuthDeg` porte la convergence, tandis que `deviationLampeDp` donne l'écart à la
mire, c'est-à-dire la seule déviation que l'examinateur observe. Un œil qui fixe réellement n'est
donc jamais droit à l'écran, mais son reflet reste centré.

Un examen peut déclarer `distance: 'loin'` : la mire passe alors **à 5 mètres**, la convergence
tombe à 0,3° par œil et le point lumineux n'est plus dessiné, puisqu'il se trouverait derrière
l'observateur. Le cas peut déclarer un `deviationLoin` différent de son angle de près ; sans lui,
l'angle ne varie pas avec la distance. C'est la comparaison des deux mesures qui fait la part de
l'accommodation dans une déviation.

## Ajouter un cas clinique

1. Créer `src/cases/mon-cas.ts` en exportant un objet `CasClinique` (voir
   `src/cases/esotropie-precoce.ts` comme référence commentée).
2. L'inscrire dans `CAS_DISPONIBLES` dans `src/cases/index.ts`.

Le **`titre`** et le **`resume`** ne doivent pas nommer le diagnostic : ils ne disent que ce que
contiendrait un courrier d'adressage. C'est l'étudiant qui conclut, à la synthèse, et sa réponse
s'inscrit en dernière ligne du cahier de bilan.

Un cas déclare cinq choses :

- **`oculaire`** : les paramètres physiques du patient — angle, mode de fixation, hyperactions,
  déviation verticale dissociée, nystagmus, angle kappa, réfraction, acuité. C'est ce bloc qui
  pilote entièrement le rendu 3D.
- **`questions`** : la banque de questions d'anamnèse et d'antécédents, avec la réponse du
  patient et un poids. Un poids positif marque une question essentielle, un poids nul une
  question neutre, un poids négatif une question hors sujet. L'ordre de déclaration n'a pas
  d'importance : la liste est mélangée aléatoirement à chaque nouveau bilan.
- **`examens`** : pour chaque examen du catalogue, le compte rendu obtenu, la fourchette de
  mesure acceptée, la question d'interprétation, et le poids. Un poids négatif accompagné de
  `justificationMalus` sert à pénaliser un examen non contributif **en expliquant pourquoi**.
- **`ordreAttendu`** : la séquence des examens essentiels, qui donne le bonus de conduite du
  bilan. Seul l'ordre relatif compte : intercaler un examen supplémentaire ne pénalise pas.
- **`synthese.questions`** : questionnaire de fin de bilan (QCM, oui/non, réponses ouvertes
  évaluées par mots-clés). C'est le seul endroit où le diagnostic et la conduite chirurgicale
  sont nommés. Une question peut porter un `niveau` (`L3`…).
- **`compteRenduExpert`** : le bilan tel que l'aurait rédigé un orthoptiste expérimenté.

Les examens restent tous accessibles à tout moment : le jeu ne guide pas l'étudiant dans un
couloir, il évalue ses choix.

## Modes

- **Entraînement** : chaque geste est commenté immédiatement, avec sa justification clinique.
- **Évaluation** : aucun retour pendant le bilan, score et debriefing complets à la fin.

## Cas disponibles

- **Strabisme convergent chez une adolescente de 16 ans** *(diagnostic attendu : ésotropie précoce)* —
  Léa, 16 ans. Ésotropie alternante de 40 DP, stable de près comme de loin,
  hypermétropie de +4.00, hyperaction bilatérale des obliques inférieurs, nystagmus manifeste
  latent, Lang négatif, sans amblyopie résiduelle.
