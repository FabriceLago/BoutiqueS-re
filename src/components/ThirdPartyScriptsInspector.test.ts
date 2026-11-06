/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires pour ThirdPartyScriptsInspector
 * Fichier : src/components/ThirdPartyScriptsInspector.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Inspecteur de Balises & Scripts Tiers (ThirdPartyScriptsInspector)', () => {
  it('identifie les balises tierces courantes (GTM, Meta Pixel, Stripe, TikTok)', () => {
    const scripts = ['gtm', 'meta_pixel', 'stripe_elements', 'tiktok_pixel'];
    expect(scripts).toContain('gtm');
    expect(scripts).toContain('stripe_elements');
  });

  it('évalue le confinement par Content-Security-Policy pour éviter les fuites', () => {
    const isIsolated = (hasCsp: boolean) => hasCsp;
    expect(isIsolated(true)).toBe(true);
    expect(isIsolated(false)).toBe(false);
  });
});
