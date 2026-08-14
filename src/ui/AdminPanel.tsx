import { useState } from 'react';
import { CAS_DISPONIBLES, casCliniquePrepare } from '../cases';
import {
  ajouterQuestion,
  ajouterQuestionSynthese,
  ajouterVarianteSynthese,
  criteresOuvertsQuestion,
  motsCritereSynthese,
  overridesCas,
  retirerQuestion,
  retirerQuestionSynthese,
  retirerVarianteBaseSynthese,
  retirerVarianteSynthese,
} from '../engine/admin';
import { useAdminSession } from '../engine/adminSession';
import { useSession } from '../engine/session';
import type { QuestionAnamnese, QuestionSynthese } from '../engine/types';
import { Bouton, Carte, Etiquette } from './composants';

function FormulaireQuestion({
  casId,
  onAjoute,
}: {
  casId: string;
  onAjoute: () => void;
}) {
  const [rubrique, setRubrique] = useState<QuestionAnamnese['rubrique']>('anamnese');
  const [libelle, setLibelle] = useState('');
  const [reponse, setReponse] = useState('');
  const [poids, setPoids] = useState('0');
  const [commentaire, setCommentaire] = useState('');

  const soumettre = () => {
    if (!libelle.trim() || !reponse.trim()) return;
    ajouterQuestion(casId, {
      rubrique,
      libelle: libelle.trim(),
      reponse: reponse.trim(),
      poids: Number.parseInt(poids, 10) || 0,
      commentaire: commentaire.trim() || undefined,
    });
    setLibelle('');
    setReponse('');
    setCommentaire('');
    onAjoute();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['anamnese', 'Anamnèse'],
            ['antecedents', 'Antécédents'],
          ] as const
        ).map(([valeur, label]) => (
          <Bouton key={valeur} actif={rubrique === valeur} onClick={() => setRubrique(valeur)}>
            {label}
          </Bouton>
        ))}
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-slate-400">Question</span>
        <input
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          placeholder="Libellé de la question"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-slate-400">Réponse du patient / des parents</span>
        <textarea
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
          rows={3}
          className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Poids
          <input
            type="number"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 outline-none focus:border-sky-500"
          />
        </label>
        <span className="self-center text-xs text-slate-600">
          0 = neutre, positif = essentielle, négatif = pénalisée
        </span>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-slate-400">Commentaire pédagogique (optionnel)</span>
        <input
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
        />
      </label>
      <Bouton ton="principal" onClick={soumettre} disabled={!libelle.trim() || !reponse.trim()}>
        Ajouter la question
      </Bouton>
    </div>
  );
}

function FormulaireQuestionSynthese({
  casId,
  onAjoute,
}: {
  casId: string;
  onAjoute: () => void;
}) {
  const [type, setType] = useState<QuestionSynthese['type']>('ouverte');
  const [question, setQuestion] = useState('');
  const [poids, setPoids] = useState('2');
  const [explication, setExplication] = useState('');
  const [reponseAttendue, setReponseAttendue] = useState('');
  const [seuil, setSeuil] = useState('1');
  const [criteresTexte, setCriteresTexte] = useState('');
  const [correctOuiNon, setCorrectOuiNon] = useState(true);
  const [optionsQcm, setOptionsQcm] = useState('bonne|Bonne réponse|oui\nmauvaise|Mauvaise réponse|non');

  const soumettre = () => {
    if (!question.trim() || !explication.trim()) return;
    const poidsNum = Number.parseInt(poids, 10) || 0;

    if (type === 'ouverte') {
      const criteres = criteresTexte
        .split('\n')
        .map((ligne) => ligne.trim())
        .filter(Boolean)
        .map((ligne) => {
          const [id, ...reste] = ligne.split('|');
          const variantes = (reste.join('|') || id)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
          return { id: id.trim(), variantes };
        })
        .filter((c) => c.id && c.variantes.length > 0);
      if (criteres.length === 0 || !reponseAttendue.trim()) return;
      ajouterQuestionSynthese(casId, {
        type: 'ouverte',
        question: question.trim(),
        poids: poidsNum,
        explication: explication.trim(),
        reponseAttendue: reponseAttendue.trim(),
        criteres,
        seuil: Number.parseInt(seuil, 10) || 1,
      });
    } else if (type === 'ouiNon') {
      ajouterQuestionSynthese(casId, {
        type: 'ouiNon',
        question: question.trim(),
        poids: poidsNum,
        explication: explication.trim(),
        correct: correctOuiNon,
      });
    } else {
      const options = optionsQcm
        .split('\n')
        .map((ligne) => ligne.trim())
        .filter(Boolean)
        .map((ligne) => {
          const [id, libelle, correct] = ligne.split('|').map((p) => p.trim());
          return { id: id || libelle, libelle: libelle || id, correct: correct === 'oui' };
        })
        .filter((o) => o.id && o.libelle);
      if (options.length < 2 || !options.some((o) => o.correct)) return;
      ajouterQuestionSynthese(casId, {
        type: 'qcm',
        question: question.trim(),
        poids: poidsNum,
        explication: explication.trim(),
        options,
      });
    }

    setQuestion('');
    setExplication('');
    setReponseAttendue('');
    setCriteresTexte('');
    onAjoute();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['ouverte', 'Réponse ouverte'],
            ['qcm', 'QCM'],
            ['ouiNon', 'Oui / Non'],
          ] as const
        ).map(([valeur, label]) => (
          <Bouton key={valeur} actif={type === valeur} onClick={() => setType(valeur)}>
            {label}
          </Bouton>
        ))}
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-slate-400">Question</span>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-400">
        Poids
        <input
          type="number"
          value={poids}
          onChange={(e) => setPoids(e.target.value)}
          className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 outline-none focus:border-sky-500"
        />
      </label>
      {type === 'ouverte' && (
        <>
          <label className="block space-y-1 text-sm">
            <span className="text-slate-400">Critères et mots acceptés</span>
            <textarea
              value={criteresTexte}
              onChange={(e) => setCriteresTexte(e.target.value)}
              rows={4}
              placeholder={'nml|nml, nystagmus manifeste latent\nupshoot|upshoot, hyperaction obliques'}
              className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-sky-500"
            />
            <span className="text-xs text-slate-600">
              Une ligne par critère : identifiant | mot1, mot2, mot3
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Seuil (critères requis)
            <input
              type="number"
              min={1}
              value={seuil}
              onChange={(e) => setSeuil(e.target.value)}
              className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 outline-none focus:border-sky-500"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-slate-400">Réponse attendue (débriefing)</span>
            <input
              value={reponseAttendue}
              onChange={(e) => setReponseAttendue(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
            />
          </label>
        </>
      )}
      {type === 'qcm' && (
        <label className="block space-y-1 text-sm">
          <span className="text-slate-400">Options QCM</span>
          <textarea
            value={optionsQcm}
            onChange={(e) => setOptionsQcm(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-sky-500"
          />
          <span className="text-xs text-slate-600">
            Une ligne par option : id | libellé | oui (si correcte) ou non
          </span>
        </label>
      )}
      {type === 'ouiNon' && (
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={correctOuiNon}
            onChange={(e) => setCorrectOuiNon(e.target.checked)}
            className="rounded border-slate-600 bg-slate-950"
          />
          La bonne réponse est « Oui »
        </label>
      )}
      <label className="block space-y-1 text-sm">
        <span className="text-slate-400">Explication (débriefing)</span>
        <textarea
          value={explication}
          onChange={(e) => setExplication(e.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
        />
      </label>
      <Bouton ton="principal" onClick={soumettre} disabled={!question.trim() || !explication.trim()}>
        Ajouter à la synthèse
      </Bouton>
    </div>
  );
}

function ListeQuestionsAdmin({
  casId,
  revision,
  onChange,
}: {
  casId: string;
  revision: number;
  onChange: () => void;
}) {
  void revision;
  const questions = overridesCas(casId).questions;
  if (questions.length === 0) {
    return <p className="text-sm text-slate-500">Aucune question ajoutée pour ce cas.</p>;
  }
  return (
    <ul className="space-y-2">
      {questions.map((q) => (
        <li
          key={q.id}
          className="flex items-start justify-between gap-3 rounded-md border border-slate-800 bg-slate-950/40 p-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Etiquette>{q.rubrique === 'anamnese' ? 'Anamnèse' : 'Antécédents'}</Etiquette>
              <span className="font-mono text-[10px] text-slate-600">{q.poids} pt</span>
            </div>
            <p className="mt-1 text-sm text-slate-200">{q.libelle}</p>
            <p className="mt-1 text-xs text-slate-400">{q.reponse}</p>
          </div>
          <Bouton
            ton="danger"
            onClick={() => {
              retirerQuestion(casId, q.id);
              onChange();
            }}
          >
            Retirer
          </Bouton>
        </li>
      ))}
    </ul>
  );
}

function ListeQuestionsSyntheseAdmin({
  casId,
  revision,
  onChange,
}: {
  casId: string;
  revision: number;
  onChange: () => void;
}) {
  void revision;
  const questions = overridesCas(casId).syntheseQuestions;
  if (questions.length === 0) {
    return <p className="text-sm text-slate-500">Aucune question de synthèse ajoutée.</p>;
  }
  return (
    <ul className="space-y-2">
      {questions.map((q) => (
        <li
          key={q.id}
          className="flex items-start justify-between gap-3 rounded-md border border-slate-800 bg-slate-950/40 p-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Etiquette>{q.type === 'ouverte' ? 'Ouverte' : q.type === 'qcm' ? 'QCM' : 'Oui/Non'}</Etiquette>
              <span className="font-mono text-[10px] text-slate-600">{q.poids} pt</span>
            </div>
            <p className="mt-1 text-sm text-slate-200">{q.question}</p>
          </div>
          <Bouton
            ton="danger"
            onClick={() => {
              retirerQuestionSynthese(casId, q.id);
              onChange();
            }}
          >
            Retirer
          </Bouton>
        </li>
      ))}
    </ul>
  );
}

function SectionMotsSynthese({
  casId,
  revision,
  onChange,
}: {
  casId: string;
  revision: number;
  onChange: () => void;
}) {
  void revision;
  const cas = casCliniquePrepare(CAS_DISPONIBLES.find((c) => c.id === casId)!);
  const ouvertes = cas.synthese.questions.filter((q) => q.type === 'ouverte');

  if (ouvertes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Ce cas n'a pas de question ouverte en synthèse (ajoutez-en une ci-dessus).
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {ouvertes.map((question) => {
        if (question.type !== 'ouverte') return null;
        const criteres = criteresOuvertsQuestion(question);
        if (criteres.length === 0) {
          return (
            <div key={question.id} className="rounded-md border border-slate-800 p-4">
              <p className="text-sm text-slate-200">{question.question}</p>
              <p className="mt-2 text-xs text-slate-500">Aucun critère ouvert configurable.</p>
            </div>
          );
        }
        return (
          <div key={question.id} className="space-y-3 rounded-md border border-slate-800 p-4">
            <p className="text-sm font-medium text-slate-200">{question.question}</p>
            {criteres.map((critere) => {
              const mots = motsCritereSynthese(
                casId,
                question.id,
                critere.critereId,
                critere.variantes,
              );
              return (
                <div key={`${question.id}-${critere.libelle}`} className="space-y-2 border-l-2 border-slate-700 pl-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Critère « {critere.libelle} »
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mots.map(({ texte, source }) => (
                      <span
                        key={texte}
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${
                          source === 'admin'
                            ? 'bg-sky-950/50 text-sky-200'
                            : 'bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        {texte}
                        <button
                          type="button"
                          className="text-slate-400 hover:text-rose-300"
                          title="Retirer ce mot"
                          onClick={() => {
                            if (source === 'admin') {
                              retirerVarianteSynthese(casId, question.id, critere.critereId, texte);
                            } else {
                              retirerVarianteBaseSynthese(
                                casId,
                                question.id,
                                critere.critereId,
                                texte,
                              );
                            }
                            onChange();
                          }}
                          aria-label={`Retirer ${texte}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {mots.length === 0 && (
                      <span className="text-xs text-slate-600">Aucun mot accepté pour ce critère.</span>
                    )}
                  </div>
                  <AjoutVariante
                    onAjouter={(texte) => {
                      ajouterVarianteSynthese(casId, question.id, critere.critereId, texte);
                      onChange();
                    }}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function AjoutVariante({ onAjouter }: { onAjouter: (texte: string) => void }) {
  const [texte, setTexte] = useState('');
  return (
    <div className="flex gap-2">
      <input
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Ajouter un mot accepté"
        className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 outline-none focus:border-sky-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && texte.trim()) {
            onAjouter(texte.trim());
            setTexte('');
          }
        }}
      />
      <Bouton
        ton="neutre"
        disabled={!texte.trim()}
        onClick={() => {
          onAjouter(texte.trim());
          setTexte('');
        }}
      >
        Ajouter
      </Bouton>
    </div>
  );
}

export function AdminPanel() {
  const quitterAdmin = useSession((s) => s.quitterAdmin);
  const deconnexion = useAdminSession((s) => s.deconnexion);
  const [casId, setCasId] = useState(CAS_DISPONIBLES[0]!.id);
  const [onglet, setOnglet] = useState<'anamnese' | 'synthese'>('anamnese');
  const [revision, setRevision] = useState(0);
  const rafraichir = () => setRevision((n) => n + 1);

  const quitter = () => {
    deconnexion();
    quitterAdmin();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Administration</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enrichir les cas cliniques : questions d'anamnèse, questions de synthèse et mots
            acceptés pour les réponses ouvertes. Les modifications sont enregistrées localement
            dans ce navigateur.
          </p>
        </div>
        <div className="flex gap-2">
          <Bouton ton="discret" onClick={quitterAdmin}>
            Retour à l'accueil
          </Bouton>
          <Bouton ton="discret" onClick={quitter}>
            Déconnexion
          </Bouton>
        </div>
      </header>

      <Carte titre="Cas clinique">
        <div className="space-y-2">
          {CAS_DISPONIBLES.map((c) => {
            const ov = overridesCas(c.id);
            return (
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
                <div className="text-sm text-slate-400">
                  {ov.questions.length} question(s) anamnèse · {ov.syntheseQuestions.length}{' '}
                  question(s) synthèse
                </div>
              </button>
            );
          })}
        </div>
      </Carte>

      <nav className="flex gap-2 border-b border-slate-800 pb-2">
        {(
          [
            ['anamnese', 'Anamnèse / antécédents'],
            ['synthese', 'Synthèse'],
          ] as const
        ).map(([cle, label]) => (
          <button
            key={cle}
            type="button"
            onClick={() => setOnglet(cle)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              onglet === cle
                ? 'bg-sky-950/50 text-sky-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {onglet === 'anamnese' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Carte titre="Nouvelle question">
            <FormulaireQuestion casId={casId} onAjoute={rafraichir} />
          </Carte>
          <Carte titre="Questions ajoutées">
            <ListeQuestionsAdmin casId={casId} revision={revision} onChange={rafraichir} />
          </Carte>
        </div>
      )}

      {onglet === 'synthese' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Carte titre="Nouvelle question de synthèse">
              <FormulaireQuestionSynthese casId={casId} onAjoute={rafraichir} />
            </Carte>
            <Carte titre="Questions de synthèse ajoutées">
              <ListeQuestionsSyntheseAdmin casId={casId} revision={revision} onChange={rafraichir} />
            </Carte>
          </div>
          <Carte titre="Mots acceptés pour les réponses ouvertes">
            <p className="mb-4 text-xs text-slate-500">
              Ajoutez ou retirez les mots-clés reconnus pour chaque critère. Les mots en gris
              proviennent du cas de base ; ceux en bleu ont été ajoutés en administration.
            </p>
            <SectionMotsSynthese casId={casId} revision={revision} onChange={rafraichir} />
          </Carte>
        </div>
      )}
    </div>
  );
}

export function ModalConnexionAdmin({
  ouvert,
  onFermer,
  onConnecte,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onConnecte: () => void;
}) {
  const connexion = useAdminSession((s) => s.connexion);
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(false);

  if (!ouvert) return null;

  const valider = () => {
    if (connexion(motDePasse)) {
      setMotDePasse('');
      setErreur(false);
      onConnecte();
    } else {
      setErreur(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-xl">
        <h2 className="text-lg font-medium text-slate-100">Mode administrateur</h2>
        <p className="mt-1 text-sm text-slate-400">Mot de passe requis.</p>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => {
            setMotDePasse(e.target.value);
            setErreur(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && valider()}
          className="mt-4 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          autoFocus
        />
        {erreur && <p className="mt-2 text-sm text-rose-400">Mot de passe incorrect.</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Bouton ton="discret" onClick={onFermer}>
            Annuler
          </Bouton>
          <Bouton ton="principal" onClick={valider}>
            Connexion
          </Bouton>
        </div>
      </div>
    </div>
  );
}
