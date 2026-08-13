import { useMemo } from 'react';
import * as THREE from 'three';
import type { PositionsOrbites } from './orbites';

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
    demiEcart: ecartPupillaire / 2,
    demiVerre: ecartPupillaire / 2 + DEMI_VERRE_CM,
  };
}

/** Monture procedurale calée sur les orbites : legere, sans asset externe. */
export function LunettesPatient({ orbites }: { orbites: PositionsOrbites }) {
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
