import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { enVisionDeLoin, EYES, type Eye as OeilId } from '../domain/ocular-model';
import { useSession } from '../engine/session';
import { Eye } from './Eye';
import {
  CHAMP_ENSEMBLE_DEG,
  CHAMP_RAPPROCHE_DEG,
  DECALAGE_ZOOM_Y,
  DISTANCE_CIBLE,
  DISTANCE_OBSERVATEUR,
  directionRegard,
  RAYON_GLOBE,
} from './geometrie';
import { ORBITES_DEFAUT, type PositionsOrbites } from './orbites';
import { TetePatient } from './TetePatient';

/** Cote temporal de l'oeil, exprime en X : la droite du patient est en -X. */
const signeTemporal = (oeil: OeilId) => (oeil === 'OD' ? -1 : 1);

/** Cache d'occlusion : glisse devant l'oeil vise et se retire hors champ. */
function Cache({ orbites }: { orbites: PositionsOrbites }) {
  const cache = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const { etat } = useSession.getState();
    if (!cache.current) return;
    const occlusion = etat.occlusion;
    const cible =
      occlusion === 'aucune'
        ? new THREE.Vector3(0, 16, 3.6)
        : new THREE.Vector3(orbites[occlusion][0], orbites[occlusion][1], orbites[occlusion][2] + 2.2);
    cache.current.position.lerp(cible, 1 - Math.exp(-dt / 0.07));
  });

  return (
    <group ref={cache} position={[0, 16, 3.6]}>
      <mesh>
        <boxGeometry args={[4.4, 5.2, 0.28]} />
        <meshStandardMaterial color="#2f3a45" roughness={0.6} />
      </mesh>
      <mesh position={[0, -3.6, 0]}>
        <boxGeometry args={[0.7, 2.4, 0.28]} />
        <meshStandardMaterial color="#2f3a45" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Prismes({ orbites }: { orbites: PositionsOrbites }) {
  const prismes = useSession((s) => s.etat.prismes);
  return (
    <>
      {EYES.map((oeil) => {
        const prisme = prismes[oeil];
        if (!prisme) return null;
        const [x, y, z] = orbites[oeil];
        const versLaBase =
          prisme.base === 'temporale'
            ? signeTemporal(oeil)
            : prisme.base === 'nasale'
              ? -signeTemporal(oeil)
              : 0;
        const versLeHaut = prisme.base === 'superieure' ? 1 : prisme.base === 'inferieure' ? -1 : 0;
        return (
          <group key={oeil} position={[x, y, z + 1.4]}>
            <mesh>
              <boxGeometry args={[2.6, 2.6, 0.3]} />
              <meshPhysicalMaterial
                transparent
                opacity={0.16}
                color="#bfe6fa"
                roughness={0.05}
                clearcoat={1}
              />
            </mesh>
            <mesh position={[versLaBase * 1.25, versLeHaut * 1.25, 0]}>
              <boxGeometry args={[versLaBase ? 0.22 : 2.6, versLeHaut ? 0.22 : 2.6, 0.34]} />
              <meshStandardMaterial color="#ef8a3c" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/**
 * Point de fixation lumineux tenu par le praticien : c'est lui qui cree le reflet.
 *
 * En vision de loin, la mire est a cinq metres, donc derriere l'observateur et hors du
 * champ : on ne montre plus le point lumineux, mais l'eclairage de la piece reste, et les
 * yeux continuent de viser la direction reelle de la mire.
 */
function Cible() {
  const groupe = useRef<THREE.Group>(null);
  const deLoin = useSession((s) => enVisionDeLoin(s.etat));

  useFrame((_, dt) => {
    const { etat } = useSession.getState();
    if (!groupe.current) return;
    const cible = directionRegard(etat.gaze.azimuthDeg, etat.gaze.elevationDeg).multiplyScalar(
      DISTANCE_CIBLE,
    );
    groupe.current.position.lerp(cible, 1 - Math.exp(-dt / 0.09));
  });

  return (
    <group ref={groupe} position={[0, 0, DISTANCE_CIBLE]}>
      <mesh visible={!deLoin}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#fff8e1" />
      </mesh>
      <pointLight intensity={85} distance={0} decay={1.4} color="#fff6df" />
    </group>
  );
}

function Camera({ rapprochee }: { rapprochee: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const regardY = useRef(0);
  useFrame((_, dt) => {
    const champVise = rapprochee ? CHAMP_RAPPROCHE_DEG : CHAMP_ENSEMBLE_DEG;
    const regardVise = rapprochee ? DECALAGE_ZOOM_Y : 0;
    const lissage = 1 - Math.exp(-dt / 0.25);
    camera.position.z += (DISTANCE_OBSERVATEUR - camera.position.z) * lissage;
    camera.fov += (champVise - camera.fov) * lissage;
    regardY.current += (regardVise - regardY.current) * lissage;
    camera.updateProjectionMatrix();
    camera.lookAt(0, regardY.current, 0);
  });
  return null;
}

export function PatientScene({ zoomReflets }: { zoomReflets: boolean }) {
  const [orbites, setOrbites] = useState<PositionsOrbites>(ORBITES_DEFAUT);
  const retenirOrbites = useCallback((positions: PositionsOrbites) => {
    setOrbites(positions);
  }, []);

  return (
    <>
      <Camera rapprochee={zoomReflets} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-6, 8, 12]} intensity={1.15} />
      <directionalLight position={[8, -4, 10]} intensity={0.4} />
      <Suspense fallback={null}>
        <TetePatient onOrbites={retenirOrbites} />
      </Suspense>
      {EYES.map((oeil) => (
        <group key={oeil} position={orbites[oeil]} scale={orbites.rayon / RAYON_GLOBE}>
          <Eye oeil={oeil} position={[0, 0, 0]} paupieres={false} />
        </group>
      ))}
      <Prismes orbites={orbites} />
      <Cache orbites={orbites} />
      <Cible />
    </>
  );
}
