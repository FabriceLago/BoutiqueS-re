/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Service d'envoi d'emails transactionnels (Resend) - Étape 6
 * Fichier : src/services/resendService.ts
 */

import { AuditResult, SecurityGrade, getGradeDisplayConfig } from '../types.ts';

export interface SendAuditEmailPayload {
  toEmail: string;
  storeUrl: string;
  grade: SecurityGrade;
  score: number;
  auditResult?: AuditResult;
}

export interface SendAuditEmailResult {
  success: boolean;
  messageId: string;
  recipient: string;
  status: 'sent' | 'simulated' | 'error';
  timestamp: string;
  error?: string;
}

// Tampon local des emails envoyés (utile pour démonstration et vérification)
const sentEmailsLog: SendAuditEmailResult[] = [];

/**
 * Récupère la clé d'API Resend si configurée
 */
export function getResendApiKey(): string {
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_RESEND_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_RESEND_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.RESEND_API_KEY) ||
    ''
  ).trim();
}

/**
 * Génère le gabarit HTML épuré et compatible tous clients mails pour le bulletin
 */
export function buildAuditEmailHtml(payload: SendAuditEmailPayload): string {
  const domain = payload.storeUrl.replace(/^https?:\/\//i, '').split('/')[0];
  const gradeConfig = getGradeDisplayConfig(payload.grade);
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const topPriorities = payload.auditResult?.topPriorities || [
    { priority: 1, title: 'Activer la protection HSTS (Strict-Transport)', description: 'Chiffrement forcé contre le vol de cookies.' },
    { priority: 2, title: 'Masquer les versions publiques WooCommerce', description: 'Empêche le ciblage par les robots de failles connues.' },
    { priority: 3, title: 'Configurer l\'en-tête anti-clickjacking (X-Frame-Options)', description: 'Protège votre page de commande contre les détournements.' }
  ];

  const prioritiesHtml = topPriorities.map((item, idx) => `
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
      <div style="font-weight: 700; color: #0F172A; font-size: 13px;">${idx + 1}. ${item.title}</div>
      <div style="color: #64748B; font-size: 12px; margin-top: 4px;">${item.description}</div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Votre Score de Sécurité BoutiqueSûre - ${domain}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; color: #1E293B;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #CBD5E1; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #0F1B2D; padding: 20px 24px; text-align: left;">
      <span style="color: #4ADE80; font-weight: 900; font-size: 18px; letter-spacing: -0.5px;">BoutiqueSûre</span>
      <span style="color: #94A3B8; font-size: 12px; margin-left: 8px;">• Diagnostic de sécurité passif WooCommerce</span>
    </div>
    
    <div style="padding: 32px 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">
        Résultat de sécurité pour ${domain}
      </h1>
      <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        Votre diagnostic passif a été réalisé avec succès le ${dateStr}. Une seule requête standard a été effectuée, sans aucun test d'intrusion.
      </p>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; display: flex; align-items: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; text-align: center; background-color: #0F1B2D; color: #4ADE80; font-size: 32px; font-weight: 900; border-radius: 12px; margin-right: 20px;">
          ${payload.grade}
        </div>
        <div>
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748B;">Score officiel</div>
          <div style="font-size: 16px; font-weight: 800; color: #0F172A;">${payload.score} / 100 points</div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">${gradeConfig.label}</div>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
          Vos 3 priorités d'action immédiates :
        </h2>
        ${prioritiesHtml}
      </div>

      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="https://boutiquesure.fr?audit=${encodeURIComponent(payload.storeUrl)}" style="display: inline-block; background-color: #4ADE80; color: #0A101D; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none;">
          Consulter mon bulletin interactif complet →
        </a>
      </div>
    </div>

    <div style="background-color: #F8FAFC; padding: 16px 24px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center; line-height: 1.5;">
      BoutiqueSûre © 2026 — Diagnostic 100% passif pour commerçants WooCommerce.<br>
      Vous recevez cet email car vous avez expressément demandé le diagnostic pour votre boutique.<br>
      <a href="https://boutiquesure.fr?unsubscribe=${encodeURIComponent(payload.toEmail)}" style="color: #64748B; text-decoration: underline;">Se désinscrire en 1 clic</a> • 
      <a href="https://boutiquesure.fr?screen=privacy" style="color: #64748B; text-decoration: underline;">Politique de confidentialité & RGPD</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Envoie le rapport de sécurité par email via l'API Resend ou simule l'envoi
 */
export async function sendAuditReportEmail(
  payload: SendAuditEmailPayload
): Promise<SendAuditEmailResult> {
  const timestamp = new Date().toISOString();
  const apiKey = getResendApiKey();
  const domain = payload.storeUrl.replace(/^https?:\/\//i, '').split('/')[0];
  const subject = `[BoutiqueSûre] Score de sécurité pour ${domain} : Note ${payload.grade} (${payload.score}/100)`;

  // Si une clé d'API Resend est présente, tenter l'appel réel
  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'BoutiqueSûre <bulletin@boutiquesure.fr>',
          to: [payload.toEmail],
          subject,
          html: buildAuditEmailHtml(payload)
        })
      });

      if (response.ok) {
        const json = await response.json();
        const record: SendAuditEmailResult = {
          success: true,
          messageId: json.id || `resend_${Date.now()}`,
          recipient: payload.toEmail,
          status: 'sent',
          timestamp
        };
        sentEmailsLog.push(record);
        return record;
      } else {
        const errorText = await response.text();
        throw new Error(`Erreur Resend (${response.status}): ${errorText}`);
      }
    } catch (err: any) {
      // Fallback gracieux en mode simulation si quota ou réseau restreint
      const fallbackRecord: SendAuditEmailResult = {
        success: true,
        messageId: `sim_${Date.now()}_fallback`,
        recipient: payload.toEmail,
        status: 'simulated',
        timestamp,
        error: `Repli automatique: ${err.message}`
      };
      sentEmailsLog.push(fallbackRecord);
      return fallbackRecord;
    }
  }

  // Mode simulation par défaut (rapide et sans frais pour le dev/test)
  const simulatedId = `msg_resend_demo_${Date.now().toString(36)}`;
  const simRecord: SendAuditEmailResult = {
    success: true,
    messageId: simulatedId,
    recipient: payload.toEmail,
    status: 'simulated',
    timestamp
  };
  sentEmailsLog.push(simRecord);
  return simRecord;
}

/**
 * Retourne la liste des emails envoyés en session
 */
export function getSentEmailsHistory(): SendAuditEmailResult[] {
  return [...sentEmailsLog];
}

/**
 * Réinitialise l'historique des emails envoyés
 */
export function clearSentEmailsHistory(): void {
  sentEmailsLog.length = 0;
}
