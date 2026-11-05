/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Maquette Écran 1 : Page d'accueil & Formulaire
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  Sparkles,
  Shield,
  Eye,
  Server,
  Loader2,
  Check,
  Clipboard,
  Zap,
  History
} from 'lucide-react';
import { FAQ } from './FAQ.tsx';
import { FAQSection } from './FAQSection.tsx';
import { validateUrlFormat } from '../lib/scanner.ts';

// Validation email RFC 5322 standard
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed) && trimmed.length <= 254;
}

// Détection de fautes de frappe courantes sur les fournisseurs d'email
export function detectEmailTypo(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return null;
  const [user, domain] = parts;
  
  const typos: Record<string, string> = {
    'gmai.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'yaho.com': 'yahoo.com',
    'yaho.fr': 'yahoo.fr',
    'outlok.com': 'outlook.com',
    'wanado.fr': 'wanadoo.fr',
    'oranje.fr': 'orange.fr'
  };

  if (typos[domain]) {
    return `${user}@${typos[domain]}`;
  }
  return null;
}

export interface SanitizeUrlResult {
  cleanedUrl: string;
  wasModified: boolean;
  message?: string;
}

// Nettoyage intelligent de l'URL pour ne cibler que la racine publique de la boutique
export function sanitizeStoreUrl(raw: string): SanitizeUrlResult {
  if (!raw) return { cleanedUrl: '', wasModified: false };
  // Nettoyage des espaces insécables, tabulations, caractères invisibles
  let cleaned = raw.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
  if (!cleaned) return { cleanedUrl: '', wasModified: false };

  let wasModified = false;
  let reason = '';

  try {
    const hasProtocol = cleaned.startsWith('http://') || cleaned.startsWith('https://');
    const toParse = hasProtocol ? cleaned : `https://${cleaned}`;
    const parsed = new URL(toParse);

    // Si l'utilisateur colle une page interne (/wp-admin, /cart, /panier, /checkout) ou des paramètres de tracking
    if (parsed.pathname !== '/' && parsed.pathname !== '') {
      wasModified = true;
      reason = "URL automatiquement recentrée sur la page d'accueil publique de votre boutique.";
    }

    if (parsed.search || parsed.hash) {
      wasModified = true;
      reason = "Paramètres de tracking et ancres superflus retirés pour l'audit d'accueil.";
    }

    if (wasModified) {
      cleaned = `${parsed.protocol}//${parsed.host}`;
    }
  } catch {
    // Si parsing échoue, on conserve la chaîne assainie
  }

  return {
    cleanedUrl: cleaned,
    wasModified,
    message: wasModified ? reason : undefined
  };
}

/**
 * Détecte si la saisie correspond à un nom d'enseigne/boutique plutôt qu'à une URL pure
 * Exemples : "Maison du Thé", "L'Atelier Cuir", "Boutique Bio", "Chocolats de Paris"
 */
export function isStoreName(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  if (!trimmed) return false;
  
  // Si commence déjà par http:// ou https://, c'est une URL
  if (/^https?:\/\//i.test(trimmed)) return false;

  // Si contient des espaces internes, c'est un nom d'enseigne
  if (/\s/.test(trimmed)) return true;

  // Si contient des apostrophes ou caractères typiques d'un nom commercial
  if (/['’]/.test(trimmed)) return true;

  // Si ne contient aucun point et a au moins 2 caractères alphabétiques
  if (!trimmed.includes('.') && /[a-zA-ZÀ-ÿ]{2,}/.test(trimmed)) return true;

  return false;
}

/**
 * Convertit un nom de boutique en un nom de domaine ou URL valide pour l'analyse passive
 * @param storeName Le nom brut saisi (ex : "L'Atelier Cuir & Bois", "Chocolaterie de Paris", "Ma Boutique")
 * @param tld Extension de domaine par défaut ('fr', 'com', 'be', 'shop', 'eu'...)
 * @returns L'URL normalisée prête pour l'audit passif (ex : "https://l-atelier-cuir-bois.fr")
 */
export function formatStoreNameToDomain(storeName: string, tld: string = 'fr'): string {
  if (!storeName || typeof storeName !== 'string') return '';
  const trimmed = storeName.trim();
  if (!trimmed) return '';

  // Si c'est déjà une URL complète avec protocole
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Si c'est déjà un nom de domaine avec extension valide (ex: boutique.fr, shop.com)
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Nettoyage et slugification du nom de boutique
  // 1. Décomposition des accents (NFD) et suppression des diacritiques
  let slug = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // 2. Remplacement des apostrophes et esperluettes par des tirets
  slug = slug
    .replace(/['’]/g, '-')
    .replace(/&+/g, '-et-')
    .replace(/[^a-z0-9.-]/g, '-') // remplace tout caractère non alphanumérique par tiret
    .replace(/-+/g, '-')          // supprime les tirets multiples consécutifs
    .replace(/^-+|-+$/g, '');     // supprime les tirets de début et de fin

  if (!slug) return '';

  // Si le slug a déjà une extension valide à la fin (ex: slug.fr)
  if (/\.[a-z]{2,}$/i.test(slug)) {
    return `https://${slug}`;
  }

  // Ajout de l'extension TLD choisie
  const cleanTld = tld.replace(/^\./, '').toLowerCase() || 'fr';
  return `https://${slug}.${cleanTld}`;
}

export const DEMO_PRESETS = [
  {
    id: 'demo-mode',
    label: 'Boutique Mode',
    url: 'https://maboutique-mode.fr',
    email: 'contact@maboutique-mode.fr',
    badge: 'Note A (95 pts)',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'demo-bio',
    label: 'Boutique Bio',
    url: 'https://maboutique-bio.fr',
    email: 'gerant@maboutique-bio.fr',
    badge: 'Note C (65 pts)',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    id: 'demo-deco',
    label: 'Boutique Déco',
    url: 'https://maboutique-deco.com',
    email: 'contact@maboutique-deco.com',
    badge: 'Note E (35 pts)',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
  }
];

interface HomeMockupProps {
  onStartAudit: (url: string, email: string) => void;
  isMobileView?: boolean;
  onNavigateToScreen?: (screen: 'home' | 'waiting' | 'bulletin' | 'email' | 'audit_logs' | 'privacy') => void;
}

export function HomeMockup({ onStartAudit, isMobileView = false, onNavigateToScreen }: HomeMockupProps) {
  // Champs initialisés vides (aucune donnée fictive pré-remplie)
  const [storeUrl, setStoreUrl] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTld, setSelectedTld] = useState<'fr' | 'com' | 'be' | 'shop' | 'eu'>('fr');
  const [isManagerChecked, setIsManagerChecked] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // États de validation en temps réel
  const [urlTouched, setUrlTouched] = useState<boolean>(false);
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [urlSanitizedNotice, setUrlSanitizedNotice] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);

  // Restauration automatique du brouillon (sessionStorage sans réintroduire les anciennes données fictives)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUrl = sessionStorage.getItem('boutiquesure_draft_url');
        const savedEmail = sessionStorage.getItem('boutiquesure_draft_email');
        if (savedUrl && !savedUrl.includes('maboutique-mode.fr')) setStoreUrl(savedUrl);
        if (savedEmail && !savedEmail.includes('maboutique-mode.fr')) setEmail(savedEmail);
      } catch {}
    }
  }, []);

  // Sauvegarde automatique du brouillon
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('boutiquesure_draft_url', storeUrl);
        sessionStorage.setItem('boutiquesure_draft_email', email);
      } catch {}
    }
  }, [storeUrl, email]);

  // Historique des boutiques récentes
  const [recentAudits, setRecentAudits] = useState<{ url: string; date: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('boutiquesure_recent_audits');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Détection si l'utilisateur saisit un nom de boutique ou une adresse URL
  const detectedStoreName = useMemo(() => {
    return isStoreName(storeUrl);
  }, [storeUrl]);

  // Domaine suggéré/généré en direct pour l'analyse
  const suggestedDomain = useMemo(() => {
    if (!storeUrl.trim()) return '';
    return formatStoreNameToDomain(storeUrl, selectedTld);
  }, [storeUrl, selectedTld]);

  // Validation temps réel : accepte à la fois un nom d'enseigne ou une URL directe
  const urlValidation = useMemo(() => {
    if (!storeUrl.trim()) return { valid: false, error: "Veuillez saisir le nom ou l'adresse de votre boutique." };
    if (detectedStoreName) {
      const formatted = formatStoreNameToDomain(storeUrl, selectedTld);
      return validateUrlFormat(formatted);
    }
    return validateUrlFormat(storeUrl);
  }, [storeUrl, detectedStoreName, selectedTld]);

  // Indicateurs de la checklist de préparation en direct
  const isHttps = useMemo(() => {
    if (detectedStoreName) return true;
    return storeUrl.toLowerCase().startsWith('https://');
  }, [storeUrl, detectedStoreName]);

  const hasValidTld = useMemo(() => {
    if (detectedStoreName) return true;
    try {
      const u = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
      const host = new URL(u).hostname;
      return /\.[a-z]{2,}$/i.test(host);
    } catch {
      return false;
    }
  }, [storeUrl, detectedStoreName]);

  // Validation temps réel de l'email et suggestion de correction
  const emailValidation = useMemo(() => {
    if (!email.trim()) return false;
    return isValidEmailFormat(email);
  }, [email]);

  const emailTypoSuggestion = useMemo(() => {
    return detectEmailTypo(email);
  }, [email]);

  const handleUrlChange = (value: string) => {
    if (/^https?:\/\//i.test(value.trim())) {
      const sanitized = sanitizeStoreUrl(value);
      setStoreUrl(sanitized.cleanedUrl);
      if (sanitized.wasModified && sanitized.message) {
        setUrlSanitizedNotice(sanitized.message);
        setTimeout(() => setUrlSanitizedNotice(null), 4000);
      }
    } else {
      setStoreUrl(value);
    }
  };

  const handlePasteUrl = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          if (/^https?:\/\//i.test(text.trim())) {
            const sanitized = sanitizeStoreUrl(text);
            setStoreUrl(sanitized.cleanedUrl);
            if (sanitized.wasModified && sanitized.message) {
              setUrlSanitizedNotice(sanitized.message);
              setTimeout(() => setUrlSanitizedNotice(null), 4000);
            }
          } else {
            setStoreUrl(text.trim());
          }
          setUrlTouched(true);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch {
      // Pas de permission presse-papier
    }
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setStoreUrl(preset.url);
    setEmail(preset.email);
    setUrlTouched(true);
    setEmailTouched(true);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUrlTouched(true);
    setEmailTouched(true);

    if (!storeUrl.trim()) {
      setErrorMsg("Veuillez saisir le nom ou l'adresse de votre boutique en ligne.");
      return;
    }

    const targetToAudit = detectedStoreName 
      ? formatStoreNameToDomain(storeUrl, selectedTld) 
      : (urlValidation.target?.normalizedUrl || storeUrl);

    const targetCheck = validateUrlFormat(targetToAudit);
    if (!targetCheck.valid) {
      setErrorMsg(targetCheck.error || "Veuillez renseigner un nom de boutique ou une adresse web valide.");
      return;
    }

    if (!email.trim() || !email.includes('@') || !emailValidation) {
      setErrorMsg("Veuillez renseigner une adresse email valide pour recevoir le bulletin.");
      return;
    }

    if (!isManagerChecked) {
      setErrorMsg("Veuillez confirmer que vous êtes le gérant de la boutique ou habilité à agir pour son compte.");
      return;
    }

    setIsSubmitting(true);
    const normalizedUrl = targetCheck.target?.normalizedUrl || targetToAudit;
    
    // Mémoriser dans l'historique local récent
    try {
      const updated = [
        { url: normalizedUrl, date: new Date().toLocaleDateString('fr-FR') },
        ...recentAudits.filter(a => a.url !== normalizedUrl)
      ].slice(0, 3);
      setRecentAudits(updated);
      localStorage.setItem('boutiquesure_recent_audits', JSON.stringify(updated));
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      onStartAudit(normalizedUrl, email.trim());
    }, 350);
  };

  const scrollToForm = () => {
    const el = document.getElementById('form-audit-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`w-full min-h-screen bg-[#0F1B2D] text-slate-100 font-['Manrope',sans-serif] flex flex-col justify-between selection:bg-[#4ADE80] selection:text-slate-950 ${isMobileView ? 'max-w-[420px] mx-auto border-x border-slate-800 shadow-2xl' : ''}`}>
      
      {/* Navigation principale */}
      <header className="border-b border-slate-800/80 bg-[#0B1523]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#0E6B3A] flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold text-xl">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">BoutiqueSûre</span>
              <span className="text-[11px] text-slate-400 font-medium">Sécurité & Maintenance E-Commerce</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Analyse 100% passive
            </span>
            <span className="text-slate-500">•</span>
            <span>Belgique & France</span>
            <span className="text-slate-500">•</span>
            <a href="#tarifs" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Nos offres dès 69 €/mois
            </a>
            <span className="text-slate-500">•</span>
            <a href="#faq-section-ecommerce" className="hover:text-white transition-colors">
              FAQ Sécurité
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section & Formulaire */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 w-full flex flex-col items-center">
        
        {/* Badge réassurance */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Audit passif garanti 100% sans risque • Benchmark sectoriel • Préparation Directive NIS 2</span>
        </div>

        {/* Titre & Sous-titre vulgarisés pour gérants */}
        <div className="text-center max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Quel est le <span className="text-[#4ADE80]">score de sécurité</span> de votre boutique en ligne ?
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            En <strong>5 secondes</strong>, découvrez votre note de <strong>A à F</strong> et les 3 actions prioritaires
            pour protéger vos ventes et vos clients, sans jargon technique.
          </p>
        </div>

        {/* Cadre du formulaire principal */}
        <div id="form-audit-card" className="w-full max-w-xl bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 relative backdrop-blur-md">
          
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">Diagnostic gratuit immédiat</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold">
              Gratuit • 1 requête passive
            </span>
          </div>

          {/* Exemples de démonstration (optionnels) */}
          <div className="mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800" data-testid="demo-presets-container">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Ou tester rapidement avec un exemple :
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Exemples prêts à l'emploi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex flex-col justify-between card-hover-elevate btn-interactive"
                  title={`Tester avec ${preset.label} (${preset.badge})`}
                >
                  <span className="text-xs font-bold text-white truncate">{preset.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold mt-1 self-start border ${preset.badgeColor}`}>
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Champ 1 : Nom de la boutique ou Adresse URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="storeUrl" className="block text-xs font-bold text-slate-200">
                  Nom de votre boutique en ligne ou adresse web <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {urlTouched && urlValidation.valid && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {detectedStoreName ? 'Boutique identifiée' : 'URL valide'}
                    </span>
                  )}
                  {typeof window !== 'undefined' && 'clipboard' in navigator && (
                    <button
                      type="button"
                      onClick={handlePasteUrl}
                      title="Coller depuis le presse-papier"
                      className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Clipboard className="w-3 h-3" />
                      <span>{pasteSuccess ? 'Collé !' : 'Coller'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  id="storeUrl"
                  type="text"
                  required
                  value={storeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={() => setUrlTouched(true)}
                  placeholder="Ex : Ma Boutique Bio ou mon-magasin.fr"
                  className={`w-full min-h-[48px] px-4 pr-10 rounded-xl bg-[#0F1B2D] border text-white placeholder-slate-500 text-sm focus:outline-none transition-all ${
                    urlTouched && !urlValidation.valid
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500'
                      : urlTouched && urlValidation.valid
                      ? 'border-emerald-500/60 focus:ring-2 focus:ring-[#4ADE80]'
                      : 'border-slate-700 focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent'
                  }`}
                  aria-describedby="storeUrl-hint"
                  aria-invalid={urlTouched && !urlValidation.valid}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {urlTouched && (
                    urlValidation.valid ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )
                  )}
                </div>
              </div>

              {/* Boîte d'assistance intelligente lorsqu'un nom de boutique est saisi */}
              {detectedStoreName && storeUrl.trim().length >= 2 && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs animate-in fade-in space-y-2" data-testid="store-name-helper">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Enseigne détectée : <strong>{storeUrl.trim()}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Extension :</span>
                      <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60">
                        {(['fr', 'com', 'be', 'shop', 'eu'] as const).map(tld => (
                          <button
                            key={tld}
                            type="button"
                            onClick={() => setSelectedTld(tld)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                              selectedTld === tld 
                                ? 'bg-emerald-400 text-slate-950 shadow-sm' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            .{tld}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1.5 border-t border-emerald-500/20">
                    <span className="truncate">
                      Cible analysée : <code className="text-emerald-400 font-mono font-bold">{suggestedDomain}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStoreUrl(suggestedDomain);
                        setUrlTouched(true);
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline ml-2 shrink-0 cursor-pointer"
                    >
                      Utiliser cette adresse
                    </button>
                  </div>
                </div>
              )}

              {/* Notification si l'URL a été nettoyée d'une page interne */}
              {urlSanitizedNotice && (
                <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{urlSanitizedNotice}</span>
                </div>
              )}

              {/* Mini-liste de contrôle en temps réel */}
              <div className="mt-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 grid grid-cols-3 gap-2 text-[10px]">
                <div className={`flex items-center gap-1 font-medium ${isHttps ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isHttps ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                  <span>{detectedStoreName ? 'Nom identifié' : 'Tunnel HTTPS'}</span>
                </div>
                <div className={`flex items-center gap-1 font-medium ${hasValidTld ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasValidTld ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                  <span>{detectedStoreName ? `Extension .${selectedTld}` : 'Extension valide'}</span>
                </div>
                <div className={`flex items-center gap-1 font-medium ${urlValidation.valid ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${urlValidation.valid ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                  <span>Prêt pour le scan</span>
                </div>
              </div>

              {urlTouched && !urlValidation.valid ? (
                <p id="storeUrl-hint" className="mt-1.5 text-[11px] text-rose-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  {urlValidation.error}
                </p>
              ) : (
                <p id="storeUrl-hint" className="mt-1.5 text-[11px] text-slate-400">
                  Exemple : Ma Boutique Bio (nom de votre enseigne) ou mon-magasin.fr (adresse web)
                </p>
              )}
            </div>

            {/* Champ 2 : Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-slate-200">
                  Votre adresse email professionnelle <span className="text-rose-400">*</span>
                </label>
                {emailTouched && emailValidation && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Email valide
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="gerant@votre-boutique.fr"
                  className={`w-full min-h-[48px] px-4 pr-10 rounded-xl bg-[#0F1B2D] border text-white placeholder-slate-500 text-sm focus:outline-none transition-all ${
                    emailTouched && !emailValidation
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500'
                      : emailTouched && emailValidation
                      ? 'border-emerald-500/60 focus:ring-2 focus:ring-[#4ADE80]'
                      : 'border-slate-700 focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent'
                  }`}
                  aria-describedby="email-hint"
                  aria-invalid={emailTouched && !emailValidation}
                />
                {emailTouched && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {emailValidation ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Suggestion en cas de faute de frappe courante */}
              {emailTypoSuggestion && (
                <button
                  type="button"
                  onClick={() => setEmail(emailTypoSuggestion)}
                  className="mt-1.5 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vouliez-vous dire <strong className="text-white underline">{emailTypoSuggestion}</strong> ? Cliquez pour corriger</span>
                </button>
              )}

              {emailTouched && !emailValidation ? (
                <p id="email-hint" className="mt-1 text-[11px] text-rose-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  Format d'email incomplet ou invalide (ex: gerant@maboutique.fr).
                </p>
              ) : (
                <p id="email-hint" className="mt-1 text-[11px] text-slate-400">
                  Vous recevrez une copie de votre bulletin de sécurité A à F avec votre lien d'accès pérenne.
                </p>
              )}
            </div>

            {/* Case légale obligatoire (Gérant) */}
            <div className="pt-2">
              <label 
                htmlFor="managerConsent" 
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer min-h-[44px] transition-colors ${
                  errorMsg && !isManagerChecked
                    ? 'bg-rose-500/10 border-rose-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  id="managerConsent"
                  type="checkbox"
                  checked={isManagerChecked}
                  onChange={(e) => setIsManagerChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-[#4ADE80] focus:ring-[#4ADE80] shrink-0 mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-snug">
                  <strong className="text-white">Engagement de légitimité :</strong> Je confirme être le gérant de cette boutique en ligne ou dûment autorisé à agir pour son compte.
                </span>
              </label>
            </div>

            {/* Indicateur d'état de la sonde en direct */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white">Sonde passive en ligne</span>
              </div>
              <span className="text-slate-400">Temps estimé : ~4,8 s • 0 impact acheteurs</span>
            </div>

            {/* Bouton d'action principal */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[50px] px-6 py-3.5 rounded-xl bg-[#4ADE80] hover:bg-[#3ec974] active:bg-[#34b566] text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 text-slate-950 animate-spin" />
                  <span>Initialisation du diagnostic passif...</span>
                </>
              ) : (
                <>
                  <span>Calculer mon score de sécurité</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </>
              )}
            </button>

            {/* Historique local des récentes boutiques testées si existantes */}
            {recentAudits.length > 0 && (
              <div className="pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Boutiques récemment testées :</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentAudits.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setStoreUrl(item.url);
                        setUrlTouched(true);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors cursor-pointer"
                      title={`Recharger ${item.url}`}
                    >
                      {item.url.replace(/^https?:\/\//, '')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Mention de protection & RGPD */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% conforme RGPD
            </span>
            <span>Désinscription en 1 clic</span>
            <span>Zéro spam garanti</span>
          </div>
        </div>
        {/* Composant FAQ dédié — Placé directement sous le formulaire */}
        <FAQ />

        {/* Bloc réassurance 100% passif */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">100% Passif & Sans Risque</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Une seule requête publique normale, identique à un visiteur chargeant votre page. Aucun test d'intrusion.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Résultat en 5 secondes</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Votre note de A à F calculée instantanément avec les 3 corrections les plus urgentes pour vos ventes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Spécialiste E-Commerce</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Conçu pour les e-commerçants belges et français réalisant entre 100k€ et 500k€ de CA sans équipe IT.
              </p>
            </div>
          </div>
        </div>

        {/* Section Tarifs transparents */}
        <section id="tarifs" className="mt-16 w-full max-w-4xl text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Un accompagnement clair et sans surprise
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Après votre diagnostic gratuit, choisissez la formule qui correspond à votre rythme pour sécuriser votre chiffre d'affaires.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {/* Offre 1 : Diagnostic */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">One-Shot</div>
                <h3 className="text-lg font-bold text-white mt-1">Diagnostic Complet Boutique en Ligne</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">590 €</span>
                  <span className="text-xs text-slate-400">HTVA</span>
                </div>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Audit approfondi avec rapport d'intervention personnalisé, revue des extensions, base de données et recommandations d'un expert e-commerce dédié.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <span className="text-xs font-semibold text-emerald-400">Idéal pour faire un état des lieux complet</span>
              </div>
            </div>

            {/* Offre 2 : Sérénité */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-900 border border-emerald-500/30 flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-extrabold shadow">
                Recommandé
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Abonnement Mensuel</div>
                <h3 className="text-lg font-bold text-white mt-1">Abonnement Sérénité</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">69 €</span>
                  <span className="text-xs text-slate-400">HTVA / mois</span>
                </div>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Mises à jour testées sur environnement miroir, sauvegardes quotidiennes externalisées, monitoring 24/7 et assistance prioritaire en cas de pépin.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <span className="text-xs font-semibold text-emerald-300">Sans engagement de durée • Zéro tracas</span>
              </div>
            </div>
          </div>
        </section>

        {/* Composant FAQSection dédié — Situé à la fin de la page HomeMockup */}
        <FAQSection onScrollToForm={scrollToForm} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B1523] py-8 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>BoutiqueSûre © 2026 — Maintenance & Sécurité E-Commerce en France et Belgique</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#tarifs" className="hover:text-emerald-400 transition-colors">Tarifs</a>
            <span className="text-slate-700">•</span>
            <a href="#faq-section-ecommerce" className="hover:text-emerald-400 transition-colors">FAQ Sécurité</a>
            <span className="text-slate-700">•</span>
            <button 
              type="button"
              onClick={() => onNavigateToScreen?.('privacy')}
              className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
              data-testid="footer-privacy-btn"
            >
              Politique de confidentialité & RGPD
            </button>
            <span className="text-slate-700">•</span>
            <span>Contact : contact@boutiquesure.fr</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
