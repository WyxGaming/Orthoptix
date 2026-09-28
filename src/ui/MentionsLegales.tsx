type MentionsLegalesProps = {
  onRetour?: () => void;
};

export function MentionsLegales({ onRetour }: MentionsLegalesProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:px-10 md:py-10">
      {onRetour && (
        <button
          type="button"
          onClick={onRetour}
          className="mb-6 text-sm text-ink-muted underline decoration-line underline-offset-2 hover:text-ink"
        >
          ← Retour
        </button>
      )}

      <article className="space-y-8 text-sm leading-relaxed text-ink md:text-[0.95rem]">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">Mentions légales</h1>
          <p className="text-ink-muted">
            <strong className="font-medium text-ink">Dernière mise à jour : 28/09/2026</strong>
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">1. Éditeurs du site</h2>
          <p>
            Le présent site est un projet pédagogique développé par{' '}
            <strong>Simon Barbaray et Maxence Rateaux</strong>, orthoptistes, rattachés à l&apos;
            <strong>Hôpital Necker – Enfants Malades</strong> et à la formation en orthoptie de l&apos;Université Paris
            Cité.
          </p>
          <p>
            Le site a pour objectif de proposer gratuitement un outil pédagogique consacré au vocabulaire utilisé en
            ophtalmologie et en orthoptie.
          </p>
          <h3 className="pt-1 font-medium text-ink">Contact</h3>
          <p>Pour toute question, remarque ou demande concernant le site :</p>
          <ul className="list-none space-y-3 pl-0">
            <li>
              <strong>Simon Barbaray</strong>
              <br />
              <a
                className="text-accent-deep underline decoration-line underline-offset-2 hover:text-ink"
                href="mailto:simon.barbaray@aphp.fr"
              >
                ✉️ simon.barbaray@aphp.fr
              </a>
            </li>
            <li>
              <strong>Maxence Rateaux</strong>
              <br />
              <a
                className="text-accent-deep underline decoration-line underline-offset-2 hover:text-ink"
                href="mailto:maxence.rateaux@aphp.fr"
              >
                ✉️ maxence.rateaux@aphp.fr
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">2. Hébergement</h2>
          <p>Le site est hébergé par :</p>
          <p>
            <strong>Vercel Inc.</strong>
            <br />
            440 N Barranca Avenue #4133
            <br />
            Covina, CA 91723
            <br />
            États-Unis
          </p>
          <p>Vercel fournit des services d&apos;hébergement et de déploiement d&apos;applications web.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">3. Objet du site</h2>
          <p>
            Ce site constitue une ressource pédagogique destinée principalement aux étudiants en orthoptie, mais
            également à toute personne souhaitant consulter ou approfondir le vocabulaire relatif à l&apos;ophtalmologie
            et à l&apos;orthoptie.
          </p>
          <p>
            Les contenus proposés comprennent notamment des définitions de termes médicaux et orthoptiques ainsi que des
            abréviations couramment utilisées dans ces domaines.
          </p>
          <p>L&apos;accès au site est libre et gratuit.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">4. Responsabilité</h2>
          <p>
            Les informations présentes sur ce site sont proposées à des fins exclusivement pédagogiques et informatives.
          </p>
          <p>
            Malgré le soin apporté à la rédaction, à la vérification et à la mise à jour des contenus, aucune garantie
            ne peut être donnée quant à leur exhaustivité, leur actualité ou leur adéquation à une situation clinique
            particulière.
          </p>
          <p>
            Les utilisateurs sont invités à se référer aux enseignements dispensés dans le cadre de leur formation, aux
            recommandations professionnelles et aux sources médicales de référence.
          </p>
          <p>
            Les éditeurs du site ne sauraient être tenus responsables de l&apos;utilisation qui pourrait être faite des
            informations qui y sont présentées.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">5. Propriété intellectuelle</h2>
          <p>
            Le site, sa structure, son organisation, sa présentation et les éléments originaux créés dans le cadre du
            projet sont protégés par les dispositions applicables en matière de propriété intellectuelle.
          </p>
          <p>
            Les contenus provenant de sources ou d&apos;ouvrages tiers restent soumis aux droits de leurs auteurs et
            éditeurs respectifs.
          </p>
          <p>Les principales sources utilisées pour l&apos;élaboration des définitions sont notamment :</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Lanthony P.</strong>, <em>Dictionnaire du strabisme : physiologie et clinique</em>, Maloine, Paris,
              1983 ; édition A. &amp; J. Péchereau, 2007.
            </li>
            <li>
              <strong>Académie nationale de médecine</strong>,{' '}
              <em>Dictionnaire de l&apos;Académie nationale de médecine</em>, ressource médicale en ligne.
            </li>
          </ul>
          <p>
            Les sources sont indiquées afin de permettre l&apos;identification et la vérification des références
            utilisées.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">6. Évolution du site</h2>
          <p>
            Le contenu du site est susceptible d&apos;être modifié, complété ou corrigé afin de tenir compte de
            l&apos;évolution des connaissances médicales et des suggestions des utilisateurs.
          </p>
          <p>
            Toute erreur ou proposition d&apos;amélioration peut être signalée aux responsables du site aux adresses de
            contact indiquées ci-dessus.
          </p>
        </section>
      </article>
    </div>
  );
}
