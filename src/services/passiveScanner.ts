/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Moteur d'analyse passive (Étape 4)
 * Analyse 100% passive basée sur une seule requête HTTP GET ordinaire
 */

export interface RawScanInput {
  url: string;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string | undefined>;
  htmlBody: string;
  tlsInfo?: {
    authorized: boolean;
    validTo?: string; // ISO date string
    daysRemaining?: number;
  };
}

export interface SecurityCheckResult {
  id: string;
  category: 'ssl' | 'headers' | 'exposure';
  name: string;
  passed: boolean;
  scoreWeight: number;
  earnedPoints: number;
  valueDetected?: string;
  userExplanation: string;
  recommendation?: string;
  urgencyLevel: 'critique' | 'urgent' | 'recommande' | 'info';
}

export interface PaymentGatewayDetected {
  id: 'stripe' | 'mollie' | 'paypal' | 'payplug' | 'klarna';
  name: string;
  foundInHtml: boolean;
}

export interface CommercialOfferRecommendation {
  recommendedOffer: 'serenite_subscription' | 'complete_diagnostic';
  headline: string;
  subtext: string;
  primaryButtonLabel: string;
  primaryPrice: string;
  secondaryButtonLabel: string;
  secondaryPrice: string;
}

export interface RevenueRiskEstimation {
  annualTurnoverBracket: '100k_250k' | '250k_500k';
  dailyRevenueAverage: number;
  estimatedDailyLossOnBreach: number;
  explanation: string;
}

export interface PassiveScanReport {
  domain: string;
  scanDate: string;
  isWooCommerceDetected: boolean;
  isWordPressDetected: boolean;
  detectedPaymentGateways: PaymentGatewayDetected[];
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  gradeLabel: string;
  checks: SecurityCheckResult[];
  top3Priorities: SecurityCheckResult[];
  commercialOffer: CommercialOfferRecommendation;
  revenueRisk: RevenueRiskEstimation;
  trustBadgeEligible: boolean;
  progressDelta?: {
    previousScore: number;
    difference: number;
    isImproved: boolean;
    label: string;
  };
}

/**
 * Normalise les clés d'en-têtes HTTP en minuscules
 */
export function normalizeHeaders(headers: Record<string, string | undefined>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, val] of Object.entries(headers)) {
    if (val !== undefined && val !== null) {
      normalized[key.toLowerCase().trim()] = String(val).trim();
    }
  }
  return normalized;
}

/**
 * Analyse la présence et la configuration des en-têtes HTTP de sécurité
 */
export function evaluateSecurityHeaders(headers: Record<string, string>): SecurityCheckResult[] {
  const results: SecurityCheckResult[] = [];

  // 1. HSTS (Strict-Transport-Security) - 10 pts
  const hsts = headers['strict-transport-security'];
  const hasHsts = Boolean(hsts && hsts.length > 0);
  const hstsMaxAgeMatch = hsts ? hsts.match(/max-age=(\d+)/i) : null;
  const hstsMaxAge = hstsMaxAgeMatch ? parseInt(hstsMaxAgeMatch[1], 10) : 0;
  const hstsValid = hasHsts && hstsMaxAge >= 2592000; // Au moins 30 jours

  results.push({
    id: 'header_hsts',
    category: 'headers',
    name: 'En-tête HSTS (Strict-Transport-Security)',
    passed: hstsValid,
    scoreWeight: 10,
    earnedPoints: hstsValid ? 10 : 0,
    valueDetected: hsts,
    userExplanation: hstsValid 
      ? "L'en-tête HSTS est actif, obligeant les navigateurs à toujours utiliser une connexion sécurisée chiffrée."
      : "L'en-tête HSTS est absent. Vos clients risquent une interception de connexion non sécurisée lors du paiement.",
    recommendation: hstsValid ? undefined : "Ajouter l'en-tête 'Strict-Transport-Security: max-age=31536000; includeSubDomains' sur votre serveur web.",
    urgencyLevel: 'critique'
  });

  // 2. X-Frame-Options / CSP frame-ancestors - 10 pts
  const xfo = headers['x-frame-options'];
  const csp = headers['content-security-policy'] || '';
  const hasCspFrameAncestors = /frame-ancestors\s+[^;]+/i.test(csp);
  const xfoPassed = Boolean(
    (xfo && (xfo.toUpperCase() === 'DENY' || xfo.toUpperCase() === 'SAMEORIGIN')) ||
    hasCspFrameAncestors
  );

  results.push({
    id: 'header_xframe',
    category: 'headers',
    name: 'Protection contre le détournement de clic (X-Frame-Options)',
    passed: xfoPassed,
    scoreWeight: 10,
    earnedPoints: xfoPassed ? 10 : 0,
    valueDetected: xfo || (hasCspFrameAncestors ? 'frame-ancestors (CSP)' : undefined),
    userExplanation: xfoPassed
      ? "Votre site ne peut pas être incrusté dans des faux sites pirates (protection anti-clickjacking)."
      : "Votre boutique peut être affichée en iframe sur un site malveillant pour subtiliser les identifiants de vos clients.",
    recommendation: xfoPassed ? undefined : "Ajouter l'en-tête 'X-Frame-Options: SAMEORIGIN' ou configurer frame-ancestors dans votre CSP.",
    urgencyLevel: 'urgent'
  });

  // 3. X-Content-Type-Options - 5 pts
  const xcto = headers['x-content-type-options'];
  const xctoPassed = Boolean(xcto && xcto.toLowerCase().includes('nosniff'));

  results.push({
    id: 'header_xcontent',
    category: 'headers',
    name: 'Protection contre l\'usurpation MIME (X-Content-Type-Options)',
    passed: xctoPassed,
    scoreWeight: 5,
    earnedPoints: xctoPassed ? 5 : 0,
    valueDetected: xcto,
    userExplanation: xctoPassed
      ? "Le navigateur respecte scrupuleusement les types de fichiers et bloque les scripts malveillants déguisés en images."
      : "L'en-tête 'nosniff' est manquant, ce qui peut permettre à des fichiers malveillants d'être exécutés par un navigateur.",
    recommendation: xctoPassed ? undefined : "Ajouter l'en-tête 'X-Content-Type-Options: nosniff' sur votre serveur.",
    urgencyLevel: 'recommande'
  });

  // 4. Content-Security-Policy (CSP) - 10 pts
  const hasCsp = Boolean(csp && csp.length > 10);
  results.push({
    id: 'header_csp',
    category: 'headers',
    name: 'Politique de sécurité de contenu (CSP)',
    passed: hasCsp,
    scoreWeight: 10,
    earnedPoints: hasCsp ? 10 : 0,
    valueDetected: hasCsp ? `${csp.substring(0, 40)}...` : undefined,
    userExplanation: hasCsp
      ? "Une politique CSP restreint les sources de scripts tiers et limite fortement les attaques de vol de cartes bancaires (Magecart)."
      : "Aucune politique CSP détectée. Si un plugin tiers est compromis, un script voleur de carte bancaire pourrait s'exécuter sans blocage.",
    recommendation: hasCsp ? undefined : "Mettre en place une Content-Security-Policy adaptée à vos passerelles de paiement (Stripe, Mollie, PayPal).",
    urgencyLevel: 'critique'
  });

  // 5. Referrer-Policy - 5 pts
  const refPolicy = headers['referrer-policy'];
  const hasGoodRefPolicy = Boolean(
    refPolicy && 
    ['strict-origin-when-cross-origin', 'no-referrer', 'same-origin', 'strict-origin'].includes(refPolicy.toLowerCase())
  );

  results.push({
    id: 'header_referrer',
    category: 'headers',
    name: 'Protection des données de navigation (Referrer-Policy)',
    passed: hasGoodRefPolicy,
    scoreWeight: 5,
    earnedPoints: hasGoodRefPolicy ? 5 : 0,
    valueDetected: refPolicy,
    userExplanation: hasGoodRefPolicy
      ? "L'adresse complète des pages consultées par vos clients (panier, validation) n'est pas divulguée aux régies externes."
      : "L'en-tête Referrer-Policy n'est pas restreint, ce qui peut exposer des URL de commande sensibles.",
    recommendation: hasGoodRefPolicy ? undefined : "Ajouter l'en-tête 'Referrer-Policy: strict-origin-when-cross-origin'.",
    urgencyLevel: 'recommande'
  });

  // 6. Permissions-Policy - 5 pts
  const permPolicy = headers['permissions-policy'] || headers['feature-policy'];
  const hasPermPolicy = Boolean(permPolicy && permPolicy.length > 0);

  results.push({
    id: 'header_permissions',
    category: 'exposure',
    name: 'Restriction des capteurs (Permissions-Policy)',
    passed: hasPermPolicy,
    scoreWeight: 5,
    earnedPoints: hasPermPolicy ? 5 : 0,
    valueDetected: permPolicy,
    userExplanation: hasPermPolicy
      ? "Les fonctions sensibles du navigateur (micro, caméra, géolocalisation) sont neutralisées pour les scripts tiers."
      : "L'en-tête Permissions-Policy est absent (les scripts publicitaires ont accès aux API navigateur par défaut).",
    recommendation: hasPermPolicy ? undefined : "Ajouter l'en-tête 'Permissions-Policy: camera=(), microphone=(), geolocation=()'.",
    urgencyLevel: 'info'
  });

  return results;
}

/**
 * Analyse le HTML public pour détecter les balises meta de version et les indicateurs WooCommerce/WordPress
 */
export function evaluateHtmlExposure(html: string): {
  checks: SecurityCheckResult[];
  isWordPress: boolean;
  isWooCommerce: boolean;
  wpVersion?: string;
  wcVersion?: string;
} {
  const checks: SecurityCheckResult[] = [];

  // Détection WordPress
  const wpGeneratorMatch = html.match(/<meta\s+name=["']generator["']\s+content=["']WordPress\s*([\d\.]*)["']/i);
  const isWpByContent = /wp-content|wp-includes/i.test(html);
  const isWordPress = Boolean(wpGeneratorMatch || isWpByContent);
  const wpVersion = wpGeneratorMatch ? wpGeneratorMatch[1] : undefined;

  // Masquage de la version WordPress - 10 pts
  const wpVersionHidden = !wpGeneratorMatch || !wpVersion;
  checks.push({
    id: 'hide_wp_version',
    category: 'exposure',
    name: 'Masquage public de la version WordPress',
    passed: wpVersionHidden,
    scoreWeight: 10,
    earnedPoints: wpVersionHidden ? 10 : 0,
    valueDetected: wpVersion ? `WordPress ${wpVersion}` : undefined,
    userExplanation: wpVersionHidden
      ? "La version de WordPress n'apparaît pas en clair dans votre code public. Les robots pirates ne peuvent pas cibler de failles directes."
      : `Votre code HTML affiche en clair 'WordPress ${wpVersion}'. Les pirates savent immédiatement quelles failles tester sur votre boutique.`,
    recommendation: wpVersionHidden ? undefined : "Supprimer la balise generator via remove_action('wp_head', 'wp_generator'); dans votre thème ou plugin de sécurité.",
    urgencyLevel: 'urgent'
  });

  // Détection WooCommerce
  const wcGeneratorMatch = html.match(/<meta\s+name=["']generator["']\s+content=["']WooCommerce\s*([\d\.]*)["']/i);
  const isWcByScripts = /woocommerce|wc-add-to-cart|woocommerce-store/i.test(html);
  const isWooCommerce = Boolean(wcGeneratorMatch || isWcByScripts);
  const wcVersion = wcGeneratorMatch ? wcGeneratorMatch[1] : undefined;

  // Masquage de la version WooCommerce - 10 pts
  const wcVersionHidden = !wcGeneratorMatch || !wcVersion;
  checks.push({
    id: 'hide_wc_version',
    category: 'exposure',
    name: 'Masquage public de la version WooCommerce',
    passed: wcVersionHidden,
    scoreWeight: 10,
    earnedPoints: wcVersionHidden ? 10 : 0,
    valueDetected: wcVersion ? `WooCommerce ${wcVersion}` : undefined,
    userExplanation: wcVersionHidden
      ? "La version de votre module e-commerce WooCommerce est convenablement dissimulée."
      : `La version publique 'WooCommerce ${wcVersion}' est exposée dans le code source de la boutique.`,
    recommendation: wcVersionHidden ? undefined : "Désactiver l'affichage public du numéro de version de WooCommerce.",
    urgencyLevel: 'urgent'
  });

  return {
    checks,
    isWordPress,
    isWooCommerce,
    wpVersion,
    wcVersion
  };
}

/**
 * Analyse le statut HTTPS, la redirection et le certificat SSL/TLS
 */
export function evaluateSslAndRedirection(input: RawScanInput): SecurityCheckResult[] {
  const checks: SecurityCheckResult[] = [];

  // 1. Redirection HTTP vers HTTPS - 15 pts
  const finalIsHttps = input.finalUrl.startsWith('https://');
  const redirectionPassed = finalIsHttps;

  checks.push({
    id: 'https_enforced',
    category: 'ssl',
    name: 'Redirection HTTP vers HTTPS automatique',
    passed: redirectionPassed,
    scoreWeight: 15,
    earnedPoints: redirectionPassed ? 15 : 0,
    valueDetected: input.finalUrl,
    userExplanation: redirectionPassed
      ? "Toutes les requêtes de vos clients sont automatiquement redirigées vers une connexion sécurisée et chiffrée."
      : "La boutique n'impose pas la redirection vers HTTPS. Vos clients peuvent naviguer sans chiffrement.",
    recommendation: redirectionPassed ? undefined : "Activer la redirection 301 automatique vers HTTPS au niveau de votre serveur web ou htaccess.",
    urgencyLevel: 'critique'
  });

  // 2. Validité du certificat SSL - 15 pts
  const isSslValid = input.tlsInfo ? input.tlsInfo.authorized : finalIsHttps;
  checks.push({
    id: 'ssl_valid',
    category: 'ssl',
    name: 'Certificat SSL/TLS valide et reconnu',
    passed: isSslValid,
    scoreWeight: 15,
    earnedPoints: isSslValid ? 15 : 0,
    userExplanation: isSslValid
      ? "Le cadenas vert du navigateur est actif et délivré par une autorité de certification de confiance."
      : "Le certificat SSL est invalide, expiré ou auto-signé. Vos visiteurs voient un avertissement de sécurité alarmant.",
    recommendation: isSslValid ? undefined : "Installer un certificat SSL/TLS valide (Let's Encrypt ou autorité reconnue).",
    urgencyLevel: 'critique'
  });

  // 3. Marge d'expiration SSL (> 30 jours) - 5 pts
  const daysRemaining = input.tlsInfo?.daysRemaining ?? 60; // Par défaut 60 jours si non spécifié
  const expirationPassed = isSslValid && daysRemaining > 30;

  checks.push({
    id: 'ssl_expiration',
    category: 'ssl',
    name: 'Marge de validité du certificat (> 30 jours)',
    passed: expirationPassed,
    scoreWeight: 5,
    earnedPoints: expirationPassed ? 5 : 0,
    valueDetected: `${daysRemaining} jours restants`,
    userExplanation: expirationPassed
      ? `Le certificat est valide pour encore ${daysRemaining} jours, sans risque d'interruption imminente.`
      : `Le certificat arrive bientôt à expiration (${daysRemaining} jours). Un renouvellement rapide est requis.`,
    recommendation: expirationPassed ? undefined : "Vérifier le renouvellement automatique (cron certbot) avant expiration.",
    urgencyLevel: 'urgent'
  });

  return checks;
}

/**
 * Calcul du score global et classification de A à F
 */
export function calculateGrade(totalScore: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  label: string;
} {
  if (totalScore >= 90) return { grade: 'A', label: 'Excellente sécurité' };
  if (totalScore >= 75) return { grade: 'B', label: 'Bonne sécurité (à peaufiner)' };
  if (totalScore >= 60) return { grade: 'C', label: 'Sécurité moyenne (failles passives détectées)' };
  if (totalScore >= 45) return { grade: 'D', label: 'Sécurité vulnérable (actions urgentes requises)' };
  if (totalScore >= 25) return { grade: 'E', label: 'Sécurité critique (boutique à risque élevé)' };
  return { grade: 'F', label: 'Niveau d\'exposition maximal (non protégée)' };
}

/**
 * Détecte passivement les passerelles de paiement réputées dans le HTML public
 */
export function detectPaymentGateways(html: string): PaymentGatewayDetected[] {
  const gateways: PaymentGatewayDetected[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      foundInHtml: /js\.stripe\.com|stripe-elements|woocommerce-gateway-stripe/i.test(html)
    },
    {
      id: 'mollie',
      name: 'Mollie (Belgique / France)',
      foundInHtml: /mollie\.com|woocommerce-gateway-mollie|mollie-components/i.test(html)
    },
    {
      id: 'paypal',
      name: 'PayPal',
      foundInHtml: /paypal\.com|paypal-checkout|woocommerce-paypal-payments/i.test(html)
    },
    {
      id: 'payplug',
      name: 'Payplug',
      foundInHtml: /payplug\.com|payplug-gateway/i.test(html)
    },
    {
      id: 'klarna',
      name: 'Klarna',
      foundInHtml: /klarna\.com|klarna-payments/i.test(html)
    }
  ];

  return gateways.filter(g => g.foundInHtml);
}

/**
 * Estime le chiffre d'affaires quotidien moyen et la perte financière en cas d'incident
 * basé sur la tranche de CA déclarée ou moyenne (250 000 € / an par défaut)
 */
export function estimateRevenueRisk(
  bracket: '100k_250k' | '250k_500k' = '100k_250k',
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
): RevenueRiskEstimation {
  const annualTurnover = bracket === '100k_250k' ? 180000 : 380000;
  const dailyAverage = Math.round(annualTurnover / 365);

  let lossMultiplier = 0.05; // 5% si A
  let explanation = "Risque financier très faible : boutique bien protégée, maintenance préventive recommandée.";

  if (grade === 'B') {
    lossMultiplier = 0.15;
    explanation = "Risque financier modéré : quelques défauts de configuration à colmater.";
  } else if (grade === 'C') {
    lossMultiplier = 0.5;
    explanation = "Risque financier important : un blocage de paiement ou certificat expiré peut paralyser vos ventes pendant 24h à 48h.";
  } else if (grade === 'D' || grade === 'E' || grade === 'F') {
    lossMultiplier = 1.0;
    explanation = "Risque financier critique : forte exposition aux attaques automatisées et aux pannes bloquantes lors des pics de vente.";
  }

  const estimatedLoss = Math.round(dailyAverage * lossMultiplier);

  return {
    annualTurnoverBracket: bracket,
    dailyRevenueAverage: dailyAverage,
    estimatedDailyLossOnBreach: estimatedLoss,
    explanation
  };
}

/**
 * Génère la recommandation d'offre commerciale adaptée à la maturité du score
 * - Notes A & B : Abonnement Sérénité (69 €/mois) en offre reine
 * - Notes C, D, E, F : Diagnostic Complet (590 € HTVA) en intervention d'urgence
 */
export function buildCommercialOffer(grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'): CommercialOfferRecommendation {
  if (grade === 'A' || grade === 'B') {
    return {
      recommendedOffer: 'serenite_subscription',
      headline: "Maintenez votre niveau d'excellence en toute sérénité",
      subtext: "Votre boutique est saine ! Évitez les régressions lors des prochaines mises à jour WooCommerce en déléguant la maintenance.",
      primaryButtonLabel: "Souscrire l'Abonnement Sérénité",
      primaryPrice: "69 € HTVA / mois",
      secondaryButtonLabel: "Réserver un diagnostic complet sur mesure",
      secondaryPrice: "590 € HTVA"
    };
  }

  return {
    recommendedOffer: 'complete_diagnostic',
    headline: "Intervention prioritaire recommandée sur votre boutique",
    subtext: "Des failles passives critiques exposent vos commandes et la confiance de vos acheteurs. Un expert WooCommerce audite et corrige vos points de blocage.",
    primaryButtonLabel: "Réserver mon Diagnostic Complet Prioritaire",
    primaryPrice: "590 € HTVA",
    secondaryButtonLabel: "Découvrir l'Abonnement Sérénité mensuel",
    secondaryPrice: "69 € HTVA / mois"
  };
}

/**
 * Calcule le delta de progression par rapport à un audit antérieur
 */
export function calculateProgressDelta(currentScore: number, previousScore?: number) {
  if (typeof previousScore !== 'number') return undefined;

  const difference = currentScore - previousScore;
  const isImproved = difference > 0;

  return {
    previousScore,
    difference,
    isImproved,
    label: isImproved 
      ? `+${difference} pts gagnés depuis votre précédente analyse !`
      : `${difference} pts d'évolution par rapport à la dernière analyse.`
  };
}

export interface PassiveScanOptions {
  previousScore?: number;
  turnoverBracket?: '100k_250k' | '250k_500k';
}

/**
 * Moteur principal : traite les données d'une analyse passive 100% standard
 */
export function runPassiveScanAnalysis(
  input: RawScanInput,
  options: PassiveScanOptions = {}
): PassiveScanReport {
  const normalizedHeaders = normalizeHeaders(input.headers);
  const sslChecks = evaluateSslAndRedirection(input);
  const headerChecks = evaluateSecurityHeaders(normalizedHeaders);
  const htmlResults = evaluateHtmlExposure(input.htmlBody);
  const detectedGateways = detectPaymentGateways(input.htmlBody);

  const allChecks = [...sslChecks, ...headerChecks, ...htmlResults.checks];

  // Calcul du score total
  const totalScore = allChecks.reduce((sum, item) => sum + item.earnedPoints, 0);
  const { grade, label } = calculateGrade(totalScore);

  // Top 3 des priorités : critères échoués triés par niveau d'urgence puis par points perdus
  const failedChecks = allChecks.filter(c => !c.passed);
  
  const urgencyWeight = {
    critique: 4,
    urgent: 3,
    recommande: 2,
    info: 1
  };

  const top3Priorities = failedChecks
    .sort((a, b) => {
      const diffUrgency = urgencyWeight[b.urgencyLevel] - urgencyWeight[a.urgencyLevel];
      if (diffUrgency !== 0) return diffUrgency;
      return b.scoreWeight - a.scoreWeight;
    })
    .slice(0, 3);

  let domain = input.url;
  try {
    const parsed = new URL(input.url);
    domain = parsed.hostname;
  } catch {
    domain = input.url.replace(/^https?:\/\//, '').split('/')[0];
  }

  const commercialOffer = buildCommercialOffer(grade);
  const revenueRisk = estimateRevenueRisk(options.turnoverBracket, grade);
  const trustBadgeEligible = grade === 'A';
  const progressDelta = calculateProgressDelta(totalScore, options.previousScore);

  return {
    domain,
    scanDate: new Date().toISOString(),
    isWooCommerceDetected: htmlResults.isWooCommerce,
    isWordPressDetected: htmlResults.isWordPress,
    detectedPaymentGateways: detectedGateways,
    totalScore,
    grade,
    gradeLabel: label,
    checks: allChecks,
    top3Priorities,
    commercialOffer,
    revenueRisk,
    trustBadgeEligible,
    progressDelta
  };
}
