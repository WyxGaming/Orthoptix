import { useState } from 'react';
import { useSession } from '../engine/session';
import { examensComplementairesDetectes } from '../engine/scoring';
import type { QuestionSynthese, ReponsesSynthese } from '../engine/types';
import { Bouton, Carte, Etiquette } from './composants';

function ChampExamensComplementaires({
  question,
  valeur,
  onChange,
}: {
  question: Extract<QuestionSynthese, { type: 'examensComplementaires' }>;
  valeur: string;
  onChange: (valeur: string) => void;
}) {
  const [consultes, setConsultes] = useState(false);
  const detectes = consultes ? examensComplementairesDetectes(valeur, question.examens) : [];

  return (
    <div className="space-y-3">
      <textarea
        value={valeur}
        onChange={(e) => {
          setConsultes(false);
          onChange(e.target.value);
        }}
        rows={4}
        placeholder="Ex. fond d'œil, IRM encéphale, ponction lombaire, bilan sanguin…"
        className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-500"
      />
      <Bouton
        disabled={!valeur.trim()}
        onClick={() => setConsultes(true)}
        className="justify-center"
      >
        Consulter les résultats
      </Bouton>
      {consultes && (
        <div className="space-y-2">
          {detectes.length === 0 ? (
            <p className="rounded-md border border-amber-800/60 bg-amber-950/20 px-3 py-2 text-sm text-amber-200/90">
              Aucun examen reconnu dans votre prescription. Vérifiez les intitulés (fond d'œil,
              IRM, ponction lombaire, bilan sanguin…).
            </p>
          ) : (
            detectes.map((examen) => (
              <div
                key={examen.id}
                className="rounded-md border border-sky-800/50 bg-sky-950/25 px-3 py-2"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                  {examen.libelle}
                </div>
                {examen.imageResultat ? (
                  <figure className="mt-2 space-y-2">
                    <img
                      src={examen.imageResultat}
                      alt={examen.legendeImage ?? examen.libelle}
                      className="max-h-80 w-full rounded border border-slate-700/80 bg-slate-950 object-contain"
                    />
                    {examen.legendeImage && (
                      <figcaption className="text-xs text-slate-400">{examen.legendeImage}</figcaption>
                    )}
                  </figure>
                ) : (
                  examen.resultat && (
                    <p className="mt-1 text-sm text-slate-200">{examen.resultat}</p>
                  )
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ChampQuestion({
  question,
  valeur,
  onChange,
}: {
  question: QuestionSynthese;
  valeur: string;
  onChange: (valeur: string) => void;
}) {
  if (question.type === 'examensComplementaires') {
    return (
      <ChampExamensComplementaires question={question} valeur={valeur} onChange={onChange} />
    );
  }

  if (question.type === 'qcm') {
    return (
      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
              valeur === option.id
                ? 'border-sky-500 bg-sky-950/40 text-slate-100'
                : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {option.libelle}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'ouiNon') {
    return (
      <div className="flex gap-2">
        {(
          [
            { id: 'oui', libelle: 'Oui' },
            { id: 'non', libelle: 'Non' },
          ] as const
        ).map((option) => (
          <Bouton
            key={option.id}
            actif={valeur === option.id}
            onClick={() => onChange(option.id)}
            className="min-w-24 justify-center"
          >
            {option.libelle}
          </Bouton>
        ))}
      </div>
    );
  }

  return (
    <textarea
      value={valeur}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder="Votre réponse…"
      className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-500"
    />
  );
}

export function Synthese() {
  const cas = useSession((s) => s.cas);
  const bilan = useSession((s) => s.bilan);
  const validerSynthese = useSession((s) => s.validerSynthese);
  const [reponses, setReponses] = useState<ReponsesSynthese>({});

  const completer = (id: string, valeur: string) =>
    setReponses((prev) => ({ ...prev, [id]: valeur }));

  const pret = cas.synthese.questions.every((q) => {
    const valeur = reponses[q.id]?.trim();
    return Boolean(valeur);
  });

  return (
    <div className="mx-auto flex min-h-full max-w-5xl gap-6 p-6">
      <Carte titre="Votre bilan" className="w-2/5 self-start">
        <ol className="space-y-2">
          {bilan.map((ligne) => (
            <li key={ligne.id} className="border-l-2 border-slate-700 pl-2.5">
              <div className="text-xs font-medium text-sky-300">{ligne.titre}</div>
              <div className="text-sm text-slate-300">{ligne.contenu}</div>
            </li>
          ))}
        </ol>
      </Carte>

      <div className="flex-1 space-y-4">
        <Carte titre="Synthèse diagnostique">
          <div className="space-y-6">
            {cas.synthese.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-200">
                    <span className="mr-2 font-mono text-xs text-slate-500">{index + 1}.</span>
                    {question.question}
                  </p>
                  {question.niveau && <Etiquette>{question.niveau}</Etiquette>}
                </div>
                <ChampQuestion
                  question={question}
                  valeur={reponses[question.id] ?? ''}
                  onChange={(valeur) => completer(question.id, valeur)}
                />
              </div>
            ))}
          </div>
        </Carte>

        <div className="flex justify-end">
          <Bouton ton="principal" disabled={!pret} onClick={() => validerSynthese(reponses)}>
            Conclure le bilan
          </Bouton>
        </div>
      </div>
    </div>
  );
}
