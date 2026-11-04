/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour les critères de sécurité et tooltips informatifs du BulletinMockup
 */

import { describe, it, expect } from 'vitest';
import { SECURITY_PILLARS, SecurityCriterionItem } from './BulletinMockup';

describe('BulletinMockup Security Criteria & Tooltips', () => {
  it('définit les 3 piliers d\'évaluation totalisant 100 points', () => {
    expect(SECURITY_PILLARS).toHaveLength(3);
    const totalPoints = SECURITY_PILLARS.reduce((sum, p) => sum + p.maxPoints, 0);
    expect(totalPoints).toBe(100);

    const pillarIds = SECURITY_PILLARS.map(p => p.id);
    expect(pillarIds).toEqual(['ssl', 'headers', 'exposure']);
  });

  it('inclut un tooltip informatif détaillé pour la version PHP du serveur', () => {
    const exposurePillar = SECURITY_PILLARS.find(p => p.id === 'exposure');
    expect(exposurePillar).toBeDefined();

    const phpCriterion = exposurePillar?.criteria.find((c: SecurityCriterionItem) => c.id === 'exposure-php');
    expect(phpCriterion).toBeDefined();
    expect(phpCriterion?.name).toContain('Version PHP');
    expect(phpCriterion?.tooltipTitle).toContain('Version PHP');
    expect(phpCriterion?.tooltipContent).toMatch(/PHP 7\.4|obsolète|WordPress|WooCommerce|correctif/i);
    expect(phpCriterion?.tooltipImpact).toMatch(/panier|vitesse|compromission|serveur/i);

    // Vérification de l'état selon la note
    expect(phpCriterion?.evalStatus.A.passed).toBe(true);
    expect(phpCriterion?.evalStatus.C.passed).toBe(false);
    expect(phpCriterion?.evalStatus.E.passed).toBe(false);
  });

  it('inclut un tooltip informatif détaillé pour les plugins & extensions WooCommerce obsolètes', () => {
    const exposurePillar = SECURITY_PILLARS.find(p => p.id === 'exposure');
    const pluginsCriterion = exposurePillar?.criteria.find((c: SecurityCriterionItem) => c.id === 'exposure-plugins');
    expect(pluginsCriterion).toBeDefined();
    expect(pluginsCriterion?.name).toContain('Plugins');
    expect(pluginsCriterion?.tooltipTitle).toContain('Plugins');
    expect(pluginsCriterion?.tooltipContent).toMatch(/85 % des intrusions|extensions|CVE|robots/i);
    expect(pluginsCriterion?.tooltipImpact).toMatch(/paiement|redirection|SEO|malveillant/i);

    expect(pluginsCriterion?.evalStatus.A.passed).toBe(true);
    expect(pluginsCriterion?.evalStatus.C.passed).toBe(false);
    expect(pluginsCriterion?.evalStatus.E.passed).toBe(false);
  });

  it('couvre tous les en-têtes HTTP de sécurité critiques (HSTS, CSP, X-Frame-Options)', () => {
    const headersPillar = SECURITY_PILLARS.find(p => p.id === 'headers');
    expect(headersPillar).toBeDefined();

    const critIds = headersPillar?.criteria.map((c: SecurityCriterionItem) => c.id);
    expect(critIds).toContain('header-hsts');
    expect(critIds).toContain('header-xframe');
    expect(critIds).toContain('header-csp');
    expect(critIds).toContain('header-xcontent');
    expect(critIds).toContain('header-referrer');

    // Vérification du tooltip CSP anti-Magecart
    const cspCrit = headersPillar?.criteria.find((c: SecurityCriterionItem) => c.id === 'header-csp');
    expect(cspCrit?.tooltipTitle).toMatch(/CSP|Content Security Policy/i);
    expect(cspCrit?.tooltipImpact).toMatch(/Magecart|PCI-DSS|skimming/i);
  });

  it('couvre le chiffrement SSL/TLS, la redirection 301 et la marge d\'expiration', () => {
    const sslPillar = SECURITY_PILLARS.find(p => p.id === 'ssl');
    expect(sslPillar).toBeDefined();

    const sslRedirect = sslPillar?.criteria.find((c: SecurityCriterionItem) => c.id === 'ssl-redirect');
    expect(sslRedirect?.tooltipContent).toMatch(/Port 80 -> 443|301|HTTPS/i);

    const sslCert = sslPillar?.criteria.find((c: SecurityCriterionItem) => c.id === 'ssl-cert');
    expect(sslCert?.tooltipContent).toMatch(/TLS 1\.2|TLS 1\.3|chiffrement/i);

    const sslExpiry = sslPillar?.criteria.find((c: SecurityCriterionItem) => c.id === 'ssl-expiry');
    expect(sslExpiry?.tooltipImpact).toMatch(/ventes|renouvellement|paralyse/i);
  });

  it('définit un tooltip explicatif complet pour chaque pilier de sécurité', () => {
    SECURITY_PILLARS.forEach((pillar) => {
      expect(pillar.tooltipTitle).toBeTruthy();
      expect(pillar.tooltipTitle).toContain(pillar.title.substring(3)); // titre sans le numéro
      expect(pillar.tooltipContent.length).toBeGreaterThan(30);
      expect(pillar.tooltipImpact.length).toBeGreaterThan(20);
    });
  });

  it('fournit des infobulles complètes avec titre, contenu et impact pour TOUS les critères sans exception', () => {
    const allCriteria = SECURITY_PILLARS.flatMap(p => p.criteria);
    expect(allCriteria.length).toBeGreaterThanOrEqual(10);

    allCriteria.forEach((crit) => {
      expect(crit.id).toBeTruthy();
      expect(crit.name).toBeTruthy();
      expect(crit.tooltipTitle).toBeTruthy();
      expect(crit.tooltipContent).toBeTruthy();
      expect(crit.tooltipImpact).toBeTruthy();
      expect(crit.tooltipContent.length).toBeGreaterThan(25);
      expect(crit.tooltipImpact.length).toBeGreaterThan(15);
      expect(crit.evalStatus.A).toBeDefined();
      expect(crit.evalStatus.C).toBeDefined();
      expect(crit.evalStatus.E).toBeDefined();
    });
  });
});
