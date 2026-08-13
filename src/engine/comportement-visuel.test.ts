import { describe, expect, it } from 'vitest';
import {
  ORDRE_ETAPES_COMPORTEMENT_VISUEL,
  ordreComportementVisuelRespecte,
} from './comportement-visuel';

describe('comportement-visuel', () => {
  it('valide l ordre attendu lumiere mono-bino puis objet mono-bino', () => {
    expect(ordreComportementVisuelRespecte([...ORDRE_ETAPES_COMPORTEMENT_VISUEL])).toBe(true);
    expect(
      ordreComportementVisuelRespecte(['lumiereBino', 'lumiereMono', 'objetMono', 'objetBino']),
    ).toBe(false);
  });
});
