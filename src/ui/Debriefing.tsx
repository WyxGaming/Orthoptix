import { useSession } from '../engine/session';
import type { LigneScore } from '../engine/scoring';
import { Bouton, Carte, Etiquette } from './composants';

const STYLE_LIGNE: Record<LigneScore['nature'], string> = {
  acquis: 'border-emerald-800/70 bg-emerald-950/30',
  bonus: 'border-sky-800/70 bg-sky-950/30',
  manque: 'border-amber-800/70 bg-amber-950/20',
  malus: 'border-rose-800/70 bg-rose-950/30',
};

export function Debriefing() {
  const cas = useSession((s) => s.cas);
  const bilan = useSession((s) => s.bilan);
  const resultat = useSession((s) => s.resultat)();
  const rejouer = useSession((s) => s.rejouer);

  const parNature = (nature: LigneScore['nature']) =>
    resultat.lignes.filter((l) => l.nature === nature);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Debriefing — {cas.titre}</h1>
          <p className="text-slate-400">
            {cas.patient.prenom}, {cas.patient.ageLibelle ?? `${cas.patient.age} ans`}.
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-semibold text-sky-300">
            {resultat.total}
            <span className="text-lg text-slate-500"> / {resultat.max}</span>
          </div>
          <div className="text-sm text-slate-400">{resultat.pourcentage} % du bilan attendu</div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Carte titre="Détail du barème">
          <div className="space-y-4">
            {(['malus', 'manque', 'acquis', 'bonus'] as const).map((nature) => {
              const lignes = parNature(nature);
              if (lignes.length === 0) return null;
              return (
                <div key={nature}>
                  <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {nature === 'malus'
                      ? 'Gestes pénalisés'
                      : nature === 'manque'
                        ? 'Ce qui manque au bilan'
                        : nature === 'bonus'
                          ? 'Conduite du bilan'
                          : 'Ce qui est acquis'}
                  </h3>
                  <ul className="space-y-1.5">
                    {lignes.map((ligne, i) => (
                      <li
                        key={`${ligne.libelle}-${i}`}
                        className={`rounded-md border px-2.5 py-1.5 ${STYLE_LIGNE[ligne.nature]}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm text-slate-200">{ligne.libelle}</span>
                          <span className="shrink-0 font-mono text-xs text-slate-400">
                            {ligne.points > 0 ? '+' : ''}
                            {ligne.points}
                            {ligne.max > 0 && ` / ${ligne.max}`}
                          </span>
                        </div>
                        {ligne.commentaire && (
                          <p className="mt-1 text-xs text-slate-400">{ligne.commentaire}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Carte>

        <div className="space-y-5">
          <Carte titre="Compte rendu de l'expert">
            <ul className="space-y-2 text-sm text-slate-300">
              {cas.compteRenduExpert.map((ligne, i) => (
                <li key={i} className="border-l-2 border-sky-800 pl-2.5">
                  {ligne}
                </li>
              ))}
            </ul>
          </Carte>

          <Carte
            titre="Votre bilan"
            actions={<Etiquette>{bilan.length} éléments consignés</Etiquette>}
          >
            {bilan.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun élément consigné.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {bilan.map((ligne) => (
                  <li key={ligne.id} className="border-l-2 border-slate-700 pl-2.5">
                    <span className="text-xs font-medium text-sky-300">{ligne.titre} — </span>
                    <span className="text-slate-300">{ligne.contenu}</span>
                  </li>
                ))}
              </ul>
            )}
          </Carte>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Bouton ton="principal" onClick={rejouer}>
          Refaire ce bilan
        </Bouton>
      </div>
    </div>
  );
}
