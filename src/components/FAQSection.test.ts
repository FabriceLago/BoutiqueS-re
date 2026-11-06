/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour FAQSection (Données et logique des questions fréquentes E-Commerce)
 */

import { describe, it, expect } from 'vitest';
import { ECOMMERCE_FAQ_ITEMS, WOOCOMMERCE_FAQ_ITEMS, FAQItem } from './FAQSection';

describe('FAQSection Data & Structure', () => {
  it('contient au moins 8 questions approfondies sur la sécurité e-commerce', () => {
    expect(ECOMMERCE_FAQ_ITEMS.length).toBeGreaterThanOrEqual(8);
    expect(WOOCOMMERCE_FAQ_ITEMS).toBe(ECOMMERCE_FAQ_ITEMS);
  });

  it('couvre toutes les catégories clés (passive, business, platforms, privacy, remediation)', () => {
    const categories = new Set(ECOMMERCE_FAQ_ITEMS.map((item: FAQItem) => item.category));
    expect(categories.has('passive')).toBe(true);
    expect(categories.has('business')).toBe(true);
    expect(categories.has('platforms')).toBe(true);
    expect(categories.has('privacy')).toBe(true);
    expect(categories.has('remediation')).toBe(true);
  });

  it('répond spécifiquement aux craintes de ralentissement ou de panne de la boutique', () => {
    const impactFaq = ECOMMERCE_FAQ_ITEMS.find((item: FAQItem) => item.id === 'impact-boutique');
    expect(impactFaq).toBeDefined();
    expect(impactFaq?.question).toMatch(/ralentir|planter/i);
    expect(impactFaq?.answer).toMatch(/1 seule requête GET|zéro risque|aucun test de charge/i);
  });

  it('rappelle la charte déontologique 100% passive et l\'absence totale d\'intrusion', () => {
    const intrusionFaq = ECOMMERCE_FAQ_ITEMS.find((item: FAQItem) => item.id === 'absence-intrusion');
    expect(intrusionFaq).toBeDefined();
    expect(intrusionFaq?.answer).toMatch(/aucun port|aucun mot de passe|aucune charge utile/i);
  });

  it('explicite l\'impact sur le chiffre d\'affaires pour les boutiques de 100k€ à 500k€', () => {
    const businessFaq = ECOMMERCE_FAQ_ITEMS.find((item: FAQItem) => item.id === 'enjeu-chiffre-affaires');
    expect(businessFaq).toBeDefined();
    expect(businessFaq?.answer).toMatch(/100k€.*500k€/i);
    expect(businessFaq?.answer).toMatch(/perte|panier|carte/i);
  });

  it('garantit la stricte conformité RGPD et la confidentialité des scores', () => {
    const privacyFaq = ECOMMERCE_FAQ_ITEMS.find((item: FAQItem) => item.id === 'donnees-rgpd');
    const scoreFaq = ECOMMERCE_FAQ_ITEMS.find((item: FAQItem) => item.id === 'confidentialite-score');
    expect(privacyFaq).toBeDefined();
    expect(privacyFaq?.answer).toMatch(/RGPD|désinscription|jamais revendues/i);
    expect(scoreFaq?.answer).toMatch(/non indexé|privé/i);
  });

  it('fournit des conseils rassurants et vulgarisés en cas de mauvaise note', () => {
    const remediationFaq = ECOMMERCE_FAQ_ITEMS.find((item: FAQItem) => item.id === 'mauvaise-note-actions');
    expect(remediationFaq).toBeDefined();
    expect(remediationFaq?.answer).toMatch(/3 actions prioritaires|pas de panique|experts/i);
  });

  it('affirme la compatibilité universelle toutes plateformes (Shopify, PrestaShop, WooCommerce, Magento)', () => {
    const platformsFaq = ECOMMERCE_FAQ_ITEMS.find((item: FAQItem) => item.id === 'compatibilite-plateformes');
    expect(platformsFaq).toBeDefined();
    expect(platformsFaq?.question).toMatch(/Shopify.*PrestaShop.*WooCommerce/i);
    expect(platformsFaq?.answer).toMatch(/universel|couche réseau/i);
  });
});
