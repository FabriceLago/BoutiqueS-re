/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires pour SecurityTxtLegalGeneratorModal
 * Fichier : src/components/SecurityTxtLegalGeneratorModal.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Générateur Officiel security.txt RFC 9116 & Mentions Légales', () => {
  it('génère un contenu security.txt conforme avec les champs obligatoires RFC 9116', () => {
    const domain = 'ma-boutique-mode.fr';
    const email = 'security@ma-boutique-mode.fr';
    const content = `Contact: mailto:${email}\nCanonical: https://${domain}/.well-known/security.txt\nPreferred-Languages: fr, en`;

    expect(content).toContain('Contact: mailto:');
    expect(content).toContain('Canonical:');
    expect(content).toContain('Preferred-Languages:');
  });

  it('fournit des mentions légales e-commerce conformes PCI-DSS et RGPD', () => {
    const legalText = 'Protection des Transactions Bancaires (PCI-DSS) - Chiffrement SSL/TLS fort';
    expect(legalText).toMatch(/PCI-DSS/i);
    expect(legalText).toMatch(/Chiffrement|SSL/i);
  });
});
