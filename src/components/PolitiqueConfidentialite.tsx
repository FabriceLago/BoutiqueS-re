/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Composant Écran Politique de Confidentialité & Charte 100% Passive
 * Conforme RGPD (Règlement UE 2016/679) & Directive NIS 2
 */

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Server, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Mail, 
  Printer, 
  Database,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface PolitiqueConfidentialiteProps {
  onBack?: () => void;
  isMobileView?: boolean;
}

export function PolitiqueConfidentialite({ onBack, isMobileView = false }: PolitiqueConfidentialiteProps) {
  const [isPurged, setIsPurged] = React.useState(false);
  const [storedItemsCount, setStoredItemsCount] = React.useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('boutiquesure_')) count++;
      }
      return count;
    } catch {
      return 0;
    }
  });

  const handlePurgeLocalData = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('boutiquesure_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      setStoredItemsCount(0);
      setIsPurged(true);
      setTimeout(() => setIsPurged(false), 5000);
    } catch (e) {
      console.warn('Erreur purge:', e);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div 
      data-testid="politique-confidentialite-screen"
      className="w-full min-h-screen bg-[#0A101D] text-slate-100 font-['Manrope',sans-serif] py-8 sm:py-12 px-4 sm:px-6"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          {onBack && (
            <button
              onClick={onBack}
              data-testid="back-from-privacy-btn"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Retour à l'application</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              aria-label="Imprimer la politique de confidentialité"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer la charte</span>
            </button>
          </div>
        </div>

        {/* En-tête principal */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0F1B2D] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Transparence & Déontologie
                </span>
                <span className="text-xs text-slate-400">Version 2.4 — Mis à jour en 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Charte Déontologique 100% Passive & Politique de Confidentialité RGPD
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mt-2">
            La présente politique encadre l'utilisation de l'outil d'audit de sécurité <strong>BoutiqueSûre</strong>. 
            Elle formalise notre engagement strict d'analyse non intrusive, le respect de la vie privée des commerçants et la protection rigoureuse des données conformément au Règlement Général sur la Protection des Données (RGPD - UE 2016/679).
          </p>

          {/* 3 Garanties cardinales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">100% Passif Garanti</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  1 seule requête GET standard. Zéro intrusion, zéro charge serveur.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">IP Hachées en SHA-256</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Aucune adresse IP brute n'est stockée en clair dans nos bases.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Purge sous 30 Jours</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Suppression automatique et droit à l'oubli garanti sous 48h.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1 : La Charte 100% Passive */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/20">
              1
            </span>
            <h2 className="text-lg font-bold text-white">
              Charte d'Analyse 100% Passive & Non Intrusive
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Contrairement à un test d'intrusion ou à un scanner de vulnérabilités actif, la sonde BoutiqueSûre applique un principe de précaution absolu :
          </p>

          <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Une seule et unique requête HTTP GET normale :</strong> La sonde se contente d'appeler l'URL publique fournie, exactement comme le ferait un acheteur ordinaire ouvrant votre page d'accueil dans son navigateur.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Interdiction formelle des scans de ports :</strong> Aucun scan de ports (TCP/UDP, Nmap ou équivalent) n'est exécuté.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Aucune injection ni tentative d'intrusion :</strong> Aucun payload SQL, aucune tentative XSS, aucun test de mot de passe par dictionnaire ou force brute n'est jamais émis.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zéro impact sur vos commandes :</strong> L'analyse consomme moins de 50 Ko de bande passante et ne ralentit à aucun moment votre serveur ou vos conversions.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Identification transparente :</strong> La sonde s'identifie avec un User-Agent clair : <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[11px]">BoutiqueSure-Scanner/1.0 (+https://boutiquesure.fr)</code>.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 2 : Données collectées & RGPD */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/20">
              2
            </span>
            <h2 className="text-lg font-bold text-white">
              Données Personnelles Collectées & Finalités (RGPD)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 pr-4">Donnée collectée</th>
                  <th className="py-2.5 px-4">Finalité du traitement</th>
                  <th className="py-2.5 px-4">Base légale RGPD</th>
                  <th className="py-2.5 pl-4">Durée de conservation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 pr-4 font-semibold text-white">URL de la boutique</td>
                  <td className="py-3 px-4">Exécution de l'analyse passive des en-têtes et du certificat SSL</td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">Consentement & Intérêt légitime</td>
                  <td className="py-3 pl-4">30 jours (ou archivage anonymisé)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-white">Adresse email professionnelle</td>
                  <td className="py-3 px-4">Envoi du rapport officiel d'audit et lien vers le bulletin en ligne</td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">Consentement exprès</td>
                  <td className="py-3 pl-4">3 ans max (ou suppression sur demande en 1 clic)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-white">Empreinte d'adresse IP (SHA-256)</td>
                  <td className="py-3 px-4">Prévention des abus (Rate-limit : 3 scans max / 24h)</td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">Sécurité & Intérêt légitime</td>
                  <td className="py-3 pl-4">24 heures (remise à zéro de la fenêtre)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-white">Engagement de gérance certifié</td>
                  <td className="py-3 px-4">Preuve de légitimité de l'auteur de la demande</td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">Obligation de traçabilité</td>
                  <td className="py-3 pl-4">1 an pour le journal légal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 : Exercice des droits */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/20">
              3
            </span>
            <h2 className="text-lg font-bold text-white">
              Vos Droits & Contact du Délégué à la Protection des Données (DPO)
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Conformément aux articles 15 à 22 du RGPD, vous disposez à tout moment d'un droit d'accès, de rectification, d'opposition, de limitation et d'effacement complet de vos données.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Contact DPO Référent</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pour toute demande d'effacement ou de consultation de vos données :
              </p>
              <a 
                href="mailto:dpo@boutiquesure.fr" 
                className="mt-2 inline-block font-mono text-xs text-emerald-400 hover:underline"
              >
                dpo@boutiquesure.fr
              </a>
              <div className="text-[10px] text-slate-500 mt-1">Délai moyen de réponse : moins de 24h ouvrées.</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Hébergement & Sécurité des Serveurs</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Nos bases de données Supabase et serveurs de diagnostic sont hébergés dans l'Union Européenne (Région Francfort / Paris) sous certification ISO 27001 et chiffrement au repos AES-256.
              </p>
            </div>

            {/* Boîte d'action Droit à l'effacement immédiat */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Droit à l'oubli immédiat (Article 17 du RGPD)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                  {storedItemsCount} élément(s) en mémoire locale
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Vous pouvez purger instantanément toutes les données enregistrées dans votre navigateur par BoutiqueSûre (historique des recherches, brouillons d'URL, jeton de visite guidée et préférences).
              </p>
              {isPurged && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2" data-testid="gdpr-purge-success-alert">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Toutes vos données locales ont été immédiatement effacées avec succès conformément au RGPD.</span>
                </div>
              )}
              <button
                type="button"
                onClick={handlePurgeLocalData}
                data-testid="gdpr-purge-btn"
                className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Purger mes données locales (Droit à l'effacement)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 4 : Directive NIS 2 */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/20">
              4
            </span>
            <h2 className="text-lg font-bold text-white">
              Conformité à la Directive Européenne NIS 2 (UE 2022/2555)
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            L'Article 21 de la Directive NIS 2 impose à tout acteur de la chaîne logistique et de l'e-commerce de mettre en œuvre des mesures de gestion des risques en matière de cybersécurité, notamment le chiffrement des flux et l'analyse de vulnérabilités régulières.
          </p>

          <p className="text-xs text-slate-400 leading-relaxed">
            Le rapport généré par BoutiqueSûre constitue un élément de preuve documentaire de diligence technique, utile pour démontrer votre démarche active de sécurisation auprès de votre assureur cyber ou de votre établissement bancaire.
          </p>
        </section>

        {/* Bouton bas de page retour */}
        {onBack && (
          <div className="text-center pt-4">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retourner à l'accueil du diagnostic</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
