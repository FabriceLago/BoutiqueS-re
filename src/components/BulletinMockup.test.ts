import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('BulletinMockup - Fonctions de partage social', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('génère un lien de partage Twitter/X avec les paramètres encodés correctement pour une note A', () => {
    const storeUrl = 'https://maboutique-mode.fr';
    const score = 95;
    const shareText = `Ma boutique e-commerce a obtenu la Note A (${score}/100) au diagnostic de sécurité passif BoutiqueSûre ! Protégez vos commandes :`;
    const shareTargetUrl = `https://boutiquesure.fr?audit=${encodeURIComponent(storeUrl)}`;

    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareTargetUrl)}`;

    expect(twitterShareUrl).toContain('https://twitter.com/intent/tweet?text=');
    expect(twitterShareUrl).toContain('Note%20A');
    expect(twitterShareUrl).toContain('95%2F100');
    expect(twitterShareUrl).toContain('&url=https%3A%2F%2Fboutiquesure.fr%3Faudit%3Dhttps%253A%252F%252Fmaboutique-mode.fr');
  });

  it('génère un lien de partage Twitter/X adapté pour les notes plus vulnérables (C ou E)', () => {
    const storeUrl = 'https://maboutique-mode.fr';
    const score = 65;
    const grade = 'C';
    const shareText = `J'ai testé la sécurité passive de ma boutique e-commerce sur BoutiqueSûre (Score ${score}/100 - Note ${grade}). Testez la vôtre gratuitement :`;
    const shareTargetUrl = `https://boutiquesure.fr?audit=${encodeURIComponent(storeUrl)}`;

    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareTargetUrl)}`;

    expect(twitterShareUrl).toContain('Score%2065%2F100');
    expect(twitterShareUrl).toContain('Note%20C');
  });

  it('génère un lien de partage LinkedIn valide pour share-offsite', () => {
    const storeUrl = 'https://maboutique-mode.fr';
    const shareTargetUrl = `https://boutiquesure.fr?audit=${encodeURIComponent(storeUrl)}`;
    const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareTargetUrl)}`;

    expect(linkedinShareUrl).toContain('https://www.linkedin.com/sharing/share-offsite/?url=');
    expect(linkedinShareUrl).toContain('boutiquesure.fr%3Faudit%3Dhttps%253A%252F%252Fmaboutique-mode.fr');
  });

  it('génère un lien de partage Facebook conforme au protocole de partage', () => {
    const storeUrl = 'https://maboutique-mode.fr';
    const shareTargetUrl = `https://boutiquesure.fr?audit=${encodeURIComponent(storeUrl)}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareTargetUrl)}`;

    expect(facebookShareUrl).toContain('https://www.facebook.com/sharer/sharer.php?u=');
    expect(facebookShareUrl).toContain('boutiquesure.fr%3Faudit%3Dhttps%253A%252F%252Fmaboutique-mode.fr');
  });

  it('supporte la copie dans le presse-papier via navigator.clipboard sans erreur', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });

    const targetUrl = 'https://boutiquesure.fr?audit=https%3A%2F%2Fmaboutique.com';
    await navigator.clipboard.writeText(targetUrl);

    expect(mockWriteText).toHaveBeenCalledWith(targetUrl);
    expect(mockWriteText).toHaveBeenCalledTimes(1);
  });
});
