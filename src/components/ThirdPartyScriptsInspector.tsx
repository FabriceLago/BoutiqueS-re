/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Inspecteur de Balises & Scripts Tiers (« Tag & Pixel Inspector »)
 * Fichier : src/components/ThirdPartyScriptsInspector.tsx
 */

import React, { useState } from 'react';
import { 
  Code2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Zap, 
  Sparkles,
  Info
} from 'lucide-react';

export interface ThirdPartyScriptsInspectorProps {
  storeUrl?: string;
  grade?: string;
}

export interface ScriptTagItem {
  id: string;
  name: string;
  vendor: string;
  category: 'analytics' | 'ads' | 'chat' | 'payment';
  isDetected: boolean;
  isIsolatedByCsp: boolean;
  hasSriIntegrity: boolean;
  performanceImpact: 'low' | 'medium' | 'high';
  riskDescription: string;
}

export const ThirdPartyScriptsInspector: React.FC<ThirdPartyScriptsInspectorProps> = ({
  storeUrl = 'https://ma-boutique-en-ligne.fr',
  grade = 'C'
}) => {
  const isWellProtected = grade === 'A' || grade === 'B';

  const defaultScripts: ScriptTagItem[] = [
    {
      id: 'gtm',
      name: 'Google Tag Manager',
      vendor: 'Google LLC',
      category: 'analytics',
      isDetected: true,
      isIsolatedByCsp: isWellProtected,
      hasSriIntegrity: false,
      performanceImpact: 'medium',
      riskDescription: 'Peut injecter n\'importe quel script externe sur votre page de commande sans contrôle de code.'
    },
    {
      id: 'meta_pixel',
      name: 'Meta Pixel (Facebook Ads)',
      vendor: 'Meta Platforms Inc.',
      category: 'ads',
      isDetected: true,
      isIsolatedByCsp: isWellProtected,
      hasSriIntegrity: false,
      performanceImpact: 'medium',
      riskDescription: 'Collecte les événements d\'achat. Risque de transmission involontaire de paramètres d\'URL.'
    },
    {
      id: 'stripe_elements',
      name: 'Stripe Elements SDK (v3)',
      vendor: 'Stripe Inc.',
      category: 'payment',
      isDetected: true,
      isIsolatedByCsp: true,
      hasSriIntegrity: true,
      performanceImpact: 'low',
      riskDescription: 'Passerelle sécurisée isolée dans un iframe chiffré certifié PCI-DSS niveau 1.'
    },
    {
      id: 'tiktok_pixel',
      name: 'TikTok Pixel',
      vendor: 'ByteDance Ltd.',
      category: 'ads',
      isDetected: grade !== 'A',
      isIsolatedByCsp: isWellProtected,
      hasSriIntegrity: false,
      performanceImpact: 'medium',
      riskDescription: 'Script tiers lourd exécuté dans le contexte global du navigateur.'
    },
    {
      id: 'live_chat',
      name: 'Widget Chat / Support Client',
      vendor: 'Fournisseur externe SaaS',
      category: 'chat',
      isDetected: true,
      isIsolatedByCsp: isWellProtected,
      hasSriIntegrity: false,
      performanceImpact: 'high',
      riskDescription: 'Accès au DOM de la page ; doit être impérativement exclu de la page de paiement.'
    }
  ];

  const detectedCount = defaultScripts.filter(s => s.isDetected).length;
  const isolatedCount = defaultScripts.filter(s => s.isDetected && s.isIsolatedByCsp).length;

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      data-testid="third-party-scripts-inspector"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Inspecteur de Scripts & Balises Tierces (« Supply-Chain Audit »)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Contrôle passif des tags JavaScript externes (Pixels, Analytics, Chats) pour bloquer les fuites furtives au panier.
          </p>
        </div>

        {/* Indicateur de confinement */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Scripts Confinés CSP</div>
            <div className="text-base font-black text-indigo-400">{isolatedCount} / {detectedCount} isolés</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-sm border border-indigo-500/30">
            {Math.round((isolatedCount / Math.max(1, detectedCount)) * 100)}%
          </div>
        </div>
      </div>

      {/* Liste des scripts détectés */}
      <div className="space-y-3">
        {defaultScripts.map((script) => (
          <div 
            key={script.id}
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">{script.name}</span>
                <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800">
                  {script.vendor}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {script.riskDescription}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                script.isIsolatedByCsp 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                {script.isIsolatedByCsp ? '🛡️ Isolé par CSP' : '⚠️ Non Confiné'}
              </span>

              <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${
                script.performanceImpact === 'low' ? 'bg-slate-800 text-slate-300' :
                script.performanceImpact === 'medium' ? 'bg-amber-500/15 text-amber-300' :
                'bg-rose-500/15 text-rose-300'
              }`}>
                Poids : {script.performanceImpact.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Conseil de sécurisation */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <strong className="text-white">Règle d'or e-commerce :</strong> Isolez les scripts non indispensables (chat, avis, pixels) de la page de paiement afin d'éviter tout risque d'accès aux coordonnées de cartes bancaires.
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyScriptsInspector;
