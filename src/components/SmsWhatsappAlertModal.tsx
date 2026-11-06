/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Alertes d'Urgence SMS & WhatsApp (« Mobile Incident Alerting »)
 * Fichier : src/components/SmsWhatsappAlertModal.tsx
 */

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  BellRing, 
  MessageSquare,
  Lock,
  Clock
} from 'lucide-react';

export interface SmsWhatsappAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl?: string;
}

export const SmsWhatsappAlertModal: React.FC<SmsWhatsappAlertModalProps> = ({
  isOpen,
  onClose,
  storeUrl = 'https://ma-boutique-en-ligne.fr'
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('+33 6 12 34 56 78');
  const [channel, setChannel] = useState<'both' | 'sms' | 'whatsapp'>('whatsapp');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testSentSuccess, setTestSentSuccess] = useState<boolean>(false);

  // Déclencheurs activés
  const [triggers, setTriggers] = useState({
    sslExpiry: true,
    httpsBroken: true,
    cspTampering: true
  });

  const cleanDomain = storeUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'ma-boutique.fr';

  if (!isOpen) return null;

  const handleSendTestAlert = () => {
    setIsSendingTest(true);
    setTestSentSuccess(false);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestSentSuccess(true);
      setTimeout(() => setTestSentSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      data-testid="sms-whatsapp-alert-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col justify-between my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Alertes Immédiates SMS & WhatsApp d'Urgence
              </h2>
              <p className="text-xs text-slate-300">
                Soyez alerté en moins de 60 secondes en cas d'expiration SSL ou de coupure du panier
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-sms-modal-btn"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Mobile */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Numéro de mobile gérant :</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                data-testid="sms-phone-input"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Canal d'acheminement :</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="whatsapp">📱 WhatsApp Message (Recommandé)</option>
                <option value="sms">💬 SMS Prioritaire</option>
                <option value="both">🔔 Les deux (WhatsApp + SMS)</option>
              </select>
            </div>
          </div>

          {/* Déclencheurs critiques */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
            <span className="font-bold text-white block">Événements déclencheurs d'alerte :</span>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={triggers.sslExpiry}
                onChange={() => setTriggers(t => ({ ...t, sslExpiry: !t.sslExpiry }))}
                className="accent-emerald-400 rounded cursor-pointer" 
              />
              <span>Certificat SSL/TLS arrivant à expiration dans moins de 7 jours</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={triggers.httpsBroken}
                onChange={() => setTriggers(t => ({ ...t, httpsBroken: !t.httpsBroken }))}
                className="accent-emerald-400 rounded cursor-pointer" 
              />
              <span>Rupture de redirection HTTPS ou certificat invalide sur la boutique</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={triggers.cspTampering}
                onChange={() => setTriggers(t => ({ ...t, cspTampering: !t.cspTampering }))}
                className="accent-emerald-400 rounded cursor-pointer" 
              />
              <span>Détection d'un script tiers suspect au niveau du formulaire panier</span>
            </label>
          </div>

          {/* Aperçu Réaliste de la Notification sur Smartphone */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                Aperçu notification mobile reçue
              </span>
              <span>Il y a 1 min</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed">
              <strong>[BoutiqueSûre Alerte]</strong> 🚨 Attention : Le certificat SSL de votre boutique <code className="text-emerald-400 font-mono">{cleanDomain}</code> expire dans 4 jours. Risque de blocage immédiat des commandes par Chrome/Safari. Action requise d'urgence.
            </div>
          </div>
        </div>

        {/* Bouton de test en direct */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            {testSentSuccess && (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Notification de test simulée avec succès vers {phoneNumber} !
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSendTestAlert}
              disabled={isSendingTest}
              data-testid="send-test-sms-btn"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-spin' : ''}`} />
              <span>{isSendingTest ? 'Envoi du test...' : 'Tester l\'alerte sur mon mobile'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmsWhatsappAlertModal;
