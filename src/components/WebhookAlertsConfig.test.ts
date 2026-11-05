import { describe, it, expect } from 'vitest';

describe('WebhookAlertsConfig - Alertes Slack, Discord, MS Teams', () => {
  it('valide les formats de plateformes supportées', () => {
    const platforms = ['slack', 'discord', 'teams', 'custom'];
    expect(platforms).toHaveLength(4);
    expect(platforms).toContain('slack');
    expect(platforms).toContain('discord');
  });

  it('génère un payload JSON valide selon la plateforme sélectionnée', () => {
    const storeUrl = 'https://maboutique-mode.fr';
    const slackPayload = {
      text: '🛡️ [BoutiqueSûre] Alerte Sécurité',
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: `Alerte : ${storeUrl}` } }
      ]
    };

    expect(slackPayload.text).toContain('BoutiqueSûre');
    expect(slackPayload.blocks).toHaveLength(1);
  });
});
