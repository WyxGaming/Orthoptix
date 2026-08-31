import { useState } from 'react';
import { CATALOGUE_EXAMENS, LIBELLES_RUBRIQUES, ORDRE_RUBRIQUES } from '../engine/exams';
import { useSession } from '../engine/session';
import type { QuestionAnamnese } from '../engine/types';
import { Bouton } from './composants';

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
                  ? 'cursor-default border-line bg-cream-deep/60 text-ink-faint'
                  : 'ui-choice'
              }`}
            >
              {q.libelle}
              {dejaPosee && <span className="ml-2 text-xs text-ink-faint">posée</span>}
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
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
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
                      <span className="ml-1.5 text-accent-deep">
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
      <p className="pt-1 text-xs text-ink-muted">
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
  const questions = useSession((s) => s.questionsOrdre);
  const [onglet, setOnglet] = useState<'anamnese' | 'antecedents' | 'examens'>('anamnese');

  const anamnese = questions.filter((q) => q.rubrique === 'anamnese');
  const antecedents = questions.filter((q) => q.rubrique === 'antecedents');

  return (
    <div className="flex h-full min-h-[24rem] flex-col ui-panel">
      <nav className="flex ui-panel-header shrink-0">
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
                ? 'ui-tab-active'
                : 'ui-tab'
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
