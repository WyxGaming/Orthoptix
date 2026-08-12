import { useState } from 'react';
import { CAS_DISPONIBLES } from '../cases';
import { useSession, type Mode } from '../engine/session';
import { Bouton, Carte } from './composants';

export function StartScreen() {
  const demarrer = useSession((s) => s.demarrer);
  const [mode, setMode] = useState<Mode>('entrainement');
  const [casId, setCasId] = useState(CAS_DISPONIBLES[0]!.id);
  const cas = CAS_DISPONIBLES.find((c) => c.id === casId)!;

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-6 p-8">
      <header>
        <h1 className="text-3xl font-semibold text-slate-100">Orthoptix</h1>
        <p className="mt-1 text-slate-400">
          Bilan orthoptique simule sur patient virtuel, pour les etudiants en ophtalmologie et en
          orthoptie.
        </p>
      </header>

      <Carte titre="Cas clinique">
        <div className="space-y-3">
          {CAS_DISPONIBLES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCasId(c.id)}
              className={`w-full rounded-md border p-3 text-left transition-colors ${
                c.id === casId
                  ? 'border-sky-500 bg-sky-950/40'
                  : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="font-medium text-slate-100">{c.titre}</div>
              <div className="text-sm text-slate-400">{c.resume}</div>
            </button>
          ))}
        </div>
      </Carte>

      <Carte titre="Mode">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setMode('entrainement')}
            className={`flex-1 rounded-md border p-3 text-left ${
              mode === 'entrainement' ? 'border-sky-500 bg-sky-950/40' : 'border-slate-800'
            }`}
          >
            <div className="font-medium text-slate-100">Entrainement</div>
            <div className="text-sm text-slate-400">
              Chaque geste est commente immediatement, avec la justification clinique.
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode('evaluation')}
            className={`flex-1 rounded-md border p-3 text-left ${
              mode === 'evaluation' ? 'border-sky-500 bg-sky-950/40' : 'border-slate-800'
            }`}
          >
            <div className="font-medium text-slate-100">Evaluation</div>
            <div className="text-sm text-slate-400">
              Aucun retour pendant le bilan : score et debriefing complets a la fin.
            </div>
          </button>
        </div>
      </Carte>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {cas.patient.prenom}, {cas.patient.age} ans. {cas.patient.motif}
        </p>
        <Bouton ton="principal" onClick={() => demarrer(cas, mode)}>
          Commencer le bilan
        </Bouton>
      </div>
    </div>
  );
}
