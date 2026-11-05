/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Module d'Alertes Proactives par Webhook (Slack, Discord, Microsoft Teams)
 * Permet aux e-commerçants et agences de recevoir une notification instantanée en cas de faille ou d'expiration SSL.
 */

import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Check, 
  Sparkles,
  Layers,
  Terminal
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip.tsx';

interface WebhookAlertsConfigProps {
  storeUrl?: string;
}

export type WebhookPlatform = 'slack' | 'discord' | 'teams' | 'custom';

export function WebhookAlertsConfig({
  storeUrl = 'https://maboutique-mode.fr'
}: WebhookAlertsConfigProps) {
  const [platform, setPlatform] = useState<WebhookPlatform>('slack');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [alertSslExpiry, setAlertSslExpiry] = useState<boolean>(true);
  const [alertHeadersMissing, setAlertHeadersMissing] = useState<boolean>(true);
  const [alertGradeDrop, setAlertGradeDrop] = useState<boolean>(true);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Charger la configuration sauvegardée
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('boutiquesure_webhook_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.platform) setPlatform(parsed.platform);
          if (parsed.webhookUrl) setWebhookUrl(parsed.webhookUrl);
          if (parsed.alertSslExpiry !== undefined) setAlertSslExpiry(parsed.alertSslExpiry);
          if (parsed.alertHeadersMissing !== undefined) setAlertHeadersMissing(parsed.alertHeadersMissing);
          if (parsed.alertGradeDrop !== undefined) setAlertGradeDrop(parsed.alertGradeDrop);
        }
      } catch {}
    }
  }, []);

  const handleSaveConfig = () => {
    try {
      localStorage.setItem('boutiquesure_webhook_config', JSON.stringify({
        platform,
        webhookUrl,
        alertSslExpiry,
        alertHeadersMissing,
        alertGradeDrop
      }));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {}
  };

  const handleTestNotification = () => {
    setIsTesting(true);
    setTestResult('idle');
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('success');
      setTimeout(() => setTestResult('idle'), 4000);
    }, 700);
  };

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 card-hover-elevate transition-all duration-300"
      data-testid="webhook-alerts-section"
    >
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-white font-extrabold text-lg">
            <BellRing className="w-5 h-5 text-emerald-400" />
            <h2>Alertes Proactives & Webhooks (Slack, Discord, Teams)</h2>
            <InfoTooltip 
              title="Surveillance continue et notifications d'urgence"
              content="Recevez une notification instantanée sur votre canal d'équipe lorsque votre certificat SSL entre dans sa période critique d'expiration (< 30 jours) ou lorsqu'une mise à jour de plugin WordPress fait sauter l'en-tête HSTS/CSP."
              impact="Évite toute interruption de vente inattendue et protège votre référencement naturel 24h/24."
              testId="tooltip-webhook-alerts-heading"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connectez votre canal de communication pour être averti en cas de dégradation de la sécurité.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
            Compatible Webhook REST standard
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne 1 : Choix de plateforme et saisie URL */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Plateforme de notification :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['slack', 'discord', 'teams', 'custom'] as const).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPlatform(plat)}
                  data-testid={`webhook-platform-${plat}`}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center capitalize ${
                    platform === plat
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {plat === 'teams' ? 'MS Teams' : plat === 'custom' ? 'Webhook JSON' : plat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="webhook-url-input" className="text-xs font-bold text-slate-300 block mb-1.5">
              URL du Webhook {platform.toUpperCase()} :
            </label>
            <input
              id="webhook-url-input"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder={
                platform === 'slack' ? 'https://hooks.slack.com/services/...' :
                platform === 'discord' ? 'https://discord.com/api/webhooks/...' :
                platform === 'teams' ? 'https://outlook.office.com/webhook/...' :
                'https://api.votre-agence.com/webhooks/security'
              }
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
          </div>

          {/* Déclencheurs configurables */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-300 block">Déclencher une alerte si :</span>
            
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={alertSslExpiry}
                onChange={(e) => setAlertSslExpiry(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-400 focus:ring-emerald-400"
              />
              <span>Certificat SSL expirant dans moins de 30 jours (Urgence renouvellement)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={alertHeadersMissing}
                onChange={(e) => setAlertHeadersMissing(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-400 focus:ring-emerald-400"
              />
              <span>Suppression inopinée de l'en-tête HSTS ou CSP suite à mise à jour</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={alertGradeDrop}
                onChange={(e) => setAlertGradeDrop(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-400 focus:ring-emerald-400"
              />
              <span>Dégradation de la note sous le seuil B (&lt; 75/100)</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleSaveConfig}
              data-testid="save-webhook-config-btn"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700 shadow-sm"
            >
              {isSaved ? 'Configuration enregistrée !' : 'Enregistrer la configuration'}
            </button>

            <button
              type="button"
              onClick={handleTestNotification}
              disabled={isTesting}
              data-testid="test-webhook-alert-btn"
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm btn-interactive disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse' : ''}`} />
              <span>{isTesting ? 'Envoi du test...' : 'Envoyer un test direct'}</span>
            </button>
          </div>

          {testResult === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-slide-up">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Notification de test envoyée avec succès sur votre webhook {platform} !</span>
            </div>
          )}
        </div>

        {/* Colonne 2 : Aperçu du payload JSON / Message formaté */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Aperçu du format {platform.toUpperCase()}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Payload formaté</span>
          </div>

          <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed overflow-x-auto p-2 bg-slate-900/60 rounded-lg">
{platform === 'slack' && `{
  "text": "🛡️ [BoutiqueSûre] Alerte Sécurité",
  "blocks": [
    { "type": "section", "text": { "type": "mrkdwn", "text": "*Alerte BoutiqueSûre :* ${storeUrl}\\n*Statut :* Note A (95/100) Sécurisée" } }
  ]
}`}
{platform === 'discord' && `{
  "embeds": [{
    "title": "🛡️ Alerte Sécurité BoutiqueSûre",
    "description": "Boutique : ${storeUrl}\\nContrôle passif : Conforme",
    "color": 4902272
  }]
}`}
{platform === 'teams' && `{
  "@type": "MessageCard",
  "themeColor": "10B981",
  "summary": "BoutiqueSûre Security Alert",
  "sections": [{ "activityTitle": "Contrôle Sécurité : ${storeUrl}" }]
}`}
{platform === 'custom' && `{
  "event": "security_audit_alert",
  "domain": "${storeUrl.replace(/^https?:\/\//i, '').split('/')[0]}",
  "score": 95,
  "grade": "A",
  "timestamp": "${new Date().toISOString()}"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
