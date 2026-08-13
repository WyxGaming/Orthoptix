import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { enVisionDeLoin, EYES, type Eye as OeilId } from '../domain/ocular-model';
import { useSession } from '../engine/session';
import { Eye } from './Eye';
import {
  CHAMP_ENSEMBLE_DEG,
  CHAMP_RAPPROCHE_DEG,
  DECALAGE_ZOOM_Y,
  DECALAGE_CIBLE_Y,
  DISTANCE_CIBLE,
  DISTANCE_OBSERVATEUR,
  directionRegard,
  RAYON_GLOBE,
} from './geometrie';
import { ORBITES_DEFAUT, type PositionsOrbites } from './orbites';
import { LunettesPatient } from './LunettesPatient';
import { configModeleTete } from './modeles-tete';
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

/** Texture de mire : croix et anneaux concentriques, lisibles comme point de fixation. */
function useTextureMireFixation() {
  return useMemo(() => {
    const taille = 256;
    const canvas = document.createElement('canvas');
    canvas.width = taille;
    canvas.height = taille;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const c = taille / 2;

    const anneaux: [number, number, number][] = [
      [98, 2.5, 0.22],
      [72, 2, 0.42],
      [46, 1.8, 0.62],
      [20, 0, 1],
    ];
    for (const [rayon, epaisseur, alpha] of anneaux) {
      ctx.beginPath();
      ctx.arc(c, c, rayon, 0, Math.PI * 2);
      if (epaisseur === 0) {
        ctx.fillStyle = `rgba(255, 248, 225, ${alpha})`;
        ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(255, 210, 120, ${alpha})`;
        ctx.lineWidth = epaisseur;
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(255, 190, 80, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(c - 108, c);
    ctx.lineTo(c + 108, c);
    ctx.moveTo(c, c - 108);
    ctx.lineTo(c, c + 108);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
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
  const face = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const texture = useTextureMireFixation();
  const deLoin = useSession((s) => enVisionDeLoin(s.etat));

  useFrame((_, dt) => {
    const { etat } = useSession.getState();
    if (!groupe.current) return;
    const cible = directionRegard(etat.gaze.azimuthDeg, etat.gaze.elevationDeg)
      .multiplyScalar(DISTANCE_CIBLE)
      .add(new THREE.Vector3(0, DECALAGE_CIBLE_Y, 0));
    groupe.current.position.lerp(cible, 1 - Math.exp(-dt / 0.09));
    face.current?.lookAt(camera.position);
  });

  return (
    <group ref={groupe} position={[0, DECALAGE_CIBLE_Y, DISTANCE_CIBLE]}>
      {texture && (
        <group ref={face} visible={!deLoin}>
          <mesh>
            <planeGeometry args={[0.62, 0.62]} />
            <meshBasicMaterial
              map={texture}
              transparent
              opacity={0.94}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[0.28, 0.34, 48]} />
            <meshBasicMaterial
              color="#ffcc66"
              transparent
              opacity={0.35}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
      <mesh visible={!deLoin}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#fffef8" toneMapped={false} />
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
  const conditionsExamen = useSession((s) => s.conditionsExamen);
  const examenEnCours = useSession((s) => s.examenEnCours);
  const cas = useSession((s) => s.cas);
  const configTete = configModeleTete(cas.id);
  const retenirOrbites = useCallback((positions: PositionsOrbites) => {
    setOrbites(positions);
  }, []);

  const options = examenEnCours ? cas.optionsExamen?.[examenEnCours] : undefined;
  const montreLunettes =
    !options?.choixCorrection || conditionsExamen.correction === 'asc';

  return (
    <>
      <Camera rapprochee={zoomReflets} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-6, 8, 12]} intensity={1.15} />
      <directionalLight position={[8, -4, 10]} intensity={0.4} />
      <Suspense fallback={null}>
        <TetePatient config={configTete} onOrbites={retenirOrbites} />
      </Suspense>
      <Suspense fallback={null}>
        {montreLunettes && <LunettesPatient orbites={orbites} />}
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
