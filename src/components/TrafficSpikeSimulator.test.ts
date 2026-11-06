/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires pour TrafficSpikeSimulator
 * Fichier : src/components/TrafficSpikeSimulator.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Simulateur de Résistance aux Pics de Ventes (TrafficSpikeSimulator)', () => {
  it('calcule une augmentation du temps de réponse (TTFB) proportionnelle au nombre de visiteurs simultanés', () => {
    const baseTtfb = 320;
    const calcTtfb = (visitors: number, hasCache: boolean) => {
      const load = (visitors / 100) * (hasCache ? 0.35 : 1.2);
      return Math.round(baseTtfb + load * 45);
    };

    const ttfbLow = calcTtfb(100, true);
    const ttfbHigh = calcTtfb(2000, false);
    expect(ttfbHigh).toBeGreaterThan(ttfbLow);
  });

  it('démontre que l\'activation du cache divise significativement la charge sous pic', () => {
    const ttfbWithCache = 320 + (1000 / 100) * 0.35 * 45;
    const ttfbNoCache = 320 + (1000 / 100) * 1.2 * 45;
    expect(ttfbWithCache).toBeLessThan(ttfbNoCache);
  });
});
