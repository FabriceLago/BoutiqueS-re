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
    await expect(page.locator('text=https://maboutique-mode.fr').first()).toBeVisible();

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

    // Vérifier le Barème officiel des Notes A à F et le graphique Radar Recharts
    const gradeScaleSection = page.locator('[data-testid="grade-scale-section"]');
    await expect(gradeScaleSection).toBeVisible();
    await expect(gradeScaleSection).toContainText('Barème officiel & Signification technique des Notes (A à F)');
    await expect(page.locator('[data-testid="grade-scale-item-A"]')).toBeVisible();
    await expect(page.locator('[data-testid="grade-scale-item-F"]')).toBeVisible();

    const radarChartContainer = page.locator('[data-testid="security-radar-chart"]');
    await expect(radarChartContainer).toBeVisible();

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
    await expect(faqSection).toContainText(/sécurité (e-commerce|boutique en ligne|WooCommerce)/i);
    await expect(faqSection.locator('[data-testid="faq-search-input"]')).toBeVisible();
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

  test('6. Saisie directe du nom de sa boutique commerciale (ex: Ma Boutique Bio) avec conversion automatique', async ({ page }) => {
    await page.goto('/');

    const urlInput = page.locator('input#storeUrl');
    const emailInput = page.locator('input#email');
    const consentCheckbox = page.locator('input#managerConsent');
    const submitBtn = page.locator('button[type="submit"]');

    // Vérifier que le champ est initialement vide (pas de données fictives pré-remplies)
    await expect(urlInput).toHaveValue('');
    await expect(emailInput).toHaveValue('');

    // Saisie du nom commercial avec espaces
    await urlInput.fill('Ma Boutique Bio');
    await emailInput.fill('contact@maboutique-bio.fr');

    // Vérifier l'apparition de la boîte d'assistance intelligente
    const helperBox = page.locator('[data-testid="store-name-helper"]');
    await expect(helperBox).toBeVisible();
    await expect(helperBox).toContainText('Ma Boutique Bio');
    await expect(helperBox).toContainText('https://ma-boutique-bio.fr');

    // Vérifier le sélecteur d'extensions (ex: changer vers .com)
    const comBtn = helperBox.locator('button:has-text(".com")');
    await comBtn.click();
    await expect(helperBox).toContainText('https://ma-boutique-bio.com');

    // Revenir sur .fr
    const frBtn = helperBox.locator('button:has-text(".fr")');
    await frBtn.click();
    await expect(helperBox).toContainText('https://ma-boutique-bio.fr');

    // Soumission du formulaire avec le nom de boutique
    if (!(await consentCheckbox.isChecked())) {
      await consentCheckbox.check();
    }
    await submitBtn.click();

    // Vérifier que l'écran d'attente s'ouvre avec l'URL résolue
    await expect(page.locator('text=Analyse passive de votre boutique')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=https://ma-boutique-bio.fr')).toBeVisible();
  });

  test('7. Système de visite guidée (onboarding) interactif du Bulletin de sécurité', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence des déclencheurs de visite guidée
    const tourHeaderBtn = page.locator('[data-testid="header-start-tour-button"]');
    await expect(tourHeaderBtn).toBeVisible();

    const floatingTourBtn = page.locator('[data-testid="floating-tour-button"]');
    await expect(floatingTourBtn).toBeVisible();

    // Démarrer la visite guidée
    await tourHeaderBtn.click();

    // Vérifier l'overlay et la bulle Étape 1
    const tourOverlay = page.locator('[data-testid="onboarding-tour-overlay"]');
    await expect(tourOverlay).toBeVisible();
    await expect(page.locator('text=Votre Note Globale (A à F)')).toBeVisible();
    await expect(page.locator('text=Étape 1 / 6')).toBeVisible();

    // Avancer à l'étape 2 (Barème & Radar)
    const nextBtn = page.locator('[data-testid="tour-next-btn"]');
    await nextBtn.click();
    await expect(page.locator('text=Le Barème Officiel & le Radar')).toBeVisible();
    await expect(page.locator('text=Étape 2 / 6')).toBeVisible();

    // Reculer avec le bouton Précédent
    const prevBtn = page.locator('[data-testid="tour-prev-btn"]');
    await prevBtn.click();
    await expect(page.locator('text=Votre Note Globale (A à F)')).toBeVisible();

    // Quitter la visite guidée via le bouton de fermeture
    const closeBtn = page.locator('[data-testid="tour-close-btn"]');
    await closeBtn.click();
    await expect(tourOverlay).not.toBeVisible();
  });

  test('8. Générateur de correctifs techniques serveur (.htaccess, Nginx, functions.php) et simulateur', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Ouvrir le modal de remédiation depuis l'en-tête
    const openRemediationBtn = page.locator('[data-testid="header-open-remediation-btn"]');
    await expect(openRemediationBtn).toBeVisible();
    await openRemediationBtn.click();

    // Vérifier l'ouverture du modal
    const modalOverlay = page.locator('[data-testid="remediation-modal-overlay"]');
    await expect(modalOverlay).toBeVisible();
    await expect(page.locator('text=Remédiation technique & Snippets de configuration')).toBeVisible();

    // Vérifier la présence du simulateur de score
    const simulatorBar = page.locator('[data-testid="remediation-score-simulator-bar"]');
    await expect(simulatorBar).toBeVisible();

    // Basculer sur l'onglet Nginx
    const nginxTab = page.locator('[data-testid="tab-nginx"]');
    await expect(nginxTab).toBeVisible();
    await nginxTab.click();
    await expect(page.locator('[data-testid="remediation-code-block"]')).toContainText('add_header');

    // Basculer sur l'onglet WordPress
    const wpTab = page.locator('[data-testid="tab-wordpress"]');
    await expect(wpTab).toBeVisible();
    await wpTab.click();
    await expect(page.locator('[data-testid="remediation-code-block"]')).toContainText('add_action');

    // Tester la bascule de simulation
    const simulateToggle = page.locator('[data-testid="toggle-simulate-checkbox"]');
    await expect(simulateToggle).toBeVisible();
    await simulateToggle.check();
    await expect(simulatorBar).toContainText('1 correctif(s) activé(s)');

    // Fermer le modal
    const closeRemediationBtn = page.locator('[data-testid="remediation-close-btn"]');
    await closeRemediationBtn.click();
    await expect(modalOverlay).not.toBeVisible();
  });

  test('9. Pipeline CRM des Prospects : Bascule Vue Tableau et Vue Kanban interactive', async ({ page }) => {
    await page.goto('/');
    const auditLogsTab = page.locator('button:has-text("5. Journal des analyses")');
    await expect(auditLogsTab).toBeVisible();
    await auditLogsTab.click();

    // Basculer sur l'onglet Prospects
    const prospectsTab = page.locator('[data-testid="tab-prospects-btn"]');
    await expect(prospectsTab).toBeVisible();
    await prospectsTab.click();

    // Vérifier la présence de la table par défaut
    const tableView = page.locator('[data-testid="prospects-table-view"]');
    await expect(tableView).toBeVisible();

    // Basculer sur la vue Kanban
    const kanbanBtn = page.locator('[data-testid="view-mode-kanban-btn"]');
    await expect(kanbanBtn).toBeVisible();
    await kanbanBtn.click();

    // Vérifier l'affichage de la vue Kanban
    const kanbanView = page.locator('[data-testid="prospects-kanban-view"]');
    await expect(kanbanView).toBeVisible();

    // Vérifier la présence des colonnes du pipeline
    await expect(page.locator('[data-testid="kanban-column-nouveau"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-column-contacte"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-column-devis_envoye"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-column-converti"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-column-sans_suite"]')).toBeVisible();

    // Rebasculer en vue Tableau
    const tableBtn = page.locator('[data-testid="view-mode-table-btn"]');
    await expect(tableBtn).toBeVisible();
    await tableBtn.click();
    await expect(tableView).toBeVisible();
    await expect(kanbanView).not.toBeVisible();
  });

  test('10. Générateur d\'Attestation Officielle NIS 2 (UE 2022/2555) et export PDF certifié', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Cliquer sur le lien Attestation officielle dans le bloc NIS 2
    const nis2Btn = page.locator('[data-testid="generate-nis2-attestation-btn"]');
    await expect(nis2Btn).toBeVisible();
    await nis2Btn.click();

    // Vérifier l'ouverture du modal officiel
    const nis2Modal = page.locator('[data-testid="nis2-modal-overlay"]');
    await expect(nis2Modal).toBeVisible();
    await expect(page.locator('text=Attestation officielle de diligence technique')).toBeVisible();
    await expect(page.locator('text=Directive Européenne NIS 2 (UE 2022/2555)')).toBeVisible();

    // Vérifier la présence du bouton d'export PDF certifié
    const downloadPdfBtn = page.locator('[data-testid="download-nis2-pdf-btn"]');
    await expect(downloadPdfBtn).toBeVisible();

    // Fermer le modal
    const closeBtn = page.locator('[data-testid="nis2-close-btn"]');
    await closeBtn.click();
    await expect(nis2Modal).not.toBeVisible();
  });

  test('11. Modal de Réservation / Commande en 1 Clic : Ouverture, formulaire et confirmation', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Cliquer sur le CTA Commander le Diagnostic Complet (590 €)
    const bookDiagnosticBtn = page.locator('[data-testid="cta-book-diagnostic-btn"]');
    await expect(bookDiagnosticBtn).toBeVisible();
    await bookDiagnosticBtn.click();

    // Vérifier l'ouverture du modal de commande
    const orderModal = page.locator('[data-testid="order-modal-overlay"]');
    await expect(orderModal).toBeVisible();
    await expect(page.locator('text=Réserver votre accompagnement de sécurité')).toBeVisible();

    // Vérifier les deux offres sélectionnables
    const selectSerenite = page.locator('[data-testid="select-offer-serenite"]');
    await expect(selectSerenite).toBeVisible();
    await selectSerenite.click();
    await expect(orderModal.locator('text=Abonnement Sérénité').first()).toBeVisible();

    // Rebasculer sur le Diagnostic 590€
    const selectDiagnostic = page.locator('[data-testid="select-offer-diagnostic"]');
    await selectDiagnostic.click();

    // Remplir les informations de contact
    const phoneInput = page.locator('input#order-phone');
    await phoneInput.fill('0612345678');

    const notesInput = page.locator('textarea#order-notes');
    await notesInput.fill('Boutique sous WooCommerce 8.5 avec 1200 produits.');

    // Soumettre la commande
    const submitOrderBtn = page.locator('[data-testid="order-submit-btn"]');
    await expect(submitOrderBtn).toBeVisible();
    await submitOrderBtn.click();

    // Vérifier l'écran de confirmation avec la référence CMD-2026-
    const confirmationScreen = page.locator('[data-testid="order-confirmation-screen"]');
    await expect(confirmationScreen).toBeVisible({ timeout: 5000 });
    await expect(confirmationScreen).toContainText('Prise en charge enregistrée avec succès');
    await expect(confirmationScreen).toContainText('CMD-2026-');

    // Fermer l'écran de confirmation
    const finishBtn = page.locator('[data-testid="order-finish-btn"]');
    await finishBtn.click();
    await expect(orderModal).not.toBeVisible();
  });

  test('12. Module d\'Audit Passif DNS Anti-Usurpation & Sécurité Email (SPF, DMARC, DKIM, MX)', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence de la carte d'audit DNS & Email
    const emailDnsCard = page.locator('[data-testid="email-dns-security-card"]');
    await expect(emailDnsCard).toBeVisible();
    await expect(emailDnsCard).toContainText('Sécurité Email & Protection Anti-Usurpation DNS');
    await expect(emailDnsCard).toContainText('Contrôle passif des enregistrements de votre nom de domaine');

    // Vérifier les 4 contrôles de sécurité
    await expect(page.locator('[data-testid="email-check-spf"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-check-dmarc"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-check-dkim"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-check-mx"]')).toBeVisible();

    // Vérifier la présence du badge d'évaluation anti-usurpation
    await expect(page.locator('[data-testid="email-dns-anti-spoofing-badge"]')).toBeVisible();
  });

  test('13. Charte RGPD & Droit à l\'effacement en 1 Clic (Article 17 du RGPD)', async ({ page }) => {
    await page.goto('/');

    // Naviguer vers l'écran Charte & RGPD
    const privacyNavBtn = page.locator('[data-testid="nav-privacy-btn"]');
    await expect(privacyNavBtn).toBeVisible();
    await privacyNavBtn.click();

    // Vérifier que la charte est affichée
    await expect(page.locator('h1')).toContainText('Charte Déontologique 100% Passive');

    // Vérifier la présence du bloc Droit à l'oubli immédiat (Art. 17 RGPD)
    await expect(page.locator('text=Droit à l\'oubli immédiat (Article 17 du RGPD)')).toBeVisible();
    const purgeBtn = page.locator('[data-testid="gdpr-purge-btn"]');
    await expect(purgeBtn).toBeVisible();

    // Cliquer sur le bouton de purge
    await purgeBtn.click();

    // Vérifier l'alerte de confirmation de purge réussie
    const purgeAlert = page.locator('[data-testid="gdpr-purge-success-alert"]');
    await expect(purgeAlert).toBeVisible();
    await expect(purgeAlert).toContainText('Toutes vos données locales ont été immédiatement effacées avec succès');
  });

  test('14. Inspecteur passif des Passerelles de Paiement & Conformité PCI-DSS v4.0', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence du module passerelles de paiement
    const paymentCard = page.locator('[data-testid="payment-gateways-audit-card"]');
    await expect(paymentCard).toBeVisible();
    await expect(paymentCard).toContainText('Passerelles de Paiement');
    await expect(paymentCard).toContainText('PCI-DSS v4.0');

    // Vérifier le badge de conformité PCI-DSS
    const pciBadge = page.locator('[data-testid="pci-dss-badge"]');
    await expect(pciBadge).toBeVisible();

    // Vérifier la détection passive des scripts de paiement
    await expect(page.locator('[data-testid="gateway-card-stripe"]')).toBeVisible();
    await expect(page.locator('[data-testid="gateway-card-paypal"]')).toBeVisible();
  });

  test('15. Mini-Diagnostic Passif de Performance & Éco-Conception GreenIT', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence du module GreenIT
    const greenCard = page.locator('[data-testid="green-performance-audit-card"]');
    await expect(greenCard).toBeVisible();
    await expect(greenCard).toContainText('Éco-Conception GreenIT');

    // Vérifier la note Eco-Index et la grille de métriques passives
    const ecoBadge = page.locator('[data-testid="eco-index-badge"]');
    await expect(ecoBadge).toBeVisible();

    const metricsGrid = page.locator('[data-testid="performance-metrics-grid"]');
    await expect(metricsGrid).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-ttfb"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-protocol"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-compression"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-caching"]')).toBeVisible();
  });

  test('16. Curseur Visuel Interactif « Avant / Après Sécurisation »', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence du comparateur interactif
    const comparisonCard = page.locator('[data-testid="before-after-comparison-card"]');
    await expect(comparisonCard).toBeVisible();
    await expect(comparisonCard).toContainText('Comparateur');
    await expect(comparisonCard).toContainText('Avant');
    await expect(comparisonCard).toContainText('Après');

    // Vérifier les deux états Avant et Après
    await expect(page.locator('[data-testid="before-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="after-card"]')).toBeVisible();

    // Vérifier la présence du curseur interactif
    const slider = page.locator('[data-testid="before-after-slider"]');
    await expect(slider).toBeVisible();
    await slider.fill('80');
  });

  test('17. Widget Dynamique SVG du Badge de Sécurité & Copie de code', async ({ page }) => {
    // Permettre le presse-papier
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});

    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence du widget
    const badgeWidget = page.locator('[data-testid="dynamic-badge-widget-card"]');
    await expect(badgeWidget).toBeVisible();
    await expect(badgeWidget).toContainText('Widget SVG Dynamique & Sceau de Réassurance Panier');

    // Vérifier le container SVG
    await expect(page.locator('[data-testid="dynamic-badge-preview-container"]')).toBeVisible();

    // Tester la bascule de thèmes (Sombre -> Clair -> Émeraude)
    const lightThemeBtn = page.locator('[data-testid="badge-theme-light-btn"]');
    await expect(lightThemeBtn).toBeVisible();
    await lightThemeBtn.click();

    const emeraldThemeBtn = page.locator('[data-testid="badge-theme-emerald-btn"]');
    await expect(emeraldThemeBtn).toBeVisible();
    await emeraldThemeBtn.click();

    // Tester le bouton de copie du snippet
    const copyCodeBtn = page.locator('[data-testid="copy-badge-code-btn"]');
    await expect(copyCodeBtn).toBeVisible();
    await copyCodeBtn.click();
    await expect(page.locator('text=Copié !')).toBeVisible();
  });

  test('18. Générateur de QR Code d\'Audit Instantané & Carte de Partage Mobile', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier le bouton QR Code dans la barre de partage
    const shareQrBtn = page.locator('[data-testid="share-qr-code-btn"]');
    await expect(shareQrBtn).toBeVisible();
    await shareQrBtn.click();

    // Vérifier l'ouverture du modal
    const qrModal = page.locator('[data-testid="qr-share-modal-overlay"]');
    await expect(qrModal).toBeVisible();
    await expect(page.locator('text=Flasher ou Partager l\'Audit')).toBeVisible();

    // Vérifier le rendu du QR Code SVG
    const qrSvg = page.locator('[data-testid="qr-code-svg-container"]');
    await expect(qrSvg).toBeVisible();

    // Fermer le modal
    const closeBtn = page.locator('[data-testid="qr-modal-close-btn"]');
    await closeBtn.click();
    await expect(qrModal).not.toBeVisible();
  });

  test('19. Mode « Flotte Multi-Boutiques / Agences » dans le Back-Office', async ({ page }) => {
    await page.goto('/');
    const auditLogsTab = page.locator('button:has-text("5. Journal des analyses")');
    await expect(auditLogsTab).toBeVisible();
    await auditLogsTab.click();

    // Basculer sur l'onglet 3 : Flotte Agence
    const fleetTab = page.locator('[data-testid="tab-fleet-btn"]');
    await expect(fleetTab).toBeVisible();
    await fleetTab.click();

    // Vérifier le module de gestion de flotte
    const fleetSection = page.locator('[data-testid="fleet-manager-section"]');
    await expect(fleetSection).toBeVisible();
    await expect(fleetSection).toContainText('Gestion de Flotte Multi-Boutiques');
    await expect(fleetSection).toContainText('Espace Agences & E-Commerçants Multi-Sites');

    // Vérifier les 4 KPIs consolidés
    const fleetKpis = page.locator('[data-testid="fleet-kpis-grid"]');
    await expect(fleetKpis).toBeVisible();
    await expect(fleetKpis).toContainText('Score Moyen Flotte');
    await expect(fleetKpis).toContainText('Boutiques à Risque');

    // Vérifier le tableau de bord des boutiques
    const fleetTable = page.locator('[data-testid="fleet-table-container"]');
    await expect(fleetTable).toBeVisible();
    await expect(fleetTable).toContainText('chocolaterie-artisanale.fr');
    await expect(fleetTable).toContainText('mode-ethique-paris.com');

    // Vérifier le bouton d'export CSV
    const exportCsvBtn = page.locator('[data-testid="fleet-export-csv-btn"]');
    await expect(exportCsvBtn).toBeVisible();

    // Tester l'ajout d'une boutique dans la flotte
    const addStoreBtn = page.locator('[data-testid="fleet-add-store-btn"]');
    await expect(addStoreBtn).toBeVisible();
    await addStoreBtn.click();

    // Vérifier l'apparition du formulaire inline
    const domainInput = page.locator('[data-testid="fleet-input-domain"]');
    const clientInput = page.locator('[data-testid="fleet-input-client"]');
    await expect(domainInput).toBeVisible();
    await domainInput.fill('nouvelle-boutique-test.fr');
    await clientInput.fill('Nouvelle Boutique Test');

    const submitBtn = page.locator('[data-testid="fleet-submit-store-btn"]');
    await submitBtn.click();

    // Vérifier que la nouvelle boutique apparaît dans le tableau
    await expect(fleetTable).toContainText('nouvelle-boutique-test.fr');
  });

  test('20. Simulateur interactif de ROI Financier & Réduction d\'Abandons de Panier', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence du simulateur de ROI
    const roiSection = page.locator('[data-testid="roi-calculator-section"]');
    await expect(roiSection).toBeVisible();
    await expect(roiSection).toContainText('Simulateur de ROI & Réduction d\'Abandons de Panier');

    // Vérifier les curseurs de panier moyen et commandes par jour
    const basketSlider = page.locator('[data-testid="roi-slider-basket"]');
    const ordersSlider = page.locator('[data-testid="roi-slider-orders"]');
    await expect(basketSlider).toBeVisible();
    await expect(ordersSlider).toBeVisible();

    // Modifier les valeurs et constater le calcul dynamique
    await basketSlider.fill('120');
    await ordersSlider.fill('35');
    await expect(roiSection).toContainText('/ an');
  });

  test('21. Attestation Officielle Cyber-Assurance & Banque VAD (Modal & Export PDF)', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Ouvrir le modal via le bouton d'en-tête
    const openBtn = page.locator('[data-testid="header-open-insurance-attestation-btn"]');
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Vérifier le modal
    const modal = page.locator('[data-testid="bank-insurance-modal-overlay"]');
    await expect(modal).toBeVisible();
    await expect(page.locator('text=Attestation Cyber-Assurance & Banque VAD')).toBeVisible();

    // Vérifier le bouton de téléchargement PDF
    const downloadPdfBtn = page.locator('[data-testid="download-attestation-pdf-btn"]');
    await expect(downloadPdfBtn).toBeVisible();

    // Fermer le modal
    const closeBtn = page.locator('[data-testid="close-bank-insurance-modal-btn"]');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('22. Surveillance Passive des Fuites d\'Identifiants & Dark Web', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence de la section
    const breachSection = page.locator('[data-testid="databreach-scanner-section"]');
    await expect(breachSection).toBeVisible();
    await expect(breachSection).toContainText('Surveillance Passive des Fuites d\'Identifiants');

    // Tester le bouton d'actualisation
    const scanBtn = page.locator('[data-testid="run-databreach-scan-btn"]');
    await expect(scanBtn).toBeVisible();
    await scanBtn.click();
  });

  test('23. Alertes Proactives par Webhooks (Slack, Discord, MS Teams)', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // Vérifier la présence du module
    const webhookSection = page.locator('[data-testid="webhook-alerts-section"]');
    await expect(webhookSection).toBeVisible();
    await expect(webhookSection).toContainText('Alertes Proactives & Webhooks');

    // Tester la bascule de plateforme
    const discordBtn = page.locator('[data-testid="webhook-platform-discord"]');
    await expect(discordBtn).toBeVisible();
    await discordBtn.click();

    // Tester le bouton de test direct
    const testAlertBtn = page.locator('[data-testid="test-webhook-alert-btn"]');
    await expect(testAlertBtn).toBeVisible();
    await testAlertBtn.click();
    await expect(page.locator('text=Notification de test envoyée avec succès')).toBeVisible();
  });

  test('24. Nouvelles Fonctionnalités E-Commerce : Sandbox Cyber-Attaque, Trust Booster, Scripts Tiers et Modals', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // 1. Simulateur de Cyber-Attaque (Sandbox)
    const attackSandbox = page.locator('[data-testid="cyber-attack-sandbox"]');
    await expect(attackSandbox).toBeVisible();
    await expect(attackSandbox).toContainText('Simulateur Pédagogique de Cyber-Attaque');

    // Basculer sur le scénario Clickjacking
    const clickjackingTab = page.locator('[data-testid="scenario-tab-clickjacking"]');
    await expect(clickjackingTab).toBeVisible();
    await clickjackingTab.click();

    // Tester la bascule protection active
    const toggleProtected = page.locator('[data-testid="toggle-protected"]');
    await expect(toggleProtected).toBeVisible();
    await toggleProtected.click();
    await expect(page.locator('text=Protection BoutiqueSûre ACTIVE')).toBeVisible();

    // 2. Inspecteur de Scripts Tiers
    const scriptsInspector = page.locator('[data-testid="third-party-scripts-inspector"]');
    await expect(scriptsInspector).toBeVisible();
    await expect(scriptsInspector).toContainText('Inspecteur de Scripts & Balises Tierces');
    await expect(scriptsInspector).toContainText('Google Tag Manager');

    // 3. Checkout Trust Booster
    const trustBooster = page.locator('[data-testid="checkout-trust-booster"]');
    await expect(trustBooster).toBeVisible();
    await expect(trustBooster).toContainText('Checkout Trust Booster');
    await expect(trustBooster).toContainText('Trust Score Acheteur');

    // 4. Modal security.txt (RFC 9116)
    const openSecurityTxtBtn = page.locator('[data-testid="open-security-txt-btn"]');
    await expect(openSecurityTxtBtn).toBeVisible();
    await openSecurityTxtBtn.click();
    const securityTxtModal = page.locator('[data-testid="security-txt-legal-modal"]');
    await expect(securityTxtModal).toBeVisible();
    await expect(securityTxtModal).toContainText('security.txt (RFC 9116)');
    await page.locator('[data-testid="close-security-txt-modal-btn"]').click();
    await expect(securityTxtModal).not.toBeVisible();

    // 5. Modal Comparateur Concurrentiel (Spy-Check)
    const openBenchmarkBtn = page.locator('[data-testid="open-competitor-benchmark-btn"]');
    await expect(openBenchmarkBtn).toBeVisible();
    await openBenchmarkBtn.click();
    const benchmarkModal = page.locator('[data-testid="competitor-benchmark-modal"]');
    await expect(benchmarkModal).toBeVisible();
    await expect(benchmarkModal).toContainText('Comparateur Concurrentiel & Benchmark Sectoriel');
    await page.locator('[data-testid="close-benchmark-modal-btn"]').click();
    await expect(benchmarkModal).not.toBeVisible();

    // 6. Modal Plan d'Urgence & Black Friday
    const openEmergencyBtn = page.locator('[data-testid="open-emergency-plan-btn"]');
    await expect(openEmergencyBtn).toBeVisible();
    await openEmergencyBtn.click();
    const emergencyModal = page.locator('[data-testid="emergency-plan-modal"]');
    await expect(emergencyModal).toBeVisible();
    await expect(emergencyModal).toContainText('Plan de Continuité d\'Urgence');
    await page.locator('[data-testid="close-emergency-modal-btn"]').click();
    await expect(emergencyModal).not.toBeVisible();
  });

  test('25. Certificat Officiel A4, Simulateur de Pics de Trafic, Widget Flottant & Alertes SMS/WhatsApp', async ({ page }) => {
    await page.goto('/');
    const bulletinTab = page.locator('button:has-text("3. Bulletin de sécurité")');
    await expect(bulletinTab).toBeVisible();
    await bulletinTab.click();

    // 1. Simulateur de pics de trafic (TTFB & Soldes)
    const trafficSimulator = page.locator('[data-testid="traffic-spike-simulator"]');
    await expect(trafficSimulator).toBeVisible();
    await expect(trafficSimulator).toContainText('Simulateur de Résistance aux Pics de Ventes');
    await expect(trafficSimulator).toContainText('Temps de réponse (TTFB)');

    // 2. Modal Certificat Officiel A4
    const openCertBtn = page.locator('[data-testid="open-certificate-modal-btn"]');
    await expect(openCertBtn).toBeVisible();
    await openCertBtn.click();
    const certModal = page.locator('[data-testid="official-certificate-modal"]');
    await expect(certModal).toBeVisible();
    await expect(certModal).toContainText('Certificat Officiel de Diligence');
    await expect(certModal.locator('[data-testid="download-certificate-pdf-btn"]')).toBeVisible();
    await page.locator('[data-testid="close-certificate-modal-btn"]').click();
    await expect(certModal).not.toBeVisible();

    // 3. Modal Widget Flottant Sceau de Sécurité
    const openWidgetBtn = page.locator('[data-testid="open-floating-widget-modal-btn"]');
    await expect(openWidgetBtn).toBeVisible();
    await openWidgetBtn.click();
    const widgetModal = page.locator('[data-testid="floating-badge-widget-modal"]');
    await expect(widgetModal).toBeVisible();
    await expect(widgetModal).toContainText('Widget Flottant « Sceau de Sécurité »');
    await expect(widgetModal.locator('[data-testid="copy-floating-widget-snippet-btn"]')).toBeVisible();
    await page.locator('[data-testid="close-floating-badge-modal-btn"]').click();
    await expect(widgetModal).not.toBeVisible();

    // 4. Modal Alertes SMS & WhatsApp
    const openSmsBtn = page.locator('[data-testid="open-sms-alert-modal-btn"]');
    await expect(openSmsBtn).toBeVisible();
    await openSmsBtn.click();
    const smsModal = page.locator('[data-testid="sms-whatsapp-alert-modal"]');
    await expect(smsModal).toBeVisible();
    await expect(smsModal).toContainText('Alertes Immédiates SMS & WhatsApp');
    const sendTestSmsBtn = smsModal.locator('[data-testid="send-test-sms-btn"]');
    await expect(sendTestSmsBtn).toBeVisible();
    await sendTestSmsBtn.click();
    await expect(smsModal.locator('text=Notification de test simulée avec succès')).toBeVisible({ timeout: 5000 });
    await page.locator('[data-testid="close-sms-modal-btn"]').click();
    await expect(smsModal).not.toBeVisible();
  });

});



