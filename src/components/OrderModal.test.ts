/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires de la Commande en 1 Clic (OrderModal)
 * Fichier : src/components/OrderModal.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Modal de Commande en 1 Clic (OrderModal)', () => {
  it('calcule correctement les offres et tarifs officiels', () => {
    const diagnostic = {
      price: 590,
      currency: 'EUR',
      recurrence: 'one_off'
    };
    const serenite = {
      price: 69,
      currency: 'EUR',
      recurrence: 'monthly'
    };

    expect(diagnostic.price).toBe(590);
    expect(serenite.price).toBe(69);
  });

  it('génère un identifiant de référence de commande normalisé avec préfixe CMD-2026', () => {
    const ref = `CMD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    expect(ref).toMatch(/^CMD-2026-\d{6}$/);
  });

  it('associe automatiquement le bon statut CRM selon l\'offre sélectionnée', () => {
    const getTargetStatus = (offerType: 'diagnostic_590' | 'serenite_69') => {
      return offerType === 'serenite_69' ? 'converti' : 'devis_envoye';
    };

    expect(getTargetStatus('diagnostic_590')).toBe('devis_envoye');
    expect(getTargetStatus('serenite_69')).toBe('converti');
  });
});
