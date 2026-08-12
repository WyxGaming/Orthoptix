import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * GLB convertie en metallic-roughness : Three.js ne charge plus
 * KHR_materials_pbrSpecularGlossiness (format d'origine Sketchfab).
 */
const MODELE_URL = '/models/angelica/lea.glb';

/** Hauteur cible du visage en centimetres (menton → vertex). */
const HAUTEUR_VISAGE_CM = 22;

/** Decalage fin apres centrage : ligne pupillaire vers y = 0. */
const DECALAGE_FIN: [number, number, number] = [0, 1.2, 1.8];

/** Yeux d'origine masques : nos globes cliniques les remplacent. */
const estOeilModele = (nom: string) =>
  /eye/i.test(nom) && !/eyelash/i.test(nom);

/**
 * Tete glTF « Angelica » (Sketchfab, CC-BY-4.0). Les yeux du modele sont masques pour
 * laisser place au moteur oculomoteur (reflets, cover, prismes).
 */
export function TetePatient() {
  const { scene } = useGLTF(MODELE_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
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

    clone.position.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    const boite = new THREE.Box3().setFromObject(clone);
    const taille = boite.getSize(new THREE.Vector3());
    const centre = boite.getCenter(new THREE.Vector3());
    if (taille.y < 1e-3) {
      console.error('[TetePatient] boite englobante vide — modele non place');
      return;
    }

    const facteur = HAUTEUR_VISAGE_CM / taille.y;
    clone.scale.setScalar(facteur);
    clone.position.set(
      -centre.x * facteur + DECALAGE_FIN[0],
      -centre.y * facteur + DECALAGE_FIN[1],
      -centre.z * facteur + DECALAGE_FIN[2],
    );
  }, [clone]);

  return <primitive object={clone} />;
}

useGLTF.preload(MODELE_URL);
