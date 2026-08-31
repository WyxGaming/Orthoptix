type Partenaire = {
  fichier: string;
  alt: string;
  large?: boolean;
};

const PARTENAIRES: Partenaire[] = [
  { fichier: 'universite-paris-cite.png', alt: 'Université Paris Cité', large: true },
  { fichier: 'ap-hp-centre-upc.png', alt: 'AP-HP Centre Université Paris Cité' },
  { fichier: 'centre-borelli.jpg', alt: 'Centre Borelli' },
  { fichier: 'necker-enfants-malades.jpg', alt: 'Necker — Enfants malades, Hôpital universitaire' },
  { fichier: 'ophtara.jpg', alt: 'OPHTARA — Centre de maladies rares en ophtalmologie' },
];

const LICENCE_CC =
  'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr';

function urlPartenaire(fichier: string) {
  return `${import.meta.env.BASE_URL}partenaires/${fichier}`;
}

export function PiedDePageInstitutionnel() {
  const annee = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-line bg-surface/80 px-4 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {PARTENAIRES.map(({ fichier, alt, large }) => (
            <div
              key={fichier}
              className={`flex items-center justify-center rounded-lg border border-line bg-white px-2 py-1.5 ${
                large
                  ? 'h-16 max-w-[12rem] sm:h-20 sm:max-w-[14rem]'
                  : 'h-14 max-w-[9.5rem] sm:h-16 sm:max-w-[10.5rem]'
              }`}
            >
              <img
                src={urlPartenaire(fichier)}
                alt={alt}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className="max-w-2xl space-y-2 text-center text-[11px] leading-relaxed text-ink-faint">
          <p>
            © {annee} Simon BARBARAY, Maxence RATEAUX et Alice LECLERCQ. Tous droits réservés.
          </p>
          <p>
            Contenu diffusé sous licence{' '}
            <a
              href={LICENCE_CC}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted underline decoration-line underline-offset-2 hover:text-ink"
            >
              Creative Commons Attribution — Pas d&apos;utilisation commerciale — Pas de
              Modification 4.0 International
            </a>
            . Toute reproduction, diffusion ou adaptation sans autorisation est interdite.
          </p>
        </div>

        <a
          href={LICENCE_CC}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Licence Creative Commons BY-NC-ND 4.0"
          className="opacity-90 transition-opacity hover:opacity-100"
        >
          <img
            src={urlPartenaire('cc-by-nc-nd.png')}
            alt="Licence CC BY-NC-ND 4.0"
            className="h-8 w-auto"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </footer>
  );
}
