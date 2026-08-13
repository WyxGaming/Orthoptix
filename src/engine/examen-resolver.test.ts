import { describe, expect, it } from 'vitest';
import {
  cleConditions,
  conditionsMesureAttendues,
  libelleConditionsMesure,
} from './examen-resolver';

describe('conditionsMesureAttendues', () => {
  it('liste SC, ASC et ASC+3 en VP', () => {
    expect(
      conditionsMesureAttendues({ choixCorrection: true, choixLoupesPlus3: true }, 'pres'),
    ).toEqual([
      { correction: 'sc' },
      { correction: 'asc' },
      { correction: 'asc', loupesPlus3: true },
    ]);
  });

  it('liste SC et ASC seulement en VL', () => {
    expect(conditionsMesureAttendues({ choixCorrection: true }, 'loin')).toEqual([
      { correction: 'sc' },
      { correction: 'asc' },
    ]);
  });
});

describe('cleConditions', () => {
  it('distingue les combinaisons', () => {
    expect(cleConditions({ correction: 'sc' })).toBe('sc');
    expect(cleConditions({ correction: 'asc', loupesPlus3: true })).toBe('asc+3');
  });
});

describe('libelleConditionsMesure', () => {
  it('libelle lisiblement chaque condition', () => {
    expect(libelleConditionsMesure({ correction: 'sc' })).toContain('SC');
    expect(libelleConditionsMesure({ correction: 'asc', loupesPlus3: true })).toContain('+3');
  });
});
