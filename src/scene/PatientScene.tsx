import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { enVisionDeLoin, EYES, type Eye as OeilId } from '../domain/ocular-model';
import { useSession } from '../engine/session';
import { Eye } from './Eye';
import {
  bordPalpebral,
  CHAMP_ENSEMBLE_DEG,
  CHAMP_RAPPROCHE_DEG,
  DISTANCE_CIBLE,
  DISTANCE_OBSERVATEUR,
  directionRegard,
  masqueVisage,
  positionOeil,
} from './geometrie';

const COULEUR_PEAU = '#e9c0a2';
const COULEUR_PEAU_OMBRE = '#d5a184';

/** Cote temporal de l'oeil, exprime en X : la droite du patient est en -X. */
const signeTemporal = (oeil: OeilId) => (oeil === 'OD' ? -1 : 1);

/**
 * Volume de peau : une ellipsoide posee sur le masque du visage. Le modele du visage est
 * fait de l'accumulation de ces volumes, dont les intersections tiennent lieu de sillons.
 */
function VolumePeau({
  position,
  scale,
  couleur = COULEUR_PEAU,
  rugosite = 0.9,
  rotation,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  couleur?: string;
  rugosite?: number;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshStandardMaterial color={couleur} roughness={rugosite} />
    </mesh>
  );
}

function Visage() {
  const masque = useMemo(() => {
    // Un masque mince : sa face avant vient affleurer le sommet de la cornee, pour que
    // l'oeil ne soit plus vu au fond d'un tunnel comme dans une decoupe de carton.
    const geometrie = new THREE.ExtrudeGeometry(masqueVisage(), {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.09,
      bevelSegments: 3,
      curveSegments: 32,
    });
    geometrie.computeVertexNormals();
    return geometrie;
  }, []);

  const bords = useMemo(
    () =>
      Object.fromEntries(
        EYES.map((oeil) => [oeil, new THREE.ShapeGeometry(bordPalpebral(positionOeil(oeil)[0]), 24)]),
      ) as Record<OeilId, THREE.ShapeGeometry>,
    [],
  );

  return (
    <group>
      {/* Volume du crane, un peu plus etroit que le visage pour ne pas deborder du contour. */}
      <VolumePeau
        position={[0, 0.6, -5.4]}
        scale={[6.2, 8.1, 6.7]}
        couleur={COULEUR_PEAU_OMBRE}
        rugosite={0.85}
      />

      <mesh geometry={masque} position={[0, 0, 0.95]}>
        {/* Une peau tres mate : un reflet speculaire sur le visage brouillerait la
            lecture du seul reflet qui compte, celui de la cornee. */}
        <meshStandardMaterial color={COULEUR_PEAU} roughness={0.94} />
      </mesh>

      {/* Front, arcades sourcilieres et glabelle : le relief du tiers superieur. */}
      <VolumePeau position={[0, 4.6, 0.35]} scale={[5.0, 3.4, 0.95]} />
      {EYES.map((oeil) => (
        <VolumePeau
          key={`arcade-${oeil}`}
          position={[positionOeil(oeil)[0], 1.4, 0.5]}
          scale={[2.2, 0.8, 0.72]}
        />
      ))}
      <VolumePeau position={[0, 1.0, 0.5]} scale={[0.8, 1.3, 0.6]} />

      {/* Pommettes et joues, qui donnent au visage sa rondeur d'enfant. */}
      {EYES.map((oeil) => (
        <VolumePeau
          key={`pommette-${oeil}`}
          position={[positionOeil(oeil)[0] * 1.28, -2.6, 0.3]}
          scale={[2.9, 2.4, 0.9]}
        />
      ))}

      {/* Nez : arete, pointe et ailes, reperes de symetrie pour juger des reflets. */}
      <VolumePeau position={[0, -1.3, 0.72]} scale={[0.62, 2.0, 0.78]} />
      <VolumePeau position={[0, -3.15, 0.85]} scale={[0.8, 0.66, 0.8]} />
      {EYES.map((oeil) => (
        <VolumePeau
          key={`aile-${oeil}`}
          position={[signeTemporal(oeil) * 0.72, -3.2, 0.6]}
          scale={[0.44, 0.4, 0.55]}
        />
      ))}

      {/* Bouche et menton. */}
      <VolumePeau position={[0, -4.95, 0.6]} scale={[1.55, 0.34, 0.42]} couleur="#c2836f" />
      <VolumePeau position={[0, -5.5, 0.62]} scale={[1.4, 0.4, 0.45]} couleur="#cb8e7c" />
      <VolumePeau position={[0, -7.0, 0.35]} scale={[2.3, 1.6, 0.8]} />

      {EYES.map((oeil) => (
        <mesh key={`bord-${oeil}`} geometry={bords[oeil]} position={[0, 0, 1.24]}>
          <meshStandardMaterial color="#8d5646" roughness={0.85} />
        </mesh>
      ))}

      {/* Sourcils, poses sur l'arcade et inclines vers la tempe. */}
      {EYES.map((oeil) => (
        <VolumePeau
          key={oeil}
          position={[positionOeil(oeil)[0], 1.95, 1.05]}
          scale={[1.4, 0.2, 0.24]}
          rotation={[0, 0, signeTemporal(oeil) * 0.14]}
          couleur="#4a3226"
        />
      ))}
    </group>
  );
}

/** Cache d'occlusion : glisse devant l'oeil vise et se retire hors champ. */
function Cache() {
  const cache = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const { etat } = useSession.getState();
    if (!cache.current) return;
    const occlusion = etat.occlusion;
    const cible = new THREE.Vector3(
      occlusion === 'aucune' ? 0 : positionOeil(occlusion)[0],
      occlusion === 'aucune' ? 16 : 0,
      3.6,
    );
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

function Prismes() {
  const prismes = useSession((s) => s.etat.prismes);
  return (
    <>
      {EYES.map((oeil) => {
        const prisme = prismes[oeil];
        if (!prisme) return null;
        const x = positionOeil(oeil)[0];
        const versLaBase =
          prisme.base === 'temporale'
            ? signeTemporal(oeil)
            : prisme.base === 'nasale'
              ? -signeTemporal(oeil)
              : 0;
        const versLeHaut = prisme.base === 'superieure' ? 1 : prisme.base === 'inferieure' ? -1 : 0;
        return (
          <group key={oeil} position={[x, 0, 2.6]}>
            <mesh>
              <boxGeometry args={[2.6, 2.6, 0.3]} />
              {/* Verre tres peu teinte : c'est la pupille situee derriere qu il faut lire. */}
              <meshPhysicalMaterial
                transparent
                opacity={0.16}
                color="#bfe6fa"
                roughness={0.05}
                clearcoat={1}
              />
            </mesh>
            {/* Repere de la base du prisme. */}
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
 * yeux continuent de viser la direction reelle de la mire. C'est bien ce que voit le
 * praticien, qui regarde l'enfant fixer quelque chose au-dessus de son epaule.
 */
function Cible() {
  const groupe = useRef<THREE.Group>(null);
  const deLoin = useSession((s) => enVisionDeLoin(s.etat));

  useFrame((_, dt) => {
    const { etat } = useSession.getState();
    if (!groupe.current) return;
    // Le porte-lumiere reste a distance de bras, meme quand la mire est lointaine :
    // seule sa direction compte pour l'eclairage, et le visage doit rester eclaire.
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
      {/* Intensite calibree pour un visage eclaire a 33 cm, sans coupure de portee. */}
      <pointLight intensity={85} distance={0} decay={1.4} color="#fff6df" />
    </group>
  );
}

/**
 * Le praticien reste a sa place : on ne peut pas s'approcher davantage sans passer
 * devant la mire. Le gros plan se fait donc en resserrant le champ, comme on le ferait
 * en penchant la tete pour mieux voir les reflets.
 */
function Camera({ rapprochee }: { rapprochee: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useFrame((_, dt) => {
    const champVise = rapprochee ? CHAMP_RAPPROCHE_DEG : CHAMP_ENSEMBLE_DEG;
    const lissage = 1 - Math.exp(-dt / 0.25);
    camera.position.z += (DISTANCE_OBSERVATEUR - camera.position.z) * lissage;
    camera.fov += (champVise - camera.fov) * lissage;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function PatientScene({ zoomReflets }: { zoomReflets: boolean }) {
  return (
    <>
      <Camera rapprochee={zoomReflets} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[-6, 8, 12]} intensity={1.1} />
      <directionalLight position={[8, -4, 10]} intensity={0.35} />
      <Visage />
      {EYES.map((oeil) => (
        <Eye key={oeil} oeil={oeil} position={positionOeil(oeil)} />
      ))}
      <Prismes />
      <Cache />
      <Cible />
    </>
  );
}
