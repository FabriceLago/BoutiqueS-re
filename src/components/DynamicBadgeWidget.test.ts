/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour le Widget Dynamique SVG du Badge de Sécurité
 */

import { describe, it, expect } from 'vitest';
import { generateBadgeSvgCode } from './DynamicBadgeWidget.tsx';

describe('Widget Dynamique SVG du Badge de Sécurité', () => {
  it('génère un code SVG valide contenant la note et le libellé officiel', () => {
    const svg = generateBadgeSvgCode('maboutique.fr', 'A', 98, 'dark');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('BOUTIQUE PROTÉGÉE');
    expect(svg).toContain('NOTE A');
    expect(svg).toContain('width="280"');
  });

  it('adapte les couleurs de fond selon le thème sélectionné', () => {
    const darkSvg = generateBadgeSvgCode('maboutique.fr', 'A', 98, 'dark');
    const lightSvg = generateBadgeSvgCode('maboutique.fr', 'A', 98, 'light');

    expect(darkSvg).toContain('fill="#0F1B2D"');
    expect(lightSvg).toContain('fill="#FFFFFF"');
  });
});
