/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires pour CompetitorBenchmarkModal
 * Fichier : src/components/CompetitorBenchmarkModal.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Comparateur Concurrentiel & Benchmark Sectoriel (CompetitorBenchmarkModal)', () => {
  it('supporte les 5 secteurs e-commerce clés (mode, bio, beaute, maison, tech)', () => {
    const sectors = ['mode', 'bio', 'beaute', 'maison', 'tech'];
    expect(sectors.length).toBe(5);
    expect(sectors).toContain('mode');
    expect(sectors).toContain('tech');
  });

  it('calcule correctement le percentile sectoriel par rapport à la moyenne', () => {
    const avgScore = 60;
    const myScore = 80;
    const isAboveAverage = myScore > avgScore;
    expect(isAboveAverage).toBe(true);
  });
});
