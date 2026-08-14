import type { CasClinique, CritereOuvert, QuestionAnamnese } from './types';

export const ADMIN_MOT_DE_PASSE = 'ortho2026';
const CLE_STOCKAGE = 'orthoptix-admin-overrides';

/** Repli quand localStorage est indisponible (tests, SSR). */
let memoireOverrides: AdminStorage = {};

export type CasAdminOverrides = {
  questions: QuestionAnamnese[];
  /** questionId → critereId → variantes ajoutées par l'administrateur. */
  syntheseVariantes: Record<string, Record<string, string[]>>;
};

export type AdminStorage = Record<string, CasAdminOverrides>;

const overridesVides = (): CasAdminOverrides => ({
  questions: [],
  syntheseVariantes: {},
});

export function lireOverrides(): AdminStorage {
  if (typeof localStorage !== 'undefined') {
    try {
      const brut = localStorage.getItem(CLE_STOCKAGE);
      if (brut) return JSON.parse(brut) as AdminStorage;
    } catch {
      /* ignore */
    }
  }
  return memoireOverrides;
}

export function ecrireOverrides(stockage: AdminStorage): void {
  memoireOverrides = stockage;
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(stockage));
}

/** Vide les overrides (tests). */
export function reinitialiserOverrides(): void {
  memoireOverrides = {};
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(CLE_STOCKAGE);
  }
}

export function overridesCas(casId: string): CasAdminOverrides {
  return lireOverrides()[casId] ?? overridesVides();
}

export function sauvegarderOverridesCas(casId: string, overrides: CasAdminOverrides): void {
  const stockage = lireOverrides();
  stockage[casId] = overrides;
  ecrireOverrides(stockage);
}

export function appliquerOverrides(
  cas: CasClinique,
  overrides: CasAdminOverrides = overridesVides(),
): CasClinique {
  const syntheseQuestions = cas.synthese.questions.map((question) => {
    if (question.type !== 'ouverte') return question;
    const ajouts = overrides.syntheseVariantes[question.id];
    if (!ajouts) return question;

    const enrichir = (criteres: CritereOuvert[]) =>
      criteres.map((critere) => ({
        ...critere,
        variantes: [...critere.variantes, ...(ajouts[critere.id] ?? [])],
      }));

    return {
      ...question,
      criteres: question.criteres ? enrichir(question.criteres) : undefined,
      alternatives: question.alternatives?.map((alt) => ({
        ...alt,
        criteres: enrichir(alt.criteres),
      })),
      bonusCriteres: question.bonusCriteres ? enrichir(question.bonusCriteres) : undefined,
    };
  });

  return {
    ...cas,
    questions: [...cas.questions, ...overrides.questions],
    synthese: { questions: syntheseQuestions },
  };
}

export function casAvecOverrides(cas: CasClinique): CasClinique {
  return appliquerOverrides(cas, overridesCas(cas.id));
}

export function verifierMotDePasse(motDePasse: string): boolean {
  return motDePasse === ADMIN_MOT_DE_PASSE;
}

export function idQuestionAdmin(): string {
  return `admin-${Date.now().toString(36)}`;
}

export function ajouterQuestion(
  casId: string,
  question: Omit<QuestionAnamnese, 'id'> & { id?: string },
): QuestionAnamnese {
  const overrides = overridesCas(casId);
  const nouvelle: QuestionAnamnese = {
    ...question,
    id: question.id ?? idQuestionAdmin(),
  };
  overrides.questions.push(nouvelle);
  sauvegarderOverridesCas(casId, overrides);
  return nouvelle;
}

export function retirerQuestion(casId: string, questionId: string): void {
  const overrides = overridesCas(casId);
  overrides.questions = overrides.questions.filter((q) => q.id !== questionId);
  sauvegarderOverridesCas(casId, overrides);
}

export function ajouterVarianteSynthese(
  casId: string,
  questionId: string,
  critereId: string,
  variante: string,
): void {
  const texte = variante.trim();
  if (!texte) return;
  const overrides = overridesCas(casId);
  if (!overrides.syntheseVariantes[questionId]) {
    overrides.syntheseVariantes[questionId] = {};
  }
  const liste = overrides.syntheseVariantes[questionId]![critereId] ?? [];
  if (liste.includes(texte)) return;
  overrides.syntheseVariantes[questionId]![critereId] = [...liste, texte];
  sauvegarderOverridesCas(casId, overrides);
}

export function retirerVarianteSynthese(
  casId: string,
  questionId: string,
  critereId: string,
  variante: string,
): void {
  const overrides = overridesCas(casId);
  const parCritere = overrides.syntheseVariantes[questionId];
  if (!parCritere?.[critereId]) return;
  parCritere[critereId] = parCritere[critereId]!.filter((v) => v !== variante);
  if (parCritere[critereId]!.length === 0) delete parCritere[critereId];
  if (Object.keys(parCritere).length === 0) delete overrides.syntheseVariantes[questionId];
  sauvegarderOverridesCas(casId, overrides);
}
