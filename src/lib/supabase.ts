/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Initialisation du client Supabase (Étape 6)
 * Fichier : src/lib/supabase.ts
 *
 * Gère la connectivité à la base de données PostgreSQL / Supabase,
 * l'authentification et la persistance des journaux d'analyse (scan_logs)
 * et des prospects (prospects).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Schéma de la table `scan_logs` (Traçabilité déontologique 100% passive)
 */
export interface ScanLogRow {
  id: string;
  domain: string;
  email: string;
  status: 'success' | 'failed' | 'rate_limited' | 'error';
  is_owner_confirmed: boolean;
  ip_hash?: string | null;
  score?: number | null;
  grade?: string | null;
  error_message?: string | null;
  created_at: string;
}

export type ScanLogInsert = Omit<ScanLogRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

/**
 * Schéma de la table `prospects` (Lead generation WooCommerce)
 */
export interface ProspectRow {
  id: string;
  email: string;
  domain: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  is_owner_confirmed: boolean;
  turnover_bracket?: '100k_250k' | '250k_500k';
  unsubscribed: boolean;
  commercial_status: 'nouveau' | 'contacte' | 'devis_envoye' | 'converti' | 'sans_suite';
  notes?: string | null;
  created_at: string;
  last_scan_date: string;
}

export type ProspectInsert = Omit<ProspectRow, 'id' | 'created_at' | 'last_scan_date'> & {
  id?: string;
  created_at?: string;
  last_scan_date?: string;
};

/**
 * Schéma de la table `rate_limits` (Protection anti-abus : 3 scans par 24h par IP)
 */
export interface RateLimitRow {
  id: string;
  ip_hash: string;
  target_domain: string;
  request_count: number;
  window_start: string;
  last_request: string;
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * Définition générique du schéma Supabase Database (conforme Supabase v2)
 */
export interface Database {
  public: {
    Tables: {
      scan_logs: {
        Row: ScanLogRow;
        Insert: ScanLogInsert;
        Update: Partial<ScanLogInsert>;
        Relationships: [];
      };
      prospects: {
        Row: ProspectRow;
        Insert: ProspectInsert;
        Update: Partial<ProspectInsert>;
        Relationships: [];
      };
      rate_limits: {
        Row: RateLimitRow;
        Insert: Omit<RateLimitRow, 'id'> & { id?: string };
        Update: Partial<Omit<RateLimitRow, 'id'>>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/**
 * Variables d'environnement pour Supabase (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY)
 */
export const supabaseUrl: string = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  ''
).trim();

export const supabaseAnonKey: string = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  ''
).trim();

/**
 * Détermine si Supabase dispose de variables d'environnement valides
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
}

/**
 * Fabrique un client Supabase avec options personnalisées ou valeurs d'environnement
 */
export function createSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const targetUrl = url || supabaseUrl;
  const targetKey = anonKey || supabaseAnonKey;

  if (!targetUrl || !targetKey || !targetUrl.startsWith('https://')) {
    return null;
  }

  return createClient(targetUrl, targetKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Instance principale du client Supabase initialisée avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
 * (vaut null si les variables d'environnement ne sont pas encore configurées)
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Accesseur sécurisé garantissant l'accès au client Supabase
 */
export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

/**
 * Enregistre une tentative d'analyse dans la table `scan_logs` de Supabase
 */
export async function recordScanLog(
  log: ScanLogInsert
): Promise<{ success: boolean; data?: ScanLogRow; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase n\'est pas encore configuré (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquants).'
    };
  }

  try {
    const { data, error } = await supabase
      .from('scan_logs')
      .insert({
        domain: log.domain.toLowerCase().trim(),
        email: log.email.toLowerCase().trim(),
        status: log.status,
        is_owner_confirmed: log.is_owner_confirmed,
        ip_hash: log.ip_hash || null,
        score: log.score ?? null,
        grade: log.grade ?? null,
        error_message: log.error_message ?? null,
        created_at: log.created_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ScanLogRow };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur inconnue lors de l\'enregistrement du log.' };
  }
}

/**
 * Enregistre ou met à jour un prospect WooCommerce dans la table `prospects`
 */
export async function saveProspect(
  prospect: ProspectInsert
): Promise<{ success: boolean; data?: ProspectRow; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase n\'est pas encore configuré (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquants).'
    };
  }

  try {
    const now = new Date().toISOString();
    const payload = {
      email: prospect.email.toLowerCase().trim(),
      domain: prospect.domain.toLowerCase().trim(),
      score: prospect.score,
      grade: prospect.grade,
      is_owner_confirmed: prospect.is_owner_confirmed,
      turnover_bracket: prospect.turnover_bracket || '100k_250k',
      unsubscribed: prospect.unsubscribed ?? false,
      commercial_status: prospect.commercial_status || 'nouveau',
      notes: prospect.notes || null,
      last_scan_date: now
    };

    const { data, error } = await supabase
      .from('prospects')
      .upsert(payload, { onConflict: 'email,domain' })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ProspectRow };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur lors de l\'enregistrement du prospect.' };
  }
}

/**
 * Récupère les logs récents d'analyse pour le journal de bord
 */
export async function fetchRecentScanLogs(
  limit: number = 50
): Promise<{ success: boolean; data: ScanLogRow[]; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      data: [],
      error: 'Supabase non configuré.'
    };
  }

  try {
    const { data, error } = await supabase
      .from('scan_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: (data as ScanLogRow[]) || [] };
  } catch (err: any) {
    return { success: false, data: [], error: err.message || 'Erreur lors de la récupération des logs.' };
  }
}
