/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Composant FAQSection : Questions fréquentes sur la sécurité WooCommerce
 * Situé à la fin de la page d'accueil pour rassurer l'utilisateur avant le scan.
 */

import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUp, 
  Eye, 
  Sparkles,
  CreditCard,
  Search
} from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'passive' | 'business' | 'privacy' | 'remediation';
  question: string;
  answer: string;
  highlight?: string;
}

export const WOOCOMMERCE_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'impact-boutique',
    category: 'passive',
    question: "L'analyse risque-t-elle de ralentir ou de faire planter ma boutique WooCommerce ?",
    answer: "Absolument aucun risque. Notre scanner n'envoie qu'une seule et unique requête HTTP GET standard vers votre page d'accueil, exactement identique à un visiteur ordinaire ou au robot Googlebot. Aucun test de charge, aucune écriture en base de données et zéro interruption pour vos clients en train de passer commande.",
    highlight: "Zéro risque technique • 1 seule requête GET normale"
  },
  {
    id: 'definition-passif',
    category: 'passive',
    question: "Qu'est-ce qu'une analyse de sécurité « 100 % passive » ?",
    answer: "Une analyse passive ne lit QUE les signaux publics émis librement par votre serveur web : la validité et la chaîne d'autorité du certificat SSL/TLS, la redirection HTTPS systématique, la présence des en-têtes HTTP de sécurité (HSTS, CSP, X-Frame-Options) et l'exposition publique des versions de WordPress ou WooCommerce dans les balises meta.",
    highlight: "Lecture stricte des en-têtes publics sans injection"
  },
  {
    id: 'absence-intrusion',
    category: 'passive',
    question: "Réalisez-vous des tests d'intrusion, des scans de ports ou des tentatives d'accès ?",
    answer: "Formellement NON. C'est une charte éthique et légale inviolable : nous ne scannons aucun port fermé, nous ne devinons aucune URL confidentielle (/wp-admin, /wp-login.php, /backup.sql), nous ne testons aucun mot de passe par force brute, nous n'énumérons aucun identifiant et nous n'injectons aucune charge utile. L'outil agit comme un simple thermomètre de santé publique.",
    highlight: "Déontologie absolue • Aucune tentative d'intrusion"
  },
  {
    id: 'enjeu-chiffre-affaires',
    category: 'business',
    question: "Pourquoi la sécurité de mon WooCommerce est-elle un enjeu direct de chiffre d'affaires ?",
    answer: "Pour une boutique réalisant entre 100k€ et 500k€ de chiffre d'affaires annuel, une seule journée de panne ou de défaillance du panier représente 300 € à 1 500 € de pertes nettes. De plus, les failles d'en-têtes HTTP permettent les attaques de clickjacking et de détournement de formulaire (form-jacking/Magecart) visant les données de cartes bancaires. Sécuriser sa boutique protège vos conversions, votre réputation et votre conformité bancaire PCI-DSS.",
    highlight: "Protection des ventes quotidiennes et réputation Stripe/PayPal"
  },
  {
    id: 'confirmation-gerant',
    category: 'privacy',
    question: "Pourquoi demandez-vous une confirmation expresse que je suis le gérant ?",
    answer: "Par strict respect de la déontologie professionnelle et du RGPD. Bien que l'analyse soit 100 % passive et n'utilise que des informations publiques, nous tenons à nous assurer que le rapport de santé est adressé exclusivement aux personnes légitimement responsables de la gestion de l'e-commerce.",
    highlight: "Conformité éthique et traçabilité transparente"
  },
  {
    id: 'confidentialite-score',
    category: 'privacy',
    question: "Mes résultats d'audit et mon score de sécurité sont-ils visibles par des tiers ou concurrents ?",
    answer: "Non, la confidentialité est absolue. Votre bulletin de sécurité n'est pas indexé sur les moteurs de recherche et reste privé. Seul le lien sécurisé unique généré pour vous (et envoyé à votre adresse email professionnelle) permet d'accéder au rapport détaillé.",
    highlight: "Rapports privés non indexés sur Google"
  },
  {
    id: 'donnees-rgpd',
    category: 'privacy',
    question: "Que faites-vous de mon adresse email ? (Garanties RGPD & Zéro spam)",
    answer: "Votre adresse email sert uniquement à vous acheminer votre bulletin de sécurité et votre récapitulatif PDF d'actions prioritaires. Vos données sont hébergées de manière sécurisée en Union Européenne, ne sont jamais revendues à des tiers et vous pouvez vous désinscrire ou demander la suppression définitive de vos données en 1 seul clic.",
    highlight: "Hébergement UE conforme RGPD • Désinscription 1 clic"
  },
  {
    id: 'mauvaise-note-actions',
    category: 'remediation',
    question: "Que se passe-t-il si ma boutique obtient une mauvaise note (D, E ou F) ?",
    answer: "Pas d'inquiétude : la majorité des failles passives détectées (en-têtes HTTP manquants, versions divulguées) sont simples et rapides à corriger. Votre bulletin vous fournira immédiatement les 3 actions prioritaires expliquées sans jargon technique. Si vous n'avez pas de développeur en interne, nos experts WooCommerce peuvent intervenir pour appliquer les correctifs.",
    highlight: "Top 3 actions concrètes et vulgarisées fournies d'office"
  }
];

interface FAQSectionProps {
  onScrollToForm?: () => void;
}

export function FAQSection({ onScrollToForm }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'passive' | 'business' | 'privacy' | 'remediation'>('all');

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredItems = WOOCOMMERCE_FAQ_ITEMS.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleScrollTop = () => {
    if (onScrollToForm) {
      onScrollToForm();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="faq-section-woocommerce" 
      data-testid="faq-section"
      className="w-full max-w-4xl mt-16 mb-8 px-4 sm:px-0"
      aria-labelledby="faq-section-heading"
    >
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-8">
        
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Foire Aux Questions</span>
          </div>
          
          <h2 id="faq-section-heading" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tout comprendre sur la <span className="text-[#4ADE80]">sécurité WooCommerce</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Des réponses claires et transparentes pour sécuriser votre boutique en ligne sans jargon technique et sans aucun risque pour vos ventes.
          </p>
        </div>

        {/* Filtres par thématique */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {[
            { id: 'all', label: 'Toutes les questions' },
            { id: 'passive', label: '🛡️ Analyse 100% passive' },
            { id: 'business', label: '💼 Impact Chiffre d\'Affaires' },
            { id: 'privacy', label: '🔒 Confidentialité & RGPD' },
            { id: 'remediation', label: '⚡ Solutions & Correctifs' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Liste des accordéons */}
        <div className="space-y-3.5" role="region" aria-label="Questions fréquentes sur la sécurité WooCommerce">
          {filteredItems.map((item, index) => {
            const isOpen = openIndex === index;
            const headingId = `faq-btn-sec-${item.id}`;
            const panelId = `faq-panel-sec-${item.id}`;

            return (
              <div 
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-[#0F1B2D]/80 overflow-hidden transition-all duration-200 hover:border-slate-700/90"
              >
                <button
                  type="button"
                  id={headingId}
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  onClick={() => toggleAccordion(index)}
                  className="w-full min-h-[56px] px-5 py-4 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white font-extrabold text-xs sm:text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4ADE80] transition-colors"
                >
                  <span className="leading-snug">{item.question}</span>
                  <div className={`shrink-0 w-7 h-7 rounded-full bg-slate-800/90 flex items-center justify-center text-[#4ADE80] text-xs transition-transform duration-200 ${isOpen ? 'rotate-180 bg-emerald-500/20 shadow-inner' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div 
                    id={panelId}
                    role="region"
                    aria-labelledby={headingId}
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/60 space-y-3"
                  >
                    <p>{item.answer}</p>
                    {item.highlight && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.highlight}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bloc rassurant avec appel à l'action pour remonter au formulaire */}
        <div className="pt-6 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Prêt à tester la résilience de votre boutique ?</p>
              <p className="text-[11px] text-slate-400">Scan 100% passif, gratuit et résultat en 5 secondes.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleScrollTop}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#0E6B3A] hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span>Lancer mon scan gratuit</span>
            <ArrowUp className="w-4 h-4 text-slate-950" />
          </button>
        </div>

      </div>
    </section>
  );
}

export default FAQSection;
