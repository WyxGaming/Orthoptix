import { create } from 'zustand';
import { verifierMotDePasse } from './admin';

type AdminSessionState = {
  authentifie: boolean;
  connexion: (motDePasse: string) => boolean;
  deconnexion: () => void;
};

export const useAdminSession = create<AdminSessionState>((set) => ({
  authentifie: false,
  connexion: (motDePasse) => {
    const ok = verifierMotDePasse(motDePasse);
    if (ok) set({ authentifie: true });
    return ok;
  },
  deconnexion: () => set({ authentifie: false }),
}));
