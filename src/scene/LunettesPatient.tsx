import { useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { PositionsOrbites } from './orbites';

/** glTF + scene.bin dans public/models/lunettes/, ou lunettes.glb compresse. */
const MODELE_GLTf = '/models/lunettes/scene.gltf';
const MODELE_GLB = '/models/lunettes/lunettes.glb';
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
          <mesh material={verre}>
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

function LunettesGltf({ url, orbites }: { url: string; orbites: PositionsOrbites }) {
  const { scene } = useGLTF(url);
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

type SourceModele = 'glb' | 'gltf' | 'procedurale';

async function detecterSource(): Promise<SourceModele> {
  try {
    const glb = await fetch(MODELE_GLB, { method: 'HEAD' });
    if (glb.ok) return 'glb';
    const bin = await fetch(BIN_URL, { method: 'HEAD' });
    if (bin.ok) return 'gltf';
  } catch {
    /* repli procedurale */
  }
  return 'procedurale';
}

/**
 * Monture Sketchfab si lunettes.glb ou scene.bin est present, sinon repli procedurale.
 */
export function LunettesPatient({ orbites }: { orbites: PositionsOrbites }) {
  const [source, setSource] = useState<SourceModele | null>(null);

  useEffect(() => {
    let actif = true;
    detecterSource().then((mode) => {
      if (actif) setSource(mode);
    });
    return () => {
      actif = false;
    };
  }, []);

  if (source === null) return null;
  if (source === 'procedurale') return <LunettesProcedurales orbites={orbites} />;

  const url = source === 'glb' ? MODELE_GLB : MODELE_GLTf;
  return (
    <Suspense fallback={<LunettesProcedurales orbites={orbites} />}>
      <LunettesGltf url={url} orbites={orbites} />
    </Suspense>
  );
}
