/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires du Générateur de Correctifs Serveur
 * Fichier : src/components/RemediationDrawer.test.ts
 */

import { describe, it, expect } from 'vitest';
import { REMEDIATION_SNIPPETS } from './RemediationDrawer.tsx';

describe('Générateur de correctifs techniques serveur (RemediationDrawer)', () => {
  it('contient tous les snippets indispensables pour la sécurisation passive WooCommerce', () => {
    const requiredSnippets = [
      'ssl-redirect',
      'header-hsts',
      'header-xframe',
      'header-csp',
      'header-content-type',
      'header-referrer',
      'exposure-generator',
      'exposure-permissions'
    ];

    for (const key of requiredSnippets) {
      expect(REMEDIATION_SNIPPETS[key]).toBeDefined();
      expect(REMEDIATION_SNIPPETS[key].name).toBeTruthy();
      expect(REMEDIATION_SNIPPETS[key].pointsGain).toBeGreaterThan(0);
      expect(REMEDIATION_SNIPPETS[key].snippets.apache).toBeTruthy();
      expect(REMEDIATION_SNIPPETS[key].snippets.nginx).toBeTruthy();
      expect(REMEDIATION_SNIPPETS[key].snippets.wordpress).toBeTruthy();
      expect(REMEDIATION_SNIPPETS[key].targetFile.apache).toContain('.htaccess');
    }
  });

  it('fournit des syntaxes Apache .htaccess valides et sécurisées avec mod_headers / mod_rewrite', () => {
    const hsts = REMEDIATION_SNIPPETS['header-hsts'];
    expect(hsts.snippets.apache).toContain('Strict-Transport-Security');
    expect(hsts.snippets.apache).toContain('max-age=31536000');
    expect(hsts.snippets.apache).toContain('<IfModule mod_headers.c>');

    const redirect = REMEDIATION_SNIPPETS['ssl-redirect'];
    expect(redirect.snippets.apache).toContain('RewriteEngine On');
    expect(redirect.snippets.apache).toContain('R=301');

    const csp = REMEDIATION_SNIPPETS['header-csp'];
    expect(csp.snippets.apache).toContain('Content-Security-Policy');
    expect(csp.snippets.apache).toContain('js.stripe.com');
  });

  it('fournit des directives Nginx valides', () => {
    const xframe = REMEDIATION_SNIPPETS['header-xframe'];
    expect(xframe.snippets.nginx).toContain('add_header X-Frame-Options "SAMEORIGIN" always;');

    const nosniff = REMEDIATION_SNIPPETS['header-content-type'];
    expect(nosniff.snippets.nginx).toContain('add_header X-Content-Type-Options "nosniff" always;');
  });

  it('fournit des fonctions WordPress valides avec les hooks standard send_headers / init', () => {
    const generator = REMEDIATION_SNIPPETS['exposure-generator'];
    expect(generator.snippets.wordpress).toContain("remove_action('wp_head', 'wp_generator');");
    expect(generator.snippets.wordpress).toContain("add_filter('the_generator', '__return_empty_string');");
  });

  it('calcule correctement le gain potentiel cumulé pour amener un score de C vers A', () => {
    const baseScore = 58; // Note C
    const appliedFixes = ['header-hsts', 'header-csp', 'header-xframe', 'exposure-generator'];
    
    let simulatedScore = baseScore;
    for (const fixId of appliedFixes) {
      simulatedScore += REMEDIATION_SNIPPETS[fixId].pointsGain;
    }

    // 58 + 10 + 10 + 10 + 10 = 98 pts -> Note A
    expect(simulatedScore).toBe(98);
    expect(simulatedScore >= 90).toBe(true);
  });
});
