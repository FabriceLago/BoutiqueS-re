/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Système de visite guidée (Onboarding Tour interactif)
 * Guide pas-à-pas pour aider les commerçants à interpréter leur bulletin de santé et score
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Check, 
  Compass, 
  ShieldCheck, 
  Gauge, 
  Sliders, 
  Layers, 
  Award,
  HelpCircle
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  badge: string;
  description: string;
  keyInsight: string;
  actionHint?: string;
  icon?: React.ReactNode;
}

export const BULLETIN_TOUR_STEPS: TourStep[] = [
  {
    id: 'hero-score',
    targetSelector: '[data-testid="hero-score-badge"]',
    title: 'Votre Note Globale (A à F)',
    badge: 'Étape 1 / 6 • Note & Score',
    description: 'Votre score sur 100 points synthétise 10 contrôles passifs stricts. De la Note A (protection exemplaire) à la Note F (exposition critique), il mesure la vulnérabilité de votre boutique face aux robots malveillants.',
    keyInsight: 'Une note C ou inférieure signifie que vos versions logicielles sont lisibles publiquement ou que vos transactions manquent de barrières HTTP strictes.',
    actionHint: 'Survolez l\'icône info pour voir le détail des seuils de points.'
  },
  {
    id: 'grade-scale',
    targetSelector: '[data-testid="grade-scale-section"]',
    title: 'Le Barème Officiel & le Radar',
    badge: 'Étape 2 / 6 • Barème & Équilibre',
    description: 'Cliquez sur les capsules de notes (A à F) pour tester la réaction du bulletin. Le graphique radar Recharts affiche en un coup d\'œil l\'équilibre entre vos 5 dimensions de protection.',
    keyInsight: 'Ce radar met en évidence vos axes les plus vulnérables (ex : SSL solide mais absence totale d\'en-têtes HTTP de sécurité).',
    actionHint: 'Cliquez sur Note A ou Note C pour comparer les profils.'
  },
  {
    id: 'top-priorities',
    targetSelector: '[data-testid="top-priorities-card"]',
    title: 'Les 3 Actions Prioritaires Vulgarisées',
    badge: 'Étape 3 / 6 • Correctifs Clés',
    description: 'Pas besoin d\'être développeur ! Nous trions pour vous les 3 failles les plus critiques à colmater en priorité absolue pour éliminer 85 % des risques d\'intrusion sur WooCommerce.',
    keyInsight: 'Chaque recommandation est rédigée sans jargon technique avec son niveau d\'urgence et son impact commercial.',
    actionHint: 'Vérifiez la Priorité 1 pour sécuriser vos paiements.'
  },
  {
    id: 'criteria-grid',
    targetSelector: '[data-testid="security-criteria-grid"]',
    title: 'Détail des 10 Critères & Infobulles',
    badge: 'Étape 4 / 6 • 10 Critères 100 pts',
    description: 'Explorez les 3 Piliers (Chiffrement SSL, En-têtes HTTP, Exposition publique). Survolez n\'importe quelle ligne de critère pour afficher instantanément son infobulle technique et son rôle protecteur.',
    keyInsight: 'Toutes les vérifications sont 100 % passives et proviennent d\'une seule requête GET publique, sans aucune intrusion.',
    actionHint: 'Passez la souris sur une ligne pour voir l\'explication.'
  },
  {
    id: 'revenue-calculator',
    targetSelector: '[data-testid="interactive-revenue-calculator"]',
    title: 'Simulateur de CA à Risque',
    badge: 'Étape 5 / 6 • Impact Financier',
    description: 'Ajustez votre volume de commandes et votre panier moyen. Ce simulateur interactif calcule le préjudice net d\'un panier bloqué ou d\'un certificat expiré pendant 48 heures.',
    keyInsight: 'Permet de comparer la perte potentielle de milliers d\'euros de ventes avec le coût fixe d\'une remise à niveau (590 € rentabilisé immédiatement).',
    actionHint: 'Déplacez les curseurs pour ajuster votre volume de vente.'
  },
  {
    id: 'conversion-actions',
    targetSelector: '[data-testid="pricing-conversion-section"]',
    title: 'Export PDF & Accompagnement',
    badge: 'Étape 6 / 6 • Passage à l\'Action',
    description: 'Téléchargez votre attestation officielle au format PDF pour votre assureur ou votre équipe technique, ou réservez une intervention d\'urgence garantie sous 48h ou un abonnement Sérénité mensuel.',
    keyInsight: 'Le Veilleur Mensuel Automatique (69 €/mois) surveille passivement votre boutique chaque 1er du mois avec alerte sous 2h.',
    actionHint: 'Vous pourrez relancer cette visite guidée à tout moment.'
  }
];

interface OnboardingTourProps {
  steps?: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  tourKey?: string;
}

export function OnboardingTour({
  steps = BULLETIN_TOUR_STEPS,
  isOpen,
  onClose,
  onComplete,
  tourKey = 'boutiquesure_tour_seen'
}: OnboardingTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = useMemo(() => steps[currentStepIndex] || steps[0], [steps, currentStepIndex]);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Calcul et mise à jour de la position de l'élément cible
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;
    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      try {
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
      } catch {}
      setTargetRect(element.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen) {
      updateTargetPosition();
      const handleResize = () => updateTargetPosition();
      const handleScroll = () => {
        const element = document.querySelector(currentStep.targetSelector);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen, currentStepIndex, updateTargetPosition, currentStep]);

  // Raccourcis clavier (Flèche droite / Entrée = Suivant, Flèche gauche = Précédent, Échap = Quitter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, isLastStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(tourKey, 'dismissed');
    } catch {}
    onClose();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(tourKey, 'completed');
    } catch {}
    if (onComplete) onComplete();
    onClose();
  };

  if (!isOpen) return null;

  // Calcul du placement de la bulle d'onboarding
  const popoverStyle: React.CSSProperties = (() => {
    if (!targetRect) {
      // Centré si cible introuvable
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      };
    }

    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const popoverWidth = Math.min(420, windowWidth - 32);

    const estimatedPopoverHeight = 350;
    // Préférer au-dessous si assez d'espace, sinon au-dessus
    const spaceBelow = windowHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const showBelow = spaceBelow >= estimatedPopoverHeight + 20 || spaceBelow > spaceAbove;

    let top = showBelow ? targetRect.bottom + 12 : targetRect.top - estimatedPopoverHeight - 12;
    // Clamping vertical strict pour garantir que tous les boutons sont visibles dans le viewport
    top = Math.max(16, Math.min(top, windowHeight - estimatedPopoverHeight - 20));

    // Centrage horizontal par rapport à la cible
    let left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    // Clamping horizontal
    left = Math.max(16, Math.min(left, windowWidth - popoverWidth - 16));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      maxHeight: `calc(100vh - 32px)`,
      zIndex: 1000
    };
  })();

  return (
    <div 
      className="fixed inset-0 z-[990] onboarding-tour-root font-['Manrope',sans-serif] pointer-events-auto" 
      data-testid="onboarding-tour-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Visite guidée pour interpréter votre score de sécurité"
    >
      {/* 1. Backdrop assombrissant avec mise en lumière */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-[2px] transition-opacity duration-300 z-[990]"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* 2. Spotlight lumineux entourant l'élément cible */}
      {targetRect && (
        <div 
          className="fixed pointer-events-none rounded-2xl border-2 border-[#4ADE80] shadow-[0_0_35px_rgba(74,222,128,0.45)] transition-all duration-300 z-[995] animate-pulse"
          style={{
            top: `${Math.max(0, targetRect.top - 8)}px`,
            left: `${Math.max(0, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`
          }}
          data-testid="tour-spotlight-box"
        />
      )}

      {/* 3. Bulle interactive popover d'explication */}
      <div 
        style={popoverStyle}
        className="bg-slate-900 border-2 border-emerald-400/90 rounded-2xl p-5 shadow-2xl shadow-black/80 text-slate-100 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto"
        data-testid="tour-popover-card"
      >
        {/* En-tête de la bulle */}
        <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>{currentStep.badge}</span>
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
              {currentStep.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            data-testid="tour-close-btn"
            aria-label="Fermer la visite guidée"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Quitter la visite guidée (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps d'explication vulgarisée */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3.5">
          {currentStep.description}
        </p>

        {/* Encadré « Bon à savoir » */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1 mb-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Ce que cela signifie pour votre boutique :</span>
          </div>
          <p className="text-[12px] text-slate-300 leading-normal pl-5">
            {currentStep.keyInsight}
          </p>
        </div>

        {/* Pied de la bulle : Progression & Boutons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          {/* Indicateur de progression par points */}
          <div className="flex items-center gap-1.5" aria-label={`Étape ${currentStepIndex + 1} sur ${steps.length}`}>
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                aria-label={`Aller à l'étape ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex 
                    ? 'w-6 bg-emerald-400' 
                    : idx < currentStepIndex 
                      ? 'w-2 bg-emerald-500/50' 
                      : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                data-testid="tour-prev-btn"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Précédent</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              data-testid="tour-next-btn"
              className="px-4 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>{isLastStep ? 'Terminer la visite' : 'Suivant'}</span>
              {isLastStep ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Raccourci d'abandon discret */}
        <div className="text-center mt-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            data-testid="tour-skip-btn"
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors underline cursor-pointer"
          >
            Passer la visite guidée
          </button>
        </div>
      </div>
    </div>
  );
}
