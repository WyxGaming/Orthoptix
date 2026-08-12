import { useMemo, useState } from 'react';
import { CATALOGUE_EXAMENS, LIBELLES_RUBRIQUES, ORDRE_RUBRIQUES } from '../engine/exams';
import { useSession } from '../engine/session';
import type { QuestionAnamnese } from '../engine/types';
import { Bouton } from './composants';

/**
 * Melange deterministe : l'ordre de declaration du cas ne doit pas trahir
 * quelles questions sont pertinentes, mais il doit rester stable d'une session
 * a l'autre pour que deux etudiants voient la meme liste.
 */
function melangeStable<T extends { id: string }>(items: T[]): T[] {
  const cle = (id: string) => {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  return [...items].sort((a, b) => cle(a.id) - cle(b.id));
}

function ListeQuestions({ questions }: { questions: QuestionAnamnese[] }) {
  const poserQuestion = useSession((s) => s.poserQuestion);
  const journal = useSession((s) => s.journal);
  const posees = new Set(journal.filter((a) => a.type === 'question').map((a) => a.id));

  return (
    <ul className="space-y-1.5">
      {questions.map((q) => {
        const dejaPosee = posees.has(q.id);
        return (
          <li key={q.id}>
            <button
              type="button"
              disabled={dejaPosee}
              onClick={() => poserQuestion(q.id)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                dejaPosee
                  ? 'cursor-default border-slate-800 bg-slate-900/40 text-slate-500'
                  : 'border-slate-700 text-slate-200 hover:border-sky-600 hover:bg-slate-800'
              }`}
            >
              {q.libelle}
              {dejaPosee && <span className="ml-2 text-xs text-slate-600">posee</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function EtagereExamens() {
  const cas = useSession((s) => s.cas);
  const lancerExamen = useSession((s) => s.lancerExamen);
  const examenEnCours = useSession((s) => s.examenEnCours);
  const journal = useSession((s) => s.journal);
  const realises = new Set(journal.filter((a) => a.type === 'examen').map((a) => a.id));

  return (
    <div className="space-y-4">
      {ORDRE_RUBRIQUES.map((rubrique) => {
        const examens = Object.values(CATALOGUE_EXAMENS).filter((e) => e.rubrique === rubrique);
        return (
          <div key={rubrique}>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {LIBELLES_RUBRIQUES[rubrique]}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {examens.map((examen) => (
                <Bouton
                  key={examen.id}
                  title={examen.description}
                  actif={examenEnCours === examen.id}
                  onClick={() => lancerExamen(examen.id)}
                  className={realises.has(examen.id) ? 'opacity-60' : ''}
                >
                  {examen.nom}
                  {realises.has(examen.id) && <span className="ml-1.5 text-emerald-400">✓</span>}
                </Bouton>
              ))}
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-xs text-slate-500">
        Tous les examens du cabinet sont accessibles a tout moment. A vous de choisir ceux
        qu appelle ce tableau clinique — et de renoncer aux autres. Passez la souris sur un examen
        pour en relire le principe. {cas.patient.prenom} est cooperante.
      </p>
    </div>
  );
}

export function PanneauInterrogatoire() {
  const cas = useSession((s) => s.cas);
  const [onglet, setOnglet] = useState<'anamnese' | 'antecedents' | 'examens'>('anamnese');

  const questions = useMemo(() => melangeStable(cas.questions), [cas]);
  const anamnese = questions.filter((q) => q.rubrique === 'anamnese');
  const antecedents = questions.filter((q) => q.rubrique === 'antecedents');

  return (
    <div className="flex h-full min-h-[24rem] flex-col rounded-lg border border-slate-800 bg-slate-900/60">
      <nav className="flex shrink-0 border-b border-slate-800">
        {(
          [
            ['anamnese', 'Anamnese'],
            ['antecedents', 'Antecedents'],
            ['examens', 'Examens'],
          ] as const
        ).map(([cle, libelle]) => (
          <button
            key={cle}
            type="button"
            onClick={() => setOnglet(cle)}
            className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              onglet === cle
                ? 'border-b-2 border-sky-500 text-sky-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {libelle}
          </button>
        ))}
      </nav>

      <div className="defilement-fin flex-1 overflow-y-auto p-3">
        {onglet === 'anamnese' && <ListeQuestions questions={anamnese} />}
        {onglet === 'antecedents' && <ListeQuestions questions={antecedents} />}
        {onglet === 'examens' && <EtagereExamens />}
      </div>
    </div>
  );
}
