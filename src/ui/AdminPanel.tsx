import { useState } from 'react';
import { CAS_DISPONIBLES, casCliniquePrepare } from '../cases';
import {
  ajouterQuestion,
  ajouterVarianteSynthese,
  overridesCas,
  retirerQuestion,
  retirerVarianteSynthese,
} from '../engine/admin';
import { useAdminSession } from '../engine/adminSession';
import { useSession } from '../engine/session';
import type { QuestionAnamnese } from '../engine/types';
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
        <span className="text-xs text-slate-600 self-center">
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

function SectionVariantesSynthese({
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
  const overrides = overridesCas(casId);
  const ouvertes = cas.synthese.questions.filter((q) => q.type === 'ouverte');

  if (ouvertes.length === 0) {
    return <p className="text-sm text-slate-500">Ce cas n'a pas de question ouverte en synthèse.</p>;
  }

  return (
    <div className="space-y-6">
      {ouvertes.map((question) => {
        if (question.type !== 'ouverte') return null;
        return (
          <div key={question.id} className="space-y-3 rounded-md border border-slate-800 p-4">
            <p className="text-sm text-slate-200">{question.question}</p>
            {question.criteres.map((critere) => {
              const ajoutees = overrides.syntheseVariantes[question.id]?.[critere.id] ?? [];
              return (
                <div key={critere.id} className="space-y-2 border-l-2 border-slate-700 pl-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Critère « {critere.id} »
                  </p>
                  <p className="text-xs text-slate-600">
                    Variantes de base : {critere.variantes.slice(0, 4).join(', ')}
                    {critere.variantes.length > 4 ? '…' : ''}
                  </p>
                  {ajoutees.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {ajoutees.map((variante) => (
                        <span
                          key={variante}
                          className="inline-flex items-center gap-1 rounded bg-sky-950/50 px-2 py-0.5 text-xs text-sky-200"
                        >
                          {variante}
                          <button
                            type="button"
                            className="text-sky-400 hover:text-rose-300"
                            onClick={() => {
                              retirerVarianteSynthese(casId, question.id, critere.id, variante);
                              onChange();
                            }}
                            aria-label={`Retirer ${variante}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <AjoutVariante
                    onAjouter={(texte) => {
                      ajouterVarianteSynthese(casId, question.id, critere.id, texte);
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
        placeholder="Nouvelle variante acceptée"
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
            Enrichir les cas cliniques : questions d'anamnèse / antécédents et variantes des
            réponses ouvertes en synthèse. Les ajouts sont enregistrés localement dans ce
            navigateur.
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
              <div className="text-sm text-slate-400">
                {overridesCas(c.id).questions.length} question(s) ajoutée(s)
              </div>
            </button>
          ))}
        </div>
      </Carte>

      <nav className="flex gap-2 border-b border-slate-800 pb-2">
        {(
          [
            ['anamnese', 'Anamnèse / antécédents'],
            ['synthese', 'Synthèse (réponses ouvertes)'],
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
        <Carte titre="Variantes acceptées supplémentaires">
          <SectionVariantesSynthese casId={casId} revision={revision} onChange={rafraichir} />
        </Carte>
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
