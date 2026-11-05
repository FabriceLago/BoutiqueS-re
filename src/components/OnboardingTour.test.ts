/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour les spécifications et étapes du système de visite guidée (OnboardingTour)
 */

import { describe, it, expect } from 'vitest';
import { BULLETIN_TOUR_STEPS, TourStep } from './OnboardingTour';

describe('Système de Visite Guidée (Onboarding Tour)', () => {

  describe('Définition des étapes du tour (BULLETIN_TOUR_STEPS)', () => {
    it('comprend 6 étapes clés couvrant l\'intégralité du score et du bulletin', () => {
      expect(BULLETIN_TOUR_STEPS).toHaveLength(6);
      const ids = BULLETIN_TOUR_STEPS.map((s: TourStep) => s.id);
      expect(ids).toEqual([
        'hero-score',
        'grade-scale',
        'top-priorities',
        'criteria-grid',
        'revenue-calculator',
        'conversion-actions'
      ]);
    });

    it('chaque étape cible un élément DOM valide avec un sélecteur data-testid', () => {
      BULLETIN_TOUR_STEPS.forEach((step: TourStep) => {
        expect(step.targetSelector).toMatch(/^\[data-testid="[a-z0-9-]+"]$/);
      });
    });

    it('fournit des explications pédagogiques vulgarisées sans jargon pour le commerçant', () => {
      BULLETIN_TOUR_STEPS.forEach((step: TourStep) => {
        expect(step.title.length).toBeGreaterThan(5);
        expect(step.description.length).toBeGreaterThan(30);
        expect(step.keyInsight.length).toBeGreaterThan(20);
        expect(step.badge).toMatch(/Étape \d \/ 6/);
      });
    });

    it('l\'étape 1 explique la note globale A à F et les 10 contrôles passifs', () => {
      const step1 = BULLETIN_TOUR_STEPS.find(s => s.id === 'hero-score');
      expect(step1).toBeDefined();
      expect(step1?.title).toContain('Note Globale');
      expect(step1?.targetSelector).toBe('[data-testid="hero-score-badge"]');
      expect(step1?.description).toMatch(/score sur 100 points|contrôles passifs|Note A|Note F/i);
    });

    it('l\'étape 2 explique le barème officiel et le radar des 5 dimensions', () => {
      const step2 = BULLETIN_TOUR_STEPS.find(s => s.id === 'grade-scale');
      expect(step2).toBeDefined();
      expect(step2?.title).toContain('Barème Officiel');
      expect(step2?.targetSelector).toBe('[data-testid="grade-scale-section"]');
      expect(step2?.description).toMatch(/radar Recharts|5 dimensions/i);
    });

    it('l\'étape 3 vulgarise les 3 actions prioritaires sans jargon technique', () => {
      const step3 = BULLETIN_TOUR_STEPS.find(s => s.id === 'top-priorities');
      expect(step3).toBeDefined();
      expect(step3?.title).toContain('3 Actions Prioritaires');
      expect(step3?.targetSelector).toBe('[data-testid="top-priorities-card"]');
      expect(step3?.description).toMatch(/85 % des risques d'intrusion/i);
    });

    it('l\'étape 4 guide l\'utilisateur sur les 10 critères et les infobulles au survol', () => {
      const step4 = BULLETIN_TOUR_STEPS.find(s => s.id === 'criteria-grid');
      expect(step4).toBeDefined();
      expect(step4?.title).toContain('10 Critères');
      expect(step4?.targetSelector).toBe('[data-testid="security-criteria-grid"]');
      expect(step4?.description).toMatch(/Survolez n'importe quelle ligne|infobulle technique/i);
    });

    it('l\'étape 5 met en avant le simulateur de Chiffre d\'Affaires à risque', () => {
      const step5 = BULLETIN_TOUR_STEPS.find(s => s.id === 'revenue-calculator');
      expect(step5).toBeDefined();
      expect(step5?.title).toContain('CA à Risque');
      expect(step5?.targetSelector).toBe('[data-testid="interactive-revenue-calculator"]');
      expect(step5?.description).toMatch(/volume de commandes|panier moyen|48 heures/i);
    });

    it('l\'étape 6 conclut sur l\'export officiel PDF et les formules de sécurisation', () => {
      const step6 = BULLETIN_TOUR_STEPS.find(s => s.id === 'conversion-actions');
      expect(step6).toBeDefined();
      expect(step6?.title).toContain('Export PDF');
      expect(step6?.targetSelector).toBe('[data-testid="pricing-conversion-section"]');
      expect(step6?.keyInsight).toMatch(/Veilleur Mensuel Automatique|69 €\/mois/i);
    });
  });

});
