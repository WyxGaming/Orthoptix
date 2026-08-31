const PARTENAIRES = [
  { fichier: "universite-paris-cite.png", alt: "Université Paris Cité" },
  { fichier: "ap-hp-centre-upc.png", alt: "AP-HP Centre Université Paris Cité" },
  { fichier: "centre-borelli.jpg", alt: "Centre Borelli" },
  { fichier: "necker-enfants-malades.jpg", alt: "Necker — Enfants malades, Hôpital universitaire" },
  { fichier: "ophtara.jpg", alt: "OPHTARA — Centre de maladies rares en ophtalmologie" },
];

const LICENCE_CC = "https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr";

function urlPartenaire(fichier) {
  return `${import.meta.env.BASE_URL}partenaires/${fichier}`;
}

export default function PiedDePageInstitutionnel() {
  const annee = new Date().getFullYear();

  return (
    <footer className="og-site-footer">
      <div className="og-site-footer-inner">
        <div className="og-partner-logos">
          {PARTENAIRES.map(({ fichier, alt }) => (
            <div key={fichier} className="og-partner-logo-wrap">
              <img
                src={urlPartenaire(fichier)}
                alt={alt}
                className="og-partner-logo"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className="og-site-footer-legal">
          <p>
            © {annee} Simon BARBARAY, Maxence RATEAUX et Alice LECLERCQ. Tous droits réservés.
          </p>
          <p>
            Contenu diffusé sous licence{" "}
            <a href={LICENCE_CC} target="_blank" rel="noopener noreferrer">
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
          className="og-cc-badge-link"
        >
          <img
            src={urlPartenaire("cc-by-nc-nd.png")}
            alt="Licence CC BY-NC-ND 4.0"
            className="og-cc-badge"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </footer>
  );
}
