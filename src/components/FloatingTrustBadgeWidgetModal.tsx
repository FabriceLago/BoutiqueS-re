/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Widget Flottant « Sceau de Sécurité » & Générateur de Snippet
 * Fichier : src/components/FloatingTrustBadgeWidgetModal.tsx
 */

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  Code2, 
  CheckCircle2, 
  Eye, 
  Layout, 
  ExternalLink,
  Lock
} from 'lucide-react';

export interface FloatingTrustBadgeWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl?: string;
  grade?: string;
  score?: number;
}

export const FloatingTrustBadgeWidgetModal: React.FC<FloatingTrustBadgeWidgetModalProps> = ({
  isOpen,
  onClose,
  storeUrl = 'https://ma-boutique-en-ligne.fr',
  grade = 'A',
  score = 95
}) => {
  const [position, setPosition] = useState<'bottom_left' | 'bottom_right'>('bottom_right');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [isExpandedPreview, setIsExpandedPreview] = useState<boolean>(false);

  const cleanDomain = (storeUrl || '')
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .replace(/[^a-zA-Z0-9.-]/g, '') || 'ma-boutique.fr';
  const safePosition = position === 'bottom_left' ? 'left' : 'right';
  const safeTheme = theme === 'light' ? 'light' : 'dark';

  if (!isOpen) return null;

  const widgetSnippet = `<!-- BoutiqueSûre Floating Trust Badge Snippet -->
<div id="boutiquesure-trust-badge" data-domain="${cleanDomain}" data-position="${safePosition}" data-theme="${safeTheme}"></div>
<script async src="https://boutiquesure.fr/widgets/trust-badge.v1.js" integrity="sha384-bs2026cert" crossorigin="anonymous"></script>
<!-- Fin Snippet BoutiqueSûre -->`;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(widgetSnippet);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = widgetSnippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      data-testid="floating-badge-widget-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col justify-between my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Widget Flottant « Sceau de Sécurité » pour Boutique en Ligne
              </h2>
              <p className="text-xs text-slate-300">
                Pillule de réassurance discrète à coller dans votre footer pour rassurer 100% des acheteurs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-floating-badge-modal-btn"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options de personnalisation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1.5">Position sur l'écran :</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPosition('bottom_left')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                  position === 'bottom_left' 
                    ? 'bg-emerald-400 text-slate-950 border-emerald-400 shadow-md font-black' 
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Bas Gauche
              </button>
              <button
                type="button"
                onClick={() => setPosition('bottom_right')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                  position === 'bottom_right' 
                    ? 'bg-emerald-400 text-slate-950 border-emerald-400 shadow-md font-black' 
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Bas Droite
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1.5">Style d'apparence :</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-slate-800 text-white border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40' 
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🌙 Sombre Épuré
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-white text-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/40' 
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                ☀️ Clair Lumineux
              </button>
            </div>
          </div>
        </div>

        {/* Prévisualisation Réaliste du Widget Flottant */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative min-h-[160px] flex items-end justify-between overflow-hidden">
          <div className="text-[11px] text-slate-500 self-start">
            Aperçu direct du comportement sur votre boutique (cliquez pour tester le volet) :
          </div>

          {/* Le badge interactif */}
          <div className={`transition-all ${position === 'bottom_right' ? 'ml-auto' : 'mr-auto'} relative`}>
            
            {/* Popover ouvert au clic */}
            {isExpandedPreview && (
              <div className="absolute bottom-12 right-0 w-64 p-3.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-2 z-10 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Boutique Sécurisée
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                    Note {grade}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Paiements cryptés 256 bits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Protection Anti-Magecart active</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
                  Certifié par BoutiqueSûre
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsExpandedPreview(!isExpandedPreview)}
              className={`px-3.5 py-2 rounded-full border shadow-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-slate-900/95 border-emerald-400 text-white shadow-emerald-500/20'
                  : 'bg-white border-emerald-500 text-slate-900 shadow-slate-900/10'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>Sécurisé par BoutiqueSûre</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-mono font-black">
                {grade}
              </span>
            </button>
          </div>
        </div>

        {/* Snippet de code universel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              Snippet universel HTML / JS (Collez avant &lt;/body&gt;) :
            </span>
            <button
              type="button"
              onClick={handleCopySnippet}
              data-testid="copy-floating-widget-snippet-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black cursor-pointer shadow-sm transition-all"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Copié !' : 'Copier le code'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {widgetSnippet}
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Poids ultra-léger (&lt; 4 Ko), aucun impact sur la vitesse de chargement.</span>
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

export default FloatingTrustBadgeWidgetModal;
