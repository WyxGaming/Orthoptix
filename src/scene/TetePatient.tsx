import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RAYON_GLOBE } from './geometrie';
import type { ConfigModeleTete } from './modeles-tete';
import { ORBITES_DEFAUT, type PositionsOrbites } from './orbites';

const estOeilModele = (nom: string) => /eye/i.test(nom) && !/eyelash/i.test(nom);

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
function extraireOrbites(racine: THREE.Object3D): PositionsOrbites | null {
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
  const rayon = Math.min(
    rayonEnveloppe(coteNegatif, centreOD),
    rayonEnveloppe(cotePositif, centreOG),
    RAYON_GLOBE,
  );

  const reculZ = 0.55;
  const hausseY = 0.3;
  const ecartX = 0.1;
  return {
    OD: [centreOD.x - ecartX, centreOD.y + hausseY, centreOD.z - reculZ],
    OG: [centreOG.x + ecartX, centreOG.y + hausseY, centreOG.z - reculZ],
    rayon: Math.max(0.35, rayon),
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

    const orbites = config.orbites ?? extraireOrbites(clone) ?? ORBITES_DEFAUT;
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

      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of materials) {
        if (!mat || !('roughness' in mat)) continue;
        const standard = mat as THREE.MeshStandardMaterial;
        standard.roughness = Math.max(standard.roughness ?? 0.5, 0.82);
        standard.metalness = Math.min(standard.metalness ?? 0, 0.05);
        if ('envMapIntensity' in standard) standard.envMapIntensity = 0.25;
        standard.needsUpdate = true;
      }
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
