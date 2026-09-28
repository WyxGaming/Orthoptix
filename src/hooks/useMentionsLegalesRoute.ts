import { useCallback, useEffect, useState } from 'react';

const HASH = 'mentions-legales';

function isMentionsHash() {
  return typeof window !== 'undefined' && window.location.hash.replace(/^#/, '') === HASH;
}

export function useMentionsLegalesRoute() {
  const [open, setOpen] = useState(isMentionsHash);

  useEffect(() => {
    const sync = () => setOpen(isMentionsHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const openMentions = useCallback(() => {
    window.location.hash = HASH;
    setOpen(true);
  }, []);

  const closeMentions = useCallback(() => {
    const { pathname, search } = window.location;
    window.history.replaceState(null, '', `${pathname}${search}`);
    setOpen(false);
  }, []);

  return { mentionsOpen: open, openMentions, closeMentions };
}
