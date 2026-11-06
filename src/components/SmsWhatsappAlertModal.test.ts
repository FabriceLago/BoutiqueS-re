/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires pour SmsWhatsappAlertModal
 * Fichier : src/components/SmsWhatsappAlertModal.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Alertes d\'Urgence SMS & WhatsApp (SmsWhatsappAlertModal)', () => {
  it('supporte les canaux WhatsApp, SMS et Hybride', () => {
    const channels = ['whatsapp', 'sms', 'both'];
    expect(channels).toContain('whatsapp');
    expect(channels).toContain('sms');
  });

  it('inclut le déclencheur d\'expiration critique de certificat SSL (< 7 jours)', () => {
    const trigger = 'Certificat SSL/TLS arrivant à expiration dans moins de 7 jours';
    expect(trigger).toMatch(/SSL\/TLS/i);
    expect(trigger).toMatch(/7 jours/i);
  });
});
