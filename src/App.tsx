import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { useSession } from './engine/session';
import { CHAMP_ENSEMBLE_DEG, DISTANCE_OBSERVATEUR } from './scene/geometrie';
import { PatientScene } from './scene/PatientScene';
import { Bouton } from './ui/composants';
import { Debriefing } from './ui/Debriefing';
import { PanneauBilan } from './ui/PanneauBilan';
import { PanneauExamen } from './ui/PanneauExamen';
import { PanneauInterrogatoire } from './ui/PanneauInterrogatoire';
import { StartScreen } from './ui/StartScreen';
import { Synthese } from './ui/Synthese';

function Bilan() {
  const cas = useSession((s) => s.cas);
  const mode = useSession((s) => s.mode);
  const passerALaSynthese = useSession((s) => s.passerALaSynthese);
  const [zoom, setZoom] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-2.5">
        <div>
          <h1 className="font-semibold text-slate-100">
            {cas.patient.prenom}, {cas.patient.age} ans
          </h1>
          <p className="text-xs text-slate-500">{cas.patient.motif}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-slate-500">
            Mode {mode === 'entrainement' ? 'entrainement' : 'evaluation'}
          </span>
          <Bouton ton="principal" onClick={passerALaSynthese}>
            Passer a la synthese
          </Bouton>
        </div>
      </header>

      <main className="defilement-fin grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[20rem_1fr_22rem] lg:overflow-hidden">
        <PanneauInterrogatoire />

        <div className="flex min-h-0 flex-col gap-4">
          {/* Le canevas et le panneau d examen se partagent la hauteur : sans cela, un
              cover test (prismes + interpretation) pousse « Consigner » hors ecran. */}
          <div className="relative min-h-[16rem] flex-[3] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            <Canvas
              className="!h-full !w-full"
              camera={{ position: [0, 0, DISTANCE_OBSERVATEUR], fov: CHAMP_ENSEMBLE_DEG }}
              shadows={false}
              gl={{ antialias: true, alpha: false }}
            >
              <color attach="background" args={['#272757']} />
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
    <div className="h-full">
      {phase === 'accueil' && <StartScreen />}
      {phase === 'bilan' && <Bilan />}
      {phase === 'synthese' && <Synthese />}
      {phase === 'debriefing' && <Debriefing />}
    </div>
  );
}
