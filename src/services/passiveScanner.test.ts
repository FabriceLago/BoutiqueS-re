/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires du moteur d'analyse passive (Vitest)
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeHeaders,
  evaluateSecurityHeaders,
  evaluateHtmlExposure,
  evaluateSslAndRedirection,
  calculateGrade,
  runPassiveScanAnalysis,
  detectPaymentGateways,
  estimateRevenueRisk,
  buildCommercialOffer,
  calculateProgressDelta,
  RawScanInput
} from './passiveScanner.ts';

describe('1. Normalisation des en-têtes HTTP', () => {
  it('doit convertir les clés en minuscules et retirer les espaces inutiles', () => {
    const rawHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains ',
      'X-FRAME-OPTIONS': ' SAMEORIGIN',
      'Content-Type': 'text/html; charset=UTF-8',
      'Undefined-Header': undefined
    };

    const normalized = normalizeHeaders(rawHeaders);

    expect(normalized['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
    expect(normalized['x-frame-options']).toBe('SAMEORIGIN');
    expect(normalized['content-type']).toBe('text/html; charset=UTF-8');
    expect(normalized['undefined-header']).toBeUndefined();
  });
});

describe('2. Évaluation des en-têtes de sécurité HTTP', () => {
  it('doit valider la présence de HSTS quand max-age est suffisant', () => {
    const headersOk = { 'strict-transport-security': 'max-age=31536000; includeSubDomains' };
    const resultsOk = evaluateSecurityHeaders(headersOk);
    const hstsCheck = resultsOk.find(c => c.id === 'header_hsts');

    expect(hstsCheck?.passed).toBe(true);
    expect(hstsCheck?.earnedPoints).toBe(10);

    const headersMissing = {};
    const resultsMissing = evaluateSecurityHeaders(headersMissing);
    const hstsMissingCheck = resultsMissing.find(c => c.id === 'header_hsts');

    expect(hstsMissingCheck?.passed).toBe(false);
    expect(hstsMissingCheck?.earnedPoints).toBe(0);
    expect(hstsMissingCheck?.recommendation).toBeDefined();
  });

  it('doit valider X-Frame-Options (SAMEORIGIN, DENY ou via CSP frame-ancestors)', () => {
    const headersXfo = { 'x-frame-options': 'SAMEORIGIN' };
    const resultsXfo = evaluateSecurityHeaders(headersXfo);
    expect(resultsXfo.find(c => c.id === 'header_xframe')?.passed).toBe(true);

    const headersCspAncestors = { 'content-security-policy': "default-src 'self'; frame-ancestors 'none';" };
    const resultsCspAncestors = evaluateSecurityHeaders(headersCspAncestors);
    expect(resultsCspAncestors.find(c => c.id === 'header_xframe')?.passed).toBe(true);

    const headersNone = {};
    const resultsNone = evaluateSecurityHeaders(headersNone);
    expect(resultsNone.find(c => c.id === 'header_xframe')?.passed).toBe(false);
  });

  it('doit valider X-Content-Type-Options: nosniff', () => {
    const headersOk = { 'x-content-type-options': 'nosniff' };
    expect(evaluateSecurityHeaders(headersOk).find(c => c.id === 'header_xcontent')?.passed).toBe(true);

    const headersMissing = {};
    expect(evaluateSecurityHeaders(headersMissing).find(c => c.id === 'header_xcontent')?.passed).toBe(false);
  });

  it('doit évaluer Content-Security-Policy (CSP)', () => {
    const headersWithCsp = { 'content-security-policy': "default-src 'self' https:; script-src 'self'" };
    expect(evaluateSecurityHeaders(headersWithCsp).find(c => c.id === 'header_csp')?.passed).toBe(true);

    const headersNoCsp = {};
    expect(evaluateSecurityHeaders(headersNoCsp).find(c => c.id === 'header_csp')?.passed).toBe(false);
  });

  it('doit valider Referrer-Policy et Permissions-Policy', () => {
    const headers = {
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=()'
    };
    const results = evaluateSecurityHeaders(headers);

    expect(results.find(c => c.id === 'header_referrer')?.passed).toBe(true);
    expect(results.find(c => c.id === 'header_permissions')?.passed).toBe(true);
  });
});

describe('3. Évaluation passive du HTML public (Divulgation de versions)', () => {
  it('doit détecter la balise meta generator WordPress et pénaliser l\'exposition', () => {
    const htmlExposed = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="generator" content="WordPress 6.4.2" />
        </head>
        <body class="home wp-content">
          <h1>Ma boutique</h1>
        </body>
      </html>
    `;

    const result = evaluateHtmlExposure(htmlExposed);
    expect(result.isWordPress).toBe(true);
    expect(result.wpVersion).toBe('6.4.2');
    
    const wpCheck = result.checks.find(c => c.id === 'hide_wp_version');
    expect(wpCheck?.passed).toBe(false); // Faute de sécurité car version exposée
    expect(wpCheck?.earnedPoints).toBe(0);
  });

  it('doit accorder les points si la version WordPress est correctement masquée', () => {
    const htmlSecured = `
      <!DOCTYPE html>
      <html>
        <head><title>Boutique sécurisée</title></head>
        <body><div class="wp-content">Boutique</div></body>
      </html>
    `;

    const result = evaluateHtmlExposure(htmlSecured);
    expect(result.isWordPress).toBe(true);
    expect(result.wpVersion).toBeUndefined();

    const wpCheck = result.checks.find(c => c.id === 'hide_wp_version');
    expect(wpCheck?.passed).toBe(true);
    expect(wpCheck?.earnedPoints).toBe(10);
  });

  it('doit détecter WooCommerce et vérifier si sa version est exposée', () => {
    const htmlWcExposed = `
      <html>
        <head>
          <meta name="generator" content="WooCommerce 8.5.1" />
        </head>
        <body class="woocommerce">
          <ul class="products"><li>Produit</li></ul>
        </body>
      </html>
    `;

    const result = evaluateHtmlExposure(htmlWcExposed);
    expect(result.isWooCommerce).toBe(true);
    expect(result.wcVersion).toBe('8.5.1');

    const wcCheck = result.checks.find(c => c.id === 'hide_wc_version');
    expect(wcCheck?.passed).toBe(false);
  });
});

describe('4. Évaluation SSL & Redirection', () => {
  it('doit valider la redirection HTTPS et le certificat', () => {
    const input: RawScanInput = {
      url: 'http://boutique-test.com',
      finalUrl: 'https://boutique-test.com/',
      statusCode: 200,
      headers: {},
      htmlBody: '<html></html>',
      tlsInfo: {
        authorized: true,
        daysRemaining: 75
      }
    };

    const sslChecks = evaluateSslAndRedirection(input);
    expect(sslChecks.find(c => c.id === 'https_enforced')?.passed).toBe(true);
    expect(sslChecks.find(c => c.id === 'ssl_valid')?.passed).toBe(true);
    expect(sslChecks.find(c => c.id === 'ssl_expiration')?.passed).toBe(true);
  });
});

describe('5. Seuils de notes A à F', () => {
  it('doit attribuer les bonnes notes et labels selon le barème', () => {
    expect(calculateGrade(95)).toEqual({ grade: 'A', label: 'Excellente sécurité' });
    expect(calculateGrade(80)).toEqual({ grade: 'B', label: 'Bonne sécurité (à peaufiner)' });
    expect(calculateGrade(65)).toEqual({ grade: 'C', label: 'Sécurité moyenne (failles passives détectées)' });
    expect(calculateGrade(50)).toEqual({ grade: 'D', label: 'Sécurité vulnérable (actions urgentes requises)' });
    expect(calculateGrade(30)).toEqual({ grade: 'E', label: 'Sécurité critique (boutique à risque élevé)' });
    expect(calculateGrade(15)).toEqual({ grade: 'F', label: 'Niveau d\'exposition maximal (non protégée)' });
  });
});

describe('6. Rapport d\'analyse complet & Top 3 des priorités', () => {
  it('doit produire un rapport complet avec score et Top 3 des actions sur un site avec failles', () => {
    const inputVulnerable: RawScanInput = {
      url: 'http://boutique-vulnerable.com',
      finalUrl: 'https://boutique-vulnerable.com/', // HTTPS ok
      statusCode: 200,
      headers: {
        // HSTS manquant
        // CSP manquant
        'x-frame-options': 'SAMEORIGIN', // OK
        'x-content-type-options': 'nosniff' // OK
      },
      htmlBody: `
        <html>
          <head>
            <meta name="generator" content="WordPress 6.4.1" />
            <meta name="generator" content="WooCommerce 8.4.0" />
          </head>
          <body><div class="woocommerce">Boutique</div></body>
        </html>
      `,
      tlsInfo: {
        authorized: true,
        daysRemaining: 45
      }
    };

    const report = runPassiveScanAnalysis(inputVulnerable);

    expect(report.domain).toBe('boutique-vulnerable.com');
    expect(report.isWooCommerceDetected).toBe(true);
    expect(report.isWordPressDetected).toBe(true);
    expect(report.totalScore).toBeLessThan(80);
    expect(report.top3Priorities.length).toBe(3);

    // Les priorités critiques (HSTS ou CSP) doivent être en tête de liste
    const topIds = report.top3Priorities.map(p => p.id);
    expect(topIds).toContain('header_hsts');
    expect(topIds).toContain('header_csp');
  });
});

describe('7. Détection passive des passerelles de paiement (HTML public)', () => {
  it('doit identifier Stripe, Mollie et PayPal sans aucune injection de code', () => {
    const html = `
      <html>
        <head>
          <script src="https://js.stripe.com/v3/"></script>
          <script src="https://www.paypal.com/sdk/js?client-id=sb"></script>
        </head>
        <body class="woocommerce-gateway-mollie">
          <div>Boutique</div>
        </body>
      </html>
    `;

    const gateways = detectPaymentGateways(html);
    const ids = gateways.map(g => g.id);

    expect(ids).toContain('stripe');
    expect(ids).toContain('mollie');
    expect(ids).toContain('paypal');
    expect(ids).not.toContain('payplug');
  });
});

describe('8. Estimation du Chiffre d\'Affaires à risque (Psychologie gérant)', () => {
  it('doit estimer un impact financier cohérent selon la sévérité de la note', () => {
    const riskA = estimateRevenueRisk('100k_250k', 'A');
    expect(riskA.estimatedDailyLossOnBreach).toBeLessThan(50);

    const riskC = estimateRevenueRisk('100k_250k', 'C');
    expect(riskC.estimatedDailyLossOnBreach).toBeGreaterThan(200);

    const riskE = estimateRevenueRisk('250k_500k', 'E');
    expect(riskE.estimatedDailyLossOnBreach).toBeGreaterThan(900);
  });
});

describe('9. Aiguillage commercial dynamique (Conversion par profil de note)', () => {
  it('doit recommander l\'Abonnement Sérénité (69 €/mois) en offre reine pour les notes A et B', () => {
    const offerA = buildCommercialOffer('A');
    expect(offerA.recommendedOffer).toBe('serenite_subscription');
    expect(offerA.primaryButtonLabel).toContain('Abonnement Sérénité');

    const offerB = buildCommercialOffer('B');
    expect(offerB.recommendedOffer).toBe('serenite_subscription');
  });

  it('doit recommander le Diagnostic Complet (590 €) en offre prioritaire pour les notes vulnérables (C, D, E, F)', () => {
    const offerC = buildCommercialOffer('C');
    expect(offerC.recommendedOffer).toBe('complete_diagnostic');
    expect(offerC.primaryButtonLabel).toContain('Diagnostic Complet');

    const offerE = buildCommercialOffer('E');
    expect(offerE.recommendedOffer).toBe('complete_diagnostic');
  });
});

describe('10. Calcul du Delta de progression et badge de confiance', () => {
  it('doit calculer les points gagnés par rapport à un audit antérieur', () => {
    const delta = calculateProgressDelta(90, 60);
    expect(delta?.difference).toBe(30);
    expect(delta?.isImproved).toBe(true);
    expect(delta?.label).toContain('+30 pts gagnés');
  });

  it('doit activer l\'éligibilité au badge de confiance BoutiqueSûre pour la note A', () => {
    const inputClean: RawScanInput = {
      url: 'https://boutique-parfaite.fr',
      finalUrl: 'https://boutique-parfaite.fr/',
      statusCode: 200,
      headers: {
        'strict-transport-security': 'max-age=31536000',
        'content-security-policy': "default-src 'self' https:;",
        'x-frame-options': 'SAMEORIGIN',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'camera=()'
      },
      htmlBody: '<html><head><title>Boutique Sûre</title></head><body>Boutique</body></html>',
      tlsInfo: { authorized: true, daysRemaining: 80 }
    };

    const report = runPassiveScanAnalysis(inputClean, { previousScore: 50 });
    expect(report.grade).toBe('A');
    expect(report.trustBadgeEligible).toBe(true);
    expect(report.commercialOffer.recommendedOffer).toBe('serenite_subscription');
    expect(report.progressDelta?.isImproved).toBe(true);
  });
});
