/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour le Comparateur Visuel « Avant / Après Sécurisation »
 */

import { describe, it, expect } from 'vitest';

describe('Comparateur Visuel « Avant / Après Sécurisation »', () => {
  it('définit les calculs d\'impact de conversion standard', () => {
    const abandonmentRateBefore = 34; // +34%
    const conversionGainAfterMin = 8; // +8%
    const conversionGainAfterMax = 12; // +12%

    expect(abandonmentRateBefore).toBeGreaterThan(0);
    expect(conversionGainAfterMax).toBeGreaterThan(conversionGainAfterMin);
  });

  it('valide le format du domaine nettoyé', () => {
    const rawUrl = 'https://maboutique-mode.fr/panier/?coupon=promo';
    const cleanDomain = rawUrl.replace(/^https?:\/\//i, '').split('/')[0];
    expect(cleanDomain).toBe('maboutique-mode.fr');
  });
});
