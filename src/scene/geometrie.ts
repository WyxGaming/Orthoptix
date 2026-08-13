import * as THREE from 'three';
import { DEMI_ECART_PUPILLAIRE_CM, DISTANCE_PRES_CM, type Eye } from '../domain/ocular-model';

/** Toute la scene est en centimetres. */
export const CM_PAR_MM = 0.1;

export const RAYON_GLOBE = 1.2;

/**
 * Ecart pupillaire et distance de mire sont reprises du modele, et non redefinies :
 * c'est ce qui garantit que les globes visent bien le point lumineux affiche, et donc
 * que la convergence calculee corresponde a ce que l'on voit. La mire de loin, elle,
 * n'est jamais dessinee : elle serait derriere l'observateur.
 */
export const DEMI_ECART_PUPILLAIRE = DEMI_ECART_PUPILLAIRE_CM;
export const DISTANCE_CIBLE = DISTANCE_PRES_CM;

/** Decalage vertical de la mire de fixation, en centimetres. */
export const DECALAGE_CIBLE_Y = 1;

/**
 * Distance de l'oeil du praticien, donc de la camera. Elle doit rester superieure a
 * celle de la mire : le praticien tient sa lumiere devant lui, entre lui et l'enfant.
 * Mire et camera etant toutes deux sur l'axe, la lumiere reste coaxiale a l'observateur,
 * condition sans laquelle le reflet de Hirschberg ne serait pas lisible.
 */
export const DISTANCE_OBSERVATEUR = 50;

/**
 * Champ vertical de la camera, en degres. La vue d'ensemble cadre le visage entier,
 * ou se lisent le modele et la position de la tete ; le gros plan sert aux reflets.
 */
/** Vue d'ensemble un peu plus large pour cadrer la tete glTF (cheveux compris). */
export const CHAMP_ENSEMBLE_DEG = 24;
export const CHAMP_RAPPROCHE_DEG = 9;

/** Decalage vertical du cadrage en gros plan reflets, en centimetres. */
export const DECALAGE_ZOOM_Y = 5;

/**
 * Le patient regarde vers +Z, donc vers l'observateur. Sa droite pointe vers -X :
 * un azimut positif, ou le patient regarde a sa droite, apparait a gauche de l'ecran.
 */
export const DIRECTION_DROITE_PATIENT = new THREE.Vector3(-1, 0, 0);

export const positionOeil = (oeil: Eye): [number, number, number] => [
  oeil === 'OD' ? -DEMI_ECART_PUPILLAIRE : DEMI_ECART_PUPILLAIRE,
  0,
  0,
];

export function directionRegard(azimuthDeg: number, elevationDeg: number): THREE.Vector3 {
  const az = THREE.MathUtils.degToRad(azimuthDeg);
  const el = THREE.MathUtils.degToRad(elevationDeg);
  return new THREE.Vector3(
    -Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
}

export const DEMI_LARGEUR_FENTE = 1.02;
export const DEMI_HAUTEUR_FENTE = 0.58;

/**
 * Hauteur des bords libres des paupieres, au milieu de la fente. Ces deux valeurs sont
 * la hauteur atteinte par les courbes de l'amande a mi-parcours : c'est la que les
 * calottes palpebrales doivent s'arreter pour coincider avec l'ouverture dessinee.
 */
export const MARGE_PAUPIERE_SUP = DEMI_HAUTEUR_FENTE * 1.156;
export const MARGE_PAUPIERE_INF = DEMI_HAUTEUR_FENTE * -0.881;

/** Les paupieres glissent juste au-dessus de la cornee, sans la toucher. */
export const RAYON_PAUPIERE = RAYON_GLOBE + 0.07;

/**
 * Trace une amande palpebrale dans un chemin existant.
 * La demi-largeur reste inferieure au rayon du globe pour que celui-ci remplisse
 * toujours l'ouverture, meme quand l'oeil est en forte adduction.
 */
function dessinerAmande(
  chemin: THREE.Path,
  centreX: number,
  demiLargeur: number,
  demiHauteur: number,
): void {
  chemin.moveTo(centreX - demiLargeur, 0);
  chemin.bezierCurveTo(
    centreX - demiLargeur * 0.5,
    demiHauteur * 1.55,
    centreX + demiLargeur * 0.4,
    demiHauteur * 1.5,
    centreX + demiLargeur,
    demiHauteur * 0.1,
  );
  chemin.bezierCurveTo(
    centreX + demiLargeur * 0.5,
    -demiHauteur * 1.15,
    centreX - demiLargeur * 0.5,
    -demiHauteur * 1.2,
    centreX - demiLargeur,
    0,
  );
}

/** Fente palpebrale, creusee dans le masque du visage. */
export function fentePalpebrale(
  centreX: number,
  demiLargeur = DEMI_LARGEUR_FENTE,
  demiHauteur = DEMI_HAUTEUR_FENTE,
): THREE.Path {
  const p = new THREE.Path();
  dessinerAmande(p, centreX, demiLargeur, demiHauteur);
  return p;
}

/** Bord libre des paupieres : un lisere sombre qui detache l'oeil de la peau. */
export function bordPalpebral(centreX: number): THREE.Shape {
  const contour = new THREE.Shape();
  dessinerAmande(contour, centreX, DEMI_LARGEUR_FENTE * 1.14, DEMI_HAUTEUR_FENTE * 1.3);
  contour.holes.push(fentePalpebrale(centreX));
  return contour;
}

/**
 * Contour du visage, perce des deux fentes palpebrales.
 *
 * Ce n'est plus un rectangle arrondi mais un ovale facial : front, tempes, pommettes,
 * puis machoire qui se resserre vers un menton arrondi. Les dimensions sont celles d'un
 * visage d adolescente, soit environ 13 cm de large pour 18 cm du menton a la lisiere du
 * cuir chevelu, l'origine etant sur la ligne pupillaire.
 */
export function masqueVisage(): THREE.Shape {
  const contour = new THREE.Shape();
  contour.moveTo(0, -9.2);
  // Menton, puis branche montante de la machoire.
  contour.bezierCurveTo(2.5, -9.1, 4.5, -7.5, 5.5, -5.1);
  // Machoire vers la pommette, point le plus large du visage.
  contour.bezierCurveTo(6.3, -3.2, 6.6, -1.5, 6.6, 0.5);
  // Pommette vers la tempe.
  contour.bezierCurveTo(6.6, 2.7, 6.4, 4.7, 5.9, 6.1);
  // Tempe vers le haut du front.
  contour.bezierCurveTo(5.3, 7.7, 3.3, 8.8, 0, 8.8);
  contour.bezierCurveTo(-3.3, 8.8, -5.3, 7.7, -5.9, 6.1);
  contour.bezierCurveTo(-6.4, 4.7, -6.6, 2.7, -6.6, 0.5);
  contour.bezierCurveTo(-6.6, -1.5, -6.3, -3.2, -5.5, -5.1);
  contour.bezierCurveTo(-4.5, -7.5, -2.5, -9.1, 0, -9.2);
  contour.holes.push(
    fentePalpebrale(-DEMI_ECART_PUPILLAIRE),
    fentePalpebrale(DEMI_ECART_PUPILLAIRE),
  );
  return contour;
}
