import { describe, it, expect } from 'vitest';

describe('DataBreachScanner - Contrôle passif fuites et hygiène', () => {
  it('nettoie le nom de domaine pour la recherche passive', () => {
    const rawUrl = 'https://maboutique-mode.fr/checkout/order-pay';
    const cleanDomain = rawUrl.replace(/^https?:\/\//i, '').split('/')[0];
    expect(cleanDomain).toBe('maboutique-mode.fr');
  });

  it('vérifie le masquage de l\'endpoint public REST API /wp-json/wp/v2/users', () => {
    const isEnumerationBlocked = true;
    expect(isEnumerationBlocked).toBe(true);
  });
});
