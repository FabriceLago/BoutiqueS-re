/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour resendService.ts (Étape 6)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  buildAuditEmailHtml, 
  sendAuditReportEmail, 
  getSentEmailsHistory, 
  clearSentEmailsHistory 
} from './resendService.ts';

describe('Resend Email Transactional Service (Étape 6)', () => {
  beforeEach(() => {
    clearSentEmailsHistory();
  });

  it('génère un gabarit HTML valide contenant la note, le score et les liens RGPD', () => {
    const html = buildAuditEmailHtml({
      toEmail: 'gerant@maboutique.fr',
      storeUrl: 'https://maboutique.fr',
      grade: 'A',
      score: 95
    });

    expect(html).toContain('BoutiqueSûre');
    expect(html).toContain('maboutique.fr');
    expect(html).toContain('95 / 100 points');
    expect(html).toContain('Excellente sécurité');
    expect(html).toContain('Se désinscrire en 1 clic');
    expect(html).toContain('Politique de confidentialité & RGPD');
  });

  it('simule avec succès l\'envoi d\'un email transactionnel et enregistre la trace', async () => {
    const result = await sendAuditReportEmail({
      toEmail: 'client@deco-paris.com',
      storeUrl: 'https://deco-paris.com',
      grade: 'C',
      score: 65
    });

    expect(result.success).toBe(true);
    expect(result.recipient).toBe('client@deco-paris.com');
    expect(result.messageId).toBeDefined();

    const history = getSentEmailsHistory();
    expect(history.length).toBe(1);
    expect(history[0].recipient).toBe('client@deco-paris.com');
  });
});
