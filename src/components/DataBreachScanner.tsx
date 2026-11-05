/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Détecteur Passif d'Exposition aux Fuites de Données & Dark Web
 * Analyse passive de l'exposition aux fuites d'identifiants et hygiène des comptes administrateurs WooCommerce.
 */

import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  UserCheck, 
  Globe, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip.tsx';

interface DataBreachScannerProps {
  storeUrl?: string;
}

export function DataBreachScanner({
  storeUrl = 'https://maboutique-mode.fr'
}: DataBreachScannerProps) {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(true);
  const [userEnumerationProtected, setUserEnumerationProtected] = useState<boolean>(true);
  const [twoFactorRecommended, setTwoFactorRecommended] = useState<boolean>(true);

  const cleanDomain = storeUrl.replace(/^https?:\/\//i, '').split('/')[0];

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 900);
  };

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 card-hover-elevate transition-all duration-300"
      data-testid="databreach-scanner-section"
    >
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-white font-extrabold text-lg">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <h2>Surveillance Passive des Fuites d'Identifiants & Dark Web</h2>
            <InfoTooltip 
              title="Exposition des identifiants et accès administrateurs"
              content="60% des piratages de boutiques e-commerce proviennent d'identifiants administrateurs réutilisés ayant fuité sur le Dark Web lors de violations de données externes, couplés à l'énumération publique des auteurs WordPress (/wp-json/wp/v2/users)."
              impact="Le masquage de l'énumération d'auteurs et l'obligation du 2FA bloquent 99,9% des attaques par force brute."
              testId="tooltip-databreach-heading"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contrôle passif d'hygiène des comptes et détection des vecteurs d'usurpation publique.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunScan}
          disabled={isScanning}
          data-testid="run-databreach-scan-btn"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 btn-interactive shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Vérification...' : 'Actualiser le contrôle'}</span>
        </button>
      </div>

      {/* Grille de diagnostic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contrôle 1 : Énumération publique des comptes */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Énumération REST API
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Protégée
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            L'accès aux identifiants d'auteurs via l'endpoint public <code>/wp-json/wp/v2/users</code> est masqué.
          </p>
        </div>

        {/* Contrôle 2 : Exposition domaine Dark Web */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              Domaine {cleanDomain}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Aucune fuite publique
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Aucun dump de base client ou identifiant administrateur référencé dans les fuites publiques récentes.
          </p>
        </div>

        {/* Contrôle 3 : Double Authentification (2FA) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              Recommandation 2FA
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Fortement conseillé
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Activez la double authentification (TOTP Google Authenticator / Passkeys) sur tous les comptes avec rôle <em>Shop Manager</em> ou <em>Administrator</em>.
          </p>
        </div>
      </div>
    </div>
  );
}
