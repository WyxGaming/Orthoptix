import { useState } from 'react';
import { EYES, type BasePrisme, type Eye } from '../domain/ocular-model';
import { CATALOGUE_EXAMENS } from '../engine/exams';
import { useSession } from '../engine/session';
import type { ModeInteraction } from '../engine/types';
import { Bouton, Carte } from './composants';

/** Positions du regard, nommees du point de vue du patient et disposees comme a l'ecran. */
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
    { az: 25, el: -18, nom: 'Bas-droite' },
    { az: 0, el: -18, nom: 'Bas' },
    { az: -25, el: -18, nom: 'Bas-gauche' },
  ],
];

/** Ce que l'on cherche a neutraliser avec les prismes depend de l'epreuve en cours. */
const AIDE_PRISMES: Record<ModeInteraction, string> = {
  occlusion:
    'Montez la puissance jusqu a ce que le cache ne declenche plus aucun mouvement : le prisme neutralisant donne l angle. Un mouvement qui change de sens signe une sur-correction.',
  reflets: 'Montez la puissance jusqu a recentrer le reflet corneen de l oeil devie.',
  motilite: '',
  presentation: '',
};

const BASES: { valeur: BasePrisme; libelle: string }[] = [
  { valeur: 'temporale', libelle: 'Base temporale' },
  { valeur: 'nasale', libelle: 'Base nasale' },
  { valeur: 'superieure', libelle: 'Base superieure' },
  { valeur: 'inferieure', libelle: 'Base inferieure' },
];

function CommandesMotilite() {
  const deplacerCible = useSession((s) => s.deplacerCible);
  const gaze = useSession((s) => s.etat.gaze);

  return (
    <div>
      <div className="grid w-fit grid-cols-3 gap-1.5">
        {POSITIONS_REGARD.flat().map((p) => (
          <Bouton
            key={p.nom}
            actif={gaze.azimuthDeg === p.az && gaze.elevationDeg === p.el}
            onClick={() => deplacerCible({ azimuthDeg: p.az, elevationDeg: p.el })}
            className="w-32 justify-center text-xs"
          >
            {p.nom}
          </Bouton>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Mire tenue a 33 cm. Les positions sont nommees du cote du patient : le regard a droite se
        lit a gauche de l ecran, comme en consultation.
      </p>
    </div>
  );
}

function CommandesOcclusion() {
  const occlure = useSession((s) => s.occlure);
  const occlusion = useSession((s) => s.etat.occlusion);
  const oeilFixateur = useSession((s) => s.etat.oeilFixateur);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {EYES.map((oeil) => (
          <Bouton key={oeil} actif={occlusion === oeil} onClick={() => occlure(oeil)}>
            Cacher {oeil}
          </Bouton>
        ))}
        <Bouton actif={occlusion === 'aucune'} onClick={() => occlure('aucune')}>
          Decouvrir
        </Bouton>
      </div>
      <p className="text-xs text-slate-500">
        Commencez par un cache unilateral (restitution, preference de fixation), puis alternez
        sans temps binoculaire pour liberer l angle total. Oeil fixateur actuel :{' '}
        <span className="text-slate-300">{oeilFixateur}</span>.
      </p>
    </div>
  );
}

function CommandesPrismes({ aide }: { aide: string }) {
  const poserPrisme = useSession((s) => s.poserPrisme);
  const prismes = useSession((s) => s.etat.prismes);
  const [oeil, setOeil] = useState<Eye>('OD');
  const [base, setBase] = useState<BasePrisme>('temporale');
  const puissance = prismes[oeil]?.puissance ?? 0;

  const appliquer = (valeur: number) => {
    const bornee = Math.max(0, Math.min(80, valeur));
    poserPrisme(oeil, bornee === 0 ? null : { puissance: bornee, base });
  };

  return (
    <div className="space-y-2 rounded-md border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-500">Prisme devant</span>
        {EYES.map((e) => (
          <Bouton key={e} actif={oeil === e} onClick={() => setOeil(e)}>
            {e}
          </Bouton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {BASES.map((b) => (
          <Bouton
            key={b.valeur}
            actif={base === b.valeur}
            onClick={() => {
              setBase(b.valeur);
              if (puissance > 0) poserPrisme(oeil, { puissance, base: b.valeur });
            }}
          >
            {b.libelle}
          </Bouton>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Bouton onClick={() => appliquer(puissance - 2)}>−2</Bouton>
        <span className="w-24 text-center font-mono text-lg text-slate-100">{puissance} DP</span>
        <Bouton onClick={() => appliquer(puissance + 2)}>+2</Bouton>
        <Bouton ton="discret" onClick={() => appliquer(0)}>
          Retirer
        </Bouton>
      </div>
      <p className="text-xs text-slate-500">{aide}</p>
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
  const validerExamen = useSession((s) => s.validerExamen);
  const abandonnerExamen = useSession((s) => s.abandonnerExamen);

  const [mesure, setMesure] = useState('');
  const [interpretationId, setInterpretationId] = useState<string | null>(null);
  const [resultatRevele, setResultatRevele] = useState(false);

  if (!examenEnCours) {
    return (
      <Carte titre="Examen en cours" className="h-full">
        <p className="text-sm text-slate-500">
          Aucun examen en cours. Choisissez un examen dans l onglet Examens, ou passez a la
          synthese quand votre bilan vous parait complet.
        </p>
      </Carte>
    );
  }

  const definition = CATALOGUE_EXAMENS[examenEnCours];
  const examen = cas.examens[examenEnCours];
  const demandeMesure = Boolean(examen?.attendu) || definition.saisieMesure;

  const consigner = () => {
    const valeur = Number.parseFloat(mesure.replace(',', '.'));
    validerExamen({
      mesure: Number.isFinite(valeur) ? valeur : undefined,
      interpretationId: interpretationId ?? undefined,
    });
    setMesure('');
    setInterpretationId(null);
    setResultatRevele(false);
  };

  return (
    <Carte
      titre={definition.nom}
      className="flex h-full min-h-0 flex-col overflow-hidden"
      corpsClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      actions={
        definition.interaction === 'reflets' || definition.interaction === 'occlusion' ? (
          <Bouton ton="discret" onClick={() => setZoom(!zoom)}>
            {zoom ? 'Vue d ensemble' : 'Zoom sur les yeux'}
          </Bouton>
        ) : undefined
      }
    >
      <div className="defilement-fin min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <p className="text-sm text-slate-400">{definition.description}</p>

        {definition.distance === 'loin' && (
          <p className="rounded-md border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-200/90">
            Mire placee a 5 metres, hors du champ : l enfant fixe au-dessus de votre epaule et
            vous ne voyez plus le point lumineux.{' '}
            {definition.interaction === 'reflets'
              ? 'Les reflets que vous lisez sur les cornees sont ceux de cette lumiere lointaine.'
              : 'Seuls les mouvements des yeux sont lisibles.'}
          </p>
        )}

        {definition.interaction === 'motilite' && <CommandesMotilite />}
        {definition.interaction === 'occlusion' && <CommandesOcclusion />}
        {definition.prismes && <CommandesPrismes aide={AIDE_PRISMES[definition.interaction]} />}
        {definition.interaction === 'reflets' && !definition.prismes && (
          <p className="text-xs text-slate-500">
            Comparez la position du reflet a celle du centre pupillaire. Un millimetre de
            decentrement correspond a environ 15 dioptries prismatiques.
          </p>
        )}

        {definition.interaction === 'presentation' && (
          <div className="space-y-2">
            {!resultatRevele ? (
              <Bouton ton="principal" onClick={() => setResultatRevele(true)}>
                Presenter le test a {cas.patient.prenom}
              </Bouton>
            ) : (
              <p className="rounded-md border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200">
                {examen?.resultat ?? 'Le test ne montre rien de particulier.'}
              </p>
            )}
          </div>
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

        {examen?.interpretation &&
          (definition.interaction !== 'presentation' || resultatRevele) && (
          <fieldset className="space-y-1.5">
            <legend className="mb-1 text-sm text-slate-300">{examen.interpretation.question}</legend>
            {examen.interpretation.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setInterpretationId(option.id)}
                className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                  interpretationId === option.id
                    ? 'border-sky-500 bg-sky-950/40 text-slate-100'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {option.libelle}
              </button>
            ))}
          </fieldset>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-800 px-4 py-3">
        <Bouton
          ton="principal"
          onClick={consigner}
          disabled={
            (definition.interaction === 'presentation' && !resultatRevele) ||
            (Boolean(examen?.interpretation) && !interpretationId)
          }
        >
          Consigner l examen
        </Bouton>
        <Bouton ton="discret" onClick={abandonnerExamen}>
          Renoncer
        </Bouton>
      </div>
    </Carte>
  );
}
