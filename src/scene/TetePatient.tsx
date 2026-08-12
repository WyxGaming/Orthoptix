import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RAYON_GLOBE } from './geometrie';
import { ORBITES_DEFAUT, type PositionsOrbites } from './orbites';

/**
 * GLB convertie en metallic-roughness : Three.js ne charge plus
 * KHR_materials_pbrSpecularGlossiness (format d'origine Sketchfab).
 */
const MODELE_URL = '/models/angelica/lea.glb';

/** Hauteur cible du visage en centimetres (menton → vertex). */
const HAUTEUR_VISAGE_CM = 22;

/** Decalage fin apres centrage : ajuste menton / cheveux, pas les orbites. */
const DECALAGE_FIN: [number, number, number] = [0, 1.2, 1.8];

const estOeilModele = (nom: string) => /eye/i.test(nom) && !/eyelash/i.test(nom);

function centroide(groupe: THREE.Vector3[]): THREE.Vector3 {
  const c = new THREE.Vector3();
  for (const p of groupe) c.add(p);
  return c.multiplyScalar(1 / groupe.length);
}

function rayonEnveloppe(groupe: THREE.Vector3[], centre: THREE.Vector3): number {
  let max = 0;
  for (const p of groupe) max = Math.max(max, p.distanceTo(centre));
  // Moitie de l'enveloppe, puis +25 % puis +15 % : lisibles dans l'orbite.
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

  // Dans notre scene, -X = OD (droite patient), +X = OG.
  // Recul sur Z pour enfoncer les globes dans l'orbite du mesh.
  const reculZ = 0.55;
  const hausseY = 0.3; // 3 mm
  const ecartX = 0.1; // 1 mm par oeil → +2 mm d'ecart pupillaire
  return {
    OD: [centreOD.x - ecartX, centreOD.y + hausseY, centreOD.z - reculZ],
    OG: [centreOG.x + ecartX, centreOG.y + hausseY, centreOG.z - reculZ],
    rayon: Math.max(0.35, rayon),
  };
}

/**
 * Tete glTF « Angelica » (Sketchfab, CC-BY-4.0). Les yeux du modele sont masques pour
 * laisser place au moteur oculomoteur ; leurs centres sont renvoyes via onOrbites.
 */
export function TetePatient({
  onOrbites,
}: {
  onOrbites?: (orbites: PositionsOrbites) => void;
}) {
  const { scene } = useGLTF(MODELE_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    clone.position.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    const boite = new THREE.Box3().setFromObject(clone);
    const taille = boite.getSize(new THREE.Vector3());
    const centre = boite.getCenter(new THREE.Vector3());
    if (taille.y < 1e-3) {
      console.error('[TetePatient] boite englobante vide — modele non place');
      onOrbites?.(ORBITES_DEFAUT);
      return;
    }

    const facteur = HAUTEUR_VISAGE_CM / taille.y;
    clone.scale.setScalar(facteur);
    clone.position.set(
      -centre.x * facteur + DECALAGE_FIN[0],
      -centre.y * facteur + DECALAGE_FIN[1],
      -centre.z * facteur + DECALAGE_FIN[2],
    );
    clone.updateMatrixWorld(true);

    const orbites = extraireOrbites(clone) ?? ORBITES_DEFAUT;
    onOrbites?.(orbites);

    clone.traverse((obj) => {
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
  }, [clone, onOrbites]);

  return <primitive object={clone} />;
}

useGLTF.preload(MODELE_URL);
