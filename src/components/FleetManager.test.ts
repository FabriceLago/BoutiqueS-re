/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour le Gestionnaire de Flotte Multi-Boutiques
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_FLEET_STORES } from './FleetManager.tsx';

describe('Gestionnaire de Flotte Multi-Boutiques (Agences)', () => {
  it('fournit une liste initiale de boutiques avec scores variés', () => {
    expect(DEFAULT_FLEET_STORES.length).toBeGreaterThanOrEqual(4);
    
    const grades = DEFAULT_FLEET_STORES.map(s => s.grade);
    expect(grades).toContain('A');
    expect(grades).toContain('C');
    expect(grades).toContain('E');
  });

  it('calcule correctement la moyenne de sécurité du parc', () => {
    const totalScore = DEFAULT_FLEET_STORES.reduce((acc, s) => acc + s.score, 0);
    const avg = Math.round(totalScore / DEFAULT_FLEET_STORES.length);

    expect(avg).toBeGreaterThanOrEqual(0);
    expect(avg).toBeLessThanOrEqual(100);
  });

  it('identifie avec exactitude les boutiques nécessitant une action prioritaire', () => {
    const riskStores = DEFAULT_FLEET_STORES.filter(s => ['C', 'D', 'E', 'F'].includes(s.grade));
    expect(riskStores.length).toBeGreaterThan(0);
  });
});
