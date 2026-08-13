import { useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { PositionsOrbites } from './orbites';

const MODELE_URL = '/models/lunettes/scene.gltf';
const BIN_URL = '/models/lunettes/scene.bin';

/** Demi-largeur de verre au-dela de l'ecart pupillaire, en cm. */
const DEMI_VERRE_CM = 1.15;

/** Decalage fin apres alignement sur les orbites (pont nasal, avance sur Z). */
const DECALAGE_FIN: [number, number, number] = [0, -0.35, 0.45];

const COULEUR_MONTURE = '#4a2812';
const COULEUR_VERRE = '#dfe8ef';

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
    demiEcart: ecartPupillaire / 2,
    demiVerre: ecartPupillaire / 2 + DEMI_VERRE_CM,
  };
}

/** Repli tant que scene.bin n'est pas dans le depot (~29 Mo, trop lourd pour le chat). */
function LunettesProcedurales({ orbites }: { orbites: PositionsOrbites }) {
  const { position, demiEcart, demiVerre } = cadreOrbites(orbites);
  const rayonVerre = demiVerre * 0.72;
  const epaisseurMonture = 0.07;

  const monture = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COULEUR_MONTURE, roughness: 0.45, metalness: 0.05 }),
    [],
  );
  const verre = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: COULEUR_VERRE,
        transparent: true,
        opacity: 0.14,
        roughness: 0.04,
        clearcoat: 1,
      }),
    [],
  );

  return (
    <group position={position}>
      {([-1, 1] as const).map((cote) => (
        <group key={cote} position={[cote * demiEcart, 0, 0]}>
          <mesh material={monture} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[rayonVerre, epaisseurMonture, 12, 40]} />
          </mesh>
          <mesh material={verre} rotation={[0, 0, 0]}>
            <circleGeometry args={[rayonVerre - epaisseurMonture * 0.4, 32]} />
          </mesh>
        </group>
      ))}
      <mesh material={monture} position={[0, 0.05, 0]}>
        <boxGeometry args={[demiEcart * 0.55, epaisseurMonture * 1.4, epaisseurMonture * 1.6]} />
      </mesh>
      {([-1, 1] as const).map((cote) => (
        <mesh
          key={`temple-${cote}`}
          material={monture}
          position={[cote * (demiEcart + rayonVerre * 0.35), 0.02, -0.55]}
          rotation={[0, cote * 0.18, 0]}
        >
          <boxGeometry args={[0.1, 0.06, 1.05]} />
        </mesh>
      ))}
    </group>
  );
}

function LunettesGltf({ orbites }: { orbites: PositionsOrbites }) {
  const { scene } = useGLTF(MODELE_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    const boite = new THREE.Box3().setFromObject(clone);
    const taille = boite.getSize(new THREE.Vector3());
    if (taille.x < 1e-3) return;

    const { position, ecartPupillaire } = cadreOrbites(orbites);
    const largeurCible = ecartPupillaire + DEMI_VERRE_CM * 2;
    const facteur = largeurCible / taille.x;
    clone.scale.setScalar(facteur);
    clone.updateMatrixWorld(true);

    const centreEchelle = new THREE.Box3().setFromObject(clone).getCenter(new THREE.Vector3());
    clone.position.set(
      position[0] - centreEchelle.x,
      position[1] - centreEchelle.y,
      position[2] - centreEchelle.z,
    );
  }, [clone, orbites]);

  return <primitive object={clone} />;
}

/**
 * Monture sur le patient : modele Sketchfab si scene.bin est present, sinon repli procedurale.
 */
export function LunettesPatient({ orbites }: { orbites: PositionsOrbites }) {
  const [modeleDisponible, setModeleDisponible] = useState<boolean | null>(null);

  useEffect(() => {
    let actif = true;
    fetch(BIN_URL, { method: 'HEAD' })
      .then((reponse) => {
        if (actif) setModeleDisponible(reponse.ok);
      })
      .catch(() => {
        if (actif) setModeleDisponible(false);
      });
    return () => {
      actif = false;
    };
  }, []);

  if (modeleDisponible === null) return null;
  if (!modeleDisponible) return <LunettesProcedurales orbites={orbites} />;

  return (
    <Suspense fallback={<LunettesProcedurales orbites={orbites} />}>
      <LunettesGltf orbites={orbites} />
    </Suspense>
  );
}
