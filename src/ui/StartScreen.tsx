import { useState } from 'react';
import { CAS_DISPONIBLES, casCliniquePrepare } from '../cases';
import { useAdminSession } from '../engine/adminSession';
import { useSession, type Mode } from '../engine/session';
import { configModeleTete } from '../scene/modeles-tete';
import { ModalConnexionAdmin } from './AdminPanel';
import { Bouton, Carte } from './composants';

export function StartScreen() {
  const demarrer = useSession((s) => s.demarrer);
  const ouvrirAdmin = useSession((s) => s.ouvrirAdmin);
  const authentifie = useAdminSession((s) => s.authentifie);
  const [mode, setMode] = useState<Mode>('entrainement');
  const [casId, setCasId] = useState(CAS_DISPONIBLES[0]!.id);
  const [modalAdmin, setModalAdmin] = useState(false);
  const casBase = CAS_DISPONIBLES.find((c) => c.id === casId)!;
  const cas = casCliniquePrepare(casBase);
  const credit3d = configModeleTete(casId).credit;
  const questionsAdmin = cas.questions.length - casBase.questions.length;

  const accederAdmin = () => {
    if (authentifie) {
      ouvrirAdmin();
    } else {
      setModalAdmin(true);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 md:gap-8 md:p-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-deep">Orthoptix</p>
        <h1 className="text-3xl font-light tracking-tight text-ink md:text-4xl">
          Bilan orthoptique simulé
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-muted">
          Patient virtuel 3D pour les étudiants en ophtalmologie et en orthoptie.
        </p>
      </header>

      <Carte titre="Cas clinique">
        <div className="space-y-3">
          {CAS_DISPONIBLES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCasId(c.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                c.id === casId
                  ? 'border-accent-deep bg-accent-soft'
                  : 'border-line hover:border-accent/40'
              }`}
            >
              <div className="font-medium text-ink">{c.titre}</div>
              <div className="text-sm text-ink-muted">{c.resume}</div>
              {casCliniquePrepare(c).questions.length > c.questions.length && (
                <div className="mt-1 text-xs text-accent-deep/80">
                  +{casCliniquePrepare(c).questions.length - c.questions.length} question(s)
                  administrateur
                </div>
              )}
            </button>
          ))}
        </div>
      </Carte>

      <Carte titre="Mode">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setMode('entrainement')}
            className={`flex-1 rounded-xl border p-4 text-left ${
              mode === 'entrainement' ? 'border-accent-deep bg-accent-soft' : 'border-line'
            }`}
          >
            <div className="font-medium text-ink">Entraînement</div>
            <div className="text-sm text-ink-muted">
              Chaque geste est commenté immédiatement, avec la justification clinique.
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode('evaluation')}
            className={`flex-1 rounded-xl border p-4 text-left ${
              mode === 'evaluation' ? 'border-accent-deep bg-accent-soft' : 'border-line'
            }`}
          >
            <div className="font-medium text-ink">Évaluation</div>
            <div className="text-sm text-ink-muted">
              Aucun retour pendant le bilan : score et debriefing complets à la fin.
            </div>
          </button>
        </div>
      </Carte>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {cas.patient.prenom}, {cas.patient.age} ans. {cas.patient.motif}
        </p>
        <Bouton ton="principal" onClick={() => demarrer(casBase, mode)}>
          Commencer le bilan
        </Bouton>
      </div>

      {questionsAdmin > 0 && (
        <p className="text-xs text-accent-deep/80">
          Ce cas inclut {questionsAdmin} question(s) ajoutée(s) en administration.
        </p>
      )}

      <div className="flex justify-end">
        <Bouton ton="discret" onClick={accederAdmin}>
          Administration
        </Bouton>
      </div>

      <ModalConnexionAdmin
        ouvert={modalAdmin}
        onFermer={() => setModalAdmin(false)}
        onConnecte={() => {
          setModalAdmin(false);
          ouvrirAdmin();
        }}
      />

      {credit3d && (
        <p className="text-[11px] leading-relaxed text-ink-faint">
          Modèle 3D basé sur{' '}
          <a
            className="text-ink-muted underline decoration-line hover:text-accent-deep"
            href={credit3d.url}
            target="_blank"
            rel="noreferrer"
          >
            {credit3d.titre}
          </a>{' '}
          par{' '}
          <a
            className="text-ink-muted underline decoration-line hover:text-accent-deep"
            href={`https://sketchfab.com/${credit3d.auteur}`}
            target="_blank"
            rel="noreferrer"
          >
            {credit3d.auteur}
          </a>
          , sous licence{' '}
          <a
            className="text-ink-muted underline decoration-line hover:text-accent-deep"
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            {credit3d.licence}
          </a>
          . Monture 3D fournie séparément.
        </p>
      )}
    </div>
  );
}
