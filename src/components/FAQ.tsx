/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Composant FAQ : Sécurité & Analyse 100% Passive
 */

import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, ChevronDown, CheckCircle2, Lock, Eye } from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'impact-boutique',
    question: "L'analyse risque-t-elle de ralentir ou de faire planter ma boutique ?",
    answer: "Absolument aucun risque. Notre outil n'envoie qu'une seule et unique requête HTTP GET normale vers votre page d'accueil, exactement comme un visiteur ou Googlebot qui consulte votre site. Aucun test de charge, aucune écriture et zéro coupure pour vos clients en train de commander."
  },
  {
    id: 'definition-passif',
    question: "Qu'est-ce qu'une analyse de sécurité « 100 % passive » ?",
    answer: "Une analyse passive ne lit QUE les informations publiques que votre serveur envoie déjà à n'importe quel navigateur : la validité et la date d'expiration de votre certificat SSL/TLS, la redirection HTTPS, la présence des en-têtes HTTP de sécurité (HSTS, CSP, X-Frame-Options) et les balises meta de version visibles dans le code HTML public."
  },
  {
    id: 'absence-intrusion',
    question: "Réalisez-vous des tests d'intrusion, des scans de ports ou des tentatives de connexion ?",
    answer: "Formellement NON. C'est une règle éthique et légale absolue : nous ne scannons aucun port serveur, nous ne devinons aucune URL secrète (/wp-admin, /backup.zip), nous ne testons aucun mot de passe, nous n'énumérons aucun utilisateur et nous n'injectons aucune charge utile. L'outil agit comme un simple thermomètre bienveillant."
  },
  {
    id: 'confidentialite-score',
    question: "Mes données et mon score de sécurité sont-ils visibles par des tiers ou mes concurrents ?",
    answer: "Non, confidentialité totale garantie. Votre bulletin de sécurité n'est pas indexé sur les moteurs de recherche et reste privé. Seul le lien sécurisé unique généré pour vous (et envoyé à votre adresse email) permet de le consulter."
  },
  {
    id: 'donnees-rgpd',
    question: "Que faites-vous de mon adresse email ? (Garanties RGPD)",
    answer: "Zéro spam. Votre email sert exclusivement à vous faire parvenir votre bulletin de sécurité et votre synthèse de recommandations. Conformément au RGPD européen, vos données sont conservées de façon sécurisée, vous disposez d'un lien de désinscription immédiat en 1 clic et vos données peuvent être effacées sur simple demande."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      id="faq-securite" 
      className="w-full max-w-xl mt-8" 
      aria-labelledby="faq-heading"
    >
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md">
        
        {/* En-tête du bloc FAQ */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#4ADE80]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 id="faq-heading" className="text-sm sm:text-base font-bold text-white tracking-tight">
              Foire aux questions : Sécurité & Analyse 100% passive
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Toutes les garanties de confidentialité et d'absence d'intrusion expliquées clairement.
            </p>
          </div>
        </div>

        {/* Liste des accordéons */}
        <div className="mt-4 space-y-3" role="region" aria-label="Questions fréquentes sur la sécurité passive">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            const headingId = `faq-btn-${item.id}`;
            const panelId = `faq-panel-${item.id}`;

            return (
              <div 
                key={item.id}
                className="rounded-xl border border-slate-800 bg-[#0F1B2D]/80 overflow-hidden transition-all duration-200 hover:border-slate-700"
              >
                <button
                  type="button"
                  id={headingId}
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  onClick={() => toggleAccordion(index)}
                  className="w-full min-h-[52px] px-4 py-3.5 text-left flex items-center justify-between gap-3 text-slate-200 hover:text-white font-bold text-xs sm:text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4ADE80] transition-colors"
                >
                  <span className="leading-snug">{item.question}</span>
                  <div className={`shrink-0 w-6 h-6 rounded-full bg-slate-800/90 flex items-center justify-center text-[#4ADE80] text-xs transition-transform duration-200 ${isOpen ? 'rotate-180 bg-emerald-500/20' : ''}`}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div 
                    id={panelId}
                    role="region"
                    aria-labelledby={headingId}
                    className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/50"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rappel réassurance bas de FAQ */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            1 seule requête GET ordinaire
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Zéro intrusion garantie
          </span>
        </div>

      </div>
    </section>
  );
}
export default FAQ;
