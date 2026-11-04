/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Maquette Écran 4 : Email transactionnel envoyé au gérant (Resend)
 */

import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, ExternalLink, Mail } from 'lucide-react';

interface EmailMockupProps {
  storeUrl?: string;
  email?: string;
  grade?: string;
  score?: number;
}

export function EmailMockup({
  storeUrl = 'https://maboutique-mode.fr',
  email = 'contact@maboutique-mode.fr',
  grade = 'C',
  score = 65
}: EmailMockupProps) {
  return (
    <div className="w-full min-h-screen bg-[#0A101D] text-slate-100 font-['Manrope',sans-serif] p-4 sm:p-8 flex flex-col items-center justify-center">
      
      {/* Cadre client email réaliste */}
      <div className="w-full max-w-2xl bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        
        {/* Header client email factice */}
        <div className="bg-[#F6F7F9] px-6 py-4 border-b border-slate-200 text-xs text-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              Aperçu Email Transactionnel (Resend)
            </span>
            <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">Client Web / Mobile</span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div><strong className="text-slate-800">De :</strong> BoutiqueSûre &lt;bulletin@boutiquesure.fr&gt;</div>
            <div><strong className="text-slate-800">À :</strong> {email}</div>
            <div><strong className="text-slate-800">Objet :</strong> [Bulletin] Score de sécurité pour {storeUrl.replace(/^https?:\/\//, '')} : Note {grade} ({score}/100)</div>
          </div>
        </div>

        {/* Corps de l'email HTML */}
        <div className="p-6 sm:p-10 space-y-6">
          
          {/* Logo BoutiqueSûre */}
          <div className="flex items-center gap-2 pb-6 border-b border-slate-100">
            <div className="h-8 w-8 rounded-lg bg-[#0F1B2D] flex items-center justify-center text-[#4ADE80] font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-black text-lg text-[#0F1B2D]">BoutiqueSûre</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F1B2D] leading-tight">
              Bonjour,
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Voici le résultat de l'analyse passive de sécurité réalisée sur votre boutique WooCommerce <strong>{storeUrl}</strong>.
            </p>
          </div>

          {/* Bloc Note de l'email */}
          <div className="p-5 rounded-xl bg-[#F6F7F9] border border-slate-200 flex items-center gap-6">
            <div className="h-16 w-16 rounded-xl bg-amber-500 text-slate-950 font-black text-3xl flex items-center justify-center shadow">
              {grade}
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-slate-500">Score global</div>
              <div className="text-base font-extrabold text-[#0F1B2D]">
                Sécurité moyenne — {score} / 100 points
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Des failles passives visibles facilitent le ciblage par des robots pirates.
              </div>
            </div>
          </div>

          {/* 3 Actions clés */}
          <div>
            <h2 className="text-sm font-bold text-[#0F1B2D] uppercase tracking-wider mb-3">
              Vos 3 priorités immédiates :
            </h2>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <strong>1. Activer l'en-tête HSTS :</strong> protège vos transactions contre le vol de données.
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <strong>2. Masquer les versions publiques :</strong> ne divulguez plus vos numéros de version WooCommerce.
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <strong>3. Ajouter l'en-tête X-Frame-Options :</strong> prévient le détournement de vos formulaires clients.
              </div>
            </div>
          </div>

          {/* Bouton CTA d'accès au bulletin interactif */}
          <div className="pt-2 text-center">
            <a
              href="#bulletin"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F1B2D] hover:bg-[#1a2c47] text-white font-extrabold text-sm shadow transition-colors"
            >
              <span>Consulter mon bulletin complet en ligne</span>
              <ArrowRight className="w-4 h-4 text-[#4ADE80]" />
            </a>
            <p className="text-[11px] text-slate-400 mt-2">
              Ce lien reste accessible pendant 30 jours sans mot de passe requis.
            </p>
          </div>

          {/* Offre d'accompagnement */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700">
            <strong className="text-[#0E6B3A] block mb-1">Besoin d'aide pour sécuriser votre boutique ?</strong>
            BoutiqueSûre accompagne les gérants de boutiques réalisant 100k€ à 500k€ de CA :
            diagnostic approfondi à 590 € HTVA ou abonnement Sérénité à 69 €/mois.
          </div>

          {/* Footer RGPD & Désinscription */}
          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <p>
              Cet email vous a été envoyé suite à votre demande d'audit passif sur BoutiqueSûre.fr.
            </p>
            <p>
              BoutiqueSûre SRL / SAS • Conformité RGPD • 
              <a href="#desinscription" className="text-[#0E6B3A] underline ml-1">Se désinscrire de tout contact</a>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
