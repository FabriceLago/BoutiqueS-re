/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Score de sécurité Boutique en Ligne
 * Application principale avec navigation complète des 5 écrans + Charte RGPD & Mini Back-Office
 */

import React, { useState, useEffect } from 'react';
import { 
  HomeMockup 
} from './components/HomeMockup.tsx';
import { 
  WaitingMockup 
} from './components/WaitingMockup.tsx';
import { 
  BulletinMockup 
} from './components/BulletinMockup.tsx';
import { 
  EmailMockup 
} from './components/EmailMockup.tsx';
import { 
  AuditLogs 
} from './components/AuditLogs.tsx';
import { 
  PolitiqueConfidentialite 
} from './components/PolitiqueConfidentialite.tsx';
import { AuditResult } from './types.ts';
import { 
  FileText, 
  Clock, 
  Gauge, 
  Mail, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Database,
  Sun,
  Moon,
  Layers
} from 'lucide-react';

export type MockupScreen = 'home' | 'waiting' | 'bulletin' | 'email' | 'audit_logs' | 'privacy';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<MockupScreen>('home');
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [currentAuditResult, setCurrentAuditResult] = useState<AuditResult | undefined>(undefined);
  
  // Données de la boutique courante analysée (initialisées vides sans données fictives)
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  // Deep linking via URL query parameters (?screen=..., ?audit=..., ?domain=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const screenParam = params.get('screen');
        if (
          screenParam === 'privacy' || 
          screenParam === 'home' || 
          screenParam === 'waiting' || 
          screenParam === 'bulletin' || 
          screenParam === 'email' || 
          screenParam === 'audit_logs'
        ) {
          setActiveScreen(screenParam as MockupScreen);
        }

        const auditParam = params.get('audit') || params.get('url') || params.get('domain');
        if (auditParam) {
          const cleanUrl = auditParam.startsWith('http') ? auditParam : `https://${auditParam}`;
          setCurrentUrl(cleanUrl);
          if (!screenParam) {
            setActiveScreen('bulletin');
          }
        }
      } catch {
        // ignore url parsing issues
      }
    }
  }, []);

  // Gestion du thème Sombre / Clair (haute accessibilité)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('boutiquesure_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('theme-light');
        document.documentElement.classList.remove('theme-dark');
      } else {
        document.documentElement.classList.add('theme-dark');
        document.documentElement.classList.remove('theme-light');
      }
      try {
        localStorage.setItem('boutiquesure_theme', theme);
      } catch {
        // ignore storage errors
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleStartAudit = (url: string, email: string) => {
    setCurrentUrl(url);
    setCurrentEmail(email);
    setActiveScreen('waiting');
  };

  const handleFinishWaiting = (result?: AuditResult) => {
    if (result) {
      setCurrentAuditResult(result);
    }
    setActiveScreen('bulletin');
  };

  const handleSelectAuditFromBackoffice = (url: string, email: string) => {
    setCurrentUrl(url);
    setCurrentEmail(email);
    setActiveScreen('bulletin');
  };

  return (
    <div 
      className="min-h-screen bg-[#0A101D] text-slate-100 flex flex-col font-['Manrope',sans-serif] theme-root transition-colors duration-200"
      data-theme={theme}
    >
      
      {/* Barre d'outils supérieure de maquettage (Interactive Bar) */}
      <nav 
        aria-label="Navigation des maquettes" 
        className="border-b border-slate-800 bg-[#070D18] sticky top-0 z-50 px-4 py-2.5 shadow-lg"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Identité de l'étape */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">BoutiqueSûre</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Étape 7 : Mini Back-Office & Leads CRM
                </span>
              </div>
            </div>
          </div>

          {/* Commutateur d'écrans maquettés (6 écrans au total) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveScreen('home')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'home'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Accueil & Formulaire</span>
            </button>

            <button
              onClick={() => setActiveScreen('waiting')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'waiting'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>2. Écran d'attente animé</span>
            </button>

            <button
              onClick={() => setActiveScreen('bulletin')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'bulletin'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>3. Bulletin de sécurité</span>
            </button>

            <button
              onClick={() => setActiveScreen('email')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'email'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>4. Email (Resend)</span>
            </button>

            <button
              onClick={() => setActiveScreen('audit_logs')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'audit_logs'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>5. Journal des analyses & Leads</span>
            </button>

            <button
              onClick={() => setActiveScreen('privacy')}
              data-testid="nav-privacy-btn"
              className={`min-h-[36px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'privacy'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>6. Charte & RGPD</span>
            </button>
          </div>

          {/* Commutateur de viewport Desktop / Mobile & Thème */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden xl:inline">Aperçu :</span>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setIsMobileMode(false)}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                  !isMobileMode 
                    ? 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Aperçu Desktop complet"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setIsMobileMode(true)}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                  isMobileMode 
                    ? 'bg-emerald-400 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Simulation écran mobile 390px"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile (390px)</span>
              </button>
            </div>

            {/* Bouton de bascule de thème Sombre / Clair */}
            <button
              onClick={toggleTheme}
              data-testid="theme-toggle-btn"
              aria-label={theme === 'dark' ? 'Activer le mode clair pour une haute lisibilité' : 'Activer le mode sombre profond'}
              title={theme === 'dark' ? 'Passer en mode clair (haute accessibilité)' : 'Passer en mode sombre profond'}
              className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Mode clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Mode sombre</span>
                </>
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* Rendu dynamique de la maquette sélectionnée */}
      <div className={`flex-1 w-full ${isMobileMode ? 'py-8 bg-slate-950 flex justify-center items-start overflow-x-hidden' : ''}`}>
        
        {isMobileMode && (
          <div className="w-full max-w-[400px] border-4 border-slate-700 rounded-[36px] overflow-hidden shadow-2xl bg-[#0F1B2D] my-4 mobile-device-frame">
            <div className="bg-slate-900 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
              <span>9:41</span>
              <div className="w-20 h-4 bg-slate-950 rounded-full"></div>
              <span>5G 100%</span>
            </div>
            
            {activeScreen === 'home' && (
              <HomeMockup 
                onStartAudit={handleStartAudit} 
                isMobileView={true} 
                onNavigateToScreen={setActiveScreen}
              />
            )}
            
            {activeScreen === 'waiting' && (
              <WaitingMockup 
                storeUrl={currentUrl || 'https://votre-boutique.fr'} 
                email={currentEmail || 'contact@votre-boutique.fr'} 
                onFinish={handleFinishWaiting}
                isMobileView={true} 
              />
            )}
            
            {activeScreen === 'bulletin' && (
              <BulletinMockup 
                storeUrl={currentUrl || 'https://votre-boutique.fr'} 
                email={currentEmail || 'contact@votre-boutique.fr'} 
                auditResult={currentAuditResult}
                isMobileView={true} 
                onNavigateToScreen={setActiveScreen}
              />
            )}
            
            {activeScreen === 'email' && (
              <EmailMockup 
                storeUrl={currentUrl || 'https://votre-boutique.fr'} 
                email={currentEmail || 'contact@votre-boutique.fr'} 
                grade={currentAuditResult?.grade}
                score={currentAuditResult?.score}
                auditResult={currentAuditResult}
                onNavigateToScreen={setActiveScreen}
              />
            )}

            {activeScreen === 'audit_logs' && (
              <AuditLogs 
                isMobileView={true} 
                onNavigateToScreen={setActiveScreen}
                onSelectAuditUrl={handleSelectAuditFromBackoffice}
              />
            )}

            {activeScreen === 'privacy' && (
              <PolitiqueConfidentialite 
                onBack={() => setActiveScreen('home')}
                isMobileView={true}
              />
            )}
          </div>
        )}

        {!isMobileMode && (
          <div key={activeScreen} className="animate-fade-slide-up w-full">
            {activeScreen === 'home' && (
              <HomeMockup 
                onStartAudit={handleStartAudit} 
                isMobileView={false} 
                onNavigateToScreen={setActiveScreen}
              />
            )}
            
            {activeScreen === 'waiting' && (
              <WaitingMockup 
                storeUrl={currentUrl || 'https://votre-boutique.fr'} 
                email={currentEmail || 'contact@votre-boutique.fr'} 
                onFinish={handleFinishWaiting}
                isMobileView={false} 
              />
            )}
            
            {activeScreen === 'bulletin' && (
              <BulletinMockup 
                storeUrl={currentUrl || 'https://votre-boutique.fr'} 
                email={currentEmail || 'contact@votre-boutique.fr'} 
                auditResult={currentAuditResult}
                isMobileView={false} 
                onNavigateToScreen={setActiveScreen}
              />
            )}
            
            {activeScreen === 'email' && (
              <EmailMockup 
                storeUrl={currentUrl || 'https://votre-boutique.fr'} 
                email={currentEmail || 'contact@votre-boutique.fr'} 
                grade={currentAuditResult?.grade}
                score={currentAuditResult?.score}
                auditResult={currentAuditResult}
                onNavigateToScreen={setActiveScreen}
              />
            )}

            {activeScreen === 'audit_logs' && (
              <AuditLogs 
                isMobileView={false} 
                onNavigateToScreen={setActiveScreen}
                onSelectAuditUrl={handleSelectAuditFromBackoffice}
              />
            )}

            {activeScreen === 'privacy' && (
              <PolitiqueConfidentialite 
                onBack={() => setActiveScreen('home')}
                isMobileView={false}
              />
            )}
          </div>
        )}

      </div>

    </div>
  );
}
