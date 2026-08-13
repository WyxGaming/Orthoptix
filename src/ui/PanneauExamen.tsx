import { useEffect, useState } from 'react';
import { EYES, type BasePrisme, type Eye } from '../domain/ocular-model';
import {
  ETAPES_COMPORTEMENT_VISUEL,
  ORDRE_ETAPES_COMPORTEMENT_VISUEL,
  RETOUR_ETAPE_COMPORTEMENT_VISUEL,
  type EtapeComportementVisuelId,
} from '../engine/comportement-visuel';
import { CATALOGUE_EXAMENS } from '../engine/exams';
import {
  cleConditions,
  conditionsMesureAttendues,
  libelleConditionsMesure,
} from '../engine/examen-resolver';
import { conditionsCorrespond } from '../engine/scoring';
import { melangeAleatoire, useSession } from '../engine/session';
import type { ConditionsExamen } from '../engine/types';
import { interpretationsExamen } from '../engine/types';
import { Bouton, Carte } from './composants';

/** Positions du regard, nommées du point de vue du patient et disposées comme à l'écran. */
const POSITIONS_REGARD = [
  [
    { az: 25, el: 18, nom: 'Haut-droite' },
    { az: 0, el: 18, nom: 'Haut' },
    { az: -25, el: 18, nom: 'Haut-gauche' },
  ],
  [
    { az: 25, el: 0, nom: 'Droite' },
    { az: 0, el: 0, nom: 'Primaire' },
    { az: -25, el: 0, nom: 'Gauche' },
  ],
  [
    { az: 25, el: -28, nom: 'Bas-droite' },
    { az: 0, el: -28, nom: 'Bas' },
    { az: -25, el: -28, nom: 'Bas-gauche' },
  ],
];

const BASES: { valeur: BasePrisme; libelle: string }[] = [
  { valeur: 'temporale', libelle: 'Base temporale' },
  { valeur: 'nasale', libelle: 'Base nasale' },
  { valeur: 'superieure', libelle: 'Base supérieure' },
  { valeur: 'inferieure', libelle: 'Base inférieure' },
];

function ComportementVisuel({
  propositions,
  sequence,
  onAjouter,
  onReinitialiser,
  termine,
}: {
  propositions: EtapeComportementVisuelId[];
  sequence: EtapeComportementVisuelId[];
  onAjouter: (id: EtapeComportementVisuelId) => void;
  onReinitialiser: () => void;
  termine: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-200">Que souhaitez-vous faire ?</p>
      <p className="text-xs text-slate-500">
        Appuyez sur les cases dans l ordre où vous réalisez les épreuves.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {propositions.map((id) => {
          const dejaChoisi = sequence.includes(id);
          return (
            <Bouton key={id} disabled={dejaChoisi || termine} onClick={() => onAjouter(id)}>
              {ETAPES_COMPORTEMENT_VISUEL[id].libelle}
            </Bouton>
          );
        })}
      </div>
      {sequence.length > 0 && (
        <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notes au fil de l examen
          </p>
          <ol className="space-y-2">
            {sequence.map((id, index) => (
              <li key={`${id}-${index}`} className="text-sm text-slate-200">
                <span>{ETAPES_COMPORTEMENT_VISUEL[id].libelle}</span>
                <span className="ml-2 text-emerald-400">— {RETOUR_ETAPE_COMPORTEMENT_VISUEL}</span>
              </li>
            ))}
          </ol>
          {!termine && (
            <div className="mt-2">
              <Bouton ton="discret" onClick={onReinitialiser}>
                Recommencer
              </Bouton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SaisieMesuresConditions({
  combos,
  mesures,
  onChange,
  dejaConsignes,
}: {
  combos: ConditionsExamen[];
  mesures: Record<string, string>;
  onChange: (cle: string, valeur: string) => void;
  dejaConsignes: Set<string>;
}) {
  return (
    <div className="space-y-2 rounded-md border border-slate-800 bg-slate-950/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Mesures en dioptries prismatiques
      </p>
      <p className="text-xs text-slate-500">
        Renseignez l angle pour chaque condition. Basculez les conditions ci-dessus pour observer
        le patient, puis saisissez la mesure correspondante.
      </p>
      <div className="space-y-2">
        {combos.map((combo) => {
          const cle = cleConditions(combo);
          const consigne = dejaConsignes.has(cle);
          return (
            <label
              key={cle}
              className={`flex items-center gap-2 text-sm ${consigne ? 'text-slate-500' : 'text-slate-300'}`}
            >
              <span className="min-w-[10rem]">{libelleConditionsMesure(combo)}</span>
              <input
                value={mesures[cle] ?? ''}
                onChange={(e) => onChange(cle, e.target.value)}
                inputMode="decimal"
                placeholder="0"
                disabled={consigne}
                className="w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-right font-mono text-slate-100 outline-none focus:border-sky-500 disabled:opacity-60"
              />
              <span className="text-slate-500">DP</span>
              {consigne && <span className="text-xs text-slate-600">consignée</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function CommandesConditions({
  options,
  conditions,
  onChange,
  distance,
}: {
  options: { choixCorrection?: boolean; choixLoupesPlus3?: boolean };
  conditions: ConditionsExamen;
  onChange: (conditions: ConditionsExamen) => void;
  distance?: 'pres' | 'loin';
}) {
  return (
    <div className="space-y-2 rounded-md border border-slate-800 bg-slate-950/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Conditions de l'examen
      </p>
      {options.choixCorrection && (
        <div className="flex flex-wrap gap-1.5">
          <Bouton
            actif={conditions.correction === 'asc'}
            onClick={() => onChange({ ...conditions, correction: 'asc' })}
          >
            Avec correction (ASC)
          </Bouton>
          <Bouton
            actif={conditions.correction === 'sc'}
            onClick={() => onChange({ ...conditions, correction: 'sc' })}
          >
            Sans correction (SC)
          </Bouton>
        </div>
      )}
      {options.choixLoupesPlus3 && distance !== 'loin' && (
        <Bouton
          actif={Boolean(conditions.loupesPlus3)}
          onClick={() => onChange({ ...conditions, loupesPlus3: !conditions.loupesPlus3 })}
        >
          Loupes +3 (VP)
        </Bouton>
      )}
    </div>
  );
}

function CommandesMotilite() {
  const deplacerCible = useSession((s) => s.deplacerCible);
  const gaze = useSession((s) => s.etat.gaze);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Positions du regard
      </p>
      <div className="grid grid-cols-3 gap-1">
        {POSITIONS_REGARD.flat().map((pos) => (
          <button
            key={pos.nom}
            type="button"
            onClick={() => deplacerCible({ azimuthDeg: pos.az, elevationDeg: pos.el })}
            className={`rounded-md border px-2 py-1.5 text-xs ${
              gaze.azimuthDeg === pos.az && gaze.elevationDeg === pos.el
                ? 'border-sky-500 bg-sky-950/40 text-sky-200'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {pos.nom}
          </button>
        ))}
      </div>
    </div>
  );
}

function CommandesOcclusion() {
  const occlure = useSession((s) => s.occlure);
  const occlusion = useSession((s) => s.etat.occlusion);

  return (
    <div className="flex flex-wrap gap-1.5">
      <Bouton actif={occlusion === 'aucune'} onClick={() => occlure('aucune')}>
        Aucune occlusion
      </Bouton>
      {EYES.map((oeil) => (
        <Bouton key={oeil} actif={occlusion === oeil} onClick={() => occlure(oeil)}>
          Occlusion {oeil}
        </Bouton>
      ))}
    </div>
  );
}

function CommandesPrismes() {
  const poserPrisme = useSession((s) => s.poserPrisme);
  const prismes = useSession((s) => s.etat.prismes);
  const [oeil, setOeil] = useState<Eye>('OD');
  const [puissance, setPuissance] = useState('');
  const [base, setBase] = useState<BasePrisme>('temporale');

  const appliquer = () => {
    const p = Number.parseFloat(puissance.replace(',', '.'));
    if (!Number.isFinite(p) || p <= 0) {
      poserPrisme(oeil, null);
      return;
    }
    poserPrisme(oeil, { puissance: p, base });
  };

  return (
    <div className="space-y-2 rounded-md border border-slate-800 bg-slate-950/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prismes</p>
      <div className="flex flex-wrap items-center gap-2">
        {EYES.map((e) => (
          <Bouton key={e} actif={oeil === e} onClick={() => setOeil(e)}>
            {e}
          </Bouton>
        ))}
        <input
          value={puissance}
          onChange={(e) => setPuissance(e.target.value)}
          placeholder="Puissance"
          className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
        />
        <select
          value={base}
          onChange={(e) => setBase(e.target.value as BasePrisme)}
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200"
        >
          {BASES.map((b) => (
            <option key={b.valeur} value={b.valeur}>
              {b.libelle}
            </option>
          ))}
        </select>
        <Bouton onClick={appliquer}>Appliquer</Bouton>
        {prismes[oeil] && (
          <Bouton ton="discret" onClick={() => poserPrisme(oeil, null)}>
            Retirer
          </Bouton>
        )}
      </div>
    </div>
  );
}

export function PanneauExamen({
  zoom,
  setZoom,
}: {
  zoom: boolean;
  setZoom: (v: boolean) => void;
}) {
  const examenEnCours = useSession((s) => s.examenEnCours);
  const cas = useSession((s) => s.cas);
  const conditionsExamen = useSession((s) => s.conditionsExamen);
  const definirConditionsExamen = useSession((s) => s.definirConditionsExamen);
  const validerExamen = useSession((s) => s.validerExamen);
  const abandonnerExamen = useSession((s) => s.abandonnerExamen);

  const [mesure, setMesure] = useState('');
  const [mesures, setMesures] = useState<Record<string, string>>({});
  const [interpretationsChoix, setInterpretationsChoix] = useState<Record<string, string>>({});
  const [resultatRevele, setResultatRevele] = useState(false);
  const [sequenceComportement, setSequenceComportement] = useState<EtapeComportementVisuelId[]>([]);
  const [propositionsComportement, setPropositionsComportement] = useState<EtapeComportementVisuelId[]>(
    [],
  );

  useEffect(() => {
    if (!examenEnCours) return;
    const definition = CATALOGUE_EXAMENS[examenEnCours];
    const options = cas.optionsExamen?.[examenEnCours];
    const journal = useSession.getState().journal;
    const prefill: Record<string, string> = {};

    if (options?.choixCorrection) {
      for (const combo of conditionsMesureAttendues(options, definition.distance)) {
        const cle = cleConditions(combo);
        const entree = journal.find(
          (a) =>
            a.type === 'examen' &&
            a.id === examenEnCours &&
            conditionsCorrespond(a.conditions ?? { correction: 'asc' }, combo),
        );
        if (entree?.type === 'examen' && entree.mesure !== undefined) {
          prefill[cle] = String(entree.mesure);
        }
      }
    }

    setMesure('');
    setMesures(prefill);
    setInterpretationsChoix({});
    setResultatRevele(false);
    setSequenceComportement([]);
    setPropositionsComportement(
      examenEnCours === 'comportementVisuel'
        ? melangeAleatoire(ORDRE_ETAPES_COMPORTEMENT_VISUEL)
        : [],
    );
  }, [examenEnCours, cas]);

  if (!examenEnCours) {
    return (
      <Carte titre="Examen en cours" className="h-full">
        <p className="text-sm text-slate-500">
          Aucun examen en cours. Choisissez un examen dans l'onglet Examens, ou passez à la
          synthèse quand votre bilan vous paraît complet.
        </p>
      </Carte>
    );
  }

  const definition = CATALOGUE_EXAMENS[examenEnCours];
  const optionsExamen = cas.optionsExamen?.[examenEnCours];
  const examen = cas.examens[examenEnCours];
  const ctxPreview = {
    examenId: examenEnCours,
    conditions: conditionsExamen,
    journal: useSession.getState().journal,
    indexJournal: useSession.getState().journal.length,
  };
  const examenEffectif = cas.resoudreExamen?.(ctxPreview) ?? examen;
  const demandeMesuresMultiples = Boolean(
    definition.saisieMesure && optionsExamen?.choixCorrection,
  );
  const combosMesure =
    demandeMesuresMultiples && optionsExamen
      ? conditionsMesureAttendues(optionsExamen, definition.distance)
      : [];
  const dejaConsignes = new Set(
    combosMesure
      .filter((combo) =>
        useSession
          .getState()
          .journal.some(
            (a) =>
              a.type === 'examen' &&
              a.id === examenEnCours &&
              conditionsCorrespond(a.conditions ?? { correction: 'asc' }, combo),
          ),
      )
      .map((combo) => cleConditions(combo)),
  );
  const demandeMesure =
    !demandeMesuresMultiples &&
    (Boolean(examenEffectif?.attendu) || definition.saisieMesure);
  const interpretationsExamenNiveau =
    examenEnCours === 'coverPres' && examen
      ? interpretationsExamen(examen)
      : [];
  const interpretationsConditionnelles =
    demandeMesuresMultiples ? [] : examenEffectif ? interpretationsExamen(examenEffectif) : [];
  const examenNonContributif = Boolean(examen?.nonContributifSiPresente);
  const interpretationsActives = interpretationsChoix;

  const mesureValide = (valeur: string) => {
    const n = Number.parseFloat(valeur.replace(',', '.'));
    return Number.isFinite(n);
  };

  const mesuresMultiplesCompletes =
    combosMesure
      .filter((combo) => !dejaConsignes.has(cleConditions(combo)))
      .every((combo) => mesureValide(mesures[cleConditions(combo)] ?? '')) ?? true;

  const alternanceComplete =
    examenEnCours !== 'coverPres' ||
    interpretationsExamenNiveau.every((interp) => Boolean(interpretationsChoix[interp.id]));

  const interpretationsCompletes =
    interpretationsConditionnelles.length === 0 ||
    interpretationsConditionnelles.every((interp) => Boolean(interpretationsChoix[interp.id]));

  const estComportementVisuel = definition.interaction === 'comportementVisuel';
  const comportementVisuelComplet =
    sequenceComportement.length === ORDRE_ETAPES_COMPORTEMENT_VISUEL.length;

  const peutConsigner =
    !examenNonContributif &&
    (estComportementVisuel
      ? comportementVisuelComplet && interpretationsCompletes
      : (definition.interaction !== 'presentation' || resultatRevele) &&
        (demandeMesuresMultiples
          ? (mesuresMultiplesCompletes && alternanceComplete) ||
            (dejaConsignes.size === combosMesure.length && combosMesure.length > 0)
          : interpretationsCompletes && (!demandeMesure || mesureValide(mesure))));

  const consigner = () => {
    if (estComportementVisuel) {
      validerExamen({
        etapesComportementVisuel: sequenceComportement,
        interpretationIds:
          interpretationsConditionnelles.length > 0 ? interpretationsChoix : undefined,
      });
    } else if (demandeMesuresMultiples && optionsExamen) {
      const passages = combosMesure
        .filter((combo) => !dejaConsignes.has(cleConditions(combo)))
        .map((conditions) => {
          const cle = cleConditions(conditions);
          const valeur = Number.parseFloat(mesures[cle]!.replace(',', '.'));
          const rattacherAlternance =
            examenEnCours === 'coverPres' &&
            conditions.correction === 'asc' &&
            !conditions.loupesPlus3;
          return {
            conditions,
            mesure: valeur,
            interpretationIds:
              rattacherAlternance && Object.keys(interpretationsChoix).length > 0
                ? interpretationsChoix
                : undefined,
          };
        });
      validerExamen({ passages });
    } else {
      const valeur = Number.parseFloat(mesure.replace(',', '.'));
      const interpretationIds =
        interpretationsConditionnelles.length > 0 ? interpretationsChoix : undefined;
      const interpretationId =
        interpretationsConditionnelles.length === 1
          ? interpretationsChoix[interpretationsConditionnelles[0]!.id]
          : undefined;
      validerExamen({
        mesure: Number.isFinite(valeur) ? valeur : undefined,
        interpretationId,
        interpretationIds,
      });
    }
    setMesure('');
    setMesures({});
    setInterpretationsChoix({});
    setResultatRevele(false);
    setSequenceComportement([]);
  };

  const choisirInterpretation = (interpId: string, optionId: string) => {
    setInterpretationsChoix((prev) => ({ ...prev, [interpId]: optionId }));
  };

  return (
    <Carte
      titre={definition.nom}
      className="flex h-full min-h-0 flex-col overflow-hidden"
      corpsClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      actions={
        definition.interaction === 'reflets' || definition.interaction === 'occlusion' ? (
          <Bouton ton="discret" onClick={() => setZoom(!zoom)}>
            {zoom ? "Vue d'ensemble" : 'Zoom sur les yeux'}
          </Bouton>
        ) : undefined
      }
    >
      <div className="defilement-fin min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <p className="text-sm text-slate-400">{definition.description}</p>

        {optionsExamen && (optionsExamen.choixCorrection || optionsExamen.choixLoupesPlus3) && (
          <CommandesConditions
            options={optionsExamen}
            conditions={conditionsExamen}
            onChange={definirConditionsExamen}
            distance={definition.distance}
          />
        )}

        {definition.distance === 'loin' && (
          <p className="rounded-md border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-200/90">
            Mire à 5 mètres, hors du champ visuel.
          </p>
        )}

        {definition.interaction === 'motilite' && <CommandesMotilite />}
        {definition.interaction === 'occlusion' && <CommandesOcclusion />}
        {definition.prismes && <CommandesPrismes />}

        {estComportementVisuel && (
          <ComportementVisuel
            propositions={propositionsComportement}
            sequence={sequenceComportement}
            onAjouter={(id) => setSequenceComportement((prev) => [...prev, id])}
            onReinitialiser={() => setSequenceComportement([])}
            termine={comportementVisuelComplet}
          />
        )}

        {definition.interaction === 'presentation' && (
          <div className="space-y-2">
            {!resultatRevele ? (
              <Bouton
                ton="principal"
                onClick={() => {
                  setResultatRevele(true);
                  if (examenNonContributif) validerExamen();
                }}
              >
                Présenter le test à {cas.patient.prenom}
              </Bouton>
            ) : (
              !examenNonContributif && (
                <p className="rounded-md border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200">
                  {examenEffectif?.resultat ?? 'Le test ne montre rien de particulier.'}
                </p>
              )
            )}
          </div>
        )}

        {demandeMesuresMultiples && (
          <SaisieMesuresConditions
            combos={combosMesure}
            mesures={mesures}
            dejaConsignes={dejaConsignes}
            onChange={(cle, valeur) => setMesures((prev) => ({ ...prev, [cle]: valeur }))}
          />
        )}

        {demandeMesure && (
          <label className="flex items-center gap-2 text-sm text-slate-300">
            Mesure retenue
            <input
              value={mesure}
              onChange={(e) => setMesure(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-right font-mono text-slate-100 outline-none focus:border-sky-500"
            />
            <span className="text-slate-500">dioptries prismatiques</span>
          </label>
        )}

        {interpretationsConditionnelles.length > 0 &&
          (estComportementVisuel
            ? comportementVisuelComplet
            : definition.interaction !== 'presentation' || resultatRevele) &&
          interpretationsConditionnelles.map((interp) => (
            <fieldset key={interp.id} className="space-y-1.5">
              <legend className="mb-1 text-sm text-slate-300">{interp.question}</legend>
              {interp.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choisirInterpretation(interp.id, option.id)}
                  className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                    interpretationsActives[interp.id] === option.id
                      ? 'border-sky-500 bg-sky-950/40 text-slate-100'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {option.libelle}
                </button>
              ))}
            </fieldset>
          ))}

        {interpretationsExamenNiveau.length > 0 &&
          interpretationsExamenNiveau.map((interp) => (
            <fieldset key={interp.id} className="space-y-1.5">
              <legend className="mb-1 text-sm text-slate-300">{interp.question}</legend>
              {interp.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choisirInterpretation(interp.id, option.id)}
                  className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                    interpretationsActives[interp.id] === option.id
                      ? 'border-sky-500 bg-sky-950/40 text-slate-100'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {option.libelle}
                </button>
              ))}
            </fieldset>
          ))}

        {demandeMesuresMultiples && combosMesure.length > 0 && (
          <ul className="text-xs text-slate-500">
            {combosMesure.map((combo) => {
              const cle = cleConditions(combo);
              const mesureOk = dejaConsignes.has(cle) || mesureValide(mesures[cle] ?? '');
              const complet = dejaConsignes.has(cle) || mesureOk;
              return (
                <li key={cle} className={complet ? 'text-emerald-500/80' : ''}>
                  {libelleConditionsMesure(combo)} {complet ? '✓' : '— mesure requise'}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t border-slate-800 p-3">
        <Bouton ton="discret" onClick={abandonnerExamen}>
          Abandonner
        </Bouton>
        {!examenNonContributif && (
          <Bouton ton="principal" disabled={!peutConsigner} onClick={consigner}>
            Consigner
          </Bouton>
        )}
      </div>
    </Carte>
  );
}
