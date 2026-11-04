/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Maquette Écran 3 : Bulletin de sécurité A à F
 */

import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { AuditResult, SecurityRecommendation } from '../types.ts';
import jsPDF from 'jspdf';
import { InfoTooltip } from './InfoTooltip.tsx';

export interface BulletinMockupProps {
  storeUrl?: string;
  email?: string;
  isMobileView?: boolean;
  auditResult?: AuditResult;
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

export function BulletinMockup({
  storeUrl = 'https://maboutique-mode.fr',
  email = 'contact@maboutique-mode.fr',
  isMobileView = false,
  auditResult
}: BulletinMockupProps) {
  // Possibilité de changer de note pour tester la maquette sur A, C ou E/F
  const initialGrade = auditResult ? (['A', 'C', 'E'].includes(auditResult.grade) ? (auditResult.grade as 'A' | 'C' | 'E') : 'C') : 'C';
  const [selectedGrade, setSelectedGrade] = useState<'A' | 'C' | 'E'>(initialGrade);

  React.useEffect(() => {
    if (auditResult?.grade) {
      const g = ['A', 'C', 'E'].includes(auditResult.grade) ? (auditResult.grade as 'A' | 'C' | 'E') : 'C';
      setSelectedGrade(g);
    }
  }, [auditResult]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // État du calculateur interactif de risque financier
  const [dailyOrders, setDailyOrders] = useState<number>(25);
  const [averageBasket, setAverageBasket] = useState<number>(65);
  const [badgeSnippetCopied, setBadgeSnippetCopied] = useState<boolean>(false);
  const [hoveredCriterion, setHoveredCriterion] = useState<string | null>(null);

  const gradeConfigs = {
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
          title: 'Masquer la version exacte de WordPress & WooCommerce',
          desc: 'La balise generator est visible publiquement dans votre code HTML, facilitant le travail des robots malveillants.',
          urgency: 'Priorité 2 (Urgent)',
          tooltipTitle: 'Exposition des versions WordPress & WooCommerce',
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
          title: 'Versions publiques WooCommerce et extensions visibles',
          desc: 'Signale immédiatement aux attaquants si vos modules accusent un retard de mise à jour.',
          urgency: 'Priorité 3 (Urgent)',
          tooltipTitle: 'Plugins et versions WooCommerce exposés',
          tooltipContent: 'Les plugins tiers obsolètes sont responsables de plus de 85% des failles de sécurité exploitées sur WordPress.',
          tooltipImpact: 'Risque critique d\'injection de code malveillant et de blocage par les moteurs de recherche.'
        }
      ]
    }
  };

  const current = gradeConfigs[selectedGrade];

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
      doc.text('Audit 100% passif pour boutiques WooCommerce — Réf : #BS-' + Date.now().toString(36).toUpperCase(), 15, y);

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
        { name: 'Protection contre l\'exposition', max: '25 pts max', desc: 'Masquage versions WordPress/WooCommerce et Permissions-Policy' }
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
      doc.text('Besoin d\'assistance d\'un expert WooCommerce ? contact@boutiquesure.fr | https://boutiquesure.fr', 15, y + 4);

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
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              data-testid="header-download-pdf-button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
                  className={`px-2 py-0.5 rounded cursor-pointer ${selectedGrade === 'A' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Note A
                </button>
                <button 
                  onClick={() => setSelectedGrade('C')} 
                  className={`px-2 py-0.5 rounded cursor-pointer ${selectedGrade === 'C' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Note C
                </button>
                <button 
                  onClick={() => setSelectedGrade('E')} 
                  className={`px-2 py-0.5 rounded cursor-pointer ${selectedGrade === 'E' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
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

            {/* Note géante avec libellé accessible */}
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${current.bgColor} shadow-lg shrink-0`}>
              <div className="text-center">
                <div className="text-5xl font-black tracking-tight">{current.grade}</div>
                <div className="text-xs font-bold uppercase tracking-wider mt-1">{current.score} / 100 pts</div>
              </div>
              <div className="border-l border-slate-700/60 pl-4 max-w-[200px]">
                <div className="text-xs font-extrabold text-white leading-tight">{current.label}</div>
                <div className="text-[11px] text-slate-300 mt-1">Audit 100% passif</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5 pt-5 border-t border-slate-800">
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {current.tagline} Une copie a été envoyée à <strong className="text-white">{email}</strong>.
            </p>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              data-testid="download-pdf-button"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 font-bold text-xs transition-all cursor-pointer shadow-md shrink-0 self-start sm:self-auto disabled:opacity-50"
            >
              <Download className={`w-4 h-4 text-emerald-400 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'Génération du PDF...' : 'Télécharger le rapport (PDF)'}</span>
            </button>
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
                    ? "Votre boutique surpasse 84% des e-commerçants WooCommerce de votre secteur en France & Belgique."
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
              <span className="text-sky-400 font-semibold">Attestation officielle</span>
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
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
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
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 self-start shrink-0">
                  <span>Pris en charge</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                10 critères analysés • 100 pts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SECURITY_PILLARS.map((pillar) => (
              <div 
                key={pillar.id} 
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-4"
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
                    {pillar.criteria.map((crit) => {
                      const evalCrit = crit.evalStatus[selectedGrade];
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

                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                            evalCrit.passed 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}>
                            {evalCrit.badge}
                          </span>
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
                    Code d'intégration HTML (WooCommerce / Elementor) :
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

        {/* Section Conversion Dynamique : Aiguillage ciblé selon Note A/B ou C/D/E/F */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0F1B2D] to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
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
                ? "Votre boutique est bien protégée. Déléguez la maintenance et les sauvegardes WooCommerce pour éviter toute régression."
                : "Des failles passives critiques ont été repérées. Confiez la remise à niveau à nos experts WooCommerce dédiés."}
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
                <h3 className="text-base font-bold text-white mt-2">Diagnostic Complet WooCommerce</h3>
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
                    <span>Audit approfondi de vos 20+ plugins et base SQL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>1 heure de restitution en visio avec un expert</span>
                  </li>
                </ul>
              </div>
              <button className={`mt-6 w-full min-h-[46px] px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedGrade !== 'A'
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}>
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
              <button className={`mt-6 w-full min-h-[46px] px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedGrade === 'A'
                  ? 'bg-[#4ADE80] hover:bg-[#3ec974] text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}>
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
          <div className="text-slate-500">
            Besoin d'aide ? contact@boutiquesure.fr
          </div>
        </div>
      </footer>
    </div>
  );
}
