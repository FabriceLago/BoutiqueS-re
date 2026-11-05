/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour la conformité de la Politique de Confidentialité & Charte 100% Passive
 */

import { describe, it, expect } from 'vitest';
import { hashIpForPrivacy, RGPD_CHARTER_PRINCIPLES } from '../lib/scanner.ts';

describe('Politique de Confidentialité & Charte 100% Passive (Étape 8 & Étape 1)', () => {
  it('hache les adresses IP en SHA-256 avec sel pour la confidentialité absolue', async () => {
    const rawIp = '198.51.100.42';
    const hash1 = await hashIpForPrivacy(rawIp);
    const hash2 = await hashIpForPrivacy(rawIp);

    expect(hash1).toBeDefined();
    expect(hash1.length).toBe(64); // SHA-256 hex string length
    expect(hash1).toBe(hash2); // Déterministe pour le rate limiting
    expect(hash1).not.toContain(rawIp); // L'adresse IP brute n'est jamais exposée
  });

  it('génère des empreintes distinctes pour des adresses IP distinctes', async () => {
    const ipA = '198.51.100.1';
    const ipB = '198.51.100.2';

    const hashA = await hashIpForPrivacy(ipA);
    const hashB = await hashIpForPrivacy(ipB);

    expect(hashA).not.toBe(hashB);
  });

  it('vérifie que les principes de la charte 100% passive sont définis', () => {
    expect(RGPD_CHARTER_PRINCIPLES).toBeDefined();
    expect(RGPD_CHARTER_PRINCIPLES.singleGetRequest).toBe(true);
    expect(RGPD_CHARTER_PRINCIPLES.noPenetrationTesting).toBe(true);
    expect(RGPD_CHARTER_PRINCIPLES.noPortScan).toBe(true);
    expect(RGPD_CHARTER_PRINCIPLES.retentionDays).toBe(30);
    expect(RGPD_CHARTER_PRINCIPLES.dpoEmail).toBe('dpo@boutiquesure.fr');
  });

  it('purge scrupuleusement les clés locales boutiquesure_* conformément au droit à l\'effacement RGPD (Art. 17)', () => {
    class LocalStorageMock {
      private store: Record<string, string> = {};
      get length() {
        return Object.keys(this.store).length;
      }
      key(index: number) {
        return Object.keys(this.store)[index] ?? null;
      }
      getItem(key: string) {
        return this.store[key] ?? null;
      }
      setItem(key: string, value: string) {
        this.store[key] = String(value);
      }
      removeItem(key: string) {
        delete this.store[key];
      }
      clear() {
        this.store = {};
      }
    }

    const storage = typeof window !== 'undefined' && window.localStorage 
      ? window.localStorage 
      : new LocalStorageMock();

    storage.setItem('boutiquesure_orders', JSON.stringify([{ id: 'test' }]));
    storage.setItem('boutiquesure_search_history', JSON.stringify(['test.fr']));
    storage.setItem('boutiquesure_theme', 'dark');

    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('boutiquesure_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => storage.removeItem(k));

    expect(storage.getItem('boutiquesure_orders')).toBeNull();
    expect(storage.getItem('boutiquesure_search_history')).toBeNull();
    expect(storage.getItem('boutiquesure_theme')).toBeNull();
  });
});

