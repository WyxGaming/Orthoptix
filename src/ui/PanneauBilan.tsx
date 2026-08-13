import { useEffect, useRef } from 'react';
import { useSession } from '../engine/session';

export function PanneauBilan() {
  const bilan = useSession((s) => s.bilan);
  const messages = useSession((s) => s.messages);
  const mode = useSession((s) => s.mode);
  const cas = useSession((s) => s.cas);
  const finBilan = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finBilan.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [bilan.length]);

  return (
    <div className="flex h-full min-h-[22rem] flex-col gap-3">
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-800 bg-slate-900/60">
        <header className="shrink-0 border-b border-slate-800 px-4 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cahier de bilan
          </h2>
        </header>
        <div className="defilement-fin flex-1 overflow-y-auto p-3">
          {bilan.length === 0 ? (
            <p className="text-sm text-slate-500">
              Rien de consigné pour l'instant. Commencez par interroger les parents de{' '}
              {cas.patient.prenom}.
            </p>
          ) : (
            <ol className="space-y-2.5">
              {bilan.map((ligne) => (
                <li key={ligne.id} className="border-l-2 border-slate-700 pl-2.5">
                  <div className="text-xs font-medium text-sky-300">{ligne.titre}</div>
                  <div className="text-sm text-slate-300">{ligne.contenu}</div>
                </li>
              ))}
            </ol>
          )}
          <div ref={finBilan} />
        </div>
      </div>

      {mode === 'entrainement' && (
        <div className="flex max-h-56 shrink-0 flex-col rounded-lg border border-slate-800 bg-slate-900/60">
          <header className="shrink-0 border-b border-slate-800 px-4 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Retours du superviseur
            </h2>
          </header>
          <div className="defilement-fin flex-1 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-500">
                Les commentaires apparaîtront ici au fil de vos gestes.
              </p>
            ) : (
              <ul className="space-y-2">
                {[...messages].reverse().map((m) => (
                  <li
                    key={m.id}
                    className={`rounded-md px-2.5 py-1.5 text-sm ${
                      m.ton === 'positif'
                        ? 'bg-emerald-950/50 text-emerald-200'
                        : m.ton === 'negatif'
                          ? 'bg-rose-950/50 text-rose-200'
                          : 'bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    {m.texte}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
