/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Comparateur Visuel Interactif « Avant / Après Sécurisation »
 * Fichier : src/components/BeforeAfterComparison.tsx
 *
 * Démonstrateur interactif illustrant le bond de confiance et le gain de conversion
 * entre une boutique vulnérable et une boutique auditée & remise à niveau.
 */

import React, { useState } from 'react';
import { 
  Split, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip.tsx';

export interface BeforeAfterComparisonProps {
  storeUrl: string;
  grade: string;
  score: number;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  storeUrl,
  grade,
  score
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const cleanDomain = storeUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'maboutique.fr';

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
      data-testid="before-after-comparison-card"
    >
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-white font-extrabold text-lg">
            <Split className="w-5 h-5 text-emerald-400" />
            <h2>Comparateur Interactif : Votre Boutique « Avant » vs « Après » Sécurisation</h2>
            <InfoTooltip 
              title="Impact Visuel sur la Confiance des Acheteurs"
              content="Comparez directement ce que voient vos clients sur Chrome/Safari lorsque votre boutique présente des failles techniques passives vs lorsqu'elle est certifiée conforme."
              impact="Une page panier sécurisée et rassurante génère en moyenne +8% à +12% de commandes finalisées."
              testId="tooltip-before-after-main"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Faites glisser le curseur pour visualiser la métamorphose de l'expérience d'achat sur <strong className="text-white font-mono">{cleanDomain}</strong> :
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
            Curseur Comparatif
          </span>
        </div>
      </div>

      {/* Curseur interactif range */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-rose-400 flex items-center gap-1.5">
            <Unlock className="w-3.5 h-3.5" />
            <span>AVANT (Failles détectées & Risque)</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {sliderPosition < 45 ? 'Vue Avant prédominante' : sliderPosition > 55 ? 'Vue Après sécurisation' : 'Vue 50/50 Équilibrée'}
          </span>
          <span className="text-emerald-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>APRÈS (Boutique Certifiée Note A)</span>
          </span>
        </div>

        <input 
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          data-testid="before-after-slider"
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          aria-label="Position du comparateur avant après"
        />
      </div>

      {/* Double affichage Split-Screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Panneau GAUCHE : AVANT (Boutique vulnérable) */}
        <div 
          data-testid="before-card"
          className={`p-5 rounded-2xl border transition-all ${
            sliderPosition <= 50 
              ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20 shadow-lg' 
              : 'bg-slate-950/40 border-slate-800/80 opacity-75'
          }`}
        >
          {/* Fausse barre de navigation navigateur */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-900/40 flex items-center gap-2 mb-4">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 font-mono truncate">
              <Unlock className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="font-bold">Non sécurisé</span>
              <span className="text-slate-400 truncate">| {cleanDomain}/commander/</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                État Actuel à Risque
              </span>
              <span className="text-xs font-black text-rose-400">Score &lt; 60/100</span>
            </div>

            <h3 className="text-sm font-bold text-white">
              Expérience Acheteur Dégradée
            </h3>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Avertissements de sécurité sur Google Chrome et Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Vulnérabilité aux attaques Magecart (vol de carte bancaire)</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Versions PHP/WordPress exposées aux robots scans malveillants</span>
              </li>
            </ul>

            {/* Métriques d'impact négatif */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Abandon Panier</span>
                <span className="text-sm font-black text-rose-400 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +34%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Risque Coupure</span>
                <span className="text-sm font-black text-rose-400">Élevé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau DROIT : APRÈS (Boutique Certifiée Note A) */}
        <div 
          data-testid="after-card"
          className={`p-5 rounded-2xl border transition-all ${
            sliderPosition >= 50 
              ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-lg' 
              : 'bg-slate-950/40 border-slate-800/80 opacity-75'
          }`}
        >
          {/* Fausse barre de navigation navigateur */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-900/40 flex items-center gap-2 mb-4">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono truncate">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="font-bold">Sécurisé</span>
              <span className="text-slate-300 truncate">| https://{cleanDomain}/commander/</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Après Remise à Niveau
              </span>
              <span className="text-xs font-black text-emerald-400">Note A (98/100)</span>
            </div>

            <h3 className="text-sm font-bold text-white">
              Confiance Absolue & Panier Fluide
            </h3>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Cadenas vert & en-têtes HSTS bloquant tout détournement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>CSP étanche conforme PCI-DSS v4 isolant Stripe et PayPal</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sceau officiel certifié affiché sous le bouton Commander</span>
              </li>
            </ul>

            {/* Métriques d'impact positif */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Gain de Conversion</span>
                <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +8% à +12%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Diligence NIS 2</span>
                <span className="text-sm font-black text-emerald-400">Conforme</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Synthèse chiffrée ROI */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            La sécurisation BoutiqueSûre s'autofinance en moyenne dès les <strong>14 premiers jours</strong> grâce aux paniers sauvés.
          </span>
        </div>
        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0">
          ROI Constaté : ×6 à ×10
        </span>
      </div>

    </div>
  );
};
