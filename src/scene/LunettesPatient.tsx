import { useGLTF } from '@react-three/drei';
import { Component, Suspense, useLayoutEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import type { PositionsOrbites } from './orbites';

const MODELE_URL = '/models/lunettes/lunettes.glb';

const DEMI_VERRE_CM = 1.15;
/** Ecart pupillaire supplementaire sur la monture, en cm. */
const ECART_PUPILLAIRE_SUPPLEMENTAIRE_CM = 5;
const DECALAGE_FIN: [number, number, number] = [0, -0.35, 0.45];

/** Orientation du GLB importe : 270 deg vers la droite autour de l'axe vertical. */
const CORRECTION_Y = -Math.PI / 2 - Math.PI;

function cadreOrbites(orbites: PositionsOrbites) {
  const [odX, odY, odZ] = orbites.OD;
  const [ogX, ogY, ogZ] = orbites.OG;
  const ecartPupillaire = ogX - odX;
  return {
    position: [
      (odX + ogX) / 2 + DECALAGE_FIN[0],
      (odY + ogY) / 2 + DECALAGE_FIN[1],
      (odZ + ogZ) / 2 + DECALAGE_FIN[2],
    ] as [number, number, number],
    ecartPupillaire,
  };
}

/** Isole une erreur de chargement pour ne pas faire crasher toute la scene. */
class GardeLunettes extends Component<{ children: ReactNode }, { enErreur: boolean }> {
  state = { enErreur: false };

  static getDerivedStateFromError(): { enErreur: boolean } {
    return { enErreur: true };
  }

  componentDidCatch(erreur: Error) {
    console.error('[LunettesPatient]', erreur.message);
  }

  render() {
    return this.state.enErreur ? null : this.props.children;
  }
}

function LunettesMesh({ orbites }: { orbites: PositionsOrbites }) {
  const { scene } = useGLTF(MODELE_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, CORRECTION_Y, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    const boite = new THREE.Box3().setFromObject(clone);
    const taille = boite.getSize(new THREE.Vector3());
    if (taille.x < 1e-3) return;

    const { position, ecartPupillaire } = cadreOrbites(orbites);
    const largeurCible =
      ecartPupillaire + ECART_PUPILLAIRE_SUPPLEMENTAIRE_CM + DEMI_VERRE_CM * 2;
    const facteur = largeurCible / taille.x;
    clone.scale.setScalar(facteur);
    clone.updateMatrixWorld(true);

    const centre = new THREE.Box3().setFromObject(clone).getCenter(new THREE.Vector3());
    clone.position.set(position[0] - centre.x, position[1] - centre.y, position[2] - centre.z);
  }, [clone, orbites]);

  return <primitive object={clone} />;
}

/** Monture GLB calée sur les orbites ; chargement isolé du reste de la scene. */
export function LunettesPatient({ orbites }: { orbites: PositionsOrbites }) {
  return (
    <GardeLunettes>
      <Suspense fallback={null}>
        <LunettesMesh orbites={orbites} />
      </Suspense>
    </GardeLunettes>
  );
}
