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
    <footer className="shrink-0 border-t border-line bg-surface/80 px-3 py-3">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2.5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PARTENAIRES.map(({ fichier, alt, large }) => (
            <div
              key={fichier}
              className={`flex items-center justify-center rounded-md border border-line bg-white px-1.5 py-1 ${
                large
                  ? 'h-11 max-w-[9rem] sm:h-12 sm:max-w-[10rem]'
                  : 'h-9 max-w-[7rem] sm:h-10 sm:max-w-[8rem]'
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

        <div className="flex max-w-3xl flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
          <div className="text-center text-[10px] leading-snug text-ink-faint sm:text-left">
            <p>© {annee} Simon BARBARAY, Maxence RATEAUX et Alice LECLERCQ.</p>
            <p>
              <a
                href={LICENCE_CC}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted underline decoration-line underline-offset-2 hover:text-ink"
              >
                CC BY-NC-ND 4.0
              </a>
              {' '}— reproduction interdite sans autorisation.
            </p>
          </div>
          <a
            href={LICENCE_CC}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Licence Creative Commons BY-NC-ND 4.0"
            className="shrink-0 opacity-90 transition-opacity hover:opacity-100"
          >
            <img
              src={urlPartenaire('cc-by-nc-nd.png')}
              alt="Licence CC BY-NC-ND 4.0"
              className="h-6 w-auto"
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
