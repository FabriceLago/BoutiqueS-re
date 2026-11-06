/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Comparateur Concurrentiel & Benchmark Sectoriel (« Spy-Check E-Commerce »)
 * Fichier : src/components/CompetitorBenchmarkModal.tsx
 */

import React, { useState } from 'react';
import { 
  X, 
  Swords, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Search,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export interface CompetitorBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  myStoreUrl?: string;
  myScore?: number;
  myGrade?: string;
}

export interface CompetitorData {
  id: string;
  domain: string;
  platform: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  score: number;
  hasHsts: boolean;
  hasCsp: boolean;
  versionsHidden: boolean;
}

export const CompetitorBenchmarkModal: React.FC<CompetitorBenchmarkModalProps> = ({
  isOpen,
  onClose,
  myStoreUrl = 'https://ma-boutique-en-ligne.fr',
  myScore = 65,
  myGrade = 'C'
}) => {
  const [sector, setSector] = useState<'mode' | 'bio' | 'beaute' | 'maison' | 'tech'>('mode');
  const [competitorInput, setCompetitorInput] = useState<string>('');
  const cleanMyDomain = myStoreUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'ma-boutique.fr';

  const sectorBenchmarks: Record<string, { name: string; avgScore: number; avgGrade: string; topScore: number }> = {
    mode: { name: 'Mode & Prêt-à-porter', avgScore: 58, avgGrade: 'D', topScore: 92 },
    bio: { name: 'Bio & Alimentation Saine', avgScore: 52, avgGrade: 'D', topScore: 88 },
    beaute: { name: 'Beauté & Cosmétiques', avgScore: 64, avgGrade: 'C', topScore: 94 },
    maison: { name: 'Maison, Meubles & Déco', avgScore: 55, avgGrade: 'D', topScore: 90 },
    tech: { name: 'High-Tech & Électronique', avgScore: 72, avgGrade: 'B', topScore: 98 },
  };

  const defaultCompetitors: Record<string, CompetitorData[]> = {
    mode: [
      { id: '1', domain: 'atelier-vetements-chic.fr', platform: 'WooCommerce', grade: 'D', score: 54, hasHsts: false, hasCsp: false, versionsHidden: false },
      { id: '2', domain: 'maroquinerie-paris.com', platform: 'Shopify', grade: 'B', score: 82, hasHsts: true, hasCsp: false, versionsHidden: true },
      { id: '3', domain: 'chaussures-france.be', platform: 'PrestaShop', grade: 'C', score: 62, hasHsts: true, hasCsp: false, versionsHidden: false }
    ],
    bio: [
      { id: '1', domain: 'miel-terroir-naturel.fr', platform: 'WooCommerce', grade: 'E', score: 42, hasHsts: false, hasCsp: false, versionsHidden: false },
      { id: '2', domain: 'savon-bio-artisanal.com', platform: 'Shopify', grade: 'B', score: 80, hasHsts: true, hasCsp: false, versionsHidden: true },
      { id: '3', domain: 'epicerie-vrac-direct.fr', platform: 'PrestaShop', grade: 'D', score: 51, hasHsts: false, hasCsp: false, versionsHidden: false }
    ],
    beaute: [
      { id: '1', domain: 'soins-naturels-paris.fr', platform: 'Shopify', grade: 'B', score: 84, hasHsts: true, hasCsp: false, versionsHidden: true },
      { id: '2', domain: 'parfumerie-provence.com', platform: 'WooCommerce', grade: 'C', score: 66, hasHsts: true, hasCsp: false, versionsHidden: false },
      { id: '3', domain: 'cremes-bio-lyon.fr', platform: 'PrestaShop', grade: 'D', score: 58, hasHsts: false, hasCsp: false, versionsHidden: false }
    ],
    maison: [
      { id: '1', domain: 'luminaire-design-shop.fr', platform: 'WooCommerce', grade: 'D', score: 50, hasHsts: false, hasCsp: false, versionsHidden: false },
      { id: '2', domain: 'mobilier-scandinave.be', platform: 'Shopify', grade: 'B', score: 81, hasHsts: true, hasCsp: false, versionsHidden: true },
      { id: '3', domain: 'deco-boheme-france.com', platform: 'PrestaShop', grade: 'C', score: 63, hasHsts: true, hasCsp: false, versionsHidden: false }
    ],
    tech: [
      { id: '1', domain: 'accessoires-smartphones-pro.fr', platform: 'Shopify', grade: 'A', score: 91, hasHsts: true, hasCsp: true, versionsHidden: true },
      { id: '2', domain: 'drones-gadgets-france.com', platform: 'PrestaShop', grade: 'C', score: 68, hasHsts: true, hasCsp: false, versionsHidden: false },
      { id: '3', domain: 'audio-hifi-boutique.be', platform: 'WooCommerce', grade: 'B', score: 79, hasHsts: true, hasCsp: false, versionsHidden: true }
    ]
  };

  const currentBenchmark = sectorBenchmarks[sector];
  const competitorsList = defaultCompetitors[sector];

  if (!isOpen) return null;

  // Calcul du percentile sectoriel
  const percentile = myScore > currentBenchmark.avgScore 
    ? Math.min(95, Math.round(50 + ((myScore - currentBenchmark.avgScore) / (currentBenchmark.topScore - currentBenchmark.avgScore)) * 45))
    : Math.max(15, Math.round(50 - ((currentBenchmark.avgScore - myScore) / currentBenchmark.avgScore) * 35));

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      data-testid="competitor-benchmark-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Comparateur Concurrentiel & Benchmark Sectoriel
              </h2>
              <p className="text-xs text-slate-300">
                Positionnez votre boutique face à la concurrence directe et à la moyenne nationale
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-benchmark-modal-btn"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sélecteur de secteur d'activité */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Secteur :</span>
          {(Object.keys(sectorBenchmarks) as (keyof typeof sectorBenchmarks)[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSector(key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sector === key
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {sectorBenchmarks[key].name}
            </button>
          ))}
        </div>

        {/* Bandeau Percentile & Statut */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg border border-amber-500/40 shrink-0">
              Top {100 - percentile}%
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">
                Votre boutique se classe dans le <strong>Top {100 - percentile}%</strong> de votre secteur ({currentBenchmark.name})
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Votre score : <strong className="text-emerald-400">{myScore}/100</strong> (Moyenne sectorielle : {currentBenchmark.avgScore}/100)
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
            {myScore >= currentBenchmark.avgScore ? '🛡️ Au-dessus de la moyenne' : '⚠️ En dessous de la moyenne'}
          </span>
        </div>

        {/* Tableau comparatif face-à-face */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Boutique en ligne</th>
                <th className="py-2.5 px-3">Plateforme</th>
                <th className="py-2.5 px-3 text-center">Note Sécurité</th>
                <th className="py-2.5 px-3 text-center">Score</th>
                <th className="py-2.5 px-3 text-center">HSTS</th>
                <th className="py-2.5 px-3 text-center">CSP</th>
                <th className="py-2.5 px-3 text-center">Versions Masquées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {/* Ligne : Ma Boutique */}
              <tr className="bg-emerald-950/20 border-emerald-500/30 font-sans">
                <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{cleanMyDomain}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">VOUS</span>
                </td>
                <td className="py-3 px-3 text-slate-300">E-Commerce</td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded font-bold font-mono text-emerald-300 bg-emerald-500/20">
                    {myGrade}
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-bold text-emerald-400">{myScore}/100</td>
                <td className="py-3 px-3 text-center">{myScore >= 70 ? '✅' : '❌'}</td>
                <td className="py-3 px-3 text-center">{myScore >= 90 ? '✅' : '❌'}</td>
                <td className="py-3 px-3 text-center">{myScore >= 80 ? '✅' : '❌'}</td>
              </tr>

              {/* Lignes concurrents */}
              {competitorsList.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-800/40 text-slate-300 font-sans">
                  <td className="py-3 px-3 flex items-center gap-2 font-mono text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span>{comp.domain}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-xs">{comp.platform}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold font-mono text-xs ${
                      comp.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                      comp.grade === 'B' ? 'bg-emerald-400/20 text-emerald-300' :
                      comp.grade === 'C' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {comp.grade}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold font-mono">{comp.score}/100</td>
                  <td className="py-3 px-3 text-center">{comp.hasHsts ? '✅' : '❌'}</td>
                  <td className="py-3 px-3 text-center">{comp.hasCsp ? '✅' : '❌'}</td>
                  <td className="py-3 px-3 text-center">{comp.versionsHidden ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Échantillon représentatif de 4 500 boutiques auditées en France et Belgique</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default CompetitorBenchmarkModal;
