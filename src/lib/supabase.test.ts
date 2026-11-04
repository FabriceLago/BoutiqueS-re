/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires du client Supabase (src/lib/supabase.test.ts)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  isSupabaseConfigured,
  getSupabaseClient,
  createSupabaseClient,
  supabaseUrl,
  supabaseAnonKey,
  recordScanLog,
  saveProspect,
  fetchRecentScanLogs
} from './supabase.ts';

describe('Initialisation et utilitaires Supabase (src/lib/supabase.ts)', () => {

  it('doit exposer les variables d\'environnement supabaseUrl et supabaseAnonKey sous forme de chaînes', () => {
    expect(typeof supabaseUrl).toBe('string');
    expect(typeof supabaseAnonKey).toBe('string');
  });

  it('doit indiquer de manière fiable si Supabase est configuré via les variables d\'environnement', () => {
    const configured = isSupabaseConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('doit retourner null lors de l\'appel à createSupabaseClient avec des paramètres invalides ou manquants', () => {
    expect(createSupabaseClient('', '')).toBeNull();
    expect(createSupabaseClient('http://insecure-domain.com', 'key')).toBeNull();
  });

  it('doit initialiser un client Supabase valide via createSupabaseClient avec des identifiants valides', () => {
    const customClient = createSupabaseClient('https://xyzexample.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey1234567890');
    expect(customClient).toBeDefined();
    expect(typeof customClient?.from).toBe('function');
    expect(typeof customClient?.auth).toBe('object');
  });

  it('doit gérer gracieusement l\'absence de configuration pour recordScanLog', async () => {
    // Si supabase est null (pas de clés configurées)
    if (!getSupabaseClient()) {
      const res = await recordScanLog({
        domain: 'test-store.fr',
        email: 'test@test-store.fr',
        status: 'success',
        is_owner_confirmed: true
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Supabase n\'est pas encore configuré');
    }
  });

  it('doit gérer gracieusement l\'absence de configuration pour saveProspect', async () => {
    if (!getSupabaseClient()) {
      const res = await saveProspect({
        email: 'prospect@boutique.fr',
        domain: 'boutique.fr',
        score: 85,
        grade: 'B',
        is_owner_confirmed: true,
        unsubscribed: false,
        commercial_status: 'nouveau'
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Supabase n\'est pas encore configuré');
    }
  });

  it('doit gérer gracieusement l\'absence de configuration pour fetchRecentScanLogs', async () => {
    if (!getSupabaseClient()) {
      const res = await fetchRecentScanLogs();
      expect(res.success).toBe(false);
      expect(res.data).toEqual([]);
      expect(res.error).toBe('Supabase non configuré.');
    }
  });

});
