/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests de bout en bout (Playwright E2E)
 * Valide le flux complet : Formulaire d'accueil -> Écran d'attente animé -> Bulletin de sécurité
 */

import { test, expect } from '@playwright/test';

test.describe('Flux complet utilisateur BoutiqueSûre', () => {

  test('1. Parcours complet : Saisie du formulaire -> Écran d\'attente -> Bulletin de santé', async ({ page }) => {
    // Permissions presse-papier pour le test du bouton de partage
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});

    // 1. Accès à la page d'accueil
    await page.goto('/');
    await expect(page).toHaveTitle(/Score de sécurité BoutiqueSûre/i);

    // Vérification de la présence des éléments clés
    await expect(page.locator('text=BoutiqueSûre').first()).toBeVisible();
    await expect(page.locator('h1')).toContainText('score de sécurité');

    // 2. Remplissage du formulaire
    const urlInput = page.locator('input#storeUrl');
    const emailInput = page.locator('input#email');
    const consentCheckbox = page.locator('input#managerConsent');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(urlInput).toBeVisible();
    await urlInput.fill('https://maboutique-mode.fr');
    await emailInput.fill('contact@maboutique-mode.fr');

    // Vérifier que la case gérant obligatoire est cochée
    if (!(await consentCheckbox.isChecked())) {
      await consentCheckbox.check();
    }
    await expect(consentCheckbox).toBeChecked();

    // 3. Soumission vers l'écran d'attente
    await submitBtn.click();

    // 4. Validation de l'écran d'attente animé
    await expect(page.locator('text=Analyse passive de votre boutique')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=https://maboutique-mode.fr')).toBeVisible();

    // Vérification des étapes passives
    await expect(page.locator('text=Connexion sécurisée à la page d\'accueil')).toBeVisible();
    await expect(page.locator('text=Contrôle du certificat SSL')).toBeVisible();

    // 5. Attente de la transition vers le Bulletin (soit automatique après 4.8s, soit via le bouton d'accès)
    const accessBulletinBtn = page.locator('button:has-text("Accéder à mon bulletin de sécurité")');
    
    // Attendre que le bulletin ou le bouton d'accès soit visible
    await expect(
      page.locator('h1:has-text("Bulletin de sécurité"), button:has-text("Accéder à mon bulletin de sécurité")')
    ).toBeVisible({ timeout: 10000 });

    if (await accessBulletinBtn.isVisible()) {
      await accessBulletinBtn.click();
    }

    // 6. Validation du Bulletin de sécurité
    await expect(page.locator('h1')).toContainText('Bulletin de sécurité de votre boutique');
    await expect(page.locator('text=https://maboutique-mode.fr')).toBeVisible();

    // Vérifier les 3 actions prioritaires
    await expect(page.locator('text=Les 3 actions prioritaires à corriger')).toBeVisible();

    // Vérifier la présence du bouton de téléchargement PDF
    const downloadPdfBtn = page.locator('[data-testid="download-pdf-button"]');
    await expect(downloadPdfBtn).toBeVisible();
    await expect(downloadPdfBtn).toContainText('Télécharger le rapport');

    // Vérifier la grille détaillée des critères de sécurité avec tooltips
    const criteriaGrid = page.locator('[data-testid="security-criteria-grid"]');
    await expect(criteriaGrid).toBeVisible();
    await expect(criteriaGrid).toContainText('Détail des 10 critères de sécurité');
    await expect(criteriaGrid).toContainText('Version PHP');
    await expect(criteriaGrid).toContainText('Plugins');

    // Tester l'interactivité d'un tooltip (ex: Version PHP)
    const phpTooltipBtn = page.locator('[data-testid="tooltip-exposure-php"] button');
    await expect(phpTooltipBtn).toBeVisible();
    await phpTooltipBtn.click();
    await expect(page.locator('text=Moteur d\'exécution de WordPress et WooCommerce')).toBeVisible();

    // Tester le survol d'une ligne de critère complète (ex: Plugins obsolètes)
    const pluginsRow = page.locator('[data-testid="criterion-row-exposure-plugins"]');
    await pluginsRow.hover();
    await expect(page.locator('text=premier vecteur d\'intrusion sur WordPress')).toBeVisible();

    // Vérifier les boutons de partage social
    const shareContainer = page.locator('[data-testid="share-buttons-container"]');
    await expect(shareContainer).toBeVisible();

    const twitterBtn = page.locator('[data-testid="share-twitter"]');
    await expect(twitterBtn).toBeVisible();
    await expect(twitterBtn).toHaveAttribute('href', /twitter\.com\/intent\/tweet/);

    const linkedinBtn = page.locator('[data-testid="share-linkedin"]');
    await expect(linkedinBtn).toBeVisible();
    await expect(linkedinBtn).toHaveAttribute('href', /linkedin\.com\/sharing\/share-offsite/);

    const facebookBtn = page.locator('[data-testid="share-facebook"]');
    await expect(facebookBtn).toBeVisible();
    await expect(facebookBtn).toHaveAttribute('href', /facebook\.com\/sharer/);

    const copyLinkBtn = page.locator('[data-testid="share-copy-link"]');
    await expect(copyLinkBtn).toBeVisible();
    await copyLinkBtn.click();
    await expect(page.locator('text=Lien copié !')).toBeVisible();

    // Vérifier les modules stratégiques issus de l'Étape 1 enrichie
    const strategicSection = page.locator('[data-testid="strategic-insights-section"]');
    await expect(strategicSection).toBeVisible();
    await expect(strategicSection).toContainText('Benchmark Sectoriel');
    await expect(strategicSection).toContainText('Directive NIS 2');
    await expect(strategicSection).toContainText('Hébergement & Scripts');

    const revenueCalculator = page.locator('[data-testid="interactive-revenue-calculator"]');
    await expect(revenueCalculator).toBeVisible();
    await expect(revenueCalculator).toContainText('Simulateur interactif de perte financière');

    const trustBadgeShowcase = page.locator('[data-testid="trust-badge-showcase"]');
    await expect(trustBadgeShowcase).toBeVisible();
    await expect(trustBadgeShowcase).toContainText('Badge officiel de réassurance');

    // Vérifier les 2 offres de conversion (Diagnostic 590 € & Sérénité 69 € avec Veilleur Mensuel)
    await expect(page.locator('text=590 €').first()).toBeVisible();
    await expect(page.locator('text=69 €').first()).toBeVisible();
    await expect(page.locator('text=HTVA').first()).toBeVisible();
    await expect(page.locator('text=Veilleur Mensuel Automatique').first()).toBeVisible();
  });

  test('2. Contrôle de validation : rejet si la case de gérance est décochée', async ({ page }) => {
    await page.goto('/');

    // Saisie des champs
    await page.locator('input#storeUrl').fill('https://boutique-test.com');
    await page.locator('input#email').fill('gerant@boutique-test.com');

    // Décocher la case gérant
    const consentCheckbox = page.locator('input#managerConsent');
    await consentCheckbox.uncheck();
    await expect(consentCheckbox).not.toBeChecked();

    // Clic soumission
    await page.locator('button[type="submit"]').click();

    // Message d'erreur obligatoire
    await expect(page.locator('text=Veuillez confirmer que vous êtes le gérant')).toBeVisible();
  });

  test('3. Section FAQ : vérification de l\'accordéon sous le formulaire', async ({ page }) => {
    await page.goto('/');

    const faqHeading = page.locator('#faq-heading');
    await expect(faqHeading).toBeVisible();

    // La première question est ouverte par défaut
    await expect(page.locator('text=Absolument aucun risque. Notre outil n\'envoie qu\'une seule et unique requête HTTP GET')).toBeVisible();

    // Clic sur la deuxième question pour tester l'interactivité de l'accordéon
    const secondFaqBtn = page.locator('#faq-btn-definition-passif');
    await expect(secondFaqBtn).toBeVisible();
    await secondFaqBtn.click();

    // Vérifier que la réponse 2 s'affiche
    await expect(page.locator('text=Une analyse passive ne lit QUE les informations publiques')).toBeVisible();

    // Vérifier la présence du composant FAQSection à la fin de la page HomeMockup
    const faqSection = page.locator('[data-testid="faq-section"]');
    await expect(faqSection).toBeVisible();
    await expect(faqSection).toContainText('Tout comprendre sur la');
    await expect(faqSection).toContainText('sécurité WooCommerce');
    await expect(faqSection.locator('button:has-text("Lancer mon scan gratuit")')).toBeVisible();
  });

  test('4. Onglet Journal des analyses (Audit Logs Supabase)', async ({ page }) => {
    await page.goto('/');

    // Clic sur l'onglet 5 du journal
    const auditLogsTab = page.locator('button:has-text("5. Journal des analyses")');
    await expect(auditLogsTab).toBeVisible();
    await auditLogsTab.click();

    // Vérifier la présence du tableau et du graphique historique Recharts
    await expect(page.locator('h1')).toContainText('Journal des analyses passives');
    const chart = page.locator('[data-testid="audit-trends-chart"]');
    await expect(chart).toBeVisible();
    await expect(chart).toContainText('Tendance des audits (7 derniers jours)');
    await expect(chart).toContainText('7 jours');
    await expect(chart).toContainText('Moyenne');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Confirmé').first()).toBeVisible();
  });

  test('5. Bascule de thème Sombre / Clair (haute accessibilité)', async ({ page }) => {
    await page.goto('/');

    const themeToggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await expect(themeToggleBtn).toBeVisible();

    // Mode sombre par défaut
    await expect(page.locator('.theme-root')).toHaveAttribute('data-theme', 'dark');

    // Clic pour basculer en mode clair
    await themeToggleBtn.click();
    await expect(page.locator('.theme-root')).toHaveAttribute('data-theme', 'light');

    // Clic pour revenir en mode sombre
    await themeToggleBtn.click();
    await expect(page.locator('.theme-root')).toHaveAttribute('data-theme', 'dark');
  });

});

