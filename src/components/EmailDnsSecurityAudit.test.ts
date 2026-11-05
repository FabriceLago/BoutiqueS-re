/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires de l'Audit DNS Email (SPF, DMARC, DKIM)
 * Fichier : src/components/EmailDnsSecurityAudit.test.ts
 */

import { describe, it, expect } from 'vitest';
import { computeEmailDnsChecks } from './EmailDnsSecurityAudit.tsx';

describe('Audit DNS de sécurité email & Anti-Spoofing (EmailDnsSecurityAudit)', () => {
  it('contrôle les 4 protocoles majeurs (SPF, DMARC, DKIM, MX)', () => {
    const checks = computeEmailDnsChecks('maboutique.fr', 'A');
    expect(checks).toHaveLength(4);
    const ids = checks.map(c => c.id);
    expect(ids).toEqual(['spf', 'dmarc', 'dkim', 'mx']);
  });

  it('attribue un statut conforme pour une note A', () => {
    const checks = computeEmailDnsChecks('maboutique.fr', 'A');
    const spf = checks.find(c => c.id === 'spf');
    const dmarc = checks.find(c => c.id === 'dmarc');

    expect(spf?.status).toBe('passed');
    expect(dmarc?.status).toBe('passed');
    expect(dmarc?.recordValue).toContain('v=DMARC1');
  });

  it('détecte l\'absence de DMARC et un SPF permissif pour les notes intermédiaires et critiques', () => {
    const checksC = computeEmailDnsChecks('maboutique.fr', 'C');
    const dmarcC = checksC.find(c => c.id === 'dmarc');
    expect(dmarcC?.status).toBe('failed');

    const checksE = computeEmailDnsChecks('maboutique.fr', 'E');
    const spfE = checksE.find(c => c.id === 'spf');
    expect(spfE?.status).toBe('failed');
  });
});
