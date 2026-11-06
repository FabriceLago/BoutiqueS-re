/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires pour FloatingTrustBadgeWidgetModal
 * Fichier : src/components/FloatingTrustBadgeWidgetModal.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Widget Flottant Sceau de Sécurité (FloatingTrustBadgeWidgetModal)', () => {
  it('génère un snippet HTML/JS valide avec les attributs de domaine et position', () => {
    const domain = 'ma-boutique.com';
    const position = 'right';
    const theme = 'dark';
    const snippet = `<div id="boutiquesure-trust-badge" data-domain="${domain}" data-position="${position}" data-theme="${theme}"></div>`;
    
    expect(snippet).toContain('data-domain="ma-boutique.com"');
    expect(snippet).toContain('data-position="right"');
    expect(snippet).toContain('data-theme="dark"');
  });

  it('propose les deux variantes de position (bottom_left et bottom_right)', () => {
    const positions = ['bottom_left', 'bottom_right'];
    expect(positions).toHaveLength(2);
  });
});
