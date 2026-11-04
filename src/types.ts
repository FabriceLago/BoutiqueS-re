/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Définitions des types TypeScript centraux (src/types.ts)
 * 
 * Assure la cohérence des contrats de données entre le scanner passif,
 * l'analyse d'en-têtes HTTP, l'analyse SSL, l'IA et le composant BulletinMockup.
 */

/**
 * Notes officielles de sécurité BoutiqueSûre
 * - Note A (90-100 pts) : Excellente sécurité
 * - Note B (75-89 pts)  : Bonne sécurité (ajustements mineurs)
 * - Note C (60-74 pts)  : Sécurité moyenne (failles passives détectées)
 * - Note D (45-59 pts)  : Sécurité vulnérable (actions urgentes requises)
 * - Note E (25-44 pts)  : Sécurité critique (boutique à risque élevé)
 * - Note F (< 25 pts)   : Niveau d'exposition maximal (non protégée)
 */
export type SecurityGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/**
 * Niveaux d'urgence pour le commerçant
 */
export type UrgencyLevel = 'critique' | 'urgent' | 'recommande' | 'info';

/**
 * Piliers de l'audit 100% passif sur 100 points
 */
export type SecurityPillarId = 'ssl' | 'headers' | 'exposure';

/**
 * Score et état d'un des 3 piliers de sécurité
 */
export interface SecurityPillarScore {
  pillar: SecurityPillarId;
  name: string;
  pointsEarned: number;
  maxPoints: number;
  status: 'excellent' | 'warning' | 'danger';
  checksCount: number;
  passedCount: number;
  details?: string;
}

/**
 * Détail d'un contrôle individuel de sécurité passif
 */
export interface SecurityCheckDetail {
  id: string;
  name: string;
  pillar: SecurityPillarId;
  passed: boolean;
  pointsEarned: number;
  maxPoints: number;
  valueDetected?: string;
  userExplanation: string;
  recommendation?: string;
  urgency: UrgencyLevel;
}

/**
 * Vulnérabilité ou anomalie identifiée sur la boutique
 */
export interface SecurityFlaw {
  id: string;
  title: string;
  severity: 'critique' | 'haute' | 'moyenne' | 'faible';
  description: string;
  merchantImpact: string;
  pillar?: SecurityPillarId;
}

/**
 * Recommandation de sécurité actionnable et vulgarisée
 */
export interface SecurityRecommendation {
  priority: number;
  title: string;
  description: string;
  urgency: string; // Ex: 'Priorité 1 (Critique)' ou 'Urgent'
  urgencyLevel?: UrgencyLevel;
  difficulty: 'facile' | 'moyen' | 'technique';
  estimatedGain: string;
  actionableSteps?: string[];
  implementationAdvice?: string;
}

/**
 * Estimation financière du préjudice potentiel en cas d'interruption panier
 */
export interface RevenueRiskEstimation {
  annualTurnoverBracket: '100k_250k' | '250k_500k';
  dailyRevenueAverage: number;
  dailyLossEstimate: string; // Ex: "~245 € / jour"
  explanation: string;
}

/**
 * Aiguillage commercial dynamique (Sérénité 69€/mois ou Diagnostic 590€ HTVA)
 */
export interface CommercialOffer {
  recommendedOffer: 'serenite_subscription' | 'complete_diagnostic';
  headline: string;
  subtext: string;
  primaryPrice: string;
  primaryButtonLabel: string;
  secondaryPrice?: string;
  secondaryButtonLabel?: string;
}

/**
 * Benchmark sectoriel comparatif (anonymisé et vulgarisé)
 */
export interface SectorBenchmark {
  percentile: number; // e.g. 78 (mieux protégé que 78% des boutiques de la catégorie)
  sectorName: string; // e.g. "E-Commerce & Retail WooCommerce"
  averageScore: number; // e.g. 58
  nationalRankComment: string; // Ex: "Votre boutique surpasse 78% des e-commerçants de votre secteur"
}

/**
 * Indicateur de préparation à la Directive Européenne NIS 2 (Cybersécurité e-commerce)
 */
export interface Nis2Readiness {
  status: 'conforme' | 'partiel' | 'non_conforme';
  label: string; // Ex: "Directive Européenne NIS 2 : Conforme (Niveau Avancé)"
  scorePercent: number; // e.g. 90%, 65%, 25%
  articleReference: string; // "Article 21 (Mesures de gestion des risques de cybersécurité)"
  keyRequirementsMet: string[];
  pendingActions: string[];
}

/**
 * Détection passive de l'hébergeur, CDN et pixels tiers
 */
export interface HostAndCdnDetection {
  provider: string; // Ex: "Cloudflare & Nginx", "OVHcloud", "o2switch"
  cdnActive: boolean;
  serverSoftware?: string;
  detectedThirdPartyScripts: string[]; // Ex: ['Meta Pixel', 'Google Tag Manager', 'Stripe Elements']
  cspCoverage: 'complete' | 'partielle' | 'absente';
  recommendation: string;
}


/**
 * Structure complète de l'AuditResult pour l'affichage du bulletin et la persistance
 */
export interface AuditResult {
  id: string;
  url: string;
  domain: string;
  scanDate: string;
  score: number; // 0 à 100
  grade: SecurityGrade;
  gradeLabel: string;
  appreciation: string;
  tagline: string;

  // Décomposition par pilier (Total = 100 points)
  pillars: {
    ssl: SecurityPillarScore;        // 35 pts max
    headers: SecurityPillarScore;    // 40 pts max
    exposure: SecurityPillarScore;   // 25 pts max
  };

  // Actions correctives prioritaires (Top 3) et liste complète
  recommendations: SecurityRecommendation[];
  topPriorities: SecurityRecommendation[];
  flaws: SecurityFlaw[];
  checks?: SecurityCheckDetail[];

  // Contexte technique de la boutique
  isWooCommerceConfirmed: boolean;
  isWordPressConfirmed: boolean;
  detectedPaymentGateways: string[];

  // Risque financier et offre commerciale adaptée
  revenueRisk: RevenueRiskEstimation;
  commercialOffer: CommercialOffer;

  // Benchmark sectoriel, Directive NIS 2 et Détection hébergeur/CDN
  sectorBenchmark?: SectorBenchmark;
  nis2Readiness?: Nis2Readiness;
  hostAndCdn?: HostAndCdnDetection;

  // Badge et delta de progression
  trustBadgeEligible: boolean;
  progressDelta?: {
    previousScore?: number;
    difference?: number;
    isImproved?: boolean;
    label?: string;
  };

  // Métadonnées techniques optionnelles
  technicalMeta?: {
    statusCode?: number;
    responseTimeMs?: number;
    finalUrl?: string;
    isHttps?: boolean;
    sslIssuer?: string;
    sslExpiresAt?: string;
    sslDaysRemaining?: number;
  };
}

/**
 * Configuration visuelle et stylistique d'une note de sécurité
 */
export interface GradeDisplayConfig {
  grade: SecurityGrade;
  scoreRange: string;
  label: string;
  badgeColor: string;
  bgColor: string;
  textColor: string;
  tagline: string;
}

/**
 * Restitue la configuration visuelle associée à une note officielle A à F
 */
export function getGradeDisplayConfig(grade: SecurityGrade): GradeDisplayConfig {
  switch (grade) {
    case 'A':
      return {
        grade: 'A',
        scoreRange: '90 - 100 pts',
        label: 'Excellente sécurité passive',
        badgeColor: 'bg-emerald-500 text-slate-950',
        bgColor: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400',
        textColor: 'text-emerald-400',
        tagline: 'Votre boutique dispose d\'un très bon niveau de protection publique. Continuez ainsi !'
      };
    case 'B':
      return {
        grade: 'B',
        scoreRange: '75 - 89 pts',
        label: 'Bonne sécurité — Ajustements mineurs',
        badgeColor: 'bg-emerald-400 text-slate-950',
        bgColor: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300',
        textColor: 'text-emerald-300',
        tagline: 'Les bases de sécurité sont solides, quelques en-têtes optionnels méritent d\'être renforcés.'
      };
    case 'C':
      return {
        grade: 'C',
        scoreRange: '60 - 74 pts',
        label: 'Sécurité moyenne — Failles passives détectées',
        badgeColor: 'bg-amber-500 text-slate-950',
        bgColor: 'bg-amber-950/40 border-amber-500/40 text-amber-400',
        textColor: 'text-amber-400',
        tagline: 'Plusieurs portes d\'entrée publiques restent ouvertes et vous rendent vulnérable aux attaques automatisées.'
      };
    case 'D':
      return {
        grade: 'D',
        scoreRange: '45 - 59 pts',
        label: 'Sécurité vulnérable — Actions urgentes requises',
        badgeColor: 'bg-orange-500 text-white',
        bgColor: 'bg-orange-950/50 border-orange-500/40 text-orange-400',
        textColor: 'text-orange-400',
        tagline: 'Des en-têtes critiques manquent à l\'appel et les versions de votre boutique sont exposées.'
      };
    case 'E':
      return {
        grade: 'E',
        scoreRange: '25 - 44 pts',
        label: 'Sécurité critique — Boutique fortement exposée',
        badgeColor: 'bg-rose-500 text-white',
        bgColor: 'bg-rose-950/60 border-rose-500/50 text-rose-400',
        textColor: 'text-rose-400',
        tagline: 'Attention : votre boutique ne possède quasiment aucune protection d\'en-tête et expose ses versions logicielles.'
      };
    case 'F':
    default:
      return {
        grade: 'F',
        scoreRange: '< 25 pts',
        label: 'Niveau d\'exposition maximal — Non protégée',
        badgeColor: 'bg-red-600 text-white',
        bgColor: 'bg-red-950/80 border-red-500/60 text-red-400',
        textColor: 'text-red-400',
        tagline: 'Votre boutique en ligne présente des failles critiques immédiates laissant les données clients vulnérables.'
      };
  }
}

/**
 * Génère un objet AuditResult par défaut pour la maquette et les tests
 */
export function createDefaultAuditResult(
  url: string = 'https://maboutique-mode.fr',
  requestedGrade: SecurityGrade = 'C'
): AuditResult {
  const domain = url.replace(/^https?:\/\//i, '').split('/')[0];
  const config = getGradeDisplayConfig(requestedGrade);
  const scanDate = new Date().toISOString();

  const scoresByGrade: Record<SecurityGrade, { total: number; ssl: number; headers: number; exposure: number }> = {
    A: { total: 95, ssl: 35, headers: 35, exposure: 25 },
    B: { total: 80, ssl: 35, headers: 25, exposure: 20 },
    C: { total: 65, ssl: 35, headers: 15, exposure: 15 },
    D: { total: 50, ssl: 20, headers: 15, exposure: 15 },
    E: { total: 35, ssl: 20, headers: 10, exposure: 5 },
    F: { total: 15, ssl: 0, headers: 10, exposure: 5 }
  };

  const scores = scoresByGrade[requestedGrade];

  const prioritiesByGrade: Record<SecurityGrade, SecurityRecommendation[]> = {
    A: [
      {
        priority: 1,
        title: "Politique de permissions (Permissions-Policy)",
        description: "Ajouter l'en-tête Permissions-Policy pour interdire l'accès micro/caméra aux scripts tiers.",
        urgency: "Conseil de perfectionnement",
        urgencyLevel: 'info',
        difficulty: 'facile',
        estimatedGain: "+5 points pour atteindre 100/100"
      }
    ],
    C: [
      {
        priority: 1,
        title: "Activer la protection HSTS (Strict-Transport-Security)",
        description: "Indispensable pour forcer le chiffrement SSL et empêcher l'interception de données bancaires en Wi-Fi public.",
        urgency: "Priorité 1 (Critique)",
        urgencyLevel: 'critique',
        difficulty: 'facile',
        estimatedGain: "+10 points au score de sécurité"
      },
      {
        priority: 2,
        title: "Masquer la version exacte de WordPress & WooCommerce",
        description: "La balise generator est visible publiquement dans votre code HTML, facilitant le travail des robots malveillants.",
        urgency: "Priorité 2 (Urgent)",
        urgencyLevel: 'urgent',
        difficulty: 'facile',
        estimatedGain: "+20 points sur l'exposition publique"
      },
      {
        priority: 3,
        title: "Configurer l'en-tête X-Frame-Options (Anti-Clickjacking)",
        description: "Empêche des sites pirates d'incruster votre formulaire de commande en iframe pour dérober des identifiants.",
        urgency: "Priorité 3 (Recommandé)",
        urgencyLevel: 'recommande',
        difficulty: 'facile',
        estimatedGain: "+10 points de protection panier"
      }
    ],
    E: [
      {
        priority: 1,
        title: "Redirection HTTPS non systématique ou certificat fragile",
        description: "Certains visiteurs peuvent naviguer en clair sans chiffrement, exposant les identifiants et paniers.",
        urgency: "Priorité 1 (Immédiat)",
        urgencyLevel: 'critique',
        difficulty: 'facile',
        estimatedGain: "+15 points et conformité bancaire"
      },
      {
        priority: 2,
        title: "Absence totale d'en-têtes HTTP de sécurité",
        description: "Aucune barrière CSP ou HSTS active contre les injections de faux scripts de paiement.",
        urgency: "Priorité 2 (Immédiat)",
        urgencyLevel: 'critique',
        difficulty: 'moyen',
        estimatedGain: "+40 points de sécurité"
      },
      {
        priority: 3,
        title: "Versions publiques WooCommerce et extensions visibles",
        description: "Signale immédiatement aux attaquants si vos modules accusent un retard de mise à jour.",
        urgency: "Priorité 3 (Urgent)",
        urgencyLevel: 'urgent',
        difficulty: 'facile',
        estimatedGain: "+25 points pour bloquer les robots"
      }
    ],
    B: [
      {
        priority: 1,
        title: "Déployer une politique CSP (Content-Security-Policy)",
        description: "Protège contre l'injection de scripts tiers sur le formulaire de commande.",
        urgency: "Priorité 1 (Important)",
        urgencyLevel: 'urgent',
        difficulty: 'moyen',
        estimatedGain: "+10 points"
      }
    ],
    D: [
      {
        priority: 1,
        title: "Mettre en place HSTS et verrouiller la redirection HTTPS",
        description: "Votre boutique autorise encore des flux HTTP non chiffrés sur certaines pages.",
        urgency: "Priorité 1 (Critique)",
        urgencyLevel: 'critique',
        difficulty: 'facile',
        estimatedGain: "+20 points"
      }
    ],
    F: [
      {
        priority: 1,
        title: "Sécurisation d'urgence HTTPS et en-têtes fondamentaux",
        description: "Votre boutique est exposée sans aucune protection de base.",
        urgency: "Priorité 1 (Critique)",
        urgencyLevel: 'critique',
        difficulty: 'facile',
        estimatedGain: "+50 points"
      }
    ]
  };

  const priorities = prioritiesByGrade[requestedGrade];

  return {
    id: `BS-${Date.now().toString(36).toUpperCase()}`,
    url,
    domain,
    scanDate,
    score: scores.total,
    grade: requestedGrade,
    gradeLabel: config.label,
    appreciation: `Diagnostic de sécurité passive de votre boutique ${domain}. Note officielle : ${requestedGrade} (${scores.total}/100).`,
    tagline: config.tagline,
    pillars: {
      ssl: {
        pillar: 'ssl',
        name: 'Chiffrement SSL / HTTPS',
        pointsEarned: scores.ssl,
        maxPoints: 35,
        status: scores.ssl >= 30 ? 'excellent' : scores.ssl >= 15 ? 'warning' : 'danger',
        checksCount: 3,
        passedCount: scores.ssl >= 35 ? 3 : scores.ssl >= 20 ? 2 : 1
      },
      headers: {
        pillar: 'headers',
        name: 'En-têtes HTTP de sécurité',
        pointsEarned: scores.headers,
        maxPoints: 40,
        status: scores.headers >= 30 ? 'excellent' : scores.headers >= 15 ? 'warning' : 'danger',
        checksCount: 6,
        passedCount: scores.headers >= 30 ? 5 : scores.headers >= 15 ? 2 : 1
      },
      exposure: {
        pillar: 'exposure',
        name: 'Protection contre l\'exposition',
        pointsEarned: scores.exposure,
        maxPoints: 25,
        status: scores.exposure >= 20 ? 'excellent' : scores.exposure >= 10 ? 'warning' : 'danger',
        checksCount: 3,
        passedCount: scores.exposure >= 20 ? 2 : 1
      }
    },
    recommendations: priorities,
    topPriorities: priorities.slice(0, 3),
    flaws: [
      {
        id: 'FLAW_HSTS',
        title: 'Absence de HSTS',
        severity: 'haute',
        description: 'Le chiffrement strict n\'est pas forcé.',
        merchantImpact: 'Risque d\'interception de données bancaires.',
        pillar: 'headers'
      }
    ],
    isWooCommerceConfirmed: true,
    isWordPressConfirmed: true,
    detectedPaymentGateways: ['Stripe', 'PayPal'],
    revenueRisk: {
      annualTurnoverBracket: '100k_250k',
      dailyRevenueAverage: 685,
      dailyLossEstimate: requestedGrade === 'A' ? '~25 € / jour' : requestedGrade === 'C' ? '~245 € / jour' : '~490 € / jour de perte',
      explanation: requestedGrade === 'A'
        ? "Votre boutique est saine : le risque financier est minime."
        : "Un blocage de passerelle de paiement ou un certificat expiré paralyse immédiatement les commandes de vos clients."
    },
    sectorBenchmark: {
      percentile: requestedGrade === 'A' ? 84 : requestedGrade === 'C' ? 48 : 12,
      sectorName: "E-Commerce & Retail WooCommerce (Belgique & France)",
      averageScore: 58,
      nationalRankComment: requestedGrade === 'A'
        ? "Votre boutique surpasse 84% des e-commerçants de votre secteur (Indice de confiance maximal)."
        : requestedGrade === 'C'
        ? "Votre niveau de protection se situe dans la moyenne basse (48%), vulnérable aux attaques opportunistes."
        : "Votre boutique est plus exposée que 88% des e-commerces similaires (Urgence d'intervention)."
    },
    nis2Readiness: {
      status: requestedGrade === 'A' ? 'conforme' : requestedGrade === 'C' ? 'partiel' : 'non_conforme',
      label: requestedGrade === 'A' 
        ? "Conforme Directive NIS 2 (Niveau Avancé)" 
        : requestedGrade === 'C' 
        ? "Conformité partielle Directive NIS 2" 
        : "Non conforme Directive Européenne NIS 2",
      scorePercent: requestedGrade === 'A' ? 92 : requestedGrade === 'C' ? 60 : 25,
      articleReference: "Directive Européenne NIS 2 (UE 2022/2555) — Article 21 : Mesures de gestion des risques",
      keyRequirementsMet: requestedGrade === 'A'
        ? [
            "Chiffrement SSL/TLS moderne sans régression",
            "En-têtes stricts de sécurité HTTP (HSTS, CSP, X-Frame)",
            "Masquage des versions d'infrastructure publique"
          ]
        : requestedGrade === 'C'
        ? [
            "Certificat SSL actif",
            "Protection anti-clickjacking minimale"
          ]
        : [
            "Présence d'un certificat SSL"
          ],
      pendingActions: requestedGrade === 'A'
        ? ["Maintenir la veille proactive mensuelle"]
        : requestedGrade === 'C'
        ? [
            "Déployer l'en-tête HSTS pour neutraliser les attaques en clair",
            "Masquer les numéros de version WooCommerce et plugins"
          ]
        : [
            "Forcer la redirection HTTPS sur tout le catalogue",
            "Déployer la suite d'en-têtes HTTP de sécurité",
            "Masquer la version PHP et les plugins obsolètes"
          ]
    },
    hostAndCdn: {
      provider: requestedGrade === 'A' ? "Cloudflare & Nginx (Sécurisé)" : "OVHcloud / Apache",
      cdnActive: requestedGrade === 'A',
      serverSoftware: requestedGrade === 'A' ? "Nginx / 1.24 (Masqué)" : "Apache 2.4",
      detectedThirdPartyScripts: ["Meta Pixel", "Google Tag Manager", "Stripe Checkout"],
      cspCoverage: requestedGrade === 'A' ? 'complete' : requestedGrade === 'C' ? 'partielle' : 'absente',
      recommendation: requestedGrade === 'A'
        ? "Configuration optimale avec CDN et isolation des scripts tiers."
        : "Les scripts tiers (pixels publicitaires) ne sont pas isolés par CSP. Risque d'altération du panier."
    },
    commercialOffer: {
      recommendedOffer: ['A', 'B'].includes(requestedGrade) ? 'serenite_subscription' : 'complete_diagnostic',
      headline: ['A', 'B'].includes(requestedGrade) 
        ? "Abonnement Sérénité WooCommerce" 
        : "Diagnostic & Correctifs d'urgence",
      subtext: ['A', 'B'].includes(requestedGrade)
        ? "Surveillance passive 24/7 et interventions préventives mensuelles."
        : "Intervention sous 24h par un ingénieur dédié pour corriger l'ensemble des failles.",
      primaryPrice: ['A', 'B'].includes(requestedGrade) ? "69 € HTVA / mois" : "590 € HTVA",
      primaryButtonLabel: ['A', 'B'].includes(requestedGrade) ? "Activer Sérénité (69 €/mois)" : "Sécuriser ma boutique (590 €)"
    },
    trustBadgeEligible: requestedGrade === 'A',
    progressDelta: {
      previousScore: 50,
      difference: scores.total - 50,
      isImproved: scores.total >= 50,
      label: scores.total >= 50 ? `+${scores.total - 50} pts depuis le dernier audit` : `${scores.total - 50} pts`
    }
  };
}
