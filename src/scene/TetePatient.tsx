import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RAYON_GLOBE } from './geometrie';
import type { ConfigModeleTete } from './modeles-tete';
import { ORBITES_DEFAUT, type PositionsOrbites } from './orbites';

const estOeilModele = (nom: string) => /eye/i.test(nom) && !/eyelash/i.test(nom);

/** Hair cards / barbe : nom de mesh (Jessica) ou nom de matériau (April « hair »). */
const estMateriauCheveux = (nomMesh: string, mat: THREE.Material): boolean =>
  /hair/i.test(nomMesh) ||
  /hair/i.test(mat.name ?? '') ||
  /^t_cards$/i.test(mat.name ?? '');

function centroide(groupe: THREE.Vector3[]): THREE.Vector3 {
  const c = new THREE.Vector3();
  for (const p of groupe) c.add(p);
  return c.multiplyScalar(1 / groupe.length);
}

function rayonEnveloppe(groupe: THREE.Vector3[], centre: THREE.Vector3): number {
  let max = 0;
  for (const p of groupe) max = Math.max(max, p.distanceTo(centre));
  return max * 0.275 * 1.25 * 1.15;
}

/**
 * A partir des meshes « Eye » du modele, retrouve les deux centres orbitaires
 * et un rayon de globe adapte a la taille des orbites.
 */
function extraireOrbites(racine: THREE.Object3D, centroidesDirects = false): PositionsOrbites | null {
  const points: THREE.Vector3[] = [];
  let aDesYeux = false;

  racine.updateMatrixWorld(true);
  racine.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !estOeilModele(obj.name)) return;
    aDesYeux = true;
    const geometrie = obj.geometry as THREE.BufferGeometry;
    const pos = geometrie.getAttribute('position');
    if (!pos) return;
    const local = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      local.fromBufferAttribute(pos, i);
      points.push(obj.localToWorld(local.clone()));
    }
  });

  if (!aDesYeux || points.length < 8) return null;

  const xs = points.map((p) => p.x).sort((a, b) => a - b);
  const mediane = xs[Math.floor(xs.length / 2)]!;
  const coteNegatif = points.filter((p) => p.x < mediane);
  const cotePositif = points.filter((p) => p.x >= mediane);
  if (coteNegatif.length < 4 || cotePositif.length < 4) return null;

  const centreOD = centroide(coteNegatif);
  const centreOG = centroide(cotePositif);
  const maxRayonOD = Math.max(...coteNegatif.map((p) => p.distanceTo(centreOD)));
  const maxRayonOG = Math.max(...cotePositif.map((p) => p.distanceTo(centreOG)));
  const rayon = Math.min(
    centroidesDirects
      ? Math.min(maxRayonOD, maxRayonOG)
      : Math.min(
          rayonEnveloppe(coteNegatif, centreOD),
          rayonEnveloppe(cotePositif, centreOG),
        ),
    RAYON_GLOBE,
  );

  const reculZ = 0.55;
  const hausseY = 0.3;
  const ecartX = 0.1;
  if (centroidesDirects) {
    return {
      OD: [centreOD.x, centreOD.y, centreOD.z],
      OG: [centreOG.x, centreOG.y, centreOG.z],
      rayon: Math.max(0.35, rayon),
    };
  }
  return {
    OD: [centreOD.x - ecartX, centreOD.y + hausseY, centreOD.z - reculZ],
    OG: [centreOG.x + ecartX, centreOG.y + hausseY, centreOG.z - reculZ],
    rayon: Math.max(0.35, rayon),
  };
}

const estSphereOculaire = (nom: string) => /^Sphere/i.test(nom);
const estMeshVisage = (nom: string) => /cube|head|face|visage/i.test(nom);

function trouverMeshVisage(racine: THREE.Object3D): THREE.Mesh | null {
  const meshes: THREE.Mesh[] = [];
  racine.traverse((obj) => {
    if (obj instanceof THREE.Mesh && estMeshVisage(obj.name)) meshes.push(obj);
  });
  return meshes[0] ?? null;
}

/**
 * Modeles sans meshes Eye (ex. April) : orbites deduites de la boite du visage.
 */
function extraireOrbitesVisage(racine: THREE.Object3D): PositionsOrbites | null {
  const visage = trouverMeshVisage(racine);
  if (!visage) return null;

  racine.updateMatrixWorld(true);
  const boite = new THREE.Box3().setFromObject(visage);
  const taille = boite.getSize(new THREE.Vector3());
  const hauteur = taille.y;
  if (hauteur < 1e-3) return null;

  const centre = boite.getCenter(new THREE.Vector3());
  const yOeil = centre.y - hauteur * 0.012;
  const zOeil = boite.max.z - taille.z * 0.14;
  const bande = hauteur * 0.06;

  const xs: number[] = [];
  const geo = visage.geometry as THREE.BufferGeometry;
  const pos = geo.getAttribute('position');
  if (!pos) return null;

  const local = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    local.fromBufferAttribute(pos, i);
    const w = visage.localToWorld(local.clone());
    if (Math.abs(w.y - yOeil) <= bande) xs.push(w.x);
  }

  let demiEcart = taille.x * 0.14;
  if (xs.length >= 20) {
    xs.sort((a, b) => a - b);
    demiEcart = Math.min((xs[Math.floor(xs.length * 0.92)]! - xs[Math.floor(xs.length * 0.08)]!) / 4, 2.85);
  }

  const rayon = Math.max(0.35, Math.min(hauteur * 0.055, RAYON_GLOBE));
  return {
    OD: [centre.x - demiEcart, yOeil, zOeil],
    OG: [centre.x + demiEcart, yOeil, zOeil],
    rayon,
  };
}

/** @deprecated Conservé pour modeles avec sphere de reference proche du visage. */
function extraireOrbitesSphere(racine: THREE.Object3D): PositionsOrbites | null {
  const spheres: { centre: THREE.Vector3; rayon: number }[] = [];

  racine.updateMatrixWorld(true);
  racine.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !estSphereOculaire(obj.name)) return;
    const boite = new THREE.Box3().setFromObject(obj);
    const centre = boite.getCenter(new THREE.Vector3());
    const taille = boite.getSize(new THREE.Vector3());
    spheres.push({ centre, rayon: Math.max(taille.x, taille.y, taille.z) / 2 });
  });

  if (spheres.length === 0) return null;

  if (spheres.length >= 2) {
    const triees = [...spheres].sort((a, b) => a.centre.x - b.centre.x);
    const od = triees[0]!;
    const og = triees[triees.length - 1]!;
    const rayon = Math.min(od.rayon, og.rayon, RAYON_GLOBE) * 0.95;
    return {
      OD: [od.centre.x, od.centre.y, od.centre.z],
      OG: [og.centre.x, og.centre.y, og.centre.z],
      rayon: Math.max(0.35, rayon),
    };
  }

  const ref = spheres[0]!;
  const visage = trouverMeshVisage(racine);
  if (!visage) return null;

  const yOeil = ref.centre.y;
  const bande = ref.rayon * 0.85;
  const xs: number[] = [];
  const zs: number[] = [];
  const geo = visage.geometry as THREE.BufferGeometry;
  const pos = geo.getAttribute('position');
  if (!pos) return null;
  const local = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    local.fromBufferAttribute(pos, i);
    const w = visage.localToWorld(local.clone());
    if (Math.abs(w.y - yOeil) <= bande) {
      xs.push(w.x);
      zs.push(w.z);
    }
  }
  if (xs.length < 20) return null;

  xs.sort((a, b) => a - b);
  const x05 = xs[Math.floor(xs.length * 0.08)]!;
  const x95 = xs[Math.floor(xs.length * 0.92)]!;
  const demiEcart = (x95 - x05) / 4;
  const midX = (x05 + x95) / 2;
  const zMoy = zs.reduce((s, z) => s + z, 0) / zs.length;

  return {
    OD: [midX - demiEcart, yOeil, zMoy - 0.12],
    OG: [midX + demiEcart, yOeil, zMoy - 0.12],
    rayon: Math.max(0.35, Math.min(ref.rayon * 0.95, RAYON_GLOBE)),
  };
}

function appliquerDecalageOrbites(
  orbites: PositionsOrbites,
  [dx, dy, dz]: [number, number, number],
): PositionsOrbites {
  return {
    OD: [orbites.OD[0] + dx, orbites.OD[1] + dy, orbites.OD[2] + dz],
    OG: [orbites.OG[0] + dx, orbites.OG[1] + dy, orbites.OG[2] + dz],
    rayon: orbites.rayon,
  };
}

/** Rapporte les deux yeux vers le centre (OD en +X, OG en -X). */
function reduireEcartPupillaire(orbites: PositionsOrbites, cm: number): PositionsOrbites {
  const demi = cm / 2;
  return {
    OD: [orbites.OD[0] + demi, orbites.OD[1], orbites.OD[2]],
    OG: [orbites.OG[0] - demi, orbites.OG[1], orbites.OG[2]],
    rayon: orbites.rayon,
  };
}

function TeteMesh({
  config,
  onOrbites,
}: {
  config: ConfigModeleTete;
  onOrbites?: (orbites: PositionsOrbites) => void;
}) {
  const { scene } = useGLTF(config.url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const hauteur = config.hauteurVisageCm ?? 22;
  const decalage = config.decalageFin ?? [0, 0, 0];

  useLayoutEffect(() => {
    clone.position.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    // Masquer lampes / yeux du mesh avant la boite englobante (April a des lampes hors champ).
    clone.traverse((obj) => {
      if (config.masquer?.test(obj.name)) obj.visible = false;
    });

    const boite = new THREE.Box3().setFromObject(clone);
    const taille = boite.getSize(new THREE.Vector3());
    const centre = boite.getCenter(new THREE.Vector3());
    if (taille.y < 1e-3) {
      console.error('[TetePatient] boite englobante vide — modele non place');
      onOrbites?.(config.orbites ?? ORBITES_DEFAUT);
      return;
    }

    const facteur = hauteur / taille.y;
    clone.scale.setScalar(facteur);
    clone.position.set(
      -centre.x * facteur + decalage[0],
      -centre.y * facteur + decalage[1],
      -centre.z * facteur + decalage[2],
    );
    clone.updateMatrixWorld(true);

    const orbitesBrutes =
      config.orbites ??
      extraireOrbites(clone, config.orbitesCentroidesDirects) ??
      extraireOrbitesVisage(clone) ??
      extraireOrbitesSphere(clone) ??
      ORBITES_DEFAUT;
    let orbites = config.decalageOrbites
      ? appliquerDecalageOrbites(orbitesBrutes, config.decalageOrbites)
      : orbitesBrutes;
    if (config.reductionEcartPupillaireCm) {
      orbites = reduireEcartPupillaire(orbites, config.reductionEcartPupillaireCm);
    }
    onOrbites?.(orbites);

    clone.traverse((obj) => {
      if (config.masquer?.test(obj.name)) {
        obj.visible = false;
        return;
      }

      if (!(obj instanceof THREE.Mesh)) return;

      if (estOeilModele(obj.name)) {
        obj.visible = false;
        return;
      }

      const ajuster = (source: THREE.Material): THREE.Material => {
        const mat = source.clone();
        if (!('roughness' in mat)) return mat;
        const standard = mat as THREE.MeshStandardMaterial;

        if (estMateriauCheveux(obj.name, source)) {
          standard.side = THREE.DoubleSide;
          if (source.transparent) {
            standard.transparent = true;
            standard.depthWrite = false;
          } else {
            standard.transparent = false;
            standard.alphaTest = 0.5;
            standard.depthWrite = true;
          }
          if (standard.map) standard.map.colorSpace = THREE.SRGBColorSpace;
          standard.needsUpdate = true;
          return mat;
        }

        // Face avant seulement : l'intérieur bouche (UV noires) ne doit pas transparaître.
        standard.side = THREE.FrontSide;
        standard.transparent = false;
        standard.opacity = 1;
        standard.depthWrite = true;
        standard.roughness = Math.max(standard.roughness ?? 0.5, 0.82);
        standard.metalness = Math.min(standard.metalness ?? 0, 0.05);
        if ('envMapIntensity' in standard) standard.envMapIntensity = 0.25;
        if (standard.map) standard.map.colorSpace = THREE.SRGBColorSpace;
        standard.needsUpdate = true;
        return mat;
      };

      obj.material = Array.isArray(obj.material)
        ? obj.material.map(ajuster)
        : ajuster(obj.material);
    });
  }, [clone, config, decalage, hauteur, onOrbites]);

  return <primitive object={clone} />;
}

/**
 * Tete glTF calée sur la scene. Les yeux du mesh sont masques pour le moteur oculomoteur ;
 * leurs centres sont extraits automatiquement ou pris dans la config du cas.
 */
export function TetePatient({
  config,
  onOrbites,
}: {
  config: ConfigModeleTete;
  onOrbites?: (orbites: PositionsOrbites) => void;
}) {
  return <TeteMesh config={config} onOrbites={onOrbites} />;
}

export function preloadModelesTete(urls: string[]): void {
  for (const url of urls) useGLTF.preload(url);
}
