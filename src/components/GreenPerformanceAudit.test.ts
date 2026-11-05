/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour le Diagnostic Passif de Vitesse & Éco-Conception GreenIT
 */

import { describe, it, expect } from 'vitest';
import { computeGreenPerformanceMetrics } from './GreenPerformanceAudit.tsx';

describe('Diagnostic Passif de Vitesse & Éco-Conception GreenIT', () => {
  it('calcule un éco-index A et une empreinte CO2 basse pour une note A', () => {
    const { metrics, ecoGrade, co2Grams } = computeGreenPerformanceMetrics('A');
    expect(ecoGrade).toBe('A');
    expect(co2Grams).toBeLessThan(0.5);
    expect(metrics.length).toBe(4);

    const protocol = metrics.find(m => m.id === 'protocol');
    expect(protocol?.value).toContain('HTTP/3');

    const compression = metrics.find(m => m.id === 'compression');
    expect(compression?.value).toContain('Brotli');
  });

  it('alerte sur l\'absence de compression et la lenteur TTFB pour une note E', () => {
    const { metrics, ecoGrade, co2Grams } = computeGreenPerformanceMetrics('E');
    expect(ecoGrade).toBe('D');
    expect(co2Grams).toBeGreaterThan(1.0);

    const ttfb = metrics.find(m => m.id === 'ttfb');
    expect(ttfb?.status).toBe('danger');
    expect(ttfb?.value).toContain('1 120 ms');
  });
});
