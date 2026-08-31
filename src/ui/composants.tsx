import type { ReactNode } from 'react';

type TonBouton = 'principal' | 'neutre' | 'discret' | 'danger';

const STYLES_BOUTON: Record<TonBouton, string> = {
  principal: 'bg-accent-deep hover:bg-accent text-white border-accent-deep',
  neutre: 'bg-surface hover:bg-cream-deep text-ink border-line',
  discret: 'bg-transparent hover:bg-cream-deep text-ink-muted border-line',
  danger: 'bg-blush-soft hover:bg-blush text-rose-800 border-blush',
};

export function Bouton({
  children,
  onClick,
  ton = 'neutre',
  disabled,
  actif,
  className = '',
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  ton?: TonBouton;
  disabled?: boolean;
  actif?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        actif ? 'border-accent-deep bg-accent-soft text-accent-deep' : STYLES_BOUTON[ton]
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Carte({
  titre,
  children,
  className = '',
  corpsClassName = 'p-4',
  actions,
}: {
  titre?: string;
  children: ReactNode;
  className?: string;
  /** Classes du corps : sert notamment a rendre un panneau defilable. */
  corpsClassName?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`ui-panel ${className}`}>
      {titre && (
        <header className="ui-panel-header flex shrink-0 items-center justify-between">
          <h2 className="ui-panel-title">{titre}</h2>
          {actions}
        </header>
      )}
      <div className={corpsClassName}>{children}</div>
    </section>
  );
}

export function Etiquette({ children, ton = 'neutre' }: { children: ReactNode; ton?: 'neutre' | 'positif' | 'negatif' }) {
  const styles = {
    neutre: 'bg-cream-deep text-ink-muted',
    positif: 'bg-sage-soft text-accent-deep',
    negatif: 'bg-blush-soft text-rose-700',
  }[ton];
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${styles}`}>{children}</span>
  );
}
