import { useState } from 'react';
import { CATALOGUE_EXAMENS, LIBELLES_RUBRIQUES, ORDRE_RUBRIQUES } from '../engine/exams';
import { BONUS_CONDUITE_ANAMNESE } from '../engine/scoring';
import { useSession } from '../engine/session';
import type { QuestionAnamnese } from '../engine/types';
import { Bouton } from './composants';

function trierParOrdreAttendu(
  questions: QuestionAnamnese[],
  ordre?: string[],
): QuestionAnamnese[] {
  if (!ordre?.length) return questions;
  const rang = (id: string) => {
    const i = ordre.indexOf(id);
    return i >= 0 ? i : ordre.length;
  };
  return [...questions].sort((a, b) => rang(a.id) - rang(b.id));
}

function EncartOrdreAnamnese({
  ordre,
  questions,
}: {
  ordre: string[];
  questions: QuestionAnamnese[];
}) {
  const libelles = ordre.map((id) => questions.find((q) => q.id === id)?.libelle ?? id);

  return (
    <div className="mb-3 rounded-md border border-sky-800/60 bg-sky-950/30 px-3 py-2.5">
      <p className="text-xs font-semibold text-sky-300">
        Ordre chronologique attendu (+{BONUS_CONDUITE_ANAMNESE} pts)
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Posez ces questions dans l ordre indiqué. D autres questions peuvent s intercaler entre
        elles sans pénalité — seul l ordre relatif compte.
      </p>
      <ol className="mt-2 list-inside list-decimal space-y-0.5 text-xs text-slate-300">
        {libelles.map((libelle, i) => (
          <li key={ordre[i]}>{libelle}</li>
        ))}
      </ol>
    </div>
  );
}

function ListeQuestions({
  questions,
  ordreAttendu,
}: {
  questions: QuestionAnamnese[];
  ordreAttendu?: string[];
}) {
  const poserQuestion = useSession((s) => s.poserQuestion);
  const journal = useSession((s) => s.journal);
  const posees = new Set(journal.filter((a) => a.type === 'question').map((a) => a.id));

  return (
    <ul className="space-y-1.5">
      {questions.map((q) => {
        const dejaPosee = posees.has(q.id);
        const rang = ordreAttendu?.indexOf(q.id) ?? -1;
        return (
          <li key={q.id}>
            <button
              type="button"
              disabled={dejaPosee}
              onClick={() => poserQuestion(q.id)}
              className={`flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                dejaPosee
                  ? 'cursor-default border-slate-800 bg-slate-900/40 text-slate-500'
                  : 'border-slate-700 text-slate-200 hover:border-sky-600 hover:bg-slate-800'
              }`}
            >
              {rang >= 0 && (
                <span
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    dejaPosee
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-sky-900/60 text-sky-300'
                  }`}
                >
                  {rang + 1}
                </span>
              )}
              <span className="min-w-0 flex-1">
                {q.libelle}
                {dejaPosee && <span className="ml-2 text-xs text-slate-600">posée</span>}
              </span>
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
  const nombreRealisations = useSession((s) => s.nombreRealisations);

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
              {examens.map((examen) => {
                const count = nombreRealisations(examen.id);
                const repetable = Boolean(cas.optionsExamen?.[examen.id]);
                return (
                  <Bouton
                    key={examen.id}
                    title={examen.description}
                    actif={examenEnCours === examen.id}
                    onClick={() => lancerExamen(examen.id)}
                    className={count > 0 && !repetable ? 'opacity-60' : ''}
                  >
                    {examen.nom}
                    {count > 0 && (
                      <span className="ml-1.5 text-emerald-400">
                        {repetable && count > 1 ? `✓×${count}` : '✓'}
                      </span>
                    )}
                  </Bouton>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-xs text-slate-500">
        Tous les examens du cabinet sont accessibles à tout moment. À vous de choisir ceux
        qu'appelle ce tableau clinique — et de renoncer aux autres. Passez la souris sur un examen
        pour en relire le principe. {cas.patient.prenom} est coopérant{cas.patient.sexe === 'F' ? 'e' : ''}.
        {Object.keys(cas.optionsExamen ?? {}).length > 0 &&
          ' Pour certains examens, choisissez ASC ou SC et éventuellement les loupes +3 avant de présenter le test.'}
        {cas.debutSansCorrection &&
          ` ${cas.patient.prenom} est arrivé sans lunettes : demandez-lui de les remettre avant les examens sous correction.`}
      </p>
    </div>
  );
}

export function PanneauInterrogatoire() {
  const cas = useSession((s) => s.cas);
  const questions = useSession((s) => s.questionsOrdre);
  const [onglet, setOnglet] = useState<'anamnese' | 'antecedents' | 'examens'>('anamnese');

  const ordreAnamnese = cas.ordreAnamneseAttendu;
  const anamnese = trierParOrdreAttendu(
    questions.filter((q) => q.rubrique === 'anamnese'),
    ordreAnamnese,
  );
  const antecedents = questions.filter((q) => q.rubrique === 'antecedents');

  return (
    <div className="flex h-full min-h-[24rem] flex-col rounded-lg border border-slate-800 bg-slate-900/60">
      <nav className="flex shrink-0 border-b border-slate-800">
        {(
          [
            ['anamnese', 'Anamnèse'],
            ['antecedents', 'Antécédents'],
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
        {onglet === 'anamnese' && (
          <>
            {ordreAnamnese && ordreAnamnese.length > 0 && (
              <EncartOrdreAnamnese ordre={ordreAnamnese} questions={questions} />
            )}
            <ListeQuestions questions={anamnese} ordreAttendu={ordreAnamnese} />
          </>
        )}
        {onglet === 'antecedents' && <ListeQuestions questions={antecedents} />}
        {onglet === 'examens' && <EtagereExamens />}
      </div>
    </div>
  );
}
