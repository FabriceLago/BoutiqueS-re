/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires des types centraux et fabriques (src/types.test.ts)
 */

import { describe, it, expect } from 'vitest';
import {
  SecurityGrade,
  getGradeDisplayConfig,
  createDefaultAuditResult,
  AuditResult
} from './types.ts';

describe('Définitions TypeScript et fabrique AuditResult (src/types.ts)', () => {
  const grades: SecurityGrade[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  it('doit restituer une configuration visuelle complète pour chaque note A à F', () => {
    grades.forEach((grade) => {
      const config = getGradeDisplayConfig(grade);
      expect(config.grade).toBe(grade);
      expect(config.label).toBeDefined();
      expect(config.scoreRange).toBeDefined();
      expect(config.badgeColor).toBeDefined();
      expect(config.bgColor).toBeDefined();
      expect(config.tagline).toBeDefined();
    });
  });

  it('doit générer un AuditResult cohérent et complet avec les 3 piliers (100 pts)', () => {
    const audit = createDefaultAuditResult('https://boutique-demo.fr', 'C');
    expect(audit.url).toBe('https://boutique-demo.fr');
    expect(audit.domain).toBe('boutique-demo.fr');
    expect(audit.grade).toBe('C');
    expect(audit.score).toBe(65);

    // Vérification des 3 piliers
    expect(audit.pillars.ssl.maxPoints).toBe(35);
    expect(audit.pillars.headers.maxPoints).toBe(40);
    expect(audit.pillars.exposure.maxPoints).toBe(25);
    expect(audit.pillars.ssl.pointsEarned + audit.pillars.headers.pointsEarned + audit.pillars.exposure.pointsEarned).toBe(audit.score);

    // Vérification des recommandations
    expect(Array.isArray(audit.recommendations)).toBe(true);
    expect(audit.recommendations.length).toBeGreaterThan(0);
    audit.recommendations.forEach((rec) => {
      expect(typeof rec.priority).toBe('number');
      expect(rec.title).toBeDefined();
      expect(rec.description).toBeDefined();
      expect(rec.urgency).toBeDefined();
      expect(['facile', 'moyen', 'technique']).toContain(rec.difficulty);
    });

    // Risque financier et offre commerciale
    expect(audit.revenueRisk.dailyLossEstimate).toBeDefined();
    expect(audit.commercialOffer.primaryPrice).toBeDefined();
    expect(audit.trustBadgeEligible).toBe(false);
  });

  it('doit marquer le badge de confiance éligible uniquement pour la note A', () => {
    const auditA = createDefaultAuditResult('https://boutique-securisee.fr', 'A');
    expect(auditA.trustBadgeEligible).toBe(true);
    expect(auditA.score).toBeGreaterThanOrEqual(90);

    const auditE = createDefaultAuditResult('https://boutique-danger.fr', 'E');
    expect(auditE.trustBadgeEligible).toBe(false);
  });

  it('doit intégrer les spécifications avancées : benchmark sectoriel, directive NIS 2 et hébergeur/CDN', () => {
    const auditA = createDefaultAuditResult('https://boutique-mode.fr', 'A');
    expect(auditA.sectorBenchmark).toBeDefined();
    expect(auditA.sectorBenchmark?.percentile).toBe(84);
    expect(auditA.nis2Readiness?.status).toBe('conforme');
    expect(auditA.nis2Readiness?.scorePercent).toBeGreaterThanOrEqual(90);
    expect(auditA.hostAndCdn?.provider).toContain('Cloudflare');

    const auditC = createDefaultAuditResult('https://boutique-mode.fr', 'C');
    expect(auditC.sectorBenchmark?.percentile).toBe(48);
    expect(auditC.nis2Readiness?.status).toBe('partiel');
    expect(auditC.hostAndCdn?.cspCoverage).toBe('partielle');
  });
});
