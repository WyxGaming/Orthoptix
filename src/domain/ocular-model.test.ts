import { describe, expect, it } from 'vitest';
import { degreesToPrism, prismToDegrees, reflexOffsetMm } from './prism';
import {
  directionMire,
  DISTANCE_LOIN_CM,
  etatExamenInitial,
  etatOculaire,
  EYES,
  fixationApresDecache,
  signeAdduction,
  type EtatOeil,
  type Eye,
  type Gaze,
  type ParametresOculaires,
  type Prisme,
} from './ocular-model';

const lea: ParametresOculaires = {
  deviation: { horizontal: 40, vertical: 0 },
  fixation: { mode: 'alternante' },
  upshoot: { OD: 20, OG: 20 },
  dvd: 0,
  nystagmus: { type: 'manifeste-latent', amplitudeDeg: 0.6, frequenceHz: 3 },
  kappa: { OD: 0, OG: 0 },
  correction: { OD: { sphere: 4 }, OG: { sphere: 4 } },
  acuite: { OD: '10/10 P2', OG: '9/10 P2' },
};

/** Le nystagmus est fige a l'instant zero pour rendre les mesures deterministes. */
const enPositionPrimaire = (fixateur: 'OD' | 'OG' = 'OD') => etatExamenInitial(fixateur);

const PRIMAIRE: Gaze = { azimuthDeg: 0, elevationDeg: 0 };

/**
 * Ecart entre l'axe d'un oeil et la direction de la mire, en degres. C'est cet ecart
 * que l'examinateur observe : la convergence de fixation, elle, n'est pas une deviation
 * et doit donc rester invisible dans ces mesures.
 */
const ecartMire = (etat: Record<Eye, EtatOeil>, oeil: Eye, gaze: Gaze = PRIMAIRE): number =>
  etat[oeil].azimuthDeg - directionMire(oeil, gaze).azimuthDeg;

describe('conversions prismatiques', () => {
  it('convertit 40 DP en environ 21,8 degres', () => {
    expect(prismToDegrees(40)).toBeCloseTo(21.8, 1);
  });

  it('est reciproque', () => {
    expect(degreesToPrism(prismToDegrees(37))).toBeCloseTo(37, 6);
  });

  it('applique le repere de Hirschberg de 15 DP par millimetre', () => {
    expect(reflexOffsetMm(45)).toBeCloseTo(3, 6);
  });
});

describe('esotropie en position primaire', () => {
  const etat = etatOculaire(lea, enPositionPrimaire('OD'));

  it('laisse le reflet centre sur l oeil fixateur', () => {
    expect(etat.OD.reflet.xMm).toBeCloseTo(0, 6);
  });

  it('deporte le reflet de l oeil devie du cote temporal', () => {
    // OG devie : le reflet part vers la gauche du patient, soit son cote temporal.
    expect(etat.OG.reflet.xMm).toBeLessThan(0);
    expect(Math.abs(etat.OG.reflet.xMm)).toBeCloseTo(40 / 15, 2);
  });

  it('place l oeil devie en adduction', () => {
    expect(ecartMire(etat, 'OG')).toBeCloseTo(prismToDegrees(40), 3);
  });
});

describe('convergence a la distance d examen', () => {
  it('converge chaque oeil d environ 4,8 degres sur une mire a 33 cm', () => {
    for (const oeil of EYES) {
      expect(signeAdduction(oeil) * directionMire(oeil, PRIMAIRE).azimuthDeg).toBeCloseTo(4.85, 2);
    }
  });

  it('represente environ 17 dioptries prismatiques de convergence totale', () => {
    const total = EYES.reduce(
      (somme, oeil) =>
        somme + degreesToPrism(signeAdduction(oeil) * directionMire(oeil, PRIMAIRE).azimuthDeg),
      0,
    );
    expect(total).toBeCloseTo(17, 0);
  });

  it('fait tourner davantage l oeil le plus eloigne de la mire', () => {
    // Regard a droite : la mire est du cote de l oeil droit, l oeil gauche doit donc
    // tourner de plus de 25 degres pour l atteindre.
    const gaze: Gaze = { azimuthDeg: 25, elevationDeg: 0 };
    expect(directionMire('OG', gaze).azimuthDeg).toBeGreaterThan(25);
    expect(directionMire('OD', gaze).azimuthDeg).toBeLessThan(25);
  });

  it('ne cree aucune deviation apparente sur l oeil fixateur', () => {
    // La lampe etant sur la mire, la convergence ne decentre pas son reflet.
    const etat = etatOculaire(lea, enPositionPrimaire('OD'));
    expect(ecartMire(etat, 'OD')).toBeCloseTo(0, 6);
    expect(etat.OD.deviationLampeDp.horizontal).toBeCloseTo(0, 6);
  });
});

describe('upshoot bilateral en adduction', () => {
  it('eleve l oeil gauche dans le regard a droite', () => {
    const etat = etatOculaire(lea, { ...enPositionPrimaire(), gaze: { azimuthDeg: 25, elevationDeg: 0 } });
    expect(etat.OG.elevationDeg).toBeGreaterThan(etat.OD.elevationDeg);
  });

  it('eleve l oeil droit dans le regard a gauche', () => {
    const etat = etatOculaire(lea, { ...enPositionPrimaire(), gaze: { azimuthDeg: -25, elevationDeg: 0 } });
    expect(etat.OD.elevationDeg).toBeGreaterThan(etat.OG.elevationDeg);
  });

  it('donne une elevation franchement lisible en adduction complete', () => {
    const etat = etatOculaire(lea, {
      ...enPositionPrimaire(),
      gaze: { azimuthDeg: 25, elevationDeg: 0 },
    });
    // Sur un globe de 12 mm de rayon, 10 degres font monter la pupille de plus de 2 mm.
    // En dessous, l hyperaction passe inapercue a l ecran et l etudiant ne peut pas la voir.
    expect(etat.OG.elevationDeg).toBeGreaterThan(10);
  });

  it('garde la pupille de l oeil en adduction dans la fente palpebrale', () => {
    // Par fixation croisee, l oeil qui adduit est celui qui fixe : il reste donc sur la
    // cible au lieu d etre porte en adduction extreme, ou son iris serait masque.
    const gaze: Gaze = { azimuthDeg: 25, elevationDeg: 0 };
    const etat = etatOculaire(lea, { ...enPositionPrimaire(), gaze });
    expect(ecartMire(etat, 'OG', gaze)).toBeCloseTo(0, 3);
    expect(Math.abs(etat.OD.azimuthDeg)).toBeLessThan(6);
  });

  it('n eleve aucun oeil en position primaire', () => {
    const etat = etatOculaire(lea, enPositionPrimaire());
    expect(etat.OD.elevationDeg).toBeCloseTo(0, 6);
    expect(etat.OG.elevationDeg).toBeCloseTo(0, 6);
  });
});

describe('Krimsky', () => {
  it('centre le reflet de l oeil devie quand le prisme egale la deviation', () => {
    const etat = etatOculaire(lea, {
      ...enPositionPrimaire('OD'),
      prismes: { OD: { puissance: 40, base: 'temporale' } },
    });
    expect(etat.OG.reflet.xMm).toBeCloseTo(0, 6);
  });

  it('neutralise aussi avec le prisme devant l oeil devie', () => {
    const etat = etatOculaire(lea, {
      ...enPositionPrimaire('OD'),
      prismes: { OG: { puissance: 40, base: 'temporale' } },
    });
    expect(etat.OG.reflet.xMm).toBeCloseTo(0, 6);
  });

  it('sur-corrige si le prisme est trop puissant', () => {
    const etat = etatOculaire(lea, {
      ...enPositionPrimaire('OD'),
      prismes: { OG: { puissance: 60, base: 'temporale' } },
    });
    expect(etat.OG.reflet.xMm).toBeGreaterThan(0);
  });
});

describe('cover test aux prismes', () => {
  const prismeDevantOG = (puissance: number): Partial<Record<Eye, Prisme>> => ({
    OG: { puissance, base: 'temporale' },
  });

  /** Les deux temps de l'alternance du cache, d'abord l'OD couvert puis l'OG. */
  const alternance = (prismes: Partial<Record<Eye, Prisme>>) =>
    [
      etatOculaire(lea, { ...enPositionPrimaire('OD'), occlusion: 'OD', prismes }),
      etatOculaire(lea, { ...enPositionPrimaire('OG'), occlusion: 'OG', prismes }),
    ] as const;

  /** Mouvement de restitution de l'OD entre les deux temps du cache, en degres. */
  const mouvementOD = (prismes: Partial<Record<Eye, Prisme>>) => {
    const [cacheOD, cacheOG] = alternance(prismes);
    return cacheOG.OD.azimuthDeg - cacheOD.OD.azimuthDeg;
  };

  it('abolit tout mouvement quand le prisme egale la deviation', () => {
    const [cacheOD, cacheOG] = alternance(prismeDevantOG(40));
    expect(cacheOD.OD.azimuthDeg).toBeCloseTo(cacheOG.OD.azimuthDeg, 3);
    expect(cacheOD.OG.azimuthDeg).toBeCloseTo(cacheOG.OG.azimuthDeg, 3);
  });

  it('laisse un mouvement residuel si le prisme est insuffisant', () => {
    expect(Math.abs(mouvementOD(prismeDevantOG(20)))).toBeGreaterThan(5);
  });

  it('neutralise aussi avec la puissance repartie sur les deux yeux', () => {
    // Chaque oeil fixe a son tour a travers son propre prisme : les deux puissances
    // s'additionnent donc, a la non-linearite des dioptries prismatiques pres.
    const reparti = {
      OD: { puissance: 20, base: 'temporale' },
      OG: { puissance: 20, base: 'temporale' },
    } satisfies Partial<Record<Eye, Prisme>>;
    expect(Math.abs(mouvementOD(reparti))).toBeLessThan(1);
  });

  it('inverse le sens du mouvement en cas de sur-correction', () => {
    // C'est ce changement de sens qui signe le depassement de la neutralisation.
    expect(Math.sign(mouvementOD(prismeDevantOG(60)))).toBe(
      -Math.sign(mouvementOD(prismeDevantOG(20))),
    );
  });
});

describe('vision de loin', () => {
  const deLoin = (fixateur: Eye = 'OD') => etatExamenInitial(fixateur, DISTANCE_LOIN_CM);

  it('ne demande presque plus de convergence a 5 metres', () => {
    const convergence =
      signeAdduction('OD') * directionMire('OD', PRIMAIRE, DISTANCE_LOIN_CM).azimuthDeg;
    expect(convergence).toBeCloseTo(0.32, 2);
  });

  it('mesure le meme angle qu a 33 cm quand la deviation ne depend pas de la distance', () => {
    expect(etatOculaire(lea, deLoin()).OG.deviationLampeDp.horizontal).toBeCloseTo(40, 6);
  });

  it('neutralise le Krimsky avec la meme puissance qu a 33 cm', () => {
    const etat = etatOculaire(lea, {
      ...deLoin('OD'),
      prismes: { OD: { puissance: 40, base: 'temporale' } },
    });
    expect(etat.OG.reflet.xMm).toBeCloseTo(0, 6);
  });

  it('retient l angle de loin declare par le cas', () => {
    // Une esotropie en partie accommodative fond des que l effort de pres cesse.
    const accommodative: ParametresOculaires = {
      ...lea,
      deviationLoin: { horizontal: 12, vertical: 0 },
    };
    expect(etatOculaire(accommodative, deLoin()).OG.deviationLampeDp.horizontal).toBeCloseTo(12, 6);
    expect(
      etatOculaire(accommodative, enPositionPrimaire()).OG.deviationLampeDp.horizontal,
    ).toBeCloseTo(40, 6);
  });
});

describe('occlusion', () => {
  it('fait prendre la fixation par l oeil decouvert', () => {
    const etat = etatOculaire(lea, { ...enPositionPrimaire('OD'), occlusion: 'OD' });
    expect(ecartMire(etat, 'OG')).toBeCloseTo(0, 6);
    expect(Math.abs(ecartMire(etat, 'OD'))).toBeCloseTo(prismToDegrees(40), 3);
  });

  it('conserve la fixation au decache en cas d alternance', () => {
    expect(fixationApresDecache(lea, 'OG')).toBe('OG');
  });

  it('rend la fixation a l oeil dominant quand il y a une preference', () => {
    const avecPreference: ParametresOculaires = { ...lea, fixation: { mode: 'preferee', oeil: 'OD' } };
    expect(fixationApresDecache(avecPreference, 'OG')).toBe('OD');
  });

  it('majore le nystagmus des qu un oeil est occlus', () => {
    // Un quart de periode apres l origine, l oscillation est a son amplitude maximale.
    const instant = 1 / (4 * lea.nystagmus!.frequenceHz);
    // On lit l oscillation sur l oeil fixateur, qui est sinon parfaitement aligne.
    const binoculaire = etatOculaire(lea, { ...enPositionPrimaire('OD'), tempsS: instant });
    const monoculaire = etatOculaire(lea, {
      ...enPositionPrimaire('OD'),
      occlusion: 'OG',
      tempsS: instant,
    });
    expect(Math.abs(ecartMire(binoculaire, 'OD'))).toBeCloseTo(0.6, 5);
    expect(Math.abs(ecartMire(monoculaire, 'OD'))).toBeCloseTo(0.6 * 4, 5);
  });
});
