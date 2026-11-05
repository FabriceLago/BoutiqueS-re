/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour l'Inspecteur des Passerelles de Paiement & PCI-DSS v4.0
 */

import { describe, it, expect } from 'vitest';
import { computePaymentGateways } from './PaymentGatewaysAudit.tsx';

describe('Inspecteur des Passerelles de Paiement & PCI-DSS v4.0', () => {
  it('calcule une isolation CSP conforme pour une boutique notée A', () => {
    const gateways = computePaymentGateways('A');
    expect(gateways.length).toBeGreaterThanOrEqual(3);

    const stripe = gateways.find(g => g.id === 'stripe');
    expect(stripe).toBeDefined();
    expect(stripe?.status).toBe('secure');
    expect(stripe?.cspIsolated).toBe(true);
    expect(stripe?.pciDssCompliance).toContain('Conforme Exigence 6.4.3');

    const paypal = gateways.find(g => g.id === 'paypal');
    expect(paypal?.status).toBe('secure');
  });

  it('alerte sur la vulnérabilité au form-jacking / Magecart pour une note E', () => {
    const gateways = computePaymentGateways('E');
    const stripe = gateways.find(g => g.id === 'stripe');
    expect(stripe).toBeDefined();
    expect(stripe?.status).toBe('danger');
    expect(stripe?.cspIsolated).toBe(false);
    expect(stripe?.pciDssCompliance).toContain('Vulnérable');
  });

  it('gère l\'état intermédiaire pour une note C', () => {
    const gateways = computePaymentGateways('C');
    const stripe = gateways.find(g => g.id === 'stripe');
    expect(stripe?.status).toBe('warning');
  });
});
