import type { ReactNode } from 'react';

type TonBouton = 'principal' | 'neutre' | 'discret' | 'danger';

const STYLES_BOUTON: Record<TonBouton, string> = {
  principal: 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500',
  neutre: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600',
  discret: 'bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700',
  danger: 'bg-rose-900/60 hover:bg-rose-800 text-rose-100 border-rose-700',
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
      className={`rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        actif ? 'bg-sky-700 border-sky-400 text-white' : STYLES_BOUTON[ton]
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
    <section
      className={`rounded-lg border border-slate-800 bg-slate-900/60 backdrop-blur ${className}`}
    >
      {titre && (
        <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-4 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{titre}</h2>
          {actions}
        </header>
      )}
      <div className={corpsClassName}>{children}</div>
    </section>
  );
}

export function Etiquette({ children, ton = 'neutre' }: { children: ReactNode; ton?: 'neutre' | 'positif' | 'negatif' }) {
  const styles = {
    neutre: 'bg-slate-800 text-slate-300',
    positif: 'bg-emerald-900/60 text-emerald-200',
    negatif: 'bg-rose-900/60 text-rose-200',
  }[ton];
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${styles}`}>{children}</span>;
}
