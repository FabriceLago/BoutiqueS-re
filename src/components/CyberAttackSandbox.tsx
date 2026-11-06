/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Simulateur Visuel de Cyber-Attaque Pédagogique (« Black Hat Sandbox »)
 * Fichier : src/components/CyberAttackSandbox.tsx
 * 
 * Permet aux e-commerçants de visualiser concrètement et sans danger les 3 cyber-attaques
 * les plus fréquentes sur les boutiques en ligne (Magecart/Form-Jacking, Clickjacking, et Scanning CVE).
 */

import React, { useState } from 'react';
import { 
  Skull, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  Lock, 
  Eye, 
  Terminal, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

export type AttackScenario = 'magecart' | 'clickjacking' | 'cve_scan';

export interface CyberAttackSandboxProps {
  storeUrl?: string;
  currentGrade?: string;
}

export const CyberAttackSandbox: React.FC<CyberAttackSandboxProps> = ({
  storeUrl = 'https://ma-boutique-en-ligne.fr',
  currentGrade = 'C'
}) => {
  const [selectedScenario, setSelectedScenario] = useState<AttackScenario>('magecart');
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  const cleanDomain = storeUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'ma-boutique-en-ligne.fr';

  const scenarios = {
    magecart: {
      id: 'magecart',
      name: 'Form-Jacking & Vol de Carte (Magecart)',
      badge: 'Menace n°1 E-Commerce',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: 'Un script invisible injecté dans votre page de paiement capture les numéros de carte bancaire, CVV et date au moment exact où votre client clique sur « Valider la commande ».',
      impact: 'Perte de contrat VAD bancaire, amendes RGPD/PCI-DSS et réputation anéantie.',
      technicalVulnerability: 'Absence d\'en-tête CSP (Content-Security-Policy) et absence d\'isolation des scripts tiers.',
      protectionFix: 'En-tête CSP strict autorisant uniquement votre passerelle (Stripe, PayPal, etc.) et bloquant tout exfiltration externe.'
    },
    clickjacking: {
      id: 'clickjacking',
      name: 'Détournement de Clics (Clickjacking)',
      badge: 'Usurpation Iframe',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: 'Un site pirate incruste votre boutique dans une iframe 100% invisible et superpose un faux bouton pour tromper vos visiteurs et voler leurs identifiants ou rediriger leurs paiements.',
      impact: 'Piratage des comptes clients, usurpation d\'identité et commandes frauduleuses.',
      technicalVulnerability: 'Absence de l\'en-tête HTTP X-Frame-Options: DENY / SAMEORIGIN.',
      protectionFix: 'Directive X-Frame-Options: SAMEORIGIN interdisant formellement l\'incrustation de votre boutique dans des sites tiers.'
    },
    cve_scan: {
      id: 'cve_scan',
      name: 'Scan Automatisé de Failles & Plugins',
      badge: 'Attaque Opportuniste',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      description: 'Des robots pirates scannent en permanence le web pour détecter les numéros de version visibles de votre CMS (WooCommerce, Shopify, PrestaShop) et exploiter les failles CVE connues.',
      impact: 'Prise de contrôle du serveur, défaçage de la boutique ou rançongiciel.',
      technicalVulnerability: 'Balise <meta name="generator"> publique et fichiers readme/changelog exposés.',
      protectionFix: 'Masquage systématique des numéros de version publique et blocage des fichiers sensibles dans le serveur web.'
    }
  };

  const currentScenario = scenarios[selectedScenario];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setStep(1);
    const t1 = setTimeout(() => setStep(2), 1200);
    const t2 = setTimeout(() => {
      setStep(3);
      setIsSimulating(false);
    }, 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      data-testid="cyber-attack-sandbox"
    >
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Skull className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Simulateur Pédagogique de Cyber-Attaque (« Sandbox »)
            </h2>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              100% Inoffensif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Comprenez en 30 secondes comment un pirate exploite les failles passives de votre boutique en ligne sans aucun jargon technique.
          </p>
        </div>

        {/* Bouton de bascule Défense / Attaque */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsProtected(false)}
            data-testid="toggle-unprotected"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              !isProtected 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Sans protection</span>
          </button>
          <button
            type="button"
            onClick={() => setIsProtected(true)}
            data-testid="toggle-protected"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isProtected 
                ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Avec BoutiqueSûre</span>
          </button>
        </div>
      </div>

      {/* Sélection des scénarios d'attaque */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(scenarios) as AttackScenario[]).map((key) => {
          const item = scenarios[key];
          const isSelected = selectedScenario === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedScenario(key);
                setStep(0);
              }}
              data-testid={`scenario-tab-${key}`}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-800/90 border-emerald-400/80 shadow-lg ring-1 ring-emerald-400/30' 
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white mt-2">
                  {item.name}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Écran visuel de simulation interactive */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 relative overflow-hidden">
        {/* Barre d'état */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Cible simulée :</span>
            <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {cleanDomain}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            data-testid="run-attack-simulation-btn"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulation en cours...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Lancer la démonstration</span>
              </>
            )}
          </button>
        </div>

        {/* Visualisation graphique animée de l'attaque */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[220px]">
          
          {/* Côté Visiteur / Client */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-300">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xs font-bold text-white">Client au Panier</div>
            <div className="text-[11px] text-slate-400">
              Saisie du formulaire de carte bancaire (340 €)
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 text-left">
              •••• •••• •••• 4242<br />
              Exp: 12/28 | CVC: 789
            </div>
          </div>

          {/* Vecteur de transit / Protection */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-3 py-2">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${step >= 1 ? (isProtected ? 'bg-emerald-400' : 'bg-rose-500 animate-ping') : 'bg-slate-700'}`}></span>
              <span className="text-xs font-bold text-slate-300">
                {step === 0 && 'En attente de déclenchement'}
                {step === 1 && 'Interception du flux HTTP...'}
                {step === 2 && (isProtected ? 'Bouclier actif : blocage' : 'Exfiltration des données...')}
                {step === 3 && (isProtected ? 'Tentative rejetée' : 'Piratage réussi')}
              </span>
            </div>

            <div className={`w-full p-3 rounded-xl border text-center transition-all ${
              isProtected 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}>
              {isProtected ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Protection BoutiqueSûre ACTIVE</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Aucune directive de défense</span>
                </div>
              )}
              <p className="text-[10px] mt-1 text-slate-400">
                {isProtected ? currentScenario.protectionFix : currentScenario.technicalVulnerability}
              </p>
            </div>
          </div>

          {/* Côté Pirate / Résultat */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
              isProtected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {isProtected ? <ShieldCheck className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
            </div>
            <div className="text-xs font-bold text-white">
              {isProtected ? 'Attaque Bloquée Net' : 'Serveur Pirate Externe'}
            </div>
            <div className="text-[11px] text-slate-400">
              {isProtected 
                ? 'Le navigateur refuse la connexion frauduleuse.' 
                : 'Numéro de carte dérobé et envoyé en Russie / Asie.'}
            </div>
            <div className={`p-2 rounded border text-[10px] font-mono text-left ${
              isProtected 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
            }`}>
              {isProtected 
                ? 'HTTP/2 403 Forbidden [CSP Block]' 
                : 'DATA STOLEN: card_number=4242...'}
            </div>
          </div>

        </div>

        {/* Bilan & Impact financier vulgarisé */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-300">
            <strong className="text-white">Impact réel pour votre boutique :</strong> {currentScenario.impact}
          </div>
          <span className="text-[11px] font-bold text-emerald-400 shrink-0">
            Résolu en 1 clic via nos directives serveur
          </span>
        </div>
      </div>
    </div>
  );
};

export default CyberAttackSandbox;
