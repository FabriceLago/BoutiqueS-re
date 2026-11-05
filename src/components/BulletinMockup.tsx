/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Maquette Écran 3 : Bulletin de sécurité A à F
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Download, 
  Share2, 
  ExternalLink,
  Calendar,
  Lock,
  Mail,
  RefreshCw,
  Info,
  HelpCircle,
  Server,
  Layers,
  Cpu,
  Code2,
  Copy,
  Check,
  Sliders,
  Award,
  FileCode,
  TrendingUp,
  Globe,
  Building2,
  Sparkles,
  Gauge,
  Compass,
  Terminal,
  QrCode,
  FileCheck2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { AuditResult, SecurityRecommendation } from '../types.ts';
import jsPDF from 'jspdf';
import { InfoTooltip } from './InfoTooltip.tsx';
import { OnboardingTour } from './OnboardingTour.tsx';
import { RemediationDrawer, REMEDIATION_SNIPPETS } from './RemediationDrawer.tsx';
import { NIS2AttestationModal } from './NIS2AttestationModal.tsx';
import { OrderModal, OfferType } from './OrderModal.tsx';
import { EmailDnsSecurityAudit } from './EmailDnsSecurityAudit.tsx';
import { PaymentGatewaysAudit } from './PaymentGatewaysAudit.tsx';
import { GreenPerformanceAudit } from './GreenPerformanceAudit.tsx';
import { BeforeAfterComparison } from './BeforeAfterComparison.tsx';
import { DynamicBadgeWidget } from './DynamicBadgeWidget.tsx';
import { AuditQrShareModal } from './AuditQrShareModal.tsx';
import { sendAuditReportEmail } from '../services/resendService.ts';
import { RoiConversionCalculator } from './RoiConversionCalculator.tsx';
import { BankInsuranceAttestationModal } from './BankInsuranceAttestationModal.tsx';
import { DataBreachScanner } from './DataBreachScanner.tsx';
import { WebhookAlertsConfig } from './WebhookAlertsConfig.tsx';

export interface BulletinMockupProps {
  storeUrl?: string;
  email?: string;
  isMobileView?: boolean;
  auditResult?: AuditResult;
  onNavigateToScreen?: (screen: 'home' | 'waiting' | 'bulletin' | 'email' | 'audit_logs' | 'privacy') => void;
}

export interface SecurityCriterionItem {
  id: string;
  name: string;
  points: number;
  tooltipTitle: string;
  tooltipContent: string;
  tooltipImpact: string;
  evalStatus: {
    A: { passed: boolean; badge: string };
    C: { passed: boolean; badge: string };
    E: { passed: boolean; badge: string };
  };
}

export interface SecurityPillarItem {
  id: 'ssl' | 'headers' | 'exposure';
  title: string;
  maxPoints: number;
  description: string;
  tooltipTitle: string;
  tooltipContent: string;
  tooltipImpact: string;
  criteria: SecurityCriterionItem[];
}

export const SECURITY_PILLARS: SecurityPillarItem[] = [
  {
    id: 'ssl',
    title: '1. Chiffrement SSL / HTTPS',
    maxPoints: 35,
    description: 'Chiffrement des transactions bancaires et redirection HTTPS',
    tooltipTitle: 'Pilier 1 : Chiffrement SSL / HTTPS (35 points)',
    tooltipContent: 'Vérifie que chaque page et étape de paiement est chiffrée de bout en bout (TLS 1.2/1.3), que le port 80 non sécurisé redirige systématiquement en 301 vers le port 443, et que le certificat dispose d\'une marge de renouvellement supérieure à 30 jours.',
    tooltipImpact: 'Sans HTTPS moderne et valide, les navigateurs affichent un avertissement rouge bloquant et les passerelles de paiement désactivent le checkout.',
    criteria: [
      {
        id: 'ssl-redirect',
        name: 'Redirection HTTPS automatique (301)',
        points: 15,
        tooltipTitle: 'Redirection permanente HTTPS (Port 80 -> 443)',
        tooltipContent: 'Vérifie que chaque visiteur arrivant en HTTP non sécurisé est immédiatement basculé en HTTPS avec le code 301 sans fuite de cookies.',
        tooltipImpact: 'Essentiel pour préserver le référencement naturel (SEO) et bloquer le vol de session lors de la commande.',
        evalStatus: {
          A: { passed: true, badge: '301 Permanent' },
          C: { passed: true, badge: '301 Permanent' },
          E: { passed: false, badge: 'Non forcée' }
        }
      },
      {
        id: 'ssl-cert',
        name: 'Certificat SSL/TLS moderne',
        points: 15,
        tooltipTitle: 'Certificat de chiffrement SSL/TLS',
        tooltipContent: 'Garantit que la connexion utilise un chiffrement fort (TLS 1.2 / TLS 1.3) reconnu par toutes les autorités de confiance.',
        tooltipImpact: 'Obligatoire pour les passerelles de paiement Stripe et PayPal ; évite le blocage complet par Chrome/Safari.',
        evalStatus: {
          A: { passed: true, badge: 'TLS 1.3 Valide' },
          C: { passed: true, badge: 'TLS 1.2 Valide' },
          E: { passed: false, badge: 'Non sécurisé' }
        }
      },
      {
        id: 'ssl-expiry',
        name: 'Marge expiration SSL > 30 jours',
        points: 5,
        tooltipTitle: 'Marge avant expiration du certificat SSL',
        tooltipContent: 'Contrôle que le renouvellement automatique est opérationnel et que le certificat ne risque pas d\'expirer inopinément.',
        tooltipImpact: 'Une expiration non anticipée paralyse instantanément 100% des ventes jusqu\'au renouvellement.',
        evalStatus: {
          A: { passed: true, badge: 'Expire dans 78j' },
          C: { passed: true, badge: 'Expire dans 42j' },
          E: { passed: false, badge: 'Expire dans 4j' }
        }
      }
    ]
  },
  {
    id: 'headers',
    title: '2. En-têtes HTTP de sécurité',
    maxPoints: 40,
    description: 'Directives serveur protégeant les clients contre le vol de cartes',
    tooltipTitle: 'Pilier 2 : En-têtes HTTP de sécurité (40 points)',
    tooltipContent: 'Contrôle les 5 en-têtes HTTP fondamentaux (HSTS, CSP, X-Frame-Options, X-Content-Type, Referrer-Policy) injectés par votre serveur web pour instruire les navigateurs contre le vol de cartes bancaires et le détournement de clics.',
    tooltipImpact: 'Empêche l\'injection de scripts voleurs de coordonnées bancaires (skimming Magecart) et assure la conformité aux exigences PCI-DSS v4.',
    criteria: [
      {
        id: 'header-hsts',
        name: 'Protection HSTS (Strict-Transport)',
        points: 10,
        tooltipTitle: 'En-tête HSTS (Strict-Transport-Security)',
        tooltipContent: 'Ordonne au navigateur de communiquer exclusivement par tunnel chiffré HTTPS pendant 12 à 24 mois sans jamais accepter de clair.',
        tooltipImpact: 'Bloque les attaques d\'écoute Man-in-the-Middle sur réseaux Wi-Fi publics ou réseaux mobiles.',
        evalStatus: {
          A: { passed: true, badge: 'max-age 1 an' },
          C: { passed: false, badge: 'Manquant' },
          E: { passed: false, badge: 'Manquant' }
        }
      },
      {
        id: 'header-xframe',
        name: 'Anti-Clickjacking (X-Frame-Options)',
        points: 10,
        tooltipTitle: 'En-tête X-Frame-Options',
        tooltipContent: 'Interdit l\'affichage de votre checkout dans une iframe transparente sur un site tiers pour capturer les clics et identifiants.',
        tooltipImpact: 'Protège vos clients contre le vol de session et les fausses commandes passées à leur insu.',
        evalStatus: {
          A: { passed: true, badge: 'SAMEORIGIN' },
          C: { passed: false, badge: 'Manquant' },
          E: { passed: false, badge: 'Manquant' }
        }
      },
      {
        id: 'header-csp',
        name: 'Content Security Policy (CSP anti-Magecart)',
        points: 10,
        tooltipTitle: 'Politique de sécurité du contenu (CSP)',
        tooltipContent: 'Définit la liste stricte des domaines autorisés à exécuter des scripts sur votre checkout pour bloquer les voleurs de cartes.',
        tooltipImpact: 'Bouclier n°1 contre le skimming bancaire Magecart et exigence clé de la norme PCI-DSS v4.',
        evalStatus: {
          A: { passed: true, badge: 'CSP Stricte' },
          C: { passed: false, badge: 'Absente' },
          E: { passed: false, badge: 'Absente' }
        }
      },
      {
        id: 'header-xcontent',
        name: 'Anti-MIME Sniffing (X-Content-Type)',
        points: 5,
        tooltipTitle: 'En-tête X-Content-Type-Options',
        tooltipContent: 'Force le navigateur à respecter le type MIME déclaré (nosniff) et refuse d\'exécuter des images déguisées en scripts.',
        tooltipImpact: 'Empêche l\'exécution de webshells injectés via des failles d\'upload de fichiers.',
        evalStatus: {
          A: { passed: true, badge: 'nosniff' },
          C: { passed: true, badge: 'nosniff' },
          E: { passed: false, badge: 'Manquant' }
        }
      },
      {
        id: 'header-referrer',
        name: 'Politique Referrer (Referrer-Policy)',
        points: 5,
        tooltipTitle: 'En-tête Referrer-Policy',
        tooltipContent: 'Limite les données d\'URL transmises aux sites tiers lors des clics sur des liens externes pour ne pas divulguer d\'identifiants.',
        tooltipImpact: 'Préserve la confidentialité des tokens de paiement et des paniers de vos clients.',
        evalStatus: {
          A: { passed: true, badge: 'strict-origin' },
          C: { passed: true, badge: 'strict-origin' },
          E: { passed: false, badge: 'Manquant' }
        }
      }
    ]
  },
  {
    id: 'exposure',
    title: '3. Exposition publique & Versions',
    maxPoints: 25,
    description: 'Protection de l\'environnement serveur PHP, WordPress & plugins',
    tooltipTitle: 'Pilier 3 : Exposition publique & Versions (25 points)',
    tooltipContent: 'Détecte les versions obsolètes de PHP serveur, les extensions WooCommerce identifiables publiquement par des scanners automatisés, et les balises CMS non masquées.',
    tooltipImpact: '85 % des piratages WordPress/WooCommerce exploitent des extensions tierces obsolètes dont les vulnérabilités sont publiques.',
    criteria: [
      {
        id: 'exposure-php',
        name: 'Version PHP du serveur',
        points: 8,
        tooltipTitle: 'Version PHP du serveur d\'hébergement',
        tooltipContent: 'Moteur d\'exécution de WordPress et WooCommerce. Les versions PHP obsolètes (ex: PHP 7.4 ou antérieure) ne reçoivent plus aucun correctif de sécurité et présentent des failles critiques connues des attaquants.',
        tooltipImpact: 'Ralentissement panier (-30% de vitesse d\'exécution) et risque direct de compromission du serveur.',
        evalStatus: {
          A: { passed: true, badge: 'PHP 8.2 Sécurisé' },
          C: { passed: false, badge: 'PHP 8.0 (Fin de vie)' },
          E: { passed: false, badge: 'PHP 7.4 Obsolète' }
        }
      },
      {
        id: 'exposure-plugins',
        name: 'Plugins & Extensions obsolètes',
        points: 7,
        tooltipTitle: 'Plugins & Extensions WooCommerce obsolètes',
        tooltipContent: 'Les extensions tierces sont le premier vecteur d\'intrusion sur WordPress (85% des failles). Exposer publiquement les fichiers readme ou numéros de version de modules obsolètes alerte directement les robots malveillants.',
        tooltipImpact: 'Injections de faux modules de paiement, redirections publicitaires et blacklistage SEO.',
        evalStatus: {
          A: { passed: true, badge: 'Versions masquées' },
          C: { passed: false, badge: '2 modules lisibles' },
          E: { passed: false, badge: 'Plugins vulnérables' }
        }
      },
      {
        id: 'exposure-wp',
        name: 'Masquage versions WP / WC',
        points: 5,
        tooltipTitle: 'Masquage de la version WordPress & WooCommerce',
        tooltipContent: 'La balise HTML <meta name="generator"> indique publiquement la version exacte de votre CMS aux scanners automatisés.',
        tooltipImpact: 'Supprime la visibilité de votre boutique pour les robots recherchant des versions vulnérables.',
        evalStatus: {
          A: { passed: true, badge: 'Balise masquée' },
          C: { passed: false, badge: 'WC 8.x visible' },
          E: { passed: false, badge: 'WP & WC visibles' }
        }
      },
      {
        id: 'exposure-permissions',
        name: 'Politique de permissions (Permissions-Policy)',
        points: 5,
        tooltipTitle: 'En-tête Permissions-Policy',
        tooltipContent: 'Interdit aux scripts tiers (widgets d\'avis, régies pubs, traceurs) d\'accéder à la webcam, micro ou localisation du client.',
        tooltipImpact: 'Confiance accrue de vos acheteurs et conformité stricte aux exigences du RGPD.',
        evalStatus: {
          A: { passed: true, badge: 'Restreint' },
          C: { passed: false, badge: 'Absent' },
          E: { passed: false, badge: 'Absent' }
        }
      }
    ]
  }
];

export interface GradeScaleDefinition {
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  scoreRange: string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeBg: string;
  tooltipTitle: string;
  tooltipContent: string;
  tooltipImpact: string;
  technicalCriteriaSummary: string;
  recommendedAction: string;
}

export const OFFICIAL_GRADE_SCALE: GradeScaleDefinition[] = [
  {
    grade: 'A',
    scoreRange: '90 – 100 pts',
    label: 'Excellente sécurité passive',
    bgColor: 'bg-emerald-950/40',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-500 text-slate-950',
    tooltipTitle: 'Signification technique : Note A (90 à 100 points)',
    tooltipContent: 'Chiffrement SSL/TLS irréprochable (certificat moderne avec expiration > 30 jours, redirection 301 automatique du HTTP vers le HTTPS sans fuite de cookies). Déploiement complet des en-têtes HTTP de sécurité stricts (HSTS sur 1 an, CSP anti-Magecart, X-Frame-Options DENY/SAMEORIGIN, X-Content-Type nosniff, Referrer-Policy). Masquage intégral des versions de votre CMS et de ses extensions.',
    tooltipImpact: 'Confiance absolue des acheteurs et des banques (PCI-DSS v4). Zéro alerte sur navigateur, élimination de 98% des risques d\'intrusion automatisée et conformité anticipée à la directive européenne NIS 2.',
    technicalCriteriaSummary: 'SSL : 35/35 pts • En-têtes : 40/40 pts • Exposition : 25/25 pts',
    recommendedAction: 'Maintien de la veille et intégration du badge de réassurance officiel sur la page panier.'
  },
  {
    grade: 'B',
    scoreRange: '75 – 89 pts',
    label: 'Bonne sécurité — Ajustements mineurs',
    bgColor: 'bg-emerald-950/30',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-400 text-slate-950',
    tooltipTitle: 'Signification technique : Note B (75 à 89 points)',
    tooltipContent: 'Boutique bien protégée sur les fondamentaux : certificat HTTPS valide, redirection 301 en place, HSTS et protection anti-clickjacking actifs. Seuls certains en-têtes secondaires manquent (ex: Content-Security-Policy stricte ou Permissions-Policy) ou une balise de version d\'extension mineure reste détectable par les scanners.',
    tooltipImpact: 'Boutique protégée contre les attaques opportunistes directes. Risque résiduel limité aux scripts publicitaires tiers non cloisonnés.',
    technicalCriteriaSummary: 'SSL : 35/35 pts • En-têtes : 25–35/40 pts • Exposition : 15–20/25 pts',
    recommendedAction: 'Déploiement d\'une politique CSP pour isoler les traceurs et masquage de la balise generator.'
  },
  {
    grade: 'C',
    scoreRange: '60 – 74 pts',
    label: 'Sécurité moyenne — Failles passives détectées',
    bgColor: 'bg-amber-950/40',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    badgeBg: 'bg-amber-500 text-slate-950',
    tooltipTitle: 'Signification technique : Note C (60 à 74 points)',
    tooltipContent: 'Le certificat SSL est fonctionnel, mais plusieurs barrières de protection indispensables font défaut : absence totale de HSTS (vulnérabilité aux écoutes sur Wi-Fi public), absence de X-Frame-Options (risque d\'iframe malveillante) et versions exactes du CMS et des modules e-commerce lisibles publiquement dans le code HTML.',
    tooltipImpact: 'Visibilité accrue pour les robots de scan automatisés qui testent continuellement les failles CVE connues sur les versions identifiées. Risque réel d\'interception de données de panier.',
    technicalCriteriaSummary: 'SSL : 25–35/35 pts • En-têtes : 15–25/40 pts • Exposition : 10–15/25 pts',
    recommendedAction: 'Activation immédiate de HSTS dans le fichier de configuration et masquage des versions de modules.'
  },
  {
    grade: 'D',
    scoreRange: '45 – 59 pts',
    label: 'Sécurité vulnérable — Actions urgentes requises',
    bgColor: 'bg-orange-950/50',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    badgeBg: 'bg-orange-500 text-white',
    tooltipTitle: 'Signification technique : Note D (45 à 59 points)',
    tooltipContent: 'Défauts multiples constatés : redirection HTTPS incomplète (certains flux circulent encore en clair sans chiffrement), absence totale d\'en-têtes HTTP de sécurité et détection de versions PHP serveur en fin de vie ou d\'extensions e-commerce obsolètes.',
    tooltipImpact: 'Pertes de conversion directes lors du paiement, avertissements intermittents sur les navigateurs des acheteurs et vulnérabilité directe face aux ransomwares.',
    technicalCriteriaSummary: 'SSL : 20–30/35 pts • En-têtes : 10–20/40 pts • Exposition : 5–15/25 pts',
    recommendedAction: 'Correction de la redirection 301 globale, mise à niveau PHP et blocage des en-têtes d\'exposition.'
  },
  {
    grade: 'E',
    scoreRange: '25 – 44 pts',
    label: 'Sécurité critique — Risque élevé',
    bgColor: 'bg-rose-950/60',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/50',
    badgeBg: 'bg-rose-500 text-white',
    tooltipTitle: 'Signification technique : Note E (25 à 44 points)',
    tooltipContent: 'Configuration critique : certificat SSL précaire ou expirant sous moins de 30 jours, aucune redirection HTTPS forcée, aucun en-tête de protection et fichiers internes accessibles aux robots. Les formulaires de paiement ne disposent d\'aucun verrouillage contre le skimming bancaire.',
    tooltipImpact: 'Avertissement de sécurité navigateur très fréquent, risque imminent de suspension par Stripe ou PayPal et responsabilité juridique engagée en cas de fuite de cartes bancaires.',
    technicalCriteriaSummary: 'SSL : 15–20/35 pts • En-têtes : 5–10/40 pts • Exposition : 5/25 pts',
    recommendedAction: 'Intervention d\'urgence : renouvellement SSL, bascule HTTPS intégrale et audit correctif 48h.'
  },
  {
    grade: 'F',
    scoreRange: '< 25 pts',
    label: 'Exposition maximale — Non protégée',
    bgColor: 'bg-red-950/80',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/60',
    badgeBg: 'bg-red-600 text-white',
    tooltipTitle: 'Signification technique : Note F (< 25 points)',
    tooltipContent: 'Boutique sans chiffrement HTTPS fonctionnel ou certificat expiré, échanges circulant en clair sur le port 80 sans aucune protection, en-têtes inexistants et divulgation complète des versions logicielles.',
    tooltipImpact: 'Les navigateurs bloquent l\'accès avec un écran rouge d\'alerte (« Site trompeur ou dangereux »). Transactions bancaires impossibles, perte immédiate de 95% des ventes et blacklistage SEO.',
    technicalCriteriaSummary: 'SSL : 0–10/35 pts • En-têtes : 0–5/40 pts • Exposition : 0–5/25 pts',
    recommendedAction: 'Mise en place immédiate d\'un certificat SSL Let\'s Encrypt/Cloudflare et redirection HTTPS obligatoire.'
  }
];

export type DisplayGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export function BulletinMockup({
  storeUrl = 'https://maboutique-mode.fr',
  email = 'contact@maboutique-mode.fr',
  isMobileView = false,
  auditResult,
  onNavigateToScreen
}: BulletinMockupProps) {
  // Possibilité de changer de note pour tester la maquette sur les 6 notes A à F
  const initialGrade: DisplayGrade = auditResult ? auditResult.grade : 'C';
  const [selectedGrade, setSelectedGrade] = useState<DisplayGrade>(initialGrade);

  useEffect(() => {
    if (auditResult?.grade) {
      setSelectedGrade(auditResult.grade);
    }
  }, [auditResult]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSentStatus, setEmailSentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // État du calculateur interactif de risque financier
  const [dailyOrders, setDailyOrders] = useState<number>(25);
  const [averageBasket, setAverageBasket] = useState<number>(65);
  const [badgeSnippetCopied, setBadgeSnippetCopied] = useState<boolean>(false);
  const [hoveredCriterion, setHoveredCriterion] = useState<string | null>(null);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isRemediationOpen, setIsRemediationOpen] = useState<boolean>(false);
  const [isNIS2ModalOpen, setIsNIS2ModalOpen] = useState<boolean>(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isBankInsuranceModalOpen, setIsBankInsuranceModalOpen] = useState<boolean>(false);
  const [selectedOrderOffer, setSelectedOrderOffer] = useState<OfferType>('diagnostic_590');
  
  // États interactifs d'animation et de simulation d'impact
  const [isSimulatingFixes, setIsSimulatingFixes] = useState<boolean>(false);
  const [criteriaFilter, setCriteriaFilter] = useState<'all' | 'failed' | 'passed'>('all');

  const handleOpenOrderModal = (offer: OfferType) => {
    setSelectedOrderOffer(offer);
    setIsOrderModalOpen(true);
  };
  const [activeRemediationSnippetId, setActiveRemediationSnippetId] = useState<string>('header-hsts');
  const [appliedRemediationFixes, setAppliedRemediationFixes] = useState<string[]>([]);

  const handleToggleRemediationFix = (id: string) => {
    setAppliedRemediationFixes(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleOpenRemediation = (snippetId?: string) => {
    if (snippetId && REMEDIATION_SNIPPETS[snippetId]) {
      setActiveRemediationSnippetId(snippetId);
    }
    setIsRemediationOpen(true);
  };

  const handleTriggerEmailSend = async (scoreToUse: number) => {
    setIsSendingEmail(true);
    setEmailSentStatus('idle');
    try {
      await sendAuditReportEmail({
        toEmail: email,
        storeUrl,
        grade: selectedGrade,
        score: scoreToUse,
        auditResult
      });
      setEmailSentStatus('success');
      setTimeout(() => {
        setEmailSentStatus('idle');
      }, 4000);
    } catch {
      setEmailSentStatus('error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const gradeConfigs: Record<DisplayGrade, {
    score: number;
    grade: DisplayGrade;
    label: string;
    badgeColor: string;
    bgColor: string;
    tagline: string;
    priorities: Array<{
      title: string;
      desc: string;
      urgency: string;
      tooltipTitle: string;
      tooltipContent: string;
      tooltipImpact: string;
    }>;
  }> = {
    A: {
      score: 95,
      grade: 'A',
      label: 'Excellente sécurité passive',
      badgeColor: 'bg-emerald-500 text-slate-950',
      bgColor: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400',
      tagline: 'Votre boutique dispose d\'un très bon niveau de protection publique. Continuez ainsi !',
      priorities: [
        {
          title: 'Politique de permissions (Permissions-Policy)',
          desc: 'Ajouter l\'en-tête Permissions-Policy pour interdire l\'accès micro/caméra aux scripts tiers.',
          urgency: 'Conseil de perfectionnement',
          tooltipTitle: 'Politique de permissions matérielles',
          tooltipContent: 'Désactive l\'accès aux fonctionnalités matérielles sensibles (micro, webcam, localisation) pour tous les scripts publicitaires ou analytiques intégrés.',
          tooltipImpact: 'Renforce la confiance de vos acheteurs et respecte strictement les normes RGPD.'
        }
      ]
    },
    B: {
      score: 82,
      grade: 'B',
      label: 'Bonne sécurité — Ajustements mineurs',
      badgeColor: 'bg-emerald-400 text-slate-950',
      bgColor: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300',
      tagline: 'Les bases de sécurité sont solides, quelques en-têtes optionnels méritent d\'être renforcés.',
      priorities: [
        {
          title: 'Déployer une politique CSP (Content-Security-Policy)',
          desc: 'Protège contre l\'injection de scripts tiers sur le formulaire de commande et les données bancaires.',
          urgency: 'Priorité 1 (Important)',
          tooltipTitle: 'Content-Security-Policy (CSP)',
          tooltipContent: 'Verrouille les domaines autorisés à exécuter du JavaScript sur votre boutique.',
          tooltipImpact: 'Bloque les attaques de type Magecart et le skimming de carte bancaire.'
        }
      ]
    },
    C: {
      score: 65,
      grade: 'C',
      label: 'Sécurité moyenne — Failles passives détectées',
      badgeColor: 'bg-amber-500 text-slate-950',
      bgColor: 'bg-amber-950/40 border-amber-500/40 text-amber-400',
      tagline: 'Plusieurs portes d\'entrée publiques restent ouvertes et vous rendent vulnérable aux attaques automatisées.',
      priorities: [
        {
          title: 'Activer la protection HSTS (Strict-Transport-Security)',
          desc: 'Indispensable pour forcer le chiffrement SSL et empêcher l\'interception de données bancaires en Wi-Fi public.',
          urgency: 'Priorité 1 (Critique)',
          tooltipTitle: 'Protection HSTS (Strict-Transport-Security)',
          tooltipContent: 'Ordonne au navigateur du client de ne communiquer qu\'en HTTPS strict pendant 1 an. Bloque les attaques d\'écoute Wi-Fi de type Man-in-the-Middle.',
          tooltipImpact: 'Évite l\'interception des sessions de connexion et des données de panier lors des achats sur smartphone.'
        },
        {
          title: 'Masquer la version exacte du CMS et des extensions',
          desc: 'La balise generator est visible publiquement dans votre code HTML, facilitant le travail des robots malveillants.',
          urgency: 'Priorité 2 (Urgent)',
          tooltipTitle: 'Exposition des versions du CMS & extensions',
          tooltipContent: 'Laisser fuiter les versions exactes permet aux scanners de vulnérabilités de cibler automatiquement votre boutique dès qu\'une faille CVE publique est divulguée.',
          tooltipImpact: 'Supprime la visibilité de votre boutique pour 95% des robots de piratage automatisés.'
        },
        {
          title: 'Configurer l\'en-tête X-Frame-Options (Anti-Clickjacking)',
          desc: 'Empêche des sites pirates d\'incruster votre formulaire de commande en iframe pour dérober des identifiants.',
          urgency: 'Priorité 3 (Recommandé)',
          tooltipTitle: 'Protection Anti-Clickjacking (X-Frame-Options)',
          tooltipContent: 'Interdit le chargement de votre boutique dans une iframe invisible superposée sur un site tiers malveillant pour capturer les clics.',
          tooltipImpact: 'Protège vos formulaires de commande et évite le détournement de paiement.'
        }
      ]
    },
    D: {
      score: 52,
      grade: 'D',
      label: 'Sécurité vulnérable — Actions urgentes requises',
      badgeColor: 'bg-orange-500 text-white',
      bgColor: 'bg-orange-950/50 border-orange-500/40 text-orange-400',
      tagline: 'Des en-têtes critiques manquent à l\'appel et les versions de votre boutique sont exposées.',
      priorities: [
        {
          title: 'Mettre en place HSTS et verrouiller la redirection HTTPS',
          desc: 'Votre boutique autorise encore des flux HTTP non chiffrés sur certaines pages ou ressources.',
          urgency: 'Priorité 1 (Critique)',
          tooltipTitle: 'Verrouillage Strict HTTPS & HSTS',
          tooltipContent: 'Garantit que 100% du trafic transite exclusivement par le tunnel chiffré.',
          tooltipImpact: 'Supprime les risques d\'interception en Wi-Fi public.'
        }
      ]
    },
    E: {
      score: 35,
      grade: 'E',
      label: 'Sécurité critique — Boutique fortement exposée',
      badgeColor: 'bg-rose-500 text-white',
      bgColor: 'bg-rose-950/60 border-rose-500/50 text-rose-400',
      tagline: 'Attention : votre boutique ne possède quasiment aucune protection d\'en-tête et expose ses versions logicielles.',
      priorities: [
        {
          title: 'Redirection HTTPS non systématique ou cert. fragile',
          desc: 'Certains visiteurs peuvent naviguer en clair sans chiffrement, exposant les identifiants et paniers.',
          urgency: 'Priorité 1 (Immédiat)',
          tooltipTitle: 'Absence de redirection HTTPS systématique',
          tooltipContent: 'Permettre un accès en HTTP (port 80) expose l\'ensemble des échanges en clair sur le réseau et déclenche un avertissement rouge bloquant.',
          tooltipImpact: 'Chute immédiate de 70% du taux de conversion et déclassement SEO Google.'
        },
        {
          title: 'Absence totale d\'en-têtes HTTP de sécurité',
          desc: 'Aucune barrière CSP ou HSTS active contre les injections de faux scripts de paiement.',
          urgency: 'Priorité 2 (Immédiat)',
          tooltipTitle: 'Absence d\'en-têtes HTTP de sécurité',
          tooltipContent: 'Les navigateurs de vos visiteurs sont privés d\'instructions de défense contre les attaques de clickjacking, MIME sniffing et skimming bancaire.',
          tooltipImpact: 'Boutique désarmée face aux injections de scripts de vol de carte bancaire (Magecart).'
        },
        {
          title: 'Versions publiques du CMS et extensions visibles',
          desc: 'Signale immédiatement aux attaquants si vos modules accusent un retard de mise à jour.',
          urgency: 'Priorité 3 (Urgent)',
          tooltipTitle: 'Modules et versions e-commerce exposés',
          tooltipContent: 'Les extensions tierces obsolètes sont responsables de la grande majorité des failles de sécurité exploitées sur les boutiques en ligne.',
          tooltipImpact: 'Risque critique d\'injection de code malveillant et de blocage par les moteurs de recherche.'
        }
      ]
    },
    F: {
      score: 18,
      grade: 'F',
      label: 'Exposition maximale — Non protégée',
      badgeColor: 'bg-red-600 text-white',
      bgColor: 'bg-red-950/80 border-red-500/60 text-red-400',
      tagline: 'Votre boutique présente des failles critiques immédiates laissant les données clients vulnérables.',
      priorities: [
        {
          title: 'Sécurisation d\'urgence HTTPS et certificat SSL',
          desc: 'Votre boutique est exposée sans chiffrement fonctionnel ou avec un certificat expiré.',
          urgency: 'Priorité 1 (Critique)',
          tooltipTitle: 'Urgence Chiffrement HTTPS',
          tooltipContent: 'Indispensable pour éviter le blocage rouge immédiat par Google Chrome et Firefox.',
          tooltipImpact: 'Rétablit la navigabilité du site et la possibilité de payer.'
        }
      ]
    }
  };

  const effectiveGrade: DisplayGrade = isSimulatingFixes ? 'A' : selectedGrade;
  const current = gradeConfigs[effectiveGrade] || gradeConfigs.C;

  // Calcul dynamique des scores des 5 dimensions pour le graphique Radar Recharts
  const radarData = useMemo(() => {
    switch (effectiveGrade) {
      case 'A':
        return [
          { dimension: 'SSL & HTTPS', score: 98, fullMark: 100 },
          { dimension: 'En-têtes HTTP', score: 95, fullMark: 100 },
          { dimension: 'Versions & CMS', score: 92, fullMark: 100 },
          { dimension: 'Protection Panier', score: 96, fullMark: 100 },
          { dimension: 'Conformité NIS 2', score: 92, fullMark: 100 },
        ];
      case 'B':
        return [
          { dimension: 'SSL & HTTPS', score: 92, fullMark: 100 },
          { dimension: 'En-têtes HTTP', score: 78, fullMark: 100 },
          { dimension: 'Versions & CMS', score: 80, fullMark: 100 },
          { dimension: 'Protection Panier', score: 85, fullMark: 100 },
          { dimension: 'Conformité NIS 2', score: 75, fullMark: 100 },
        ];
      case 'C':
        return [
          { dimension: 'SSL & HTTPS', score: 85, fullMark: 100 },
          { dimension: 'En-têtes HTTP', score: 50, fullMark: 100 },
          { dimension: 'Versions & CMS', score: 45, fullMark: 100 },
          { dimension: 'Protection Panier', score: 60, fullMark: 100 },
          { dimension: 'Conformité NIS 2', score: 60, fullMark: 100 },
        ];
      case 'D':
        return [
          { dimension: 'SSL & HTTPS', score: 65, fullMark: 100 },
          { dimension: 'En-têtes HTTP', score: 38, fullMark: 100 },
          { dimension: 'Versions & CMS', score: 30, fullMark: 100 },
          { dimension: 'Protection Panier', score: 45, fullMark: 100 },
          { dimension: 'Conformité NIS 2', score: 40, fullMark: 100 },
        ];
      case 'E':
        return [
          { dimension: 'SSL & HTTPS', score: 45, fullMark: 100 },
          { dimension: 'En-têtes HTTP', score: 25, fullMark: 100 },
          { dimension: 'Versions & CMS', score: 20, fullMark: 100 },
          { dimension: 'Protection Panier', score: 30, fullMark: 100 },
          { dimension: 'Conformité NIS 2', score: 25, fullMark: 100 },
        ];
      case 'F':
      default:
        return [
          { dimension: 'SSL & HTTPS', score: 15, fullMark: 100 },
          { dimension: 'En-têtes HTTP', score: 10, fullMark: 100 },
          { dimension: 'Versions & CMS', score: 10, fullMark: 100 },
          { dimension: 'Protection Panier', score: 15, fullMark: 100 },
          { dimension: 'Conformité NIS 2', score: 10, fullMark: 100 },
        ];
    }
  }, [selectedGrade]);

  /**
   * Génère et télécharge une version PDF simplifiée et professionnelle du bulletin
   */
  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 18;

      // 1. En-tête bleu nuit #0F1B2D
      doc.setFillColor(15, 27, 45);
      doc.rect(0, 0, pageWidth, 38, 'F');

      // Logo & Marque
      doc.setTextColor(74, 222, 128); // #4ADE80
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BoutiqueSûre', 15, y);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Bulletin Officiel de Sécurité E-Commerce', 58, y);

      y += 9;
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(8.5);
      doc.text('Audit 100% passif pour boutiques en ligne et sites e-commerce — Réf : #BS-' + Date.now().toString(36).toUpperCase(), 15, y);

      // 2. Fiche synthétique de la boutique
      y = 48;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Boutique analysée :', 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(14, 107, 58);
      doc.text(storeUrl, 54, y);

      y += 6.5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('Date du diagnostic :', 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), 54, y);

      y += 6.5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('Rapport transmis à :', 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(email, 54, y);

      // 3. Cadre Note & Synthèse globale
      y += 10;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, pageWidth - 30, 26, 3, 3, 'FD');

      // Couleur de note selon la note sélectionnée
      if (selectedGrade === 'A') {
        doc.setTextColor(16, 185, 129); // vert
      } else if (selectedGrade === 'C') {
        doc.setTextColor(245, 158, 11); // ambre
      } else {
        doc.setTextColor(239, 68, 68); // rouge
      }
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(`Note ${current.grade}`, 22, y + 17);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`${current.score} / 100 points`, 65, y + 11);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(current.label, 65, y + 18);

      // 4. Grille d'évaluation des 3 piliers
      y += 35;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('1. Grille d\'évaluation des 3 Piliers de sécurité (100 pts)', 15, y);

      y += 6;
      const pillars = [
        { name: 'Chiffrement SSL / HTTPS', max: '35 pts max', desc: 'Redirection HTTPS 301/302, certificat valide et marge > 30 jours' },
        { name: 'En-têtes HTTP de sécurité', max: '40 pts max', desc: 'Protection HSTS, CSP, X-Frame-Options, X-Content-Type, Referrer' },
        { name: 'Protection contre l\'exposition', max: '25 pts max', desc: 'Masquage versions CMS/extensions et Permissions-Policy' }
      ];

      pillars.forEach((p) => {
        y += 6;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${p.name} (${p.max}) :`, 18, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(p.desc, 80, y);
      });

      // 5. Actions prioritaires à corriger
      y += 12;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. Les 3 actions prioritaires pour sécuriser votre boutique', 15, y);

      y += 4;
      current.priorities.forEach((item) => {
        y += 4;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(15, y, pageWidth - 30, 20, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text(`[${item.urgency}]`, 20, y + 6.5);

        doc.setTextColor(15, 23, 42);
        doc.text(item.title, 62, y + 6.5);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const splitDesc = doc.splitTextToSize(item.desc, pageWidth - 45);
        doc.text(splitDesc, 20, y + 13);

        y += 18;
      });

      // 6. Pied de page légal et déontologique
      y = 275;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y, pageWidth - 15, y);

      y += 5;
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('BoutiqueSûre © 2026 — Diagnostic 100% passif garanti sans intrusion, sans perturbation ni coupure.', 15, y);
      doc.text('Besoin d\'assistance d\'un expert e-commerce ? contact@boutiquesure.fr | https://boutiquesure.fr', 15, y + 4);

      // Nom du fichier PDF téléchargé
      const cleanDomain = storeUrl.replace(/^https?:\/\//i, '').replace(/[^a-zA-Z0-9.-]/g, '_');
      doc.save(`BoutiqueSure-Bulletin-${cleanDomain}.pdf`);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF :', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * Partage social et copie du lien
   */
  const handleCopyShareLink = async () => {
    const urlToCopy = typeof window !== 'undefined' && window.location.href 
      ? window.location.href 
      : (storeUrl || 'https://boutiquesure.fr');
    try {
      if (navigator?.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(urlToCopy),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard timeout')), 300))
        ]);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch {
      // Fallback si la permission presse-papier est restreinte (ex: headless browser ou iframe sandbox)
      try {
        const textarea = document.createElement('textarea');
        textarea.value = urlToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (fallbackErr) {
        console.warn('Clipboard fallback notice:', fallbackErr);
      }
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareTargetUrl = typeof window !== 'undefined' && window.location.origin
    ? `${window.location.origin}?audit=${encodeURIComponent(storeUrl)}`
    : `https://boutiquesure.fr?audit=${encodeURIComponent(storeUrl)}`;

  const shareText = selectedGrade === 'A'
    ? `Ma boutique e-commerce a obtenu la Note A (${current.score}/100) au diagnostic de sécurité passif BoutiqueSûre ! Protégez vos commandes :`
    : `J'ai testé la sécurité passive de ma boutique e-commerce sur BoutiqueSûre (Score ${current.score}/100 - Note ${current.grade}). Testez la vôtre gratuitement :`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareTargetUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareTargetUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareTargetUrl)}`;

  // Calculs dynamiques pour le simulateur de risque de Chiffre d'Affaires
  const calculatedDailyRevenue = Math.max(0, dailyOrders * averageBasket);
  const calculatedRiskCoeff = selectedGrade === 'A' ? 0.05 : selectedGrade === 'C' ? 0.50 : 0.95;
  const calculatedDailyLoss = Math.round(calculatedDailyRevenue * calculatedRiskCoeff);
  const calculated48hLoss = Math.round(calculatedDailyRevenue * 2 * calculatedRiskCoeff);

  // Snippet du badge officiel pour Note A
  const badgeSnippet = `<a href="https://boutiquesure.fr/verification?domaine=${encodeURIComponent(storeUrl)}" target="_blank" rel="noopener" title="Boutique auditée passivement par BoutiqueSûre - Note A">
  <img src="https://boutiquesure.fr/badges/boutiquesure-note-a-2026.svg" alt="Garantie de Sécurité Passive BoutiqueSûre - Note A" width="160" height="48" />
</a>`;

  const handleCopyBadgeSnippet = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(badgeSnippet),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 300))
        ]);
      } else {
        throw new Error('no clipboard');
      }
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = badgeSnippet;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (fallbackErr) {
        console.warn('Fallback badge copy notice:', fallbackErr);
      }
    } finally {
      setBadgeSnippetCopied(true);
      setTimeout(() => setBadgeSnippetCopied(false), 2500);
    }
  };


  return (
    <div className={`w-full min-h-screen bg-[#0F1B2D] text-slate-100 font-['Manrope',sans-serif] flex flex-col justify-between ${isMobileView ? 'max-w-[420px] mx-auto border-x border-slate-800 shadow-2xl' : ''}`}>
      
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0B1523]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#0E6B3A] flex items-center justify-center text-slate-950 font-extrabold text-lg">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">BoutiqueSûre</span>
              <span className="text-[10px] text-slate-400">Bulletin officiel #BS-2026-881</span>
            </div>
          </div>

          {/* Actions & Sélecteur de note pour tester la maquette */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              data-testid="header-start-tour-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Lancer la visite guidée pour interpréter votre score"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visite guidée</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenRemediation()}
              data-testid="header-open-remediation-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Générer les snippets de configuration serveur (.htaccess, Nginx, functions.php)"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Correctifs serveur</span>
              <span className="sm:hidden">Correctifs</span>
              {appliedRemediationFixes.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                  +{appliedRemediationFixes.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsBankInsuranceModalOpen(true)}
              data-testid="header-open-insurance-attestation-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm btn-interactive"
              title="Générer l'Attestation officielle pour votre Assurance Cyber ou votre contrat VAD Bancaire"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Attestation Assurance & Banque</span>
              <span className="sm:hidden">Attestation</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              data-testid="header-download-pdf-button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 btn-interactive"
              title="Télécharger le rapport au format PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'Export...' : 'Télécharger le rapport'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden md:inline">Tester la note :</span>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-bold">
                <button 
                  onClick={() => setSelectedGrade('A')} 
                  title="Note A (95/100) : Excellente sécurité passive — Chiffrement HTTPS complet, HSTS, CSP et versions masquées"
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${selectedGrade === 'A' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Note A
                </button>
                <button 
                  onClick={() => setSelectedGrade('C')} 
                  title="Note C (65/100) : Sécurité moyenne — Failles passives détectées (absence HSTS, versions CMS visibles)"
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${selectedGrade === 'C' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Note C
                </button>
                <button 
                  onClick={() => setSelectedGrade('E')} 
                  title="Note E (35/100) : Sécurité critique — Risque élevé (SSL fragile, absence totale d'en-têtes, versions exposées)"
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${selectedGrade === 'E' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Note E
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu du Bulletin */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
        
        {/* En-tête du rapport */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analyse passive réalisée le {new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Bulletin de sécurité de votre boutique
              </h1>
              <p className="text-sm font-mono text-emerald-400 mt-1">
                {storeUrl}
              </p>
            </div>

            {/* Note géante avec jauge circulaire animée, libellé accessible et infobulle technique */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <div 
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${current.bgColor} shadow-lg card-hover-elevate transition-all duration-500`}
                data-testid="hero-score-badge"
              >
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  {/* Anneau SVG Radial de progression avec animation fluide */}
                  <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 72 72">
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="5"
                      className="opacity-20"
                      fill="transparent"
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      stroke={
                        effectiveGrade === 'A' ? '#10B981' :
                        effectiveGrade === 'B' ? '#34D399' :
                        effectiveGrade === 'C' ? '#F59E0B' :
                        effectiveGrade === 'D' ? '#FB923C' :
                        '#EF4444'
                      }
                      strokeWidth="5"
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={(2 * Math.PI * 30) * (1 - current.score / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-black tracking-tight flex items-center justify-center">
                      <span>{current.grade}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <div className="text-sm font-bold uppercase tracking-wider tabular-nums">{current.score} / 100 pts</div>
                    <InfoTooltip
                      title={`Signification technique : Note ${current.grade} (${current.score}/100 pts)`}
                      content={
                        effectiveGrade === 'A'
                          ? "La Note A (90-100 pts) certifie un niveau d'excellence passive : certificat SSL moderne avec marge > 30 jours, redirection 301 automatique, barrière d'en-têtes complète (HSTS >= 1 an, CSP, X-Frame-Options, X-Content-Type nosniff) et versions du CMS et des extensions masquées."
                          : effectiveGrade === 'B'
                          ? "La Note B (75-89 pts) atteste d'une bonne protection de base. Le chiffrement et la redirection sont conformes, mais certains en-têtes secondaires (CSP ou Permissions-Policy) restent à configurer."
                          : effectiveGrade === 'C'
                          ? "La Note C (60-74 pts) révèle des failles passives notables : absence de HSTS (vulnérabilité aux écoutes sur Wi-Fi public), absence de protection anti-clickjacking et versions logicielles lisibles publiquement."
                          : effectiveGrade === 'D'
                          ? "La Note D (45-59 pts) alerte sur une sécurité vulnérable : redirection HTTP incomplète, zéro en-tête de protection et extensions e-commerce obsolètes."
                          : effectiveGrade === 'E'
                          ? "La Note E (25-44 pts) traduit une exposition critique : certificat SSL fragile ou en fin de validité, aucune barrière de sécurité HTTP et risque majeur d'interception."
                          : "La Note F (< 25 pts) signale une boutique non protégée : absence de HTTPS effectif ou certificat expiré, transactions en clair et blocage immédiat par les navigateurs."
                      }
                      impact={
                        effectiveGrade === 'A' || effectiveGrade === 'B'
                          ? "Confiance maximale des acheteurs, éligibilité au badge officiel et conformité PCI-DSS v4 & NIS 2."
                          : effectiveGrade === 'C' || effectiveGrade === 'D'
                          ? "Vulnérabilité face aux robots de scan automatisés testant les failles de versions non dissimulées."
                          : "Alerte rouge de sécurité sur les navigateurs, perte massive de ventes et risque de coupure Stripe."
                      }
                      testId="tooltip-hero-grade"
                    />
                  </div>
                  <div className="text-xs font-extrabold text-white leading-tight mt-0.5">{current.label}</div>
                  <div className="text-[11px] text-slate-300 mt-1">Audit 100% passif</div>
                </div>
              </div>

              {/* Bouton Simulateur d'impact correctifs */}
              <button
                type="button"
                onClick={() => setIsSimulatingFixes(prev => !prev)}
                data-testid="simulate-fixes-toggle"
                className={`inline-flex items-center gap-2 px-3.5 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-sm btn-interactive ${
                  isSimulatingFixes
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                }`}
                title="Simuler l'impact des correctifs de remédiation en direct"
              >
                <Sparkles className={`w-4 h-4 ${isSimulatingFixes ? 'text-emerald-400 animate-spin' : 'text-emerald-400'}`} />
                <div className="text-left">
                  <div className="leading-none">{isSimulatingFixes ? 'Simulation active' : 'Simulateur d\'impact'}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{isSimulatingFixes ? 'Note A (95/100)' : '+30 pts possibles'}</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-5 pt-5 border-t border-slate-800">
            <div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {current.tagline} Une copie a été préparée pour <strong className="text-white">{email}</strong>.
              </p>
              {emailSentStatus === 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Rapport officiel envoyé avec succès par email via Resend !</span>
                </div>
              )}
              {emailSentStatus === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mt-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Erreur lors de l'envoi de l'email. Veuillez réessayer.</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Bouton Renvoyer par email */}
              <button
                type="button"
                onClick={() => handleTriggerEmailSend(current.score)}
                disabled={isSendingEmail}
                data-testid="send-email-report-btn"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
                title={`Envoyer le rapport par email à ${email}`}
              >
                <Mail className={`w-3.5 h-3.5 text-emerald-400 ${isSendingEmail ? 'animate-pulse' : ''}`} />
                <span>{isSendingEmail ? 'Envoi...' : 'Envoyer par email'}</span>
              </button>

              {/* Bouton Voir l'aperçu email */}
              {onNavigateToScreen && (
                <button
                  type="button"
                  onClick={() => onNavigateToScreen('email')}
                  data-testid="preview-email-btn"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
                  title="Prévisualiser l'email Resend généré"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Aperçu email</span>
                </button>
              )}

              {/* Bouton Télécharger le PDF */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                data-testid="download-pdf-button"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingPdf ? 'Génération du PDF...' : 'Télécharger le rapport (PDF)'}</span>
              </button>
            </div>
          </div>

          {/* Boutons de partage social du score de sécurité */}
          <div className="mt-5 pt-5 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Partager votre score :</span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="text-slate-400 hidden sm:inline text-[11px]">
                Montrez la conformité et le niveau de sécurité de votre boutique
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2" data-testid="share-buttons-container">
              {/* Twitter / X */}
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="share-twitter"
                aria-label="Partager sur X (Twitter)"
                title="Partager sur X (Twitter)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="share-linkedin"
                aria-label="Partager sur LinkedIn"
                title="Partager sur LinkedIn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077b5]/20 hover:bg-[#0077b5]/30 text-[#38bdf8] hover:text-white border border-[#0077b5]/40 hover:border-[#0077b5] text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="share-facebook"
                aria-label="Partager sur Facebook"
                title="Partager sur Facebook"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877f2]/20 hover:bg-[#1877f2]/30 text-[#60a5fa] hover:text-white border border-[#1877f2]/40 hover:border-[#1877f2] text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>

              {/* Copier le lien */}
              <button
                type="button"
                onClick={handleCopyShareLink}
                data-testid="share-copy-link"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
                title="Copier le lien du rapport"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copier le lien</span>
                  </>
                )}
              </button>

              {/* QR Code Mobile */}
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                data-testid="share-qr-code-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
                title="Générer un QR Code pour inspection mobile"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code Mobile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barème officiel des Notes A à F avec Tooltips explicatifs sur chaque note & Graphique Radar Recharts */}
        <div 
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
          data-testid="grade-scale-section"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-white font-extrabold text-lg">
                <Gauge className="w-5 h-5 text-emerald-400" />
                <h2>Barème officiel & Signification technique des Notes (A à F)</h2>
                <InfoTooltip 
                  title="Échelle officielle de maturité cybersécurité BoutiqueSûre"
                  content="Le score sur 100 points évalue 10 critères passifs stricts répartis en 3 piliers : Chiffrement SSL (35 pts), En-têtes HTTP (40 pts) et Exposition publique (25 pts). Chaque palier de note correspond à un niveau technique et juridique précis face aux risques de vol de cartes et d'indisponibilité panier."
                  impact="Une note >= A ou B permet l'obtention du Badge certifié et garantit la conformité PCI-DSS v4 et NIS 2."
                  testId="tooltip-grade-scale-heading"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Survolez chaque note ci-dessous pour découvrir les critères techniques requis, les en-têtes vérifiés et l'impact e-commerce associé.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                Barème 100% passif
              </span>
            </div>
          </div>

          {/* Grille des 6 Notes A à F avec infobulles détaillées */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="official-grades-grid">
            {OFFICIAL_GRADE_SCALE.map((item) => {
              const isCurrentGrade = selectedGrade === item.grade;
              return (
                <button
                  key={item.grade}
                  type="button"
                  onClick={() => setSelectedGrade(item.grade)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isCurrentGrade 
                      ? `${item.bgColor} ${item.borderColor} shadow-lg ring-2 ring-emerald-400/50 scale-[1.02]` 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                  data-testid={`grade-scale-item-${item.grade}`}
                  title={`Cliquer pour prévisualiser la Note ${item.grade} (${item.scoreRange})`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm ${item.badgeBg}`}>
                        {item.grade}
                      </span>
                      <InfoTooltip
                        title={item.tooltipTitle}
                        content={item.tooltipContent}
                        impact={item.tooltipImpact}
                        testId={`tooltip-grade-${item.grade}`}
                      />
                    </div>
                    <div className="text-xs font-extrabold text-white">
                      {item.scoreRange}
                    </div>
                    <div className={`text-[11px] font-semibold mt-1 leading-snug ${item.textColor}`}>
                      {item.label}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                    {item.technicalCriteriaSummary}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Graphique Radar Recharts visualisant la répartition des 5 dimensions de sécurité */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3>Répartition visuelle de la sécurité ({current.score}/100 - Note {current.grade})</h3>
                <InfoTooltip
                  title="Visualisation Radar des dimensions de protection"
                  content="Ce graphique radar compare l'efficacité de votre boutique sur les 5 axes vitaux : Chiffrement SSL/HTTPS, En-têtes HTTP, Masquage versions CMS, Sécurité Panier et Résilience NIS 2."
                  impact="Identifie instantanément les axes faibles nécessitant une action prioritaire avant une mise en production."
                  testId="tooltip-radar-chart"
                />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedGrade === 'A' || selectedGrade === 'B'
                  ? "Excellente couverture équilibrée sur l'ensemble du périmètre. L'empreinte de la boutique est quasiment invisible pour les scanners d'attaque."
                  : selectedGrade === 'C' || selectedGrade === 'D'
                  ? "Déséquilibre marqué : les flux SSL sont opérationnels mais l'absence d'en-têtes HTTP de sécurité et l'exposition des extensions créent une faille exploitable."
                  : "Couverture critique : l'ensemble des axes de défense sont affaiblis, exposant directement les transactions bancaires et les sessions utilisateurs."}
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Chiffrement & Redirection SSL</span>
                  <span className="font-bold text-white">{radarData[0].score}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>En-têtes HTTP de sécurité</span>
                  <span className="font-bold text-white">{radarData[1].score}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Protection Exposition & Versions</span>
                  <span className="font-bold text-white">{radarData[2].score}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Protection Panier & Formulaires</span>
                  <span className="font-bold text-white">{radarData[3].score}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Préparation Directive NIS 2</span>
                  <span className="font-bold text-white">{radarData[4].score}%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 h-[260px] w-full flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800/80 p-2" data-testid="security-radar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="dimension" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748B', fontSize: 9 }} />
                  <Radar 
                    name="Score Sécurité" 
                    dataKey="score" 
                    stroke={selectedGrade === 'A' || selectedGrade === 'B' ? '#4ADE80' : selectedGrade === 'C' || selectedGrade === 'D' ? '#F59E0B' : '#F43F5E'} 
                    fill={selectedGrade === 'A' || selectedGrade === 'B' ? '#4ADE80' : selectedGrade === 'C' || selectedGrade === 'D' ? '#F59E0B' : '#F43F5E'} 
                    fillOpacity={0.4} 
                  />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as { dimension: string; score: number };
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                            <p className="font-bold text-white">{data.dimension}</p>
                            <p className="text-emerald-400 font-semibold mt-0.5">Efficacité : {data.score} / 100%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Module Étape 1 enrichie : Benchmark Sectoriel, Directive Européenne NIS 2 & Détection Hébergeur/CDN */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          data-testid="strategic-insights-section"
        >
          {/* 1. Benchmark Sectoriel */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Benchmark Sectoriel</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  {selectedGrade === 'A' ? 'Top 16%' : selectedGrade === 'C' ? 'Moyenne (48%)' : 'Rang critique (12%)'}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white">
                  {selectedGrade === 'A' ? 'Top 16%' : selectedGrade === 'C' ? 'Top 52%' : 'Top 88% exposé'}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedGrade === 'A' 
                    ? "Votre boutique surpasse 84% des e-commerçants de votre secteur en France & Belgique."
                    : selectedGrade === 'C'
                    ? "Score dans la moyenne (58/100). Votre boutique reste vulnérable aux robots opportunistes."
                    : "Votre boutique fait partie des 12% les plus vulnérables du secteur. Intervention d'urgence conseillée."}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Échantillon : ~4 500 boutiques</span>
              <span className="text-emerald-400 font-semibold">Analyse passive</span>
            </div>
          </div>

          {/* 2. Directive Européenne NIS 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Directive NIS 2 (UE)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  selectedGrade === 'A'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : selectedGrade === 'C'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  {selectedGrade === 'A' ? '92% Conforme' : selectedGrade === 'C' ? '60% Partiel' : '25% Non Conforme'}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>{selectedGrade === 'A' ? 'Préparation NIS 2 validée' : selectedGrade === 'C' ? 'Conformité NIS 2 partielle' : 'Risque de non-conformité NIS 2'}</span>
                  <InfoTooltip 
                    title="Directive Européenne NIS 2 (Article 21)"
                    content="La directive NIS 2 (UE 2022/2555) oblige les acteurs e-commerce et chaînes d'approvisionnement à démontrer leur diligence en cybersécurité (chiffrement, gestion des risques et résilience)."
                    impact="Prouve la bonne foi du gérant en cas de litige bancaire, d'attaque ou de contrôle réglementaire."
                    testId="tooltip-nis2-info"
                  />
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedGrade === 'A'
                    ? "Diligence technique avérée. Vous répondez aux critères clés de résilience imposés par l'UE."
                    : selectedGrade === 'C'
                    ? "L'absence de HSTS et l'exposition des plugins limitent votre conformité légale face aux assureurs."
                    : "Non conforme aux exigences de base de l'Art. 21. Défaut de protection avéré sur les données clients."}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Réf : Art. 21 UE 2022/2555</span>
              <button
                type="button"
                onClick={() => setIsNIS2ModalOpen(true)}
                data-testid="generate-nis2-attestation-btn"
                className="text-sky-400 hover:text-sky-300 font-semibold underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Générer l'attestation officielle de diligence technique NIS 2"
              >
                <span>Attestation officielle</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 3. Détection Hébergeur & CDN */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Hébergement & Scripts</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                  {selectedGrade === 'A' ? 'Cloudflare CDN' : 'OVH / Apache'}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-sm font-bold text-white">
                  {selectedGrade === 'A' ? 'Infrastructure CDN Nginx' : 'Serveur Web Mutualisé / Dédié'}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">Meta Pixel</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">Google Tag Manager</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">Stripe Elements</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {selectedGrade === 'A'
                    ? "Traceurs publicitaires encadrés par des règles de protection."
                    : "Traceurs tiers non isolés par CSP : risque d'injection de scripts de vol de cartes."}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>3 traceurs détectés</span>
              <span className="text-indigo-400 font-semibold">100% Passif</span>
            </div>
          </div>
        </div>

        {/* Bloc Top 3 Actions Prioritaires */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl" data-testid="top-priorities-card">
          <div className="flex items-center gap-2 text-white font-extrabold text-lg mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2>Les 3 actions prioritaires à corriger</h2>
            <InfoTooltip 
              title="Priorisation des actions"
              content="Ces actions sont classées par niveau de risque réel pour votre e-commerce. Leur application permet de neutraliser 90% des vecteurs d'attaque courants."
              impact="Restaure immédiatement la confiance des passerelles de paiement et des acheteurs."
              testId="tooltip-priority-heading"
            />
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Classées par niveau d'urgence pour protéger vos commandes et vos clients :
          </p>

          <div className="space-y-4">
            {current.priorities.map((item, index) => (
              <div key={index} className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase">
                      {item.urgency}
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{item.title}</span>
                      <InfoTooltip 
                        title={item.tooltipTitle || item.title}
                        content={item.tooltipContent || item.desc}
                        impact={item.tooltipImpact || "Protection essentielle contre les intrusions automatisées."}
                        testId={`tooltip-action-${index}`}
                      />
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {item.desc}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const snippetId = item.title.toLowerCase().includes('hsts') 
                        ? 'header-hsts' 
                        : item.title.toLowerCase().includes('https') || item.title.toLowerCase().includes('cert')
                        ? 'ssl-redirect'
                        : item.title.toLowerCase().includes('csp')
                        ? 'header-csp'
                        : item.title.toLowerCase().includes('version') || item.title.toLowerCase().includes('plugin')
                        ? 'exposure-generator'
                        : item.title.toLowerCase().includes('permission')
                        ? 'exposure-permissions'
                        : 'header-hsts';
                      handleOpenRemediation(snippetId);
                    }}
                    data-testid={`btn-priority-fix-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    title="Générer le code de correction prêt à l'emploi (.htaccess / Nginx / WordPress)"
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Voir le correctif</span>
                  </button>

                  <div className="text-xs text-slate-400 font-semibold flex items-center gap-1 pl-1">
                    <span>Pris en charge</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grille détaillée des critères d'évaluation avec tooltips informatifs Lucide */}
        <div 
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
          data-testid="security-criteria-grid"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-white font-extrabold text-lg">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h2>Détail des 10 critères de sécurité analysés</h2>
                <InfoTooltip 
                  title="Grille d'évaluation passive 100 points"
                  content="Chaque critère technique est analysé de manière 100% passive via une unique requête publique GET sans aucune intrusion, test de charge ni tentative de connexion."
                  impact="Une note globale A (>= 90 pts) assure une résilience optimale contre les cyberattaques opportunistes."
                  testId="tooltip-criteria-grid-main"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Survolez ou cliquez sur les icônes d'information pour comprendre le rôle précis de chaque critère technique.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                10 critères analysés • 100 pts
              </span>
            </div>
          </div>

          {/* Filtres interactifs par sévérité */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs font-bold text-slate-300">Affichage des critères :</span>
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCriteriaFilter('all')}
                data-testid="filter-criteria-all"
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  criteriaFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous (10)
              </button>
              <button
                type="button"
                onClick={() => setCriteriaFilter('failed')}
                data-testid="filter-criteria-failed"
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  criteriaFilter === 'failed'
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                À corriger
              </button>
              <button
                type="button"
                onClick={() => setCriteriaFilter('passed')}
                data-testid="filter-criteria-passed"
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  criteriaFilter === 'passed'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Conformes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SECURITY_PILLARS.map((pillar) => (
              <div 
                key={pillar.id} 
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-4 card-hover-elevate transition-all duration-300"
                data-testid={`pillar-${pillar.id}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        {pillar.id === 'ssl' && <Lock className="w-4 h-4" />}
                        {pillar.id === 'headers' && <ShieldCheck className="w-4 h-4" />}
                        {pillar.id === 'exposure' && <Server className="w-4 h-4" />}
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        {pillar.title}
                      </h3>
                      <InfoTooltip 
                        title={pillar.tooltipTitle}
                        content={pillar.tooltipContent}
                        impact={pillar.tooltipImpact}
                        testId={`tooltip-pillar-${pillar.id}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {pillar.maxPoints} pts
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3.5">
                    {pillar.description}
                  </p>

                  <div className="space-y-2.5">
                    {pillar.criteria
                      .filter((crit) => {
                        if (criteriaFilter === 'all') return true;
                        const evalCrit = (effectiveGrade === 'A' || effectiveGrade === 'B') 
                          ? crit.evalStatus.A 
                          : (effectiveGrade === 'C' || effectiveGrade === 'D') 
                            ? crit.evalStatus.C 
                            : crit.evalStatus.E;
                        return criteriaFilter === 'passed' ? evalCrit.passed : !evalCrit.passed;
                      })
                      .map((crit) => {
                      const evalCrit = (effectiveGrade === 'A' || effectiveGrade === 'B') 
                        ? crit.evalStatus.A 
                        : (effectiveGrade === 'C' || effectiveGrade === 'D') 
                          ? crit.evalStatus.C 
                          : crit.evalStatus.E;
                      const isHovered = hoveredCriterion === crit.id;
                      return (
                        <div 
                          key={crit.id} 
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isHovered 
                              ? 'bg-slate-800/95 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30' 
                              : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
                          }`}
                          onMouseEnter={() => setHoveredCriterion(crit.id)}
                          onMouseLeave={() => setHoveredCriterion(null)}
                          data-testid={`criterion-row-${crit.id}`}
                          title={`${crit.tooltipTitle} : ${crit.tooltipContent}`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {evalCrit.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}
                            <span className="text-xs text-slate-200 font-semibold truncate" title={crit.name}>
                              {crit.name}
                            </span>
                            <InfoTooltip 
                              title={crit.tooltipTitle}
                              content={crit.tooltipContent}
                              impact={crit.tooltipImpact}
                              testId={`tooltip-${crit.id}`}
                              isOpen={isHovered}
                            />
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                              evalCrit.passed 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}>
                              {evalCrit.badge}
                            </span>

                            {REMEDIATION_SNIPPETS[crit.id] && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRemediation(crit.id);
                                }}
                                data-testid={`btn-remediation-${crit.id}`}
                                title={`Voir le code correctif prêt à l'emploi pour ${crit.name}`}
                                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700/60 transition-colors cursor-pointer"
                              >
                                <Terminal className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 font-medium">
                  <span>Pondération : {pillar.maxPoints} %</span>
                  <span className="text-emerald-400">Contrôle 100% passif</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module d'Audit Passif DNS Anti-Usurpation & Sécurité Email (SPF, DMARC, DKIM) */}
        <EmailDnsSecurityAudit
          domain={storeUrl}
          grade={selectedGrade}
        />

        {/* Module d'Audit Passif des Passerelles de Paiement & PCI-DSS v4.0 */}
        <PaymentGatewaysAudit
          storeUrl={storeUrl}
          grade={selectedGrade}
        />

        {/* Mini-Diagnostic Passif de Performance & Éco-Conception GreenIT */}
        <GreenPerformanceAudit
          storeUrl={storeUrl}
          grade={selectedGrade}
        />

        {/* Idée 1 : Simulateur de ROI Financier & Récupération d'Abandons de Panier */}
        <RoiConversionCalculator
          currentGrade={effectiveGrade}
          currentScore={current.score}
          onOpenOrderModal={() => handleOpenOrderModal('diagnostic_590')}
        />

        {/* Idée 3 : Détecteur Passif d'Exposition aux Fuites de Données & Dark Web */}
        <DataBreachScanner
          storeUrl={storeUrl}
        />

        {/* Module Calculateur interactif de perte financière & CA à risque */}
        <div 
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
          data-testid="interactive-revenue-calculator"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-white font-extrabold text-lg">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h2>Simulateur interactif de perte financière en cas d'incident</h2>
                <InfoTooltip 
                  title="Calculateur personnalisé de Chiffre d'Affaires à risque"
                  content="Ajustez vos volumes de vente pour calculer le préjudice financier immédiat en cas d'attaque, de certificat SSL expiré ou de blocage par les passerelles de paiement (durée moyenne d'interruption non assistée : 48h)."
                  impact="Démontre le retour sur investissement instantané de la sécurisation BoutiqueSûre."
                  testId="tooltip-interactive-calculator"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ajustez vos données pour estimer le préjudice réel d'une panne de panier sur votre boutique :
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                Simulation temps réel
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Contrôles du commerçant */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1.5">
                  <label htmlFor="daily-orders-input">Volume moyen de commandes :</label>
                  <span className="text-emerald-400 font-bold">{dailyOrders} commandes / jour</span>
                </div>
                <input 
                  id="daily-orders-input"
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={dailyOrders}
                  onChange={(e) => setDailyOrders(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>5 comm./j</span>
                  <span>50 comm./j</span>
                  <span>100 comm./j</span>
                  <span>200 comm./j</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1.5">
                  <label htmlFor="average-basket-input">Panier moyen (€ TTC) :</label>
                  <span className="text-emerald-400 font-bold">{averageBasket} € / commande</span>
                </div>
                <input 
                  id="average-basket-input"
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={averageBasket}
                  onChange={(e) => setAverageBasket(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>20 €</span>
                  <span>80 €</span>
                  <span>150 €</span>
                  <span>250 €</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <span>Chiffre d'Affaires quotidien estimé :</span>
                <span className="font-extrabold text-white">{calculatedDailyRevenue.toLocaleString('fr-FR')} € / jour</span>
              </div>
            </div>

            {/* Résultat dynamique calculé */}
            <div className={`lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-lg ${
              selectedGrade === 'A'
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : selectedGrade === 'C'
                ? 'bg-amber-950/30 border-amber-500/40'
                : 'bg-rose-950/30 border-rose-500/40'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Coût estimé d'un incident de 48h
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl sm:text-4xl font-black ${
                    selectedGrade === 'A' ? 'text-emerald-400' : selectedGrade === 'C' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    ~{calculated48hLoss.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-xs text-slate-300 font-medium">de perte nette</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedGrade === 'A'
                    ? "Risque financier très faible (~" + calculatedDailyLoss + " €/j de risque résiduel) grâce à vos protections actives."
                    : selectedGrade === 'C'
                    ? "Une interruption SSL ou un blocage de passerelle de 48h vous ferait perdre environ " + calculated48hLoss.toLocaleString('fr-FR') + " € de commandes."
                    : "Urgence critique : un blocage panier entraînerait immédiatement ~" + calculated48hLoss.toLocaleString('fr-FR') + " € de commandes perdues."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Coût de la remise à niveau :</span>
                <span className="font-bold text-white">590 € (rentabilisé dès la 1ère heure)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Curseur Visuel Interactif Avant / Après Sécurisation */}
        <BeforeAfterComparison
          storeUrl={storeUrl}
          grade={selectedGrade}
          score={current.score}
        />

        {/* Module Badge de réassurance officiel & Snippet pour la page Panier */}
        <div 
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
          data-testid="trust-badge-showcase"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-white font-extrabold text-lg">
                <Award className="w-5 h-5 text-emerald-400" />
                <h2>Badge officiel de réassurance client pour votre page Panier</h2>
                <InfoTooltip 
                  title="Badge de réassurance officiel BoutiqueSûre"
                  content="Ce sceau certifié prouve à vos acheteurs que votre boutique a subi un contrôle de sécurité passif rigoureux. L'intégration sous le bouton 'Commander' augmente le taux de transformation de 5 à 12%."
                  impact="Renforce la confiance immédiate et réduit drastiquement les abandons de panier."
                  testId="tooltip-trust-badge"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Rassurez vos acheteurs au moment crucial du paiement pour maximiser vos conversions :
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[11px] px-3 py-1 rounded-full font-bold ${
                selectedGrade === 'A' 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {selectedGrade === 'A' ? 'Éligible — Prêt à intégrer' : 'Déblocage dès la Note A'}
              </span>
            </div>
          </div>

          {selectedGrade === 'A' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Rendu visuel du Badge */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border-2 border-emerald-400/80 text-center shadow-lg space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto">
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                    Boutique Protégée 2026
                  </div>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    Certifié Conforme BoutiqueSûre
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Note Officielle A • Chiffrement & En-têtes Validés
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Réf : #BS-2026-CERT-OK
                </div>
              </div>

              {/* Snippet de code prêt à copier */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    Code d'intégration HTML (Boutique en ligne / CMS) :
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBadgeSnippet}
                    data-testid="copy-badge-snippet-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {badgeSnippetCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Code copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier le snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {badgeSnippet}
                </pre>
                <p className="text-[11px] text-slate-400">
                  Collez ce code dans votre modèle de page Panier ou sous le bouton de commande pour rassurer instantanément vos visiteurs.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Badge de réassurance actuellement verrouillé</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Obtenez la Note A pour débloquer votre badge officiel
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  L'intégration du badge BoutiqueSûre augmente en moyenne le taux de conversion de <strong>+8%</strong> en éliminant la peur de la fraude bancaire. Corrigez vos 3 actions prioritaires pour l'activer.
                </p>
              </div>
              <button
                onClick={() => setSelectedGrade('A')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
              >
                Prévisualiser le badge Note A
              </button>
            </div>
          )}
        </div>

        {/* Widget Dynamique Vectoriel SVG du Badge de Sécurité */}
        <DynamicBadgeWidget
          storeUrl={storeUrl}
          grade={selectedGrade}
          score={current.score}
        />

        {/* Idée 4 : Alertes Proactives & Webhooks Slack, Discord, MS Teams */}
        <WebhookAlertsConfig
          storeUrl={storeUrl}
        />

        {/* Section Conversion Dynamique : Aiguillage ciblé selon Note A/B ou C/D/E/F */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0F1B2D] to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl" data-testid="pricing-conversion-section">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Recommandation personnalisée pour votre boutique
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              {selectedGrade === 'A' 
                ? "Maintenez ce niveau d'excellence sans y passer vos soirées"
                : "Plan d'action prioritaire pour sécuriser vos commandes"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              {selectedGrade === 'A'
                ? "Votre boutique est bien protégée. Déléguez la maintenance et les sauvegardes de votre boutique en ligne pour éviter toute régression."
                : "Des failles passives critiques ont été repérées. Confiez la remise à niveau à nos experts e-commerce dédiés."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARTE 1 : Diagnostic Complet (Mis en avant si Note C ou E) */}
            <div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative ${
              selectedGrade !== 'A'
                ? 'bg-slate-900 border-2 border-emerald-400 shadow-xl shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 opacity-90'
            }`}>
              {selectedGrade !== 'A' && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase shadow">
                  Intervention Recommandée pour votre Note
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Formule Remise à Niveau
                </span>
                <h3 className="text-base font-bold text-white mt-2">Diagnostic Complet Boutique en Ligne</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">590 €</span>
                  <span className="text-xs text-slate-400">HTVA</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Correction immédiate de vos 3 points prioritaires</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Audit approfondi de vos extensions, modules et base SQL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>1 heure de restitution en visio avec un expert</span>
                  </li>
                </ul>
              </div>
              <button 
                type="button"
                onClick={() => handleOpenOrderModal('diagnostic_590')}
                data-testid="cta-book-diagnostic-btn"
                className={`mt-6 w-full min-h-[46px] px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedGrade !== 'A'
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <span>Réserver mon diagnostic prioritaire (590 €)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* CARTE 2 : Abonnement Sérénité (Mis en avant si Note A) */}
            <div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative ${
              selectedGrade === 'A'
                ? 'bg-emerald-950/30 border-2 border-[#4ADE80] shadow-xl shadow-emerald-500/20'
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              {selectedGrade === 'A' && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#4ADE80] text-slate-950 text-[10px] font-black uppercase shadow">
                  Formule Idéale Note A
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Tranquillité absolue
                </span>
                <h3 className="text-base font-bold text-white mt-2">Abonnement Sérénité</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#4ADE80]">69 €</span>
                  <span className="text-xs text-slate-300">HTVA / mois</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Veilleur Mensuel Automatique :</strong> Scan passif chaque 1er du mois (alerte 2h)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Mises à jour testées sur environnement miroir</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Sauvegardes quotidiennes externalisées en Europe</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Assistance prioritaire 5j/7 en cas de pépin</span>
                  </li>
                </ul>
              </div>
              <button 
                type="button"
                onClick={() => handleOpenOrderModal('serenite_69')}
                data-testid="cta-subscribe-serenite-btn"
                className={`mt-6 w-full min-h-[46px] px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedGrade === 'A'
                    ? 'bg-[#4ADE80] hover:bg-[#3ec974] text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>Souscrire l'Abonnement Sérénité (69 €/mois)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B1523] py-6 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>BoutiqueSûre © 2026 — Diagnostic passif garanti non intrusif</span>
          </div>
          <div className="flex items-center flex-wrap gap-4 text-xs">
            {onNavigateToScreen && (
              <>
                <button 
                  type="button"
                  onClick={() => onNavigateToScreen('privacy')} 
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                  data-testid="bulletin-footer-privacy-btn"
                >
                  Charte & Confidentialité (RGPD)
                </button>
                <span className="text-slate-700">•</span>
                <button 
                  type="button"
                  onClick={() => onNavigateToScreen('audit_logs')} 
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Journal des analyses
                </button>
                <span className="text-slate-700">•</span>
              </>
            )}
            <a href="mailto:dpo@boutiquesure.fr" className="hover:text-slate-300">
              dpo@boutiquesure.fr
            </a>
          </div>
        </div>
      </footer>

      {/* Bouton d'accès flottant à la visite guidée */}
      <button
        type="button"
        onClick={() => setIsTourOpen(true)}
        data-testid="floating-tour-button"
        className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white border-2 border-emerald-400 shadow-xl shadow-emerald-500/25 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer backdrop-blur group"
        title="Démarrer la visite guidée du bulletin"
      >
        <Compass className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
        <span className="hidden sm:inline">Comprendre mon score</span>
        <span className="sm:hidden">Guide</span>
      </button>

      {/* Système de visite guidée (Onboarding Tour) */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      {/* Tiroir & Modal de Remédiation technique avec simulateur Avant / Après */}
      <RemediationDrawer
        isOpen={isRemediationOpen}
        onClose={() => setIsRemediationOpen(false)}
        initialSnippetId={activeRemediationSnippetId}
        baseScore={current.score}
        baseGrade={current.grade}
        appliedFixes={appliedRemediationFixes}
        onToggleFix={handleToggleRemediationFix}
        onResetFixes={() => setAppliedRemediationFixes([])}
      />

      {/* Modal officiel d'attestation de diligence technique NIS 2 */}
      <NIS2AttestationModal
        isOpen={isNIS2ModalOpen}
        onClose={() => setIsNIS2ModalOpen(false)}
        storeUrl={storeUrl}
        score={current.score}
        grade={current.grade}
      />

      {/* Modal de Réservation / Commande en 1 Clic */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        initialOffer={selectedOrderOffer}
        storeUrl={storeUrl}
        email={email}
        grade={current.grade}
        score={current.score}
      />

      {/* Modal QR Code & Carte de Partage Mobile */}
      <AuditQrShareModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        storeUrl={storeUrl}
        score={current.score}
        grade={current.grade}
      />

      {/* Idée 2 : Modal d'Attestation Cyber-Assurance & Banque VAD avec export PDF officiel */}
      <BankInsuranceAttestationModal
        isOpen={isBankInsuranceModalOpen}
        onClose={() => setIsBankInsuranceModalOpen(false)}
        storeUrl={storeUrl}
        email={email}
        grade={effectiveGrade}
        score={current.score}
      />
    </div>
  );
}
