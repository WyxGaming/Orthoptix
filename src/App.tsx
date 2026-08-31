import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { useSession } from './engine/session';
import { CHAMP_ENSEMBLE_DEG, DISTANCE_OBSERVATEUR } from './scene/geometrie';
import { PatientScene } from './scene/PatientScene';
import { Bouton } from './ui/composants';
import { Debriefing } from './ui/Debriefing';
import { AdminPanel } from './ui/AdminPanel';
import { PanneauBilan } from './ui/PanneauBilan';
import { PanneauExamen } from './ui/PanneauExamen';
import { PanneauInterrogatoire } from './ui/PanneauInterrogatoire';
import { StartScreen } from './ui/StartScreen';
import { Synthese } from './ui/Synthese';

function PiedDePage() {
  return (
    <footer className="shrink-0 border-t border-line bg-surface/60 py-2 text-center text-[11px] text-ink-faint">
      Développé par Simon BARBARAY
    </footer>
  );
}

function Bilan() {
  const cas = useSession((s) => s.cas);
  const mode = useSession((s) => s.mode);
  const passerALaSynthese = useSession((s) => s.passerALaSynthese);
  const occlure = useSession((s) => s.occlure);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const cible = event.target;
      if (
        cible instanceof HTMLInputElement ||
        cible instanceof HTMLTextAreaElement ||
        cible instanceof HTMLSelectElement
      ) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        occlure('OD');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        occlure('OG');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        occlure('aucune');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [occlure]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-2.5">
        <div>
          <h1 className="font-semibold text-ink">
            {cas.patient.prenom}, {cas.patient.age} ans
          </h1>
          <p className="text-xs text-ink-muted">{cas.patient.motif}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-ink-muted sm:inline">
            Occlusion : ← OD · → OG · ↓ découvrir
          </span>
          <span className="text-xs uppercase tracking-wider text-ink-muted">
            Mode {mode === 'entrainement' ? 'entraînement' : 'évaluation'}
          </span>
          <Bouton ton="principal" onClick={passerALaSynthese}>
            Passer à la synthèse
          </Bouton>
        </div>
      </header>

      <main className="defilement-fin grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[20rem_1fr_22rem] lg:overflow-hidden">
        <PanneauInterrogatoire />

        <div className="flex min-h-0 flex-col gap-4">
          {/* Le canevas et le panneau d examen se partagent la hauteur : sans cela, un
              cover test (prismes + interpretation) pousse « Consigner » hors ecran. */}
          <div className="relative min-h-[16rem] flex-[3] overflow-hidden rounded-xl border border-line bg-canvas">
            <Canvas
              className="!h-full !w-full"
              camera={{ position: [0, 0, DISTANCE_OBSERVATEUR], fov: CHAMP_ENSEMBLE_DEG }}
              shadows={false}
              gl={{ antialias: true, alpha: false }}
            >
              <color attach="background" args={['#EDE6DA']} />
              <PatientScene zoomReflets={zoom} />
            </Canvas>
          </div>
          <div className="min-h-[11rem] flex-[2] overflow-hidden">
            <PanneauExamen zoom={zoom} setZoom={setZoom} />
          </div>
        </div>

        <PanneauBilan />
      </main>
    </div>
  );
}

export function App() {
  const phase = useSession((s) => s.phase);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {phase === 'accueil' && <StartScreen />}
        {phase === 'admin' && <AdminPanel />}
        {phase === 'bilan' && <Bilan />}
        {phase === 'synthese' && <Synthese />}
        {phase === 'debriefing' && <Debriefing />}
      </div>
      <PiedDePage />
    </div>
  );
}
