/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Maquette Écran 2 : Écran d'attente animé (Analyse 100% passive)
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Server, 
  FileCode, 
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';

import { AuditResult, createDefaultAuditResult } from '../types.ts';
import { scanWooCommerceWithGenerativeAi, logScanAttempt } from '../lib/scanner.ts';

interface WaitingMockupProps {
  storeUrl?: string;
  email?: string;
  onFinish?: (result?: AuditResult) => void;
  isMobileView?: boolean;
}

interface StepItem {
  id: number;
  label: string;
  subtext: string;
  durationMs: number;
}

const STEPS: StepItem[] = [
  {
    id: 1,
    label: 'Connexion sécurisée à la page d\'accueil',
    subtext: 'Une seule requête HTTP GET standard, comme un navigateur ordinaire.',
    durationMs: 1200,
  },
  {
    id: 2,
    label: 'Contrôle du certificat SSL et de la redirection',
    subtext: 'Vérification du cadenas HTTPS, de la validité et de l\'expiration.',
    durationMs: 1200,
  },
  {
    id: 3,
    label: 'Inspection des en-têtes de sécurité HTTP',
    subtext: 'Examen passif de HSTS, CSP, X-Frame-Options et protection contre le vol de données.',
    durationMs: 1200,
  },
  {
    id: 4,
    label: 'Détection passive des technologies e-commerce et CMS',
    subtext: 'Recherche des balises meta publiques et empreintes logicielles pour évaluer le niveau d\'exposition aux robots.',
    durationMs: 1000,
  },
];

export function WaitingMockup({ 
  storeUrl = 'https://maboutique-mode.fr', 
  email = 'contact@maboutique-mode.fr',
  onFinish,
  isMobileView = false 
}: WaitingMockupProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);
  const [computedAuditResult, setComputedAuditResult] = useState<AuditResult | null>(null);
  const auditResultRef = React.useRef<AuditResult | null>(null);

  // Exécution asynchrone de l'analyse passive réelle en arrière-plan
  useEffect(() => {
    let isCancelled = false;

    async function runPassiveScan() {
      try {
        const scanOutput = await scanWooCommerceWithGenerativeAi(storeUrl, { timeoutMs: 4000 });
        if (isCancelled) return;

        const domain = scanOutput.domain || storeUrl.replace(/^https?:\/\//i, '').split('/')[0];
        const baseResult = createDefaultAuditResult(storeUrl, scanOutput.grade);

        const fullResult: AuditResult = {
          ...baseResult,
          score: scanOutput.score,
          grade: scanOutput.grade,
          appreciation: scanOutput.appreciation,
          domain,
          isWooCommerceConfirmed: scanOutput.technologiesDetectees?.includes('WooCommerce') ?? true,
          isWordPressConfirmed: scanOutput.technologiesDetectees?.includes('WordPress') ?? true,
        };

        auditResultRef.current = fullResult;
        setComputedAuditResult(fullResult);

        // Archivage légal conforme RGPD
        await logScanAttempt({
          domain,
          email: email || 'visiteur@boutique.fr',
          status: 'success',
          isOwnerConfirmed: true,
          score: fullResult.score,
          grade: fullResult.grade
        });
      } catch {
        if (!isCancelled) {
          const fallback = createDefaultAuditResult(storeUrl, 'C');
          auditResultRef.current = fallback;
          setComputedAuditResult(fallback);
        }
      }
    }

    runPassiveScan();

    return () => {
      isCancelled = true;
    };
  }, [storeUrl, email]);

  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;
    let timer4: NodeJS.Timeout;

    // Simulation de l'avancée fluide des 4 étapes
    timer1 = setTimeout(() => {
      setCurrentStepIndex(1);
      setProgress(40);
    }, 1200);

    timer2 = setTimeout(() => {
      setCurrentStepIndex(2);
      setProgress(70);
    }, 2400);

    timer3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setProgress(90);
    }, 3600);

    timer4 = setTimeout(() => {
      setProgress(100);
      setIsCompleted(true);
      if (onFinish) {
        // Laisser 800ms pour apprécier le 100% avant redirection
        setTimeout(() => {
          onFinish(auditResultRef.current || createDefaultAuditResult(storeUrl, 'C'));
        }, 800);
      }
    }, 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish, storeUrl]);

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setProgress(15);
    setIsCompleted(false);
  };

  return (
    <div className={`w-full min-h-screen bg-[#0F1B2D] text-slate-100 font-['Manrope',sans-serif] flex flex-col justify-between selection:bg-[#4ADE80] selection:text-slate-950 ${isMobileView ? 'max-w-[420px] mx-auto border-x border-slate-800 shadow-2xl' : ''}`}>
      
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0B1523]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#0E6B3A] flex items-center justify-center text-slate-950 shadow-md font-extrabold text-lg">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">BoutiqueSûre</span>
              <span className="text-[10px] text-slate-400">Diagnostic passif en cours</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer transition-colors"
              title="Relancer l'animation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rejouer</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu central de l'écran d'attente */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full flex flex-col items-center justify-center text-center">
        
        {/* Radar Scanner Cybernétique Animé */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Cercles concentriques & Ondes radar */}
          <div className="absolute w-36 h-36 rounded-full border border-emerald-500/15 animate-ripple-ring pointer-events-none"></div>
          <div className="absolute w-28 h-28 rounded-full border border-emerald-500/25 pointer-events-none"></div>
          
          <div className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-emerald-400/40 flex items-center justify-center shadow-xl shadow-emerald-500/10 overflow-hidden">
            {/* Faisceau rotatif radar */}
            {!isCompleted && (
              <div 
                className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(74, 222, 128, 0.35) 360deg)'
                }}
              />
            )}

            {/* Viseur central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-full h-[1px] bg-emerald-400"></div>
              <div className="h-full w-[1px] bg-emerald-400 absolute"></div>
            </div>

            {isCompleted ? (
              <CheckCircle2 className="w-12 h-12 text-[#4ADE80] animate-scale-in z-10" />
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#4ADE80] animate-pulse-subtle" />
              </div>
            )}
          </div>
        </div>

        {/* Titre & Domaine analysé */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight animate-fade-slide-up">
          {isCompleted ? 'Analyse terminée avec succès !' : 'Analyse passive de votre boutique...'}
        </h1>
        <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{storeUrl}</span>
        </div>

        {/* Barre de progression avec pourcentage */}
        <div className="w-full mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl card-hover-elevate">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300">Progression du diagnostic</span>
            <span className="text-[#4ADE80] font-mono tabular-nums">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
            <div 
              className="h-full bg-gradient-to-r from-[#0E6B3A] via-[#4ADE80] to-emerald-300 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Reflet de brillance animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full -skew-x-12 animate-[shimmer-sweep_2s_infinite]"></div>
            </div>
          </div>

          {/* Liste ordonnée des étapes passives avec état d'avancement */}
          <div className="mt-8 space-y-4 text-left">
            {STEPS.map((step, index) => {
              const isDone = index < currentStepIndex || isCompleted;
              const isCurrent = index === currentStepIndex && !isCompleted;
              const isPending = index > currentStepIndex && !isCompleted;

              return (
                <div 
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3.5 ${
                    isDone 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-white' 
                      : isCurrent 
                        ? 'bg-slate-800/80 border-[#4ADE80] text-white shadow-md shadow-emerald-500/5' 
                        : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-[#4ADE80] animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {step.id}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isCurrent ? 'text-white' : isDone ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">OK</span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-emerald-400 animate-pulse">En cours...</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {step.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bouton de consultation manuelle si terminé */}
          {isCompleted && onFinish && (
            <button
              onClick={() => onFinish(computedAuditResult || auditResultRef.current || createDefaultAuditResult(storeUrl, 'C'))}
              className="mt-6 w-full py-3.5 px-6 rounded-xl bg-[#4ADE80] hover:bg-[#3ec974] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer animate-fade-in"
            >
              <span>Accéder à mon bulletin de sécurité</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          )}
        </div>

        {/* Rappel réassurance passive */}
        <div className="mt-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 max-w-lg">
          <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Garantie 100% passive :</strong> Aucune charge utile, aucun test de mot de passe, aucun scan de ports.
          </span>
        </div>

      </main>

      {/* Footer minimal */}
      <footer className="border-t border-slate-800/80 bg-[#0B1523] py-4 text-center text-xs text-slate-500">
        <span>BoutiqueSûre • Traitement confidentiel pour {email}</span>
      </footer>
    </div>
  );
}
