import type { CasClinique, CritereOuvert, QuestionAnamnese, QuestionSynthese } from './types';

export const ADMIN_MOT_DE_PASSE = 'ortho2026';
const CLE_STOCKAGE = 'orthoptix-admin-overrides';

/** Repli quand localStorage est indisponible (tests, SSR). */
let memoireOverrides: AdminStorage = {};

export type CasAdminOverrides = {
  questions: QuestionAnamnese[];
  syntheseQuestions: QuestionSynthese[];
  /** questionId → critereId → variantes ajoutées par l'administrateur. */
  syntheseVariantes: Record<string, Record<string, string[]>>;
  /** questionId → critereId → variantes de base masquées par l'administrateur. */
  syntheseVariantesRetirees: Record<string, Record<string, string[]>>;
};

export type AdminStorage = Record<string, CasAdminOverrides>;

export type CritereSyntheseRef = {
  critereId: string;
  libelle: string;
  variantes: string[];
};

const overridesVides = (): CasAdminOverrides => ({
  questions: [],
  syntheseQuestions: [],
  syntheseVariantes: {},
  syntheseVariantesRetirees: {},
});

function normaliserOverrides(stockage: Partial<CasAdminOverrides> | undefined): CasAdminOverrides {
  return {
    questions: stockage?.questions ?? [],
    syntheseQuestions: stockage?.syntheseQuestions ?? [],
    syntheseVariantes: stockage?.syntheseVariantes ?? {},
    syntheseVariantesRetirees: stockage?.syntheseVariantesRetirees ?? {},
  };
}

export function lireOverrides(): AdminStorage {
  if (typeof localStorage !== 'undefined') {
    try {
      const brut = localStorage.getItem(CLE_STOCKAGE);
      if (brut) {
        const parse = JSON.parse(brut) as Record<string, Partial<CasAdminOverrides>>;
        return Object.fromEntries(
          Object.entries(parse).map(([id, valeur]) => [id, normaliserOverrides(valeur)]),
        );
      }
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
  return normaliserOverrides(lireOverrides()[casId]);
}

export function sauvegarderOverridesCas(casId: string, overrides: CasAdminOverrides): void {
  const stockage = lireOverrides();
  stockage[casId] = overrides;
  ecrireOverrides(stockage);
}

/** Liste les critères d'une question ouverte (y compris alternatives et bonus). */
export function criteresOuvertsQuestion(question: QuestionSynthese): CritereSyntheseRef[] {
  if (question.type !== 'ouverte') return [];
  const refs: CritereSyntheseRef[] = [];
  for (const critere of question.criteres ?? []) {
    refs.push({ critereId: critere.id, libelle: critere.id, variantes: critere.variantes });
  }
  for (const alt of question.alternatives ?? []) {
    for (const critere of alt.criteres) {
      refs.push({
        critereId: critere.id,
        libelle: `${alt.id ?? 'option'} · ${critere.id}`,
        variantes: critere.variantes,
      });
    }
  }
  for (const critere of question.bonusCriteres ?? []) {
    refs.push({
      critereId: critere.id,
      libelle: `bonus · ${critere.id}`,
      variantes: critere.variantes,
    });
  }
  return refs;
}

function enrichirCriteres(
  criteres: CritereOuvert[],
  ajouts: Record<string, string[]>,
  retraits: Record<string, string[]>,
): CritereOuvert[] {
  return criteres.map((critere) => ({
    ...critere,
    variantes: [
      ...critere.variantes.filter((v) => !(retraits[critere.id] ?? []).includes(v)),
      ...(ajouts[critere.id] ?? []),
    ],
  }));
}

function appliquerVariantesQuestion(
  question: QuestionSynthese,
  ajoutsParQuestion: Record<string, string[]>,
  retraitsParQuestion: Record<string, string[]>,
): QuestionSynthese {
  if (question.type !== 'ouverte') return question;
  const ajouts = ajoutsParQuestion;
  const retraits = retraitsParQuestion;
  return {
    ...question,
    criteres: question.criteres
      ? enrichirCriteres(question.criteres, ajouts, retraits)
      : undefined,
    alternatives: question.alternatives?.map((alt) => ({
      ...alt,
      criteres: enrichirCriteres(alt.criteres, ajouts, retraits),
    })),
    bonusCriteres: question.bonusCriteres
      ? enrichirCriteres(question.bonusCriteres, ajouts, retraits)
      : undefined,
  };
}

export function appliquerOverrides(
  cas: CasClinique,
  overrides: CasAdminOverrides = overridesVides(),
): CasClinique {
  const appliquer = (question: QuestionSynthese) =>
    appliquerVariantesQuestion(
      question,
      overrides.syntheseVariantes[question.id] ?? {},
      overrides.syntheseVariantesRetirees[question.id] ?? {},
    );

  return {
    ...cas,
    questions: [...cas.questions, ...overrides.questions],
    synthese: {
      questions: [
        ...cas.synthese.questions.map(appliquer),
        ...overrides.syntheseQuestions.map(appliquer),
      ],
    },
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

export function ajouterQuestionSynthese(
  casId: string,
  question:
    | (Omit<Extract<QuestionSynthese, { type: 'ouverte' }>, 'id'> & { id?: string })
    | (Omit<Extract<QuestionSynthese, { type: 'qcm' }>, 'id'> & { id?: string })
    | (Omit<Extract<QuestionSynthese, { type: 'ouiNon' }>, 'id'> & { id?: string }),
): QuestionSynthese {
  const overrides = overridesCas(casId);
  const nouvelle = { ...question, id: question.id ?? idQuestionAdmin() } as QuestionSynthese;
  overrides.syntheseQuestions.push(nouvelle);
  sauvegarderOverridesCas(casId, overrides);
  return nouvelle;
}

export function retirerQuestionSynthese(casId: string, questionId: string): void {
  const overrides = overridesCas(casId);
  overrides.syntheseQuestions = overrides.syntheseQuestions.filter((q) => q.id !== questionId);
  delete overrides.syntheseVariantes[questionId];
  delete overrides.syntheseVariantesRetirees[questionId];
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
  const retraits = overrides.syntheseVariantesRetirees[questionId]?.[critereId] ?? [];
  if (retraits.includes(texte)) {
    overrides.syntheseVariantesRetirees[questionId]![critereId] = retraits.filter((v) => v !== texte);
    if (overrides.syntheseVariantesRetirees[questionId]![critereId]!.length === 0) {
      delete overrides.syntheseVariantesRetirees[questionId]![critereId];
    }
    if (Object.keys(overrides.syntheseVariantesRetirees[questionId]!).length === 0) {
      delete overrides.syntheseVariantesRetirees[questionId];
    }
    sauvegarderOverridesCas(casId, overrides);
    return;
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
  if (parCritere?.[critereId]?.includes(variante)) {
    parCritere[critereId] = parCritere[critereId]!.filter((v) => v !== variante);
    if (parCritere[critereId]!.length === 0) delete parCritere[critereId];
    if (Object.keys(parCritere).length === 0) delete overrides.syntheseVariantes[questionId];
    sauvegarderOverridesCas(casId, overrides);
  }
}

export function retirerVarianteBaseSynthese(
  casId: string,
  questionId: string,
  critereId: string,
  variante: string,
): void {
  const texte = variante.trim();
  if (!texte) return;
  const overrides = overridesCas(casId);
  if (!overrides.syntheseVariantesRetirees[questionId]) {
    overrides.syntheseVariantesRetirees[questionId] = {};
  }
  const liste = overrides.syntheseVariantesRetirees[questionId]![critereId] ?? [];
  if (liste.includes(texte)) return;
  overrides.syntheseVariantesRetirees[questionId]![critereId] = [...liste, texte];
  const ajouts = overrides.syntheseVariantes[questionId]?.[critereId] ?? [];
  if (ajouts.includes(texte)) {
    retirerVarianteSynthese(casId, questionId, critereId, texte);
    return;
  }
  sauvegarderOverridesCas(casId, overrides);
}

/** Mots effectifs affichés pour un critère (base ± overrides admin). */
export function motsCritereSynthese(
  casId: string,
  questionId: string,
  critereId: string,
  variantesBase: string[],
): { texte: string; source: 'base' | 'admin' }[] {
  const overrides = overridesCas(casId);
  const ajouts = overrides.syntheseVariantes[questionId]?.[critereId] ?? [];
  const retraits = new Set(overrides.syntheseVariantesRetirees[questionId]?.[critereId] ?? []);
  return [
    ...variantesBase
      .filter((texte) => !retraits.has(texte))
      .map((texte) => ({ texte, source: 'base' as const })),
    ...ajouts.map((texte) => ({ texte, source: 'admin' as const })),
  ];
}
