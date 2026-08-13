import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { PositionsOrbites } from './orbites';

const MODELE_URL = '/models/lunettes/scene.gltf';

/** Demi-largeur de verre au-dela de l'ecart pupillaire, en cm. */
const DEMI_VERRE_CM = 1.15;

/** Decalage fin apres alignement sur les orbites (pont nasal, avance sur Z). */
const DECALAGE_FIN: [number, number, number] = [0, -0.35, 0.45];

/**
 * Monture glTF « Lunettes a montures marronne » (Sketchfab, CC-BY-4.0).
 * Calée sur les centres orbitaires du patient.
 */
export function LunettesPatient({
  orbites,
  visible = true,
}: {
  orbites: PositionsOrbites;
  visible?: boolean;
}) {
  const { scene } = useGLTF(MODELE_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    const boite = new THREE.Box3().setFromObject(clone);
    const taille = boite.getSize(new THREE.Vector3());
    if (taille.x < 1e-3) {
      console.error('[LunettesPatient] boite englobante vide — scene.bin manquant ?');
      return;
    }

    const [odX, odY, odZ] = orbites.OD;
    const [ogX, ogY, ogZ] = orbites.OG;
    const milieuX = (odX + ogX) / 2;
    const milieuY = (odY + ogY) / 2;
    const milieuZ = (odZ + ogZ) / 2;
    const ecartPupillaire = ogX - odX;

    const largeurCible = ecartPupillaire + DEMI_VERRE_CM * 2;
    const facteur = largeurCible / taille.x;
    clone.scale.setScalar(facteur);
    clone.updateMatrixWorld(true);

    const centreEchelle = new THREE.Box3().setFromObject(clone).getCenter(new THREE.Vector3());
    clone.position.set(
      milieuX - centreEchelle.x + DECALAGE_FIN[0],
      milieuY - centreEchelle.y + DECALAGE_FIN[1],
      milieuZ - centreEchelle.z + DECALAGE_FIN[2],
    );
  }, [clone, orbites]);

  if (!visible) return null;

  return <primitive object={clone} />;
}

useGLTF.preload(MODELE_URL);
