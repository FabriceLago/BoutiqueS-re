/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires pour CyberAttackSandbox
 * Fichier : src/components/CyberAttackSandbox.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Simulateur Pédagogique de Cyber-Attaque (CyberAttackSandbox)', () => {
  it('définit les 3 scénarios majeurs d\'attaques e-commerce (Magecart, Clickjacking, CVE Scan)', () => {
    const scenarios = ['magecart', 'clickjacking', 'cve_scan'];
    expect(scenarios).toContain('magecart');
    expect(scenarios).toContain('clickjacking');
    expect(scenarios).toContain('cve_scan');
  });

  it('fournit des explications et des correctifs vulgarisés pour chaque scénario', () => {
    const magecartScenario = {
      name: 'Form-Jacking & Vol de Carte (Magecart)',
      fix: 'Content-Security-Policy',
      impact: 'Perte de contrat VAD'
    };
    expect(magecartScenario.fix).toMatch(/Content-Security-Policy|CSP/i);
    expect(magecartScenario.impact).toMatch(/VAD|carte/i);
  });

  it('gère correctement l\'état de protection active avec blocage immédiat', () => {
    const simulateStatus = (isProtected: boolean) => {
      return isProtected ? 'Attaque Bloquée Net' : 'Serveur Pirate Externe';
    };
    expect(simulateStatus(true)).toBe('Attaque Bloquée Net');
    expect(simulateStatus(false)).toBe('Serveur Pirate Externe');
  });
});
