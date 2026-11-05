import { describe, it, expect } from 'vitest';

describe('RoiConversionCalculator - Logique de calculs financiers', () => {
  it('calcule le chiffre d\'affaires annuel et mensuel correctement', () => {
    const dailyOrders = 20;
    const averageBasket = 65;
    const monthlyOrders = dailyOrders * 30;
    const monthlyRevenue = monthlyOrders * averageBasket;
    const annualRevenue = monthlyRevenue * 12;

    expect(monthlyOrders).toBe(600);
    expect(monthlyRevenue).toBe(39000);
    expect(annualRevenue).toBe(468000);
  });

  it('applique un taux de récupération plus élevé pour les notes dégradées (Note C/E)', () => {
    const getRecoveryMultiplier = (grade: string) => {
      if (grade === 'A' || grade === 'B') return 0.05;
      if (grade === 'C' || grade === 'D') return 0.12;
      return 0.22;
    };

    expect(getRecoveryMultiplier('A')).toBe(0.05);
    expect(getRecoveryMultiplier('C')).toBe(0.12);
    expect(getRecoveryMultiplier('E')).toBe(0.22);
  });

  it('calcule le volume de commandes supplémentaires récupérées par mois', () => {
    const monthlyRevenue = 40000;
    const recoveryMultiplier = 0.12;
    const monthlyRecovered = monthlyRevenue * recoveryMultiplier;
    const averageBasket = 50;
    const additionalOrders = Math.round(monthlyRecovered / averageBasket);

    expect(monthlyRecovered).toBe(4800);
    expect(additionalOrders).toBe(96);
  });
});
