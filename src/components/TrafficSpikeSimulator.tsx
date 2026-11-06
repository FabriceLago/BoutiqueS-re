/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Simulateur de Résistance aux Pics de Ventes (« Traffic Spike & TTFB Audit »)
 * Fichier : src/components/TrafficSpikeSimulator.tsx
 */

import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  Server, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Sparkles,
  Sliders,
  ShieldCheck
} from 'lucide-react';

export interface TrafficSpikeSimulatorProps {
  storeUrl?: string;
  grade?: string;
}

export const TrafficSpikeSimulator: React.FC<TrafficSpikeSimulatorProps> = ({
  storeUrl = 'https://ma-boutique-en-ligne.fr',
  grade = 'C'
}) => {
  const [concurrentVisitors, setConcurrentVisitors] = useState<number>(350);
  const [serverType, setServerType] = useState<'shared' | 'vps' | 'cdn_cloud'>('vps');
  const [hasServerCache, setHasServerCache] = useState<boolean>(grade === 'A' || grade === 'B');

  // Calculs dynamiques de performance et de saturation
  const baseTtfb = serverType === 'shared' ? 680 : serverType === 'vps' ? 320 : 120;
  const loadMultiplier = (concurrentVisitors / 100) * (hasServerCache ? 0.35 : 1.2);
  const estimatedTtfbMs = Math.round(baseTtfb + loadMultiplier * 45);

  // Risque de panne ou abandon (> 2000ms = critique)
  const isCritical = estimatedTtfbMs > 2200;
  const isWarning = estimatedTtfbMs > 1200 && !isCritical;
  const abandonedSalesRiskPercent = Math.min(65, Math.max(5, Math.round((estimatedTtfbMs / 2500) * 45)));

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      data-testid="traffic-spike-simulator"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Simulateur de Résistance aux Pics de Ventes (Soldes & TTFB)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Évaluez si votre serveur web et votre panier supporteront un pic soudain de trafic lors des soldes ou d'une campagne publicitaire.
          </p>
        </div>

        {/* Indicateur TTFB estimé */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Temps de réponse (TTFB)</div>
            <div className={`text-base font-black ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
              {estimatedTtfbMs} ms
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl font-extrabold flex items-center justify-center text-xs border ${
            isCritical ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
            isWarning ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
            'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            {isCritical ? 'LENT' : isWarning ? 'MOYEN' : 'FLUIDE'}
          </div>
        </div>
      </div>

      {/* Contrôles interactifs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1.5">
              <span>Visiteurs simultanés simulés :</span>
              <span className="text-amber-400 font-bold">{concurrentVisitors} internautes / minute</span>
            </div>
            <input 
              type="range"
              min="50"
              max="2500"
              step="50"
              value={concurrentVisitors}
              onChange={(e) => setConcurrentVisitors(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>50 (Trafic normal)</span>
              <span>500 (Newsletter)</span>
              <span>1 500 (Vente Flash)</span>
              <span>2 500 (Black Friday)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Type d'infrastructure serveur :</label>
              <select
                value={serverType}
                onChange={(e) => setServerType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="shared">Serveur Mutualisé (OVH / Hostinger basique)</option>
                <option value="vps">Serveur Virtuel Dédié (VPS Nginx)</option>
                <option value="cdn_cloud">Cloud Scalable + CDN (Cloudflare / Edge)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Cache serveur (Redis / Varnish) :</label>
              <button
                type="button"
                onClick={() => setHasServerCache(!hasServerCache)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  hasServerCache 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <span>{hasServerCache ? '✅ Cache Actif (Divise la charge par 4)' : '❌ Aucun cache actif'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cadre de diagnostic de saturation */}
        <div className={`lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-lg ${
          isCritical ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' :
          isWarning ? 'bg-amber-950/30 border-amber-500/40 text-amber-300' :
          'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
        }`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-white">
              Comportement sous pic de trafic
            </span>
            <div className="text-base font-extrabold text-white mt-2">
              {isCritical ? '🚨 Risque d\'erreur 504 Gateway Timeout' :
               isWarning ? '⚠️ Ralentissements perceptibles au panier' :
               '🛡️ Capacité d\'absorption optimale'}
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {isCritical 
                ? 'Sans cache et avec un serveur mutualisé, le processus PHP risque de saturer, rendant impossible la validation des commandes.' 
                : isWarning 
                ? 'Les acheteurs patientent plus de 1,2s par page. Le risque d\'abandon de panier augmente de 15%.' 
                : 'Votre configuration absorbe les requêtes en mémoire sans solliciter la base SQL.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Ventes perdues estimées :</span>
            <span className="font-bold text-white">~{abandonedSalesRiskPercent}% des paniers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficSpikeSimulator;
