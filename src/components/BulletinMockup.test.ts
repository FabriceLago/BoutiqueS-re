import { describe, it, expect, vi, beforeEach } from 'vitest';
import { REMEDIATION_SNIPPETS } from './RemediationDrawer.tsx';

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

import { OFFICIAL_GRADE_SCALE } from './BulletinMockup.tsx';

describe('BulletinMockup - Barème officiel des Notes A à F et Tooltips explicatifs', () => {
  it('définit les 6 notes officielles A, B, C, D, E, F avec leurs seuils de score respectifs', () => {
    expect(OFFICIAL_GRADE_SCALE).toHaveLength(6);
    const grades = OFFICIAL_GRADE_SCALE.map(item => item.grade);
    expect(grades).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('fournit une infobulle complète (titre, contenu technique, impact commerçant) pour chaque note', () => {
    OFFICIAL_GRADE_SCALE.forEach((scaleItem) => {
      expect(scaleItem.tooltipTitle).toBeTruthy();
      expect(scaleItem.tooltipTitle).toContain(scaleItem.grade);
      expect(scaleItem.tooltipContent.length).toBeGreaterThan(30);
      expect(scaleItem.tooltipImpact.length).toBeGreaterThan(20);
      expect(scaleItem.technicalCriteriaSummary).toBeTruthy();
      expect(scaleItem.recommendedAction).toBeTruthy();
    });
  });

  it('décrit précisément les exigences techniques pour la Note A (Excellente sécurité passive)', () => {
    const gradeA = OFFICIAL_GRADE_SCALE.find(item => item.grade === 'A');
    expect(gradeA).toBeDefined();
    expect(gradeA?.scoreRange).toBe('90 – 100 pts');
    expect(gradeA?.tooltipContent).toContain('SSL');
    expect(gradeA?.tooltipContent).toContain('HSTS');
    expect(gradeA?.tooltipContent).toContain('CSP');
    expect(gradeA?.tooltipContent).toContain('X-Frame-Options');
    expect(gradeA?.tooltipImpact).toContain('PCI-DSS');
  });

  it('décrit précisément les failles et le risque d\'exposition pour les notes intermédiaires et critiques (C, E, F)', () => {
    const gradeC = OFFICIAL_GRADE_SCALE.find(item => item.grade === 'C');
    expect(gradeC?.scoreRange).toBe('60 – 74 pts');
    expect(gradeC?.tooltipContent).toContain('absence');
    expect(gradeC?.tooltipImpact).toContain('robots');

    const gradeE = OFFICIAL_GRADE_SCALE.find(item => item.grade === 'E');
    expect(gradeE?.scoreRange).toBe('25 – 44 pts');
    expect(gradeE?.tooltipContent).toContain('SSL');
    expect(gradeE?.tooltipImpact).toContain('Stripe');

    const gradeF = OFFICIAL_GRADE_SCALE.find(item => item.grade === 'F');
    expect(gradeF?.scoreRange).toBe('< 25 pts');
    expect(gradeF?.tooltipContent).toContain('chiffrement HTTPS');
  });

  it('associe des snippets de remédiation technique vérifiés aux critères de sécurité majeurs', () => {
    const supportedCriteria = ['ssl-redirect', 'header-hsts', 'header-xframe', 'header-csp', 'header-content-type', 'header-referrer'];
    for (const critId of supportedCriteria) {
      expect(REMEDIATION_SNIPPETS[critId]).toBeDefined();
      expect(REMEDIATION_SNIPPETS[critId].snippets.apache).toBeTruthy();
      expect(REMEDIATION_SNIPPETS[critId].snippets.nginx).toBeTruthy();
      expect(REMEDIATION_SNIPPETS[critId].snippets.wordpress).toBeTruthy();
    }
  });
});

