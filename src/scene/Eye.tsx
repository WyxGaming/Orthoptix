import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  amplitudeNystagmus,
  etatOculaire,
  type Eye as OeilId,
} from '../domain/ocular-model';
import { degreesToPrism, reflexOffsetMm } from '../domain/prism';
import { useSession } from '../engine/session';
import {
  CM_PAR_MM,
  DIRECTION_DROITE_PATIENT,
  MARGE_PAUPIERE_INF,
  MARGE_PAUPIERE_SUP,
  RAYON_GLOBE,
  RAYON_PAUPIERE,
} from './geometrie';

/** La paupiere est un peu plus soutenue que la joue, et son pli plus sombre encore. */
const COULEUR_PAUPIERE = '#e5b89b';
const COULEUR_PLI = '#c9977f';

/**
 * Constante de temps de la re-fixation. Un mouvement de restitution reel dure
 * quelques dizaines de millisecondes : assez court pour etre franc, assez long
 * pour rester lisible a l'ecran.
 */
const TAU_REFIXATION_S = 0.055;

const amortir = (courant: number, cible: number, dt: number): number =>
  courant + (cible - courant) * (1 - Math.exp(-dt / TAU_REFIXATION_S));

/** Calotte spherique orientee vers l'avant, utilisee pour l'iris, la pupille et la cornee. */
function useCalotte(rayon: number, demiOuvertureCm: number) {
  return useMemo(() => {
    const angle = Math.asin(Math.min(0.99, demiOuvertureCm / rayon));
    return new THREE.SphereGeometry(rayon, 48, 24, 0, Math.PI * 2, 0, angle);
  }, [rayon, demiOuvertureCm]);
}

/**
 * Paupieres : deux calottes concentriques au globe, arretees a la hauteur du bord libre.
 * Elles ne tournent pas avec l'oeil, elles glissent dessus. C'est ce qui donne au regard
 * son relief : le globe bombe sous la peau au lieu d'etre vu au fond d'une decoupe.
 */
function Paupieres() {
  const geometries = useMemo(() => {
    const angle = (hauteur: number) => Math.acos(hauteur / RAYON_PAUPIERE);
    const thetaSup = angle(MARGE_PAUPIERE_SUP);
    const thetaInf = angle(MARGE_PAUPIERE_INF);
    return {
      superieure: new THREE.SphereGeometry(RAYON_PAUPIERE, 48, 24, 0, Math.PI * 2, 0, thetaSup),
      inferieure: new THREE.SphereGeometry(
        RAYON_PAUPIERE,
        48,
        24,
        0,
        Math.PI * 2,
        thetaInf,
        Math.PI - thetaInf,
      ),
      // Sillon palpebral superieur : une calotte a peine plus grande et plus sombre,
      // qui laisse apparaitre le pli au-dessus du bord libre.
      pli: new THREE.SphereGeometry(
        RAYON_PAUPIERE + 0.03,
        48,
        24,
        0,
        Math.PI * 2,
        0,
        angle(MARGE_PAUPIERE_SUP + 0.34),
      ),
    };
  }, []);

  return (
    <>
      <mesh geometry={geometries.pli}>
        <meshStandardMaterial color={COULEUR_PLI} roughness={0.9} />
      </mesh>
      <mesh geometry={geometries.superieure}>
        <meshStandardMaterial color={COULEUR_PAUPIERE} roughness={0.92} />
      </mesh>
      <mesh geometry={geometries.inferieure}>
        <meshStandardMaterial color={COULEUR_PAUPIERE} roughness={0.92} />
      </mesh>
    </>
  );
}

export function Eye({ oeil, position }: { oeil: OeilId; position: [number, number, number] }) {
  const globe = useRef<THREE.Group>(null);
  const reflet = useRef<THREE.Mesh>(null);
  const amorti = useRef({ azimuth: 0, elevation: 0, refletX: 0, refletY: 0 });

  const iris = useCalotte(RAYON_GLOBE + 0.005, 0.52);
  const pupille = useCalotte(RAYON_GLOBE + 0.012, 0.2);
  const cornee = useCalotte(RAYON_GLOBE + 0.03, 0.56);

  useFrame((three, dt) => {
    const { cas, etat } = useSession.getState();
    if (!cas || !globe.current || !reflet.current) return;

    // La cible est calculee sans nystagmus : l'oscillation est ajoutee apres
    // l'amortissement pour ne pas etre lissee par lui.
    const cible = etatOculaire(cas.oculaire, { ...etat, tempsS: 0 })[oeil];
    const pas = Math.min(dt, 0.05);
    const a = amorti.current;
    a.azimuth = amortir(a.azimuth, cible.azimuthDeg, pas);
    a.elevation = amortir(a.elevation, cible.elevationDeg, pas);
    a.refletX = amortir(a.refletX, cible.reflet.xMm, pas);
    a.refletY = amortir(a.refletY, cible.reflet.yMm, pas);

    const oscillationDeg = amplitudeNystagmus(cas.oculaire, {
      ...etat,
      tempsS: three.clock.elapsedTime,
    });

    const azimuthDeg = a.azimuth + oscillationDeg;
    const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
    const elevation = THREE.MathUtils.degToRad(a.elevation);
    globe.current.rotation.set(-elevation, -azimuth, 0);

    // Le reflet se lit dans le plan frontal, a partir du centre de la pupille.
    const centrePupille = new THREE.Vector3(
      -Math.sin(azimuth) * Math.cos(elevation),
      Math.sin(elevation),
      Math.cos(azimuth) * Math.cos(elevation),
    ).multiplyScalar(RAYON_GLOBE);

    const decentrementX =
      (a.refletX - reflexOffsetMm(degreesToPrism(oscillationDeg))) * CM_PAR_MM;
    const positionReflet = centrePupille
      .clone()
      .addScaledVector(DIRECTION_DROITE_PATIENT, decentrementX)
      .add(new THREE.Vector3(0, a.refletY * CM_PAR_MM, 0))
      .setLength(RAYON_GLOBE + 0.045);
    reflet.current.position.copy(positionReflet);
  });

  return (
    <group position={position}>
      <group ref={globe}>
        <mesh>
          <sphereGeometry args={[RAYON_GLOBE, 48, 32]} />
          <meshStandardMaterial color="#f4f1ec" roughness={0.28} metalness={0.02} />
        </mesh>
        <mesh geometry={iris} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#6d4a30" roughness={0.42} />
        </mesh>
        <mesh geometry={pupille} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#0d0a08" roughness={0.9} />
        </mesh>
        <mesh geometry={cornee} rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial
            transparent
            opacity={0.22}
            roughness={0.04}
            clearcoat={1}
            color="#dfe8ef"
          />
        </mesh>
      </group>

      {/* Reflet corneen : place analytiquement pour que sa lecture corresponde au repere enseigne. */}
      <mesh ref={reflet}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <Paupieres />
    </group>
  );
}
