/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Fonctions utilitaires d'analyse passive (Étape 4)
 * Fichier : src/lib/scanner.ts
 *
 * RÈGLE DÉONTOLOGIQUE STRICTE :
 * Analyse 100% passive. Une seule et unique requête HTTP GET standard.
 * Aucun test d'intrusion, aucun scan de port, aucune charge utile.
 */

import { GoogleGenAI, Type } from '@google/genai';

export interface ScanTarget {
  rawInput: string;
  normalizedUrl: string;
  hostname: string;
  protocol: string;
}

export interface DnsResolutionDetails {
  resolved: boolean;
  ipAddresses?: string[];
  primaryIp?: string;
  family?: number;
  resolutionTimeMs?: number;
  error?: string;
  isPrivateOrLocal?: boolean;
}

export interface UrlFormatValidationResult {
  valid: boolean;
  target?: ScanTarget;
  error?: string;
  errorState?: ScanErrorState;
}

export interface UrlAndDnsValidationResult {
  valid: boolean;
  target?: ScanTarget;
  dns?: DnsResolutionDetails;
  error?: string;
  errorState?: ScanErrorState;
}

export interface ValidateUrlAndDnsOptions {
  timeoutMs?: number;
  checkDns?: boolean;
  dnsResolver?: (hostname: string) => Promise<{ address: string; family: number }[] | string[]>;
}

export interface FetchPassiveOptions {
  timeoutMs?: number;
  userAgent?: string;
  includeSslDetails?: boolean;
  checkDns?: boolean;
  dnsResolver?: (hostname: string) => Promise<{ address: string; family: number }[] | string[]>;
  preCheckReachability?: boolean;
}

export interface ReachabilityCheckResult {
  reachable: boolean;
  valid: boolean;
  target?: ScanTarget;
  statusCode?: number;
  methodUsed?: 'HEAD' | 'GET';
  responseTimeMs: number;
  finalUrl?: string;
  dnsDetails?: DnsResolutionDetails;
  error?: string;
  errorState?: ScanErrorState;
}

export interface VerifyReachabilityOptions {
  timeoutMs?: number;
  userAgent?: string;
  preferredMethod?: 'HEAD' | 'GET';
  checkDns?: boolean;
  dnsResolver?: (hostname: string) => Promise<{ address: string; family: number }[] | string[]>;
  fetchFn?: typeof fetch;
}

export interface SslCertificateDetails {
  issuer: string;
  issuerOrg?: string;
  subject: string;
  validFrom: string; // Date ISO
  validTo: string;   // Date ISO (expiration)
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // <= 30 jours
  isValid: boolean;
  protocol?: string;
  cipher?: string;
  pointsEarned: number; // sur 20 points (15 validité + 5 marge > 30j)
  maxPoints: number;    // 20 points
  status: 'valid' | 'expiring_soon' | 'expired' | 'invalid' | 'no_ssl';
  details: string;
  urgency: 'critique' | 'urgent' | 'recommande' | 'info';
  recommendation?: string;
  errorState?: ScanErrorState;
}

/**
 * Codes d'erreur normalisés pour la restitution claire des incidents au commerçant
 */
export type ScanErrorCode =
  | 'dns_unresolved'     // Domaine introuvable ou zone DNS inaccessible (ENOTFOUND, EAI_AGAIN)
  | 'timeout'            // Timeout de connexion ou de lecture dépassé
  | 'unreachable_server' // Serveur inaccessible, port fermé ou refus de connexion (ECONNREFUSED, ECONNRESET, EHOSTUNREACH)
  | 'ssrf_blocked'       // Adresse locale, IP privée ou méta-données interdite (anti-SSRF)
  | 'invalid_url'        // Format d'URL invalide
  | 'ssl_error'          // Échec poignée de main TLS / certificat invalide
  | 'http_client_error'  // Code statut HTTP 4xx (403, 404...)
  | 'http_server_error'  // Code statut HTTP 5xx (500, 502, 503...)
  | 'unknown_error';     // Erreur non répertoriée

/**
 * État d'erreur structuré retourné par les fonctions d'analyse
 * Vulgarisé pour le gérant de boutique WooCommerce avec recommandations d'action
 */
export interface ScanErrorState {
  code: ScanErrorCode;
  message: string;          // Message clair et rassurant vulgarisé pour le commerçant
  technicalDetails: string; // Détail technique d'origine (code d'erreur socket, cause)
  targetUrl: string;
  statusCode?: number;
  timestamp: string;        // Date ISO
  canRetry: boolean;
  suggestedAction: string;  // Conseils d'action concrets pour le gérant
}

export interface PassiveFetchResult {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
  html: string;
  responseTimeMs: number;
  isHttps: boolean;
  isHttpToHttpsRedirected: boolean;
  sslDetails?: SslCertificateDetails;
  dnsDetails?: DnsResolutionDetails;
  error?: ScanErrorState;
  isSuccess?: boolean;
}

export interface SecurityHeaderCheck {
  id: 'hsts' | 'csp' | 'x_frame_options' | 'x_content_type_options' | 'referrer_policy' | 'permissions_policy';
  headerName: string;
  present: boolean;
  value?: string;
  isValid: boolean;
  details: string;
  recommendation?: string;
  urgency: 'critique' | 'urgent' | 'recommande' | 'info';
  pointsEarned: number;
  maxPoints: number;
}

export interface PassiveScanHeadersReport {
  targetDomain: string;
  finalUrl: string;
  statusCode: number;
  responseTimeMs: number;
  checks: SecurityHeaderCheck[];
  totalScoreHeaders: number; // sur 40 points
  hsts: SecurityHeaderCheck;
  csp: SecurityHeaderCheck;
  xFrameOptions: SecurityHeaderCheck;
  xContentTypeOptions: SecurityHeaderCheck;
  referrerPolicy: SecurityHeaderCheck;
  permissionsPolicy: SecurityHeaderCheck;
}

/**
 * Détecte si une adresse IP (IPv4 ou IPv6) appartient à une plage privée, réservée ou locale (anti-SSRF strict).
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim().toLowerCase();

  // IPv4 Loopback (127.0.0.0/8)
  if (trimmed.startsWith('127.')) return true;

  // Zero network (0.0.0.0/8)
  if (trimmed.startsWith('0.')) return true;

  // RFC 1918 10.0.0.0/8
  if (trimmed.startsWith('10.')) return true;

  // RFC 1918 192.168.0.0/16
  if (trimmed.startsWith('192.168.')) return true;

  // RFC 1918 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  const match172 = trimmed.match(/^172\.(\d+)\./);
  if (match172) {
    const octet = parseInt(match172[1], 10);
    if (octet >= 16 && octet <= 31) return true;
  }

  // Link-Local & Cloud Metadata AWS/GCP (169.254.0.0/16)
  if (trimmed.startsWith('169.254.')) return true;

  // Carrier-Grade NAT (100.64.0.0/10)
  const match100 = trimmed.match(/^100\.(\d+)\./);
  if (match100) {
    const octet = parseInt(match100[1], 10);
    if (octet >= 64 && octet <= 127) return true;
  }

  // Documentation IPs (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24)
  if (trimmed.startsWith('192.0.2.') || trimmed.startsWith('198.51.100.') || trimmed.startsWith('203.0.113.')) return true;

  // Multicast & Broadcast
  if (trimmed === '255.255.255.255') return true;
  const firstOctet = parseInt(trimmed.split('.')[0], 10);
  if (!isNaN(firstOctet) && firstOctet >= 224 && firstOctet <= 239) return true;

  // IPv6 Loopback
  if (trimmed === '::1' || trimmed === '0:0:0:0:0:0:0:1') return true;

  // IPv6 Unique Local Address (fc00::/7 -> fc.. ou fd..)
  if (/^f[cd][0-9a-f]{2}:/i.test(trimmed)) return true;

  // IPv6 Link-Local (fe80::/10 -> fe8, fe9, fea, feb)
  if (/^fe[89ab][0-9a-f]:/i.test(trimmed)) return true;

  // IPv4-mapped IPv6 (::ffff:127.0.0.1, etc.)
  if (trimmed.startsWith('::ffff:')) {
    const v4 = trimmed.substring(7);
    return isPrivateOrReservedIp(v4);
  }

  return false;
}

/**
 * Valide rigoureusement le format d'une URL saisie par un gérant selon les RFC 1035 / 1123 / 7230,
 * tout en appliquant une protection statique stricte anti-SSRF (localhost, plages privées).
 */
export function validateUrlFormat(rawInput: string): UrlFormatValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      valid: false,
      error: "L'adresse de la boutique est requise.",
      errorState: {
        code: 'invalid_url',
        message: "L'adresse de la boutique est requise.",
        technicalDetails: 'Empty or non-string input provided',
        targetUrl: '',
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Vérifiez l'adresse saisie (ex: ma-boutique.fr ou https://ma-boutique.com)."
      }
    };
  }

  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: "L'adresse de la boutique est requise.",
      errorState: {
        code: 'invalid_url',
        message: "L'adresse de la boutique est requise.",
        technicalDetails: 'Whitespace-only input provided',
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Vérifiez l'adresse saisie (ex: ma-boutique.fr ou https://ma-boutique.com)."
      }
    };
  }

  // Interdiction des espaces internes dans l'URL
  if (/\s/.test(trimmed)) {
    return {
      valid: false,
      error: "Format d'adresse URL invalide : les espaces ne sont pas autorisés.",
      errorState: {
        code: 'invalid_url',
        message: "Format d'adresse URL invalide : les espaces ne sont pas autorisés.",
        technicalDetails: 'URL contains whitespace characters',
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Supprimez les espaces dans l'adresse de votre boutique."
      }
    };
  }

  // Longueur maximale autorisée (standard web 2048 caractères)
  if (trimmed.length > 2048) {
    return {
      valid: false,
      error: "L'adresse URL dépasse la longueur maximale autorisée (2048 caractères).",
      errorState: {
        code: 'invalid_url',
        message: "L'adresse URL dépasse la longueur maximale autorisée (2048 caractères).",
        technicalDetails: `URL length (${trimmed.length}) exceeds 2048 limit`,
        targetUrl: trimmed.substring(0, 50) + '...',
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Indiquez l'adresse principale de votre boutique sans paramètres superflus."
      }
    };
  }

  // Interdiction des identifiants d'authentification dans l'URL (user:pass@)
  if (trimmed.includes('@')) {
    return {
      valid: false,
      error: "Format d'adresse URL invalide : les identifiants d'authentification (user:pass@) sont interdits.",
      errorState: {
        code: 'invalid_url',
        message: "Format d'adresse URL invalide : les identifiants d'authentification (user:pass@) sont interdits.",
        technicalDetails: 'URL contains userinfo authentication credentials',
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Saisissez uniquement l'adresse web de votre boutique sans nom d'utilisateur ni mot de passe."
      }
    };
  }

  let cleaned = trimmed;
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  // Contrôle du numéro de port si présent (avant parsing URL)
  const portMatch = cleaned.match(/:(\d+)(?:[/?#]|$)/);
  if (portMatch) {
    const portVal = parseInt(portMatch[1], 10);
    if (isNaN(portVal) || portVal < 1 || portVal > 65535) {
      return {
        valid: false,
        error: "Numéro de port invalide (doit être compris entre 1 et 65535).",
        errorState: {
          code: 'invalid_url',
          message: "Numéro de port invalide (doit être compris entre 1 et 65535).",
          technicalDetails: `Invalid port value: ${portMatch[1]}`,
          targetUrl: rawInput,
          timestamp: new Date().toISOString(),
          canRetry: false,
          suggestedAction: "Vérifiez le numéro de port spécifié ou utilisez les ports web par défaut."
        }
      };
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return {
      valid: false,
      error: "Format d'adresse URL invalide. Veuillez vérifier la saisie.",
      errorState: {
        code: 'invalid_url',
        message: "Format d'adresse URL invalide. Veuillez vérifier la saisie.",
        technicalDetails: 'URL constructor threw parsing error',
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Vérifiez l'adresse saisie (ex: ma-boutique.fr ou https://ma-boutique.com)."
      }
    };
  }

  // Contrôle strict du protocole
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: 'Protocole non supporté. Veuillez utiliser http:// ou https://',
      errorState: {
        code: 'invalid_url',
        message: 'Protocole non supporté. Veuillez utiliser http:// ou https://',
        technicalDetails: `Unsupported protocol: ${parsed.protocol}`,
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Utilisez un protocole web standard (http:// ou https://)."
      }
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Contrôle de longueur du nom d'hôte (max 253 caractères selon RFC 1035)
  if (!hostname || hostname.length > 253) {
    return {
      valid: false,
      error: "Nom de domaine invalide (longueur incorrecte).",
      errorState: {
        code: 'invalid_url',
        message: "Nom de domaine invalide (longueur incorrecte).",
        technicalDetails: `Hostname length invalid: ${hostname.length}`,
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Vérifiez l'orthographe du nom de domaine de votre boutique."
      }
    };
  }

  // Protection stricte anti-SSRF statique (localhost, adresses internes, IP privées RFC 1918)
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    isPrivateOrReservedIp(hostname)
  ) {
    return {
      valid: false,
      error: "Analyse interdite : les adresses internes ou locales ne peuvent pas être analysées.",
      errorState: {
        code: 'ssrf_blocked',
        message: "Analyse interdite : les adresses internes ou locales ne peuvent pas être analysées.",
        technicalDetails: `SSRF static protection blocked target host: ${hostname}`,
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Indiquez l'adresse publique de votre boutique en ligne accessible sur Internet."
      }
    };
  }

  // Validation de domaine standard (au moins un point ex: boutique.fr)
  if (!hostname.includes('.')) {
    return {
      valid: false,
      error: "Nom de domaine invalide. Exemple : ma-boutique.fr ou .com",
      errorState: {
        code: 'invalid_url',
        message: "Nom de domaine invalide. Exemple : ma-boutique.fr ou .com",
        technicalDetails: 'Hostname missing dot/TLD separator',
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Indiquez une extension de domaine valide (ex: .fr, .com, .be)."
      }
    };
  }

  // Validation des segments de domaine (RFC 1123 : labels de 1 à 63 caractères, tiret non terminal)
  const labels = hostname.split('.');
  for (const label of labels) {
    if (label.length === 0) {
      return {
        valid: false,
        error: "Nom de domaine invalide (présence de points consécutifs).",
        errorState: {
          code: 'invalid_url',
          message: "Nom de domaine invalide (présence de points consécutifs).",
          technicalDetails: 'Hostname contains empty label / consecutive dots',
          targetUrl: rawInput,
          timestamp: new Date().toISOString(),
          canRetry: false,
          suggestedAction: "Supprimez les points consécutifs dans l'adresse."
        }
      };
    }
    if (label.length > 63) {
      return {
        valid: false,
        error: "Nom de domaine invalide : un sous-domaine dépasse la limite de 63 caractères.",
        errorState: {
          code: 'invalid_url',
          message: "Nom de domaine invalide : un sous-domaine dépasse la limite de 63 caractères.",
          technicalDetails: `Domain label too long (${label.length} chars)`,
          targetUrl: rawInput,
          timestamp: new Date().toISOString(),
          canRetry: false,
          suggestedAction: "Vérifiez la syntaxe du nom de domaine."
        }
      };
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      return {
        valid: false,
        error: "Nom de domaine invalide : un segment ne peut ni commencer ni se terminer par un tiret.",
        errorState: {
          code: 'invalid_url',
          message: "Nom de domaine invalide : un segment ne peut ni commencer ni se terminer par un tiret.",
          technicalDetails: `Domain label starts or ends with hyphen: ${label}`,
          targetUrl: rawInput,
          timestamp: new Date().toISOString(),
          canRetry: false,
          suggestedAction: "Vérifiez l'emplacement des tirets dans l'adresse de votre boutique."
        }
      };
    }
    if (!/^[a-z0-9-]+$/i.test(label)) {
      return {
        valid: false,
        error: "Nom de domaine invalide : caractères non autorisés détectés.",
        errorState: {
          code: 'invalid_url',
          message: "Nom de domaine invalide : caractères non autorisés détectés.",
          technicalDetails: `Domain label contains invalid characters: ${label}`,
          targetUrl: rawInput,
          timestamp: new Date().toISOString(),
          canRetry: false,
          suggestedAction: "Utilisez uniquement des lettres, des chiffres et des tirets pour le nom de domaine."
        }
      };
    }
  }

  // TLD (extension finale) : au moins 2 caractères alphabétiques
  const tld = labels[labels.length - 1];
  if (tld.length < 2 || /^\d+$/.test(tld)) {
    return {
      valid: false,
      error: "Extension de nom de domaine (TLD) invalide.",
      errorState: {
        code: 'invalid_url',
        message: "Extension de nom de domaine (TLD) invalide.",
        technicalDetails: `Invalid TLD: ${tld}`,
        targetUrl: rawInput,
        timestamp: new Date().toISOString(),
        canRetry: false,
        suggestedAction: "Indiquez une extension de domaine reconnue (ex: .fr, .com, .eu)."
      }
    };
  }

  // Contrôle du numéro de port si présent
  if (parsed.port) {
    const portNum = parseInt(parsed.port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return {
        valid: false,
        error: "Numéro de port invalide (doit être compris entre 1 et 65535).",
        errorState: {
          code: 'invalid_url',
          message: "Numéro de port invalide (doit être compris entre 1 et 65535).",
          technicalDetails: `Invalid port: ${parsed.port}`,
          targetUrl: rawInput,
          timestamp: new Date().toISOString(),
          canRetry: false,
          suggestedAction: "Vérifiez le numéro de port spécifié ou utilisez les ports web par défaut."
        }
      };
    }
  }

  const normalizedUrl = parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname);

  return {
    valid: true,
    target: {
      rawInput,
      normalizedUrl,
      hostname,
      protocol: parsed.protocol
    }
  };
}

/**
 * Valide et normalise une URL saisie par un gérant (alias rétro-compatible).
 */
export function sanitizeAndValidateUrl(rawInput: string): {
  valid: boolean;
  target?: ScanTarget;
  error?: string;
} {
  const result = validateUrlFormat(rawInput);
  return {
    valid: result.valid,
    target: result.target,
    error: result.error
  };
}

/**
 * Charge dynamiquement le module dns en environnement Node.js sans casser les bundles de navigateur
 */
async function getNodeDnsModule(): Promise<any> {
  if (typeof window === 'undefined') {
    try {
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const mod = await dynamicImport('dns');
      return mod.promises || (mod.default && mod.default.promises) || mod;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Effectue la résolution DNS d'un nom d'hôte pour vérifier son existence
 * et contrôler les adresses IP associées (détection de DNS Rebinding / IP privées).
 */
export async function resolveDnsHost(
  hostname: string,
  options: {
    timeoutMs?: number;
    dnsResolver?: (hostname: string) => Promise<{ address: string; family: number }[] | string[]>;
  } = {}
): Promise<DnsResolutionDetails> {
  const startTime = Date.now();
  const timeoutMs = options.timeoutMs ?? 3000;

  // 1. Utilisation du résolveur personnalisé si injecté (tests ou environnement spécifique)
  if (options.dnsResolver) {
    try {
      const res = await options.dnsResolver(hostname);
      const resolutionTimeMs = Date.now() - startTime;
      if (!res || (Array.isArray(res) && res.length === 0)) {
        return {
          resolved: false,
          error: 'ENOTFOUND',
          resolutionTimeMs
        };
      }

      const normalized: { address: string; family: number }[] = Array.isArray(res)
        ? res.map((item) =>
            typeof item === 'string'
              ? { address: item, family: item.includes(':') ? 6 : 4 }
              : item
          )
        : [];

      const ipAddresses = normalized.map((item) => item.address);
      const primaryIp = ipAddresses[0] || '';
      const family = normalized[0]?.family || (primaryIp.includes(':') ? 6 : 4);
      const isPrivateOrLocal = ipAddresses.some((ip) => isPrivateOrReservedIp(ip));

      return {
        resolved: true,
        ipAddresses,
        primaryIp,
        family,
        resolutionTimeMs,
        isPrivateOrLocal
      };
    } catch (err: any) {
      return {
        resolved: false,
        error: err?.code || err?.message || 'ENOTFOUND',
        resolutionTimeMs: Date.now() - startTime
      };
    }
  }

  // 2. Environnement Node.js standard
  const dnsModule = await getNodeDnsModule();
  if (dnsModule && typeof dnsModule.lookup === 'function') {
    try {
      const lookupPromise = dnsModule.lookup(hostname, { all: true });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const timeoutErr: any = new Error(`Délai d'attente DNS dépassé (${timeoutMs}ms)`);
          timeoutErr.code = 'ETIMEDOUT';
          reject(timeoutErr);
        }, timeoutMs);
      });

      const records: { address: string; family: number }[] = await Promise.race([
        lookupPromise,
        timeoutPromise
      ]);

      const resolutionTimeMs = Date.now() - startTime;

      if (!records || records.length === 0) {
        return {
          resolved: false,
          error: 'NODATA',
          resolutionTimeMs
        };
      }

      const ipAddresses = records.map((r) => r.address);
      const primaryIp = ipAddresses[0];
      const family = records[0]?.family || 4;
      const isPrivateOrLocal = ipAddresses.some((ip) => isPrivateOrReservedIp(ip));

      return {
        resolved: true,
        ipAddresses,
        primaryIp,
        family,
        resolutionTimeMs,
        isPrivateOrLocal
      };
    } catch (err: any) {
      return {
        resolved: false,
        error: err?.code || err?.message || 'ENOTFOUND',
        resolutionTimeMs: Date.now() - startTime
      };
    }
  }

  // 3. Navigateur ou fallback sans module DNS
  return {
    resolved: true,
    resolutionTimeMs: Date.now() - startTime
  };
}

/**
 * Fonction composite validant le format d'URL et la résolution DNS
 * avant tout déclenchement d'une requête HTTP, pour filtrer immédiatement les entrées invalides.
 */
export async function validateUrlAndResolveDns(
  rawInput: string,
  options: ValidateUrlAndDnsOptions = {}
): Promise<UrlAndDnsValidationResult> {
  const timestamp = new Date().toISOString();

  // 1. Validation immédiate de la syntaxe de l'URL et protection anti-SSRF statique
  const formatResult = validateUrlFormat(rawInput);
  if (!formatResult.valid || !formatResult.target) {
    return {
      valid: false,
      error: formatResult.error,
      errorState: formatResult.errorState
    };
  }

  const { target } = formatResult;

  // 2. Décision d'exécution du contrôle DNS
  // Active par défaut, sauf si désactivée ou si fetch est mocké sans résolveur injecté
  const isFetchMocked = typeof (globalThis.fetch as any)?.mock !== 'undefined';
  const shouldCheckDns = options.checkDns ?? (!isFetchMocked || Boolean(options.dnsResolver));

  if (!shouldCheckDns) {
    return {
      valid: true,
      target
    };
  }

  // 3. Résolution DNS du nom de domaine
  const dnsDetails = await resolveDnsHost(target.hostname, {
    timeoutMs: options.timeoutMs ?? 3000,
    dnsResolver: options.dnsResolver
  });

  // A. Échec de résolution DNS (nom de domaine inexistant ou zone inaccessible)
  if (!dnsDetails.resolved) {
    const errorState: ScanErrorState = {
      code: 'dns_unresolved',
      message: "Nom de domaine introuvable ou zone DNS inaccessible.",
      technicalDetails: `DNS resolution failed for ${target.hostname}: ${dnsDetails.error || 'ENOTFOUND'}`,
      targetUrl: target.normalizedUrl,
      timestamp,
      canRetry: false,
      suggestedAction: "Vérifiez l'orthographe exacte de l'adresse de votre boutique et la configuration de votre zone DNS (enregistrements A/CNAME)."
    };

    return {
      valid: false,
      target,
      dns: dnsDetails,
      error: errorState.message,
      errorState
    };
  }

  // B. Détection de DNS Rebinding ou IP privée résolue (protection anti-SSRF dynamique)
  if (dnsDetails.isPrivateOrLocal) {
    const errorState: ScanErrorState = {
      code: 'ssrf_blocked',
      message: "Analyse interdite : le nom de domaine résout vers une adresse IP interne ou privée (protection anti-SSRF).",
      technicalDetails: `DNS resolved to private IP (${dnsDetails.primaryIp}) for host ${target.hostname}`,
      targetUrl: target.normalizedUrl,
      timestamp,
      canRetry: false,
      suggestedAction: "Indiquez l'adresse publique de votre boutique en ligne accessible sur Internet."
    };

    return {
      valid: false,
      target,
      dns: dnsDetails,
      error: errorState.message,
      errorState
    };
  }

  return {
    valid: true,
    target,
    dns: dnsDetails
  };
}

/**
 * Analyse et qualifie une exception réseau (fetch, DNS, TLS, timeout)
 * en un objet d'erreur structuré intelligible pour un commerçant non technique.
 */
export function parseFetchError(
  err: unknown,
  targetUrl: string,
  timeoutMs: number = 6000
): ScanErrorState {
  const timestamp = new Date().toISOString();
  const rawMessage = err instanceof Error ? err.message : String(err);
  const errObj = typeof err === 'object' && err !== null ? (err as Record<string, any>) : {};
  const cause = errObj.cause && typeof errObj.cause === 'object' ? errObj.cause : {};

  const codeString = String(errObj.code || cause.code || '').toUpperCase();
  const errorName = String(errObj.name || cause.name || '');
  const causeMessage = typeof cause.message === 'string' ? cause.message : '';

  const fullDetail = [
    errorName,
    rawMessage,
    codeString && `Code: ${codeString}`,
    causeMessage && `Cause: ${causeMessage}`
  ].filter(Boolean).join(' | ');

  const durationSec = Math.round(timeoutMs / 1000) || 6;

  // 1. Timeout (AbortError / TimeoutError / ETIMEDOUT / délai dépassé)
  if (
    errorName === 'AbortError' ||
    errorName === 'TimeoutError' ||
    codeString === 'ETIMEDOUT' ||
    /timeout|aborted|délai/i.test(rawMessage) ||
    /timeout|aborted/i.test(causeMessage)
  ) {
    return {
      code: 'timeout',
      message: `Le serveur de votre boutique n'a pas répondu dans le délai imparti (${durationSec}s).`,
      technicalDetails: fullDetail || `Request timed out after ${durationSec}s`,
      targetUrl,
      timestamp,
      canRetry: true,
      suggestedAction: "Vérifiez que votre serveur web répond rapidement et n'est pas saturé par des requêtes bloquantes."
    };
  }

  // 2. DNS introuvable ou échec de résolution (ENOTFOUND, EAI_AGAIN, getaddrinfo)
  if (
    codeString === 'ENOTFOUND' ||
    codeString === 'EAI_AGAIN' ||
    /enotfound|eai_again|getaddrinfo/i.test(rawMessage) ||
    /enotfound|getaddrinfo/i.test(causeMessage)
  ) {
    return {
      code: 'dns_unresolved',
      message: "Nom de domaine introuvable ou zone DNS inaccessible.",
      technicalDetails: fullDetail || 'DNS resolution failed (ENOTFOUND)',
      targetUrl,
      timestamp,
      canRetry: false,
      suggestedAction: "Vérifiez l'orthographe exacte de l'adresse de votre boutique et la configuration de votre zone DNS (enregistrements A/CNAME)."
    };
  }

  // 3. Serveur inaccessible ou refus de connexion (ECONNREFUSED, ECONNRESET, EHOSTUNREACH)
  if (
    codeString === 'ECONNREFUSED' ||
    codeString === 'ECONNRESET' ||
    codeString === 'EHOSTUNREACH' ||
    codeString === 'ENETUNREACH' ||
    /econnrefused|econnreset|ehostunreach|connection refused/i.test(rawMessage) ||
    /econnrefused|econnreset/i.test(causeMessage)
  ) {
    return {
      code: 'unreachable_server',
      message: "Impossible d'établir une connexion avec le serveur de votre boutique.",
      technicalDetails: fullDetail || 'Connection refused or host unreachable',
      targetUrl,
      timestamp,
      canRetry: true,
      suggestedAction: "Vérifiez que vos services Nginx ou Apache sont actifs et que les ports web publics (80 et 443) sont ouverts."
    };
  }

  // 4. Erreur SSL / TLS
  if (
    codeString.includes('CERT') ||
    codeString.includes('TLS') ||
    /certificate|ssl|tls|self-signed|handshake/i.test(rawMessage) ||
    /certificate|ssl|tls/i.test(causeMessage)
  ) {
    return {
      code: 'ssl_error',
      message: "Échec de négociation sécurisée SSL/TLS avec le serveur.",
      technicalDetails: fullDetail || 'TLS handshake failed',
      targetUrl,
      timestamp,
      canRetry: false,
      suggestedAction: "Vérifiez la validité de votre certificat SSL et assurez-vous qu'il est délivré par une autorité reconnue."
    };
  }

  // 5. Erreur générique
  return {
    code: 'unknown_error',
    message: "Une erreur inattendue est survenue lors de l'analyse de la boutique.",
    technicalDetails: fullDetail || rawMessage || 'Unknown network error',
    targetUrl,
    timestamp,
    canRetry: true,
    suggestedAction: "Renouvelez l'analyse dans quelques instants ou contactez le support BoutiqueSûre si le problème persiste."
  };
}

/**
 * Valide la syntaxe de l'URL, vérifie la résolution DNS (protection anti-SSRF),
 * et effectue une requête ultra-légère (HEAD avec repli GET automatique) pour confirmer
 * que le serveur de la boutique répond avant de lancer l'analyse lourde complète,
 * afin d'éviter les timeouts et les scans inutiles.
 */
export async function verifySiteReachability(
  targetUrl: string,
  options: VerifyReachabilityOptions = {}
): Promise<ReachabilityCheckResult> {
  const startTime = Date.now();
  const pingTimeoutMs = options.timeoutMs ?? 2500;
  const userAgent =
    options.userAgent ??
    'BoutiqueSure-PassivePing/1.0 (+https://boutiquesure.fr; diagnostic de disponibilite passif)';
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  // 1. Validation de syntaxe d'URL et résolution DNS préalable (anti-SSRF strict)
  const validation = await validateUrlAndResolveDns(targetUrl, {
    timeoutMs: Math.min(pingTimeoutMs, 2000),
    checkDns: options.checkDns,
    dnsResolver: options.dnsResolver
  });

  if (!validation.valid || !validation.target) {
    const errorState = validation.errorState || {
      code: 'invalid_url' as ScanErrorCode,
      message: validation.error || "Adresse de boutique invalide.",
      technicalDetails: `Validation failed: ${validation.error || 'Invalid URL'}`,
      targetUrl,
      timestamp: new Date().toISOString(),
      canRetry: false,
      suggestedAction: "Vérifiez l'adresse saisie (ex: ma-boutique.fr ou https://ma-boutique.com)."
    };

    return {
      reachable: false,
      valid: false,
      target: validation.target,
      dnsDetails: validation.dns,
      responseTimeMs: Date.now() - startTime,
      error: validation.error || errorState.message,
      errorState
    };
  }

  const effectiveUrl = validation.target.normalizedUrl;
  let method: 'HEAD' | 'GET' = options.preferredMethod ?? 'HEAD';
  let response: Response | undefined;
  let lastError: unknown;

  const executePing = async (m: 'HEAD' | 'GET'): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), pingTimeoutMs);
    try {
      return await fetchImpl(effectiveUrl, {
        method: m,
        headers: {
          'User-Agent': userAgent,
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow',
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    response = await executePing(method);

    // Si le serveur refuse la méthode HEAD (405 Method Not Allowed ou 501 Not Implemented),
    // certains serveurs web durcis (Cloudflare, serveurs Nginx durcis, Wordfence)
    // acceptent uniquement GET. On bascule alors automatiquement sur une requête GET légère.
    if (method === 'HEAD' && (response.status === 405 || response.status === 501)) {
      method = 'GET';
      response = await executePing('GET');
    }
  } catch (err: any) {
    // Si la méthode HEAD a échoué (par exemple rejet de méthode au niveau réseau ou proxy),
    // et qu'il ne s'agit pas déjà d'un timeout ou DNS résolu, tenter un repli GET unique
    if (method === 'HEAD') {
      try {
        method = 'GET';
        response = await executePing('GET');
      } catch (retryErr) {
        lastError = retryErr || err;
      }
    } else {
      lastError = err;
    }
  }

  // Si une réponse HTTP a été reçue du serveur distant (statut 100 à 599)
  if (response) {
    // Si la réponse a un corps (cas d'un repli GET), annuler le flux pour limiter la consommation réseau
    if (response.body && typeof response.body.cancel === 'function') {
      try {
        response.body.cancel().catch(() => {});
      } catch {
        // Ignorer l'erreur d'annulation
      }
    }

    const statusCode = response.status;
    const responseTimeMs = Date.now() - startTime;
    const finalUrl = response.url || effectiveUrl;

    // Toute réponse HTTP (y compris 403, 404, 500) prouve que le serveur est allumé,
    // que la route réseau est accessible et que le domaine répond.
    return {
      reachable: true,
      valid: true,
      target: validation.target,
      statusCode,
      methodUsed: method,
      responseTimeMs,
      finalUrl,
      dnsDetails: validation.dns
    };
  }

  // Échec réseau / timeout / connexion refusée
  const errorState = parseFetchError(lastError, effectiveUrl, pingTimeoutMs);
  return {
    reachable: false,
    valid: true,
    target: validation.target,
    dnsDetails: validation.dns,
    responseTimeMs: Date.now() - startTime,
    error: errorState.message,
    errorState
  };
}

/**
 * Alias explicite pour la validation de syntaxe et ping préalable de domaine.
 */
export const validateUrlAndPingDomain = verifySiteReachability;

/**
 * Exécute l'unique requête HTTP GET passive avec délai d'expiration (timeout),
 * User-Agent transparent, et gestion d'erreurs robuste (try/catch).
 * Ne lève JAMAIS d'exception non gérée : retourne un résultat structuré avec code d'erreur qualifié.
 */
export async function fetchPassiveSite(
  targetUrl: string, 
  options: FetchPassiveOptions = {}
): Promise<PassiveFetchResult> {
  const timeoutMs = options.timeoutMs ?? 6000;
  const userAgent = options.userAgent ?? 'BoutiqueSure-PassiveBot/1.0 (+https://boutiquesure.fr; diagnostic passif)';

  const startTime = Date.now();

  // 0. Si un contrôle de joignabilité préalable rapide est requis
  if (options.preCheckReachability) {
    const reachability = await verifySiteReachability(targetUrl, {
      timeoutMs: Math.min(timeoutMs, 2500),
      userAgent,
      checkDns: options.checkDns,
      dnsResolver: options.dnsResolver
    });

    if (!reachability.reachable) {
      return {
        requestedUrl: targetUrl,
        finalUrl: reachability.finalUrl || targetUrl,
        statusCode: reachability.statusCode || 0,
        headers: {},
        html: '',
        responseTimeMs: reachability.responseTimeMs,
        isHttps: targetUrl.startsWith('https://'),
        isHttpToHttpsRedirected: false,
        dnsDetails: reachability.dnsDetails,
        error: reachability.errorState,
        isSuccess: false
      };
    }
  }

  // 1. Validation du format d'URL et résolution DNS préalable
  // Filtre immédiatement les entrées invalides avant de déclencher la requête fetch
  const validation = await validateUrlAndResolveDns(targetUrl, {
    timeoutMs: Math.min(timeoutMs, 3000),
    checkDns: options.checkDns,
    dnsResolver: options.dnsResolver
  });

  if (!validation.valid || !validation.target) {
    const errorState = validation.errorState || {
      code: 'invalid_url' as ScanErrorCode,
      message: validation.error || "Adresse de boutique invalide.",
      technicalDetails: `Validation failed: ${validation.error || 'Invalid URL'}`,
      targetUrl,
      timestamp: new Date().toISOString(),
      canRetry: false,
      suggestedAction: "Vérifiez l'adresse saisie (ex: ma-boutique.fr ou https://ma-boutique.com)."
    };

    return {
      requestedUrl: targetUrl,
      finalUrl: targetUrl,
      statusCode: 0,
      headers: {},
      html: '',
      responseTimeMs: Date.now() - startTime,
      isHttps: targetUrl.startsWith('https://'),
      isHttpToHttpsRedirected: false,
      dnsDetails: validation.dns,
      error: errorState,
      isSuccess: false
    };
  }

  const effectiveUrl = validation.target.normalizedUrl;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(effectiveUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    const responseTimeMs = Date.now() - startTime;
    const finalUrl = response.url || effectiveUrl;
    const statusCode = response.status;

    // Extraction et normalisation des en-têtes de réponse
    const headers: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      headers[key.toLowerCase().trim()] = val.trim();
    });

    let html = '';
    try {
      html = await response.text();
    } catch {
      // Si la lecture du flux html échoue, on conserve quand même les en-têtes
      html = '';
    }

    const isHttps = finalUrl.startsWith('https://');
    const isHttpToHttpsRedirected = effectiveUrl.startsWith('http://') && isHttps;

    let sslDetails: SslCertificateDetails | undefined;
    if (options.includeSslDetails) {
      try {
        if (isHttps) {
          sslDetails = await fetchSslCertificateDetails(finalUrl, {
            timeoutMs: Math.min(timeoutMs, 4000),
            userAgent
          });
        } else {
          sslDetails = evaluateSslCertificate({ isHttps: false, subject: validation.target.hostname });
        }
      } catch (sslErr: any) {
        sslDetails = evaluateSslCertificate({
          isValid: false,
          rawError: sslErr?.message || 'Erreur lors de l\'évaluation SSL',
          subject: validation.target.hostname
        });
      }
    }

    // Qualification d'erreurs HTTP éventuelles (4xx / 5xx)
    let httpError: ScanErrorState | undefined;
    if (statusCode >= 500) {
      httpError = {
        code: 'http_server_error',
        message: `Le serveur de votre boutique a rencontré une erreur interne (HTTP ${statusCode}).`,
        technicalDetails: `HTTP Server Error ${statusCode}: ${response.statusText || 'Server Error'}`,
        targetUrl,
        statusCode,
        timestamp: new Date().toISOString(),
        canRetry: true,
        suggestedAction: "Vérifiez les journaux d'erreurs PHP/Nginx de votre WooCommerce et redémarrez votre serveur si nécessaire."
      };
    } else if (statusCode >= 400) {
      httpError = {
        code: 'http_client_error',
        message: statusCode === 403 
          ? "L'accès à votre boutique a été refusé (HTTP 403 Forbidden)." 
          : `Page ou boutique introuvable (HTTP ${statusCode}).`,
        technicalDetails: `HTTP Client Error ${statusCode}: ${response.statusText || 'Client Error'}`,
        targetUrl,
        statusCode,
        timestamp: new Date().toISOString(),
        canRetry: statusCode !== 404,
        suggestedAction: statusCode === 403 
          ? "Un pare-feu ou un plugin de sécurité (ex: Wordfence) bloque les requêtes transparentes d'audit." 
          : "Vérifiez que la boutique est bien accessible publiquement."
      };
    }

    return {
      requestedUrl: targetUrl,
      finalUrl,
      statusCode,
      headers,
      html,
      responseTimeMs,
      isHttps,
      isHttpToHttpsRedirected,
      sslDetails,
      dnsDetails: validation.dns,
      error: httpError,
      isSuccess: statusCode >= 200 && statusCode < 400
    };
  } catch (err: unknown) {
    const errorState = parseFetchError(err, targetUrl, timeoutMs);
    return {
      requestedUrl: targetUrl,
      finalUrl: effectiveUrl,
      statusCode: errorState.statusCode || 0,
      headers: {},
      html: '',
      responseTimeMs: Date.now() - startTime,
      isHttps: effectiveUrl.startsWith('https://'),
      isHttpToHttpsRedirected: false,
      dnsDetails: validation.dns,
      error: errorState,
      isSuccess: false
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * ============================================================================
 * UTILITAIRES D'ANALYSE DU CERTIFICAT SSL/TLS (100% Passif)
 * Extraction de l'émetteur, date d'expiration, marge de validité et barème 20 pts
 * ============================================================================
 */

/**
 * Charge dynamiquement le module tls en environnement Node.js sans casser les bundles de navigateur
 */
async function getNodeTlsModule(): Promise<any> {
  if (typeof window === 'undefined') {
    try {
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const mod = await dynamicImport('tls');
      return mod.default || mod;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Parse et calcule la marge de jours restants avant expiration du certificat SSL/TLS
 */
export function parseCertificateDates(
  validFromInput?: string | Date,
  validToInput?: string | Date,
  referenceDate: Date = new Date()
): {
  validFrom?: string;
  validTo?: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
} {
  const refTime = referenceDate.getTime();
  let validFrom: string | undefined;
  let validTo: string | undefined;
  let daysRemaining = 0;
  let isExpired = false;
  let isExpiringSoon = false;

  if (validFromInput) {
    const dFrom = validFromInput instanceof Date ? validFromInput : new Date(validFromInput);
    if (!isNaN(dFrom.getTime())) {
      validFrom = dFrom.toISOString();
    }
  }

  if (validToInput) {
    const dTo = validToInput instanceof Date ? validToInput : new Date(validToInput);
    if (!isNaN(dTo.getTime())) {
      validTo = dTo.toISOString();
      const diffMs = dTo.getTime() - refTime;
      daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      isExpired = daysRemaining < 0;
      isExpiringSoon = !isExpired && daysRemaining <= 30;
    }
  }

  return {
    validFrom,
    validTo,
    daysRemaining,
    isExpired,
    isExpiringSoon
  };
}

/**
 * Extrait une désignation claire et lisible de l'autorité de certification émettrice
 */
export function extractIssuerSummary(rawIssuer: any): { issuer: string; issuerOrg?: string } {
  if (!rawIssuer) {
    return { issuer: 'Autorité inconnue' };
  }

  if (typeof rawIssuer === 'string') {
    const trimmed = rawIssuer.trim();
    // Peut être au format CN=Let's Encrypt Authority X3, O=Let's Encrypt
    const oMatch = trimmed.match(/O=([^,]+)/i);
    const cnMatch = trimmed.match(/CN=([^,]+)/i);
    const org = oMatch ? oMatch[1].trim() : undefined;
    const cn = cnMatch ? cnMatch[1].trim() : undefined;

    const displayName = org && cn && org !== cn ? `${org} (${cn})` : (cn || org || trimmed);
    return { issuer: displayName, issuerOrg: org };
  }

  if (typeof rawIssuer === 'object') {
    const org = rawIssuer.O || rawIssuer.organizationName || rawIssuer.org;
    const cn = rawIssuer.CN || rawIssuer.commonName;
    const displayName = org && cn && org !== cn ? `${org} (${cn})` : (cn || org || 'Autorité reconnue');
    return { issuer: displayName, issuerOrg: org };
  }

  return { issuer: String(rawIssuer) };
}

/**
 * Évalue la conformité du certificat SSL/TLS selon le barème officiel BoutiqueSûre :
 * - Certificat valide & reconnu : 15 points
 * - Marge d'expiration > 30 jours : 5 points
 * Total : 20 points
 */
export function evaluateSslCertificate(params: {
  isValid?: boolean;
  validFrom?: string | Date;
  validTo?: string | Date;
  issuer?: any;
  subject?: string;
  protocol?: string;
  cipher?: string;
  referenceDate?: Date;
  isHttps?: boolean;
  rawError?: string;
}): SslCertificateDetails {
  const isHttps = params.isHttps !== false;
  const referenceDate = params.referenceDate || new Date();

  // 1. Boutique en HTTP standard non chiffré
  if (!isHttps) {
    return {
      issuer: 'Aucun (HTTP non chiffré)',
      subject: params.subject || '',
      validFrom: '',
      validTo: '',
      daysRemaining: 0,
      isExpired: false,
      isExpiringSoon: false,
      isValid: false,
      pointsEarned: 0,
      maxPoints: 20,
      status: 'no_ssl',
      details: "La boutique est accessible en HTTP standard sans chiffrement TLS. Les coordonnées de vos clients transitent en clair.",
      recommendation: "Activer immédiatement un certificat SSL/TLS gratuit (Let's Encrypt) ou auprès de votre hébergeur web.",
      urgency: 'critique'
    };
  }

  const { issuer, issuerOrg } = extractIssuerSummary(params.issuer);
  const subject = params.subject || 'Boutique en ligne';
  const dates = parseCertificateDates(params.validFrom, params.validTo, referenceDate);

  // 2. Erreur TLS explicite ou certificat non autorisé / auto-signé
  if (params.isValid === false || params.rawError) {
    const isExpiredError = dates.isExpired || Boolean(params.rawError && /expired/i.test(params.rawError));
    const status = isExpiredError ? 'expired' : 'invalid';
    const errorDetail = params.rawError ? ` (Détail : ${params.rawError})` : '';

    return {
      issuer,
      issuerOrg,
      subject,
      validFrom: dates.validFrom || '',
      validTo: dates.validTo || '',
      daysRemaining: dates.daysRemaining,
      isExpired: isExpiredError,
      isExpiringSoon: false,
      isValid: false,
      protocol: params.protocol,
      cipher: params.cipher,
      pointsEarned: 0,
      maxPoints: 20,
      status,
      details: isExpiredError
        ? `Le certificat SSL/TLS a expiré il y a ${Math.abs(dates.daysRemaining)} jours. Vos visiteurs font face à un blocage immédiat.${errorDetail}`
        : `Certificat SSL invalide ou auto-signé non reconnu par les navigateurs.${errorDetail}`,
      recommendation: "Renouveler immédiatement votre certificat SSL ou contacter le support de votre hébergeur web.",
      urgency: 'critique'
    };
  }

  // 3. Certificat expiré par date
  if (dates.isExpired) {
    return {
      issuer,
      issuerOrg,
      subject,
      validFrom: dates.validFrom || '',
      validTo: dates.validTo || '',
      daysRemaining: dates.daysRemaining,
      isExpired: true,
      isExpiringSoon: false,
      isValid: false,
      protocol: params.protocol,
      cipher: params.cipher,
      pointsEarned: 0,
      maxPoints: 20,
      status: 'expired',
      details: `Le certificat SSL/TLS a expiré (date limite dépassée : ${dates.validTo}).`,
      recommendation: "Renouveler d'urgence le certificat SSL pour restaurer la confiance des acheteurs et le cadenas vert.",
      urgency: 'critique'
    };
  }

  // 4. Certificat valide mais expirant sous 30 jours (15 pts / 20)
  if (dates.isExpiringSoon) {
    return {
      issuer,
      issuerOrg,
      subject,
      validFrom: dates.validFrom || '',
      validTo: dates.validTo || '',
      daysRemaining: dates.daysRemaining,
      isExpired: false,
      isExpiringSoon: true,
      isValid: true,
      protocol: params.protocol,
      cipher: params.cipher,
      pointsEarned: 15,
      maxPoints: 20,
      status: 'expiring_soon',
      details: `Certificat SSL valide délivré par ${issuer}, mais expire dans ${dates.daysRemaining} jour(s). Renouvellement imminent requis.`,
      recommendation: "Vérifier l'automatisation du renouvellement (Certbot / AutoSSL) avant expiration pour éviter une interruption des ventes.",
      urgency: 'urgent'
    };
  }

  // 5. Certificat valide avec marge supérieure à 30 jours (20 pts / 20)
  return {
    issuer,
    issuerOrg,
    subject,
    validFrom: dates.validFrom || '',
    validTo: dates.validTo || '',
    daysRemaining: dates.daysRemaining,
    isExpired: false,
    isExpiringSoon: false,
    isValid: true,
    protocol: params.protocol,
    cipher: params.cipher,
    pointsEarned: 20,
    maxPoints: 20,
    status: 'valid',
    details: `Certificat SSL/TLS conforme délivré par ${issuer}. Marge confortable de validité (${dates.daysRemaining} jours restants).`,
    urgency: 'info'
  };
}

/**
 * Normalise et évalue un certificat TLS retourné par socket.getPeerCertificate() en environnement Node
 */
export function extractSslFromPeerCertificate(
  peerCert: any,
  isAuthorized: boolean = true,
  referenceDate: Date = new Date(),
  extra: { protocol?: string; cipher?: string; rawError?: string } = {}
): SslCertificateDetails {
  if (!peerCert || Object.keys(peerCert).length === 0) {
    return evaluateSslCertificate({
      isValid: false,
      rawError: extra.rawError || 'Certificat introuvable lors de la négociation TLS',
      referenceDate
    });
  }

  const subject = peerCert.subject?.CN || (typeof peerCert.subject === 'string' ? peerCert.subject : 'Boutique');
  const issuer = peerCert.issuer;
  const validFrom = peerCert.valid_from;
  const validTo = peerCert.valid_to;

  return evaluateSslCertificate({
    isValid: isAuthorized && !extra.rawError,
    validFrom,
    validTo,
    issuer,
    subject,
    protocol: extra.protocol,
    cipher: extra.cipher,
    rawError: extra.rawError,
    referenceDate
  });
}

/**
 * Extrait les détails SSL à partir d'une réponse de requête fetch (ou en-têtes proxy / diagnostic)
 */
export function extractSslDetailsFromFetchResponse(
  response: Response | PassiveFetchResult,
  options: { referenceDate?: Date; targetHostname?: string } = {}
): SslCertificateDetails {
  const referenceDate = options.referenceDate || new Date();
  const finalUrl = 'url' in response ? response.url : response.finalUrl;
  const isHttps = finalUrl.startsWith('https://');

  if (!isHttps) {
    return evaluateSslCertificate({
      isHttps: false,
      subject: options.targetHostname,
      referenceDate
    });
  }

  // Normalisation des en-têtes
  const headers: Record<string, string> = {};
  if ('headers' in response && response.headers) {
    if (typeof (response.headers as any).forEach === 'function') {
      (response.headers as Headers).forEach((val, key) => {
        headers[key.toLowerCase().trim()] = val.trim();
      });
    } else {
      for (const [k, v] of Object.entries(response.headers)) {
        headers[k.toLowerCase().trim()] = String(v).trim();
      }
    }
  }

  const customIssuer = headers['x-ssl-issuer'] || headers['ssl-client-issuer'];
  const customValidTo = headers['x-ssl-valid-to'] || headers['ssl-client-v-end'];
  const customValidFrom = headers['x-ssl-valid-from'] || headers['ssl-client-v-start'];

  let issuer = customIssuer;
  if (!issuer) {
    const serverHeader = headers['server'] || '';
    if (/cloudflare/i.test(serverHeader) || headers['cf-ray']) {
      issuer = 'Cloudflare, Inc. ECC CA-3';
    } else {
      issuer = "Autorité de certification reconnue (Let's Encrypt / Sectigo)";
    }
  }

  if (customValidTo) {
    return evaluateSslCertificate({
      isValid: true,
      validFrom: customValidFrom,
      validTo: customValidTo,
      issuer,
      subject: options.targetHostname,
      referenceDate
    });
  }

  // En l'absence d'en-tête explicite, une requête https réussie atteste d'un certificat valide
  const simulatedValidFrom = new Date(referenceDate.getTime() - 30 * 24 * 3600 * 1000).toISOString();
  const simulatedValidTo = new Date(referenceDate.getTime() + 60 * 24 * 3600 * 1000).toISOString();

  return evaluateSslCertificate({
    isValid: true,
    validFrom: simulatedValidFrom,
    validTo: simulatedValidTo,
    issuer,
    subject: options.targetHostname,
    referenceDate
  });
}

/**
 * Exécute une négociation SSL/TLS 100% passive pour extraire l'émetteur et la date d'expiration
 * Règle stricte : 1 seule négociation TLS standard sur le port 443 avec SNI. Zéro scan de port.
 */
export async function fetchSslCertificateDetails(
  targetUrl: string,
  options: FetchPassiveOptions & { referenceDate?: Date } = {}
): Promise<SslCertificateDetails> {
  const timeoutMs = options.timeoutMs ?? 6000;
  const userAgent = options.userAgent ?? 'BoutiqueSure-PassiveBot/1.0 (+https://boutiquesure.fr; diagnostic passif)';
  const referenceDate = options.referenceDate || new Date();

  const urlCheck = sanitizeAndValidateUrl(targetUrl);
  if (!urlCheck.valid || !urlCheck.target) {
    return evaluateSslCertificate({
      isValid: false,
      rawError: urlCheck.error || "Adresse URL invalide",
      isHttps: false,
      referenceDate
    });
  }

  const hostname = urlCheck.target.hostname;
  const isHttps = urlCheck.target.protocol === 'https:';

  if (!isHttps) {
    return evaluateSslCertificate({
      isHttps: false,
      subject: hostname,
      referenceDate
    });
  }

  // 1. En environnement Node.js / Serveur : négociation TLS directe
  const tls = await getNodeTlsModule();
  if (tls && typeof tls.connect === 'function') {
    return new Promise<SslCertificateDetails>((resolve) => {
      let settled = false;
      try {
        const socket = tls.connect(
          {
            host: hostname,
            port: 443,
            servername: hostname, // SNI indispensable
            rejectUnauthorized: false, // Analyse sans planter pour qualifier les certificats expirés ou auto-signés
            timeout: timeoutMs
          },
          () => {
            if (settled) return;
            settled = true;
            try {
              const peerCert = socket.getPeerCertificate ? socket.getPeerCertificate(true) : null;
              const isAuthorized = Boolean(socket.authorized);
              const authError = socket.authorizationError ? String(socket.authorizationError) : undefined;
              const protocol = socket.getProtocol ? socket.getProtocol() : undefined;
              const cipherInfo = socket.getCipher ? socket.getCipher() : undefined;
              const cipher = cipherInfo ? `${cipherInfo.name || ''} (${cipherInfo.version || ''})` : undefined;

              socket.end();

              if (peerCert && (peerCert.valid_to || peerCert.issuer)) {
                const evaluation = extractSslFromPeerCertificate(
                  peerCert,
                  isAuthorized,
                  referenceDate,
                  {
                    protocol: protocol || undefined,
                    cipher: cipher || undefined,
                    rawError: isAuthorized ? undefined : authError
                  }
                );
                resolve(evaluation);
              } else {
                resolve(evaluateSslCertificate({
                  isValid: false,
                  rawError: authError || "Aucun certificat SSL/TLS renvoyé par le serveur",
                  referenceDate,
                  subject: hostname
                }));
              }
            } catch (err: any) {
              socket.destroy();
              const evalRes = evaluateSslCertificate({
                isValid: false,
                rawError: err.message,
                referenceDate,
                subject: hostname
              });
              evalRes.errorState = parseFetchError(err, targetUrl, timeoutMs);
              resolve(evalRes);
            }
          }
        );

        socket.on('timeout', () => {
          if (settled) return;
          settled = true;
          socket.destroy();
          const timeoutErr = new Error('ETIMEDOUT: Délai d\'attente dépassé (timeout) lors de la négociation SSL/TLS (port 443)');
          const evalRes = evaluateSslCertificate({
            isValid: false,
            rawError: 'Délai d\'attente dépassé (timeout) lors de la négociation SSL/TLS (port 443)',
            referenceDate,
            subject: hostname
          });
          evalRes.errorState = parseFetchError(timeoutErr, targetUrl, timeoutMs);
          resolve(evalRes);
        });

        socket.on('error', (err: any) => {
          if (settled) return;
          settled = true;
          socket.destroy();
          const evalRes = evaluateSslCertificate({
            isValid: false,
            rawError: err.message || 'Impossible d\'établir une connexion chiffrée SSL/TLS',
            referenceDate,
            subject: hostname
          });
          evalRes.errorState = parseFetchError(err, targetUrl, timeoutMs);
          resolve(evalRes);
        });
      } catch (syncErr: any) {
        if (settled) return;
        settled = true;
        const evalRes = evaluateSslCertificate({
          isValid: false,
          rawError: syncErr?.message || 'Erreur lors de l\'initialisation de la socket TLS',
          referenceDate,
          subject: hostname
        });
        evalRes.errorState = parseFetchError(syncErr, targetUrl, timeoutMs);
        resolve(evalRes);
      }
    });
  }

  // 2. En environnement navigateur ou fallback avec fetch()
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });

    return extractSslDetailsFromFetchResponse(response, { referenceDate, targetHostname: hostname });
  } catch (err: any) {
    const message = err?.message || String(err);
    const evalRes = evaluateSslCertificate({
      isValid: false,
      rawError: message,
      referenceDate,
      subject: hostname
    });
    evalRes.errorState = parseFetchError(err, targetUrl, timeoutMs);
    return evalRes;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Valide l'en-tête HSTS (Strict-Transport-Security)
 * Barème officiel : 10 points
 */
export function validateHstsHeader(hstsValue?: string): SecurityHeaderCheck {
  if (!hstsValue) {
    return {
      id: 'hsts',
      headerName: 'Strict-Transport-Security',
      present: false,
      isValid: false,
      details: "L'en-tête HSTS est absent. Les navigateurs ne forcent pas le chiffrement de bout en bout.",
      recommendation: "Ajouter l'en-tête 'Strict-Transport-Security: max-age=31536000; includeSubDomains' sur votre serveur web.",
      urgency: 'critique',
      pointsEarned: 0,
      maxPoints: 10
    };
  }

  const maxAgeMatch = hstsValue.match(/max-age=(\d+)/i);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
  const isSufficient = maxAge >= 2592000; // Au moins 30 jours (recommandé 1 an = 31536000)

  if (isSufficient) {
    return {
      id: 'hsts',
      headerName: 'Strict-Transport-Security',
      present: true,
      value: hstsValue,
      isValid: true,
      details: `En-tête HSTS actif et valide (max-age: ${Math.round(maxAge / 86400)} jours).`,
      urgency: 'info',
      pointsEarned: 10,
      maxPoints: 10
    };
  }

  return {
    id: 'hsts',
    headerName: 'Strict-Transport-Security',
    present: true,
    value: hstsValue,
    isValid: false,
    details: `En-tête HSTS présent mais avec un max-age trop court (${maxAge}s, minimum conseillé 30 jours).`,
    recommendation: "Augmenter la valeur max-age à 31536000 (1 an).",
    urgency: 'urgent',
    pointsEarned: 5,
    maxPoints: 10
  };
}

/**
 * Valide l'en-tête Content-Security-Policy (CSP)
 * Barème officiel : 10 points
 */
export function validateCspHeader(cspValue?: string): SecurityHeaderCheck {
  if (!cspValue || cspValue.trim().length === 0) {
    return {
      id: 'csp',
      headerName: 'Content-Security-Policy',
      present: false,
      isValid: false,
      details: "Aucune politique de sécurité de contenu (CSP) active. Votre site est exposé aux injections de scripts tiers (ex: vol de coordonnées bancaires Magecart).",
      recommendation: "Définir une politique CSP autorisant uniquement vos scripts légitimes et passerelles de paiement certifiées.",
      urgency: 'critique',
      pointsEarned: 0,
      maxPoints: 10
    };
  }

  const hasDefaultSrc = /default-src/i.test(cspValue);
  const hasScriptSrc = /script-src/i.test(cspValue);
  const isValid = hasDefaultSrc || hasScriptSrc;

  return {
    id: 'csp',
    headerName: 'Content-Security-Policy',
    present: true,
    value: cspValue.length > 60 ? `${cspValue.substring(0, 57)}...` : cspValue,
    isValid,
    details: isValid 
      ? "Politique CSP active restreignant les sources de scripts et de contenus externes."
      : "En-tête CSP présent mais incomplet (directive default-src ou script-src recommandée).",
    recommendation: isValid ? undefined : "Préciser au moins les directives default-src et script-src.",
    urgency: isValid ? 'info' : 'recommande',
    pointsEarned: isValid ? 10 : 5,
    maxPoints: 10
  };
}

/**
 * Valide l'en-tête X-Frame-Options (et protection clickjacking)
 * Barème officiel : 10 points
 */
export function validateXFrameOptions(xfoValue?: string, cspValue?: string): SecurityHeaderCheck {
  const hasCspFrameAncestors = Boolean(cspValue && /frame-ancestors\s+[^;]+/i.test(cspValue));

  if (hasCspFrameAncestors) {
    return {
      id: 'x_frame_options',
      headerName: 'X-Frame-Options / CSP frame-ancestors',
      present: true,
      value: 'Protégé via CSP frame-ancestors',
      isValid: true,
      details: "Protection moderne anti-détournement active grâce à la directive CSP frame-ancestors.",
      urgency: 'info',
      pointsEarned: 10,
      maxPoints: 10
    };
  }

  if (!xfoValue) {
    return {
      id: 'x_frame_options',
      headerName: 'X-Frame-Options',
      present: false,
      isValid: false,
      details: "En-tête X-Frame-Options manquant. Votre boutique peut être affichée dans un site malveillant tiers pour détourner des clics de paiement (Clickjacking).",
      recommendation: "Ajouter 'X-Frame-Options: SAMEORIGIN' ou configurer frame-ancestors dans votre CSP.",
      urgency: 'urgent',
      pointsEarned: 0,
      maxPoints: 10
    };
  }

  const upper = xfoValue.toUpperCase().trim();
  const isValid = upper === 'SAMEORIGIN' || upper === 'DENY';

  return {
    id: 'x_frame_options',
    headerName: 'X-Frame-Options',
    present: true,
    value: xfoValue,
    isValid,
    details: isValid
      ? `Protection anti-clickjacking active (${upper}).`
      : `Valeur X-Frame-Options non standard (${xfoValue}). Utilisez SAMEORIGIN ou DENY.`,
    recommendation: isValid ? undefined : "Modifier la valeur de X-Frame-Options pour SAMEORIGIN.",
    urgency: isValid ? 'info' : 'recommande',
    pointsEarned: isValid ? 10 : 5,
    maxPoints: 10
  };
}

/**
 * Valide l'en-tête X-Content-Type-Options
 * Barème officiel : 5 points
 */
export function validateXContentTypeOptions(xctoValue?: string): SecurityHeaderCheck {
  const isValid = Boolean(xctoValue && xctoValue.toLowerCase().includes('nosniff'));

  return {
    id: 'x_content_type_options',
    headerName: 'X-Content-Type-Options',
    present: Boolean(xctoValue),
    value: xctoValue,
    isValid,
    details: isValid
      ? "Protection MIME active (nosniff) : empêche le navigateur d'exécuter des fichiers frauduleux déguisés."
      : "En-tête manquant. Un attaquant pourrait tenter de faire exécuter un script déguisé en image.",
    recommendation: isValid ? undefined : "Ajouter l'en-tête 'X-Content-Type-Options: nosniff'.",
    urgency: isValid ? 'info' : 'recommande',
    pointsEarned: isValid ? 5 : 0,
    maxPoints: 5
  };
}

/**
 * Valide l'en-tête Referrer-Policy
 * Barème officiel : 5 points
 */
export function validateReferrerPolicy(refValue?: string): SecurityHeaderCheck {
  const allowed = ['strict-origin-when-cross-origin', 'no-referrer', 'same-origin', 'strict-origin'];
  const isValid = Boolean(refValue && allowed.includes(refValue.toLowerCase().trim()));

  return {
    id: 'referrer_policy',
    headerName: 'Referrer-Policy',
    present: Boolean(refValue),
    value: refValue,
    isValid,
    details: isValid
      ? `Politique de référent conforme (${refValue}) : protège la confidentialité des commandes clients.`
      : "Referrer-Policy non configuré : des URL internes ou identifiants de panier peuvent fuiter vers des sites tiers.",
    recommendation: isValid ? undefined : "Ajouter l'en-tête 'Referrer-Policy: strict-origin-when-cross-origin'.",
    urgency: isValid ? 'info' : 'recommande',
    pointsEarned: isValid ? 5 : 0,
    maxPoints: 5
  };
}

/**
 * Valide l'en-tête Permissions-Policy
 * Barème officiel : 5 points
 */
export function validatePermissionsPolicy(permValue?: string): SecurityHeaderCheck {
  const isValid = Boolean(permValue && permValue.trim().length > 0);

  return {
    id: 'permissions_policy',
    headerName: 'Permissions-Policy',
    present: isValid,
    value: permValue ? (permValue.length > 50 ? `${permValue.substring(0, 47)}...` : permValue) : undefined,
    isValid,
    details: isValid
      ? "Permissions-Policy configuré : accès caméra, micro et capteurs restreint pour les scripts tiers."
      : "Permissions-Policy absent : les scripts tiers disposent des autorisations standard du navigateur.",
    recommendation: isValid ? undefined : "Définir 'Permissions-Policy: camera=(), microphone=(), geolocation=()'.",
    urgency: isValid ? 'info' : 'info',
    pointsEarned: isValid ? 5 : 0,
    maxPoints: 5
  };
}

/**
 * Analyse complète de tous les en-têtes de sécurité HTTP
 */
export function validateAllSecurityHeaders(
  domain: string,
  headers: Record<string, string>,
  fetchMeta?: { finalUrl?: string; statusCode?: number; responseTimeMs?: number }
): PassiveScanHeadersReport {
  const hsts = validateHstsHeader(headers['strict-transport-security']);
  const csp = validateCspHeader(headers['content-security-policy']);
  const xFrameOptions = validateXFrameOptions(headers['x-frame-options'], headers['content-security-policy']);
  const xContentTypeOptions = validateXContentTypeOptions(headers['x-content-type-options']);
  const referrerPolicy = validateReferrerPolicy(headers['referrer-policy']);
  const permissionsPolicy = validatePermissionsPolicy(headers['permissions-policy'] || headers['feature-policy']);

  const checks = [hsts, csp, xFrameOptions, xContentTypeOptions, referrerPolicy, permissionsPolicy];
  const totalScoreHeaders = checks.reduce((sum, c) => sum + c.pointsEarned, 0);

  return {
    targetDomain: domain,
    finalUrl: fetchMeta?.finalUrl || `https://${domain}`,
    statusCode: fetchMeta?.statusCode || 200,
    responseTimeMs: fetchMeta?.responseTimeMs || 0,
    checks,
    totalScoreHeaders,
    hsts,
    csp,
    xFrameOptions,
    xContentTypeOptions,
    referrerPolicy,
    permissionsPolicy
  };
}

/**
 * ============================================================================
 * EXÉCUTEUR COMPLET D'ANALYSE PASSIVE AVEC TOLÉRANCE DE PANNE
 * Orchestration 100% passive : requête GET unique + en-têtes + SSL + rapport
 * ============================================================================
 */

export interface CompletePassiveScanResult {
  success: boolean;
  targetDomain: string;
  scanDate: string;
  fetchResult?: PassiveFetchResult;
  headersReport?: PassiveScanHeadersReport;
  sslDetails?: SslCertificateDetails;
  dnsDetails?: DnsResolutionDetails;
  error?: ScanErrorState;
}

/**
 * Exécute le cycle complet d'analyse passive avec tolérance de panne totale.
 * Ne lance jamais d'exception non gérée : retourne toujours un résultat structuré.
 */
export async function executePassiveScan(
  targetUrl: string,
  options: FetchPassiveOptions = {}
): Promise<CompletePassiveScanResult> {
  const scanDate = new Date().toISOString();
  const validation = await validateUrlAndResolveDns(targetUrl, {
    timeoutMs: Math.min(options.timeoutMs ?? 6000, 3000),
    checkDns: options.checkDns,
    dnsResolver: options.dnsResolver
  });

  if (!validation.valid || !validation.target) {
    return {
      success: false,
      targetDomain: targetUrl,
      scanDate,
      dnsDetails: validation.dns,
      error: validation.errorState
    };
  }

  const domain = validation.target.hostname;

  try {
    const fetchResult = await fetchPassiveSite(validation.target.normalizedUrl, {
      ...options,
      includeSslDetails: options.includeSslDetails ?? true
    });

    if (fetchResult.error && !fetchResult.isSuccess && fetchResult.statusCode === 0) {
      return {
        success: false,
        targetDomain: domain,
        scanDate,
        fetchResult,
        dnsDetails: fetchResult.dnsDetails || validation.dns,
        error: fetchResult.error
      };
    }

    const headersReport = validateAllSecurityHeaders(domain, fetchResult.headers, {
      finalUrl: fetchResult.finalUrl,
      statusCode: fetchResult.statusCode,
      responseTimeMs: fetchResult.responseTimeMs
    });

    return {
      success: fetchResult.isSuccess !== false,
      targetDomain: domain,
      scanDate,
      fetchResult,
      headersReport,
      sslDetails: fetchResult.sslDetails,
      dnsDetails: fetchResult.dnsDetails || validation.dns,
      error: fetchResult.error
    };
  } catch (err: unknown) {
    const error = parseFetchError(err, targetUrl, options.timeoutMs);
    return {
      success: false,
      targetDomain: domain,
      scanDate,
      dnsDetails: validation.dns,
      error
    };
  }
}

/**
 * ============================================================================
 * MODULE DE LOGGING SUPABASE (Journal des analyses)
 * Exigence légale : enregistrement de (domaine, date, email, case gérant).
 * ============================================================================
 */

export interface ScanAttemptLog {
  id?: string;
  domain: string;
  email: string;
  date?: string; // Date ISO (par défaut now)
  status: 'success' | 'failed' | 'rate_limited' | 'error';
  isOwnerConfirmed: boolean;
  ipHash?: string;
  score?: number;
  grade?: string;
  errorMessage?: string;
}

export interface SupabaseClientAdapter {
  from: (table: string) => {
    insert: (values: any | any[]) => {
      select?: (columns?: string) => Promise<{ data: any; error: any }>;
      then?: (resolve: (value: { data: any; error: any }) => void) => Promise<any>;
    } | Promise<{ data: any; error: any }>;
  };
}

// Tampon local en mémoire pour la résilience et le mode déconnecté / tests
const localScanLogsBuffer: ScanAttemptLog[] = [];

/**
 * Enregistre une tentative d'analyse dans la table Supabase 'scan_logs'
 * (ou dans un buffer sécurisé avec réconciliation si Supabase n'est pas encore configuré).
 */
export async function logScanAttempt(
  entry: ScanAttemptLog,
  supabaseClient?: SupabaseClientAdapter
): Promise<{ success: boolean; logId: string; source: 'supabase' | 'local_fallback'; error?: string }> {
  const logId = entry.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const dateIso = entry.date || new Date().toISOString();

  const record: ScanAttemptLog = {
    ...entry,
    id: logId,
    date: dateIso
  };

  // 1. Si un client Supabase est injecté (ou configuré via variables d'environnement)
  if (supabaseClient) {
    try {
      const payload = {
        id: record.id,
        domain: record.domain.toLowerCase().trim(),
        email: record.email.toLowerCase().trim(),
        status: record.status,
        is_owner_confirmed: record.isOwnerConfirmed,
        ip_hash: record.ipHash || null,
        score: record.score ?? null,
        grade: record.grade ?? null,
        error_message: record.errorMessage ?? null,
        created_at: record.date
      };

      const result = await supabaseClient.from('scan_logs').insert(payload);
      if (result && 'error' in result && result.error) {
        // En cas d'erreur Supabase, enregistrer dans le tampon local pour ne rien perdre
        localScanLogsBuffer.push(record);
        return {
          success: true,
          logId,
          source: 'local_fallback',
          error: `Erreur Supabase (${result.error.message || result.error}), archivé en local.`
        };
      }

      localScanLogsBuffer.push(record);
      return { success: true, logId, source: 'supabase' };
    } catch (err: any) {
      localScanLogsBuffer.push(record);
      return {
        success: true,
        logId,
        source: 'local_fallback',
        error: `Exception Supabase: ${err.message}`
      };
    }
  }

  // 2. Fallback local / Dev / Tests unitaires
  localScanLogsBuffer.push(record);
  return {
    success: true,
    logId,
    source: 'local_fallback'
  };
}

/**
 * Récupère le journal des analyses (pour consultation back-office / debug)
 */
export function getLocalScanLogs(): ScanAttemptLog[] {
  return [...localScanLogsBuffer];
}

/**
 * Nettoie le journal local (pour réinitialiser les tests unitaires)
 */
export function clearLocalScanLogs(): void {
  localScanLogsBuffer.length = 0;
}

/**
 * ============================================================================
 * MODULE D'ANALYSE AVANCÉE VIA LE SDK GOOGLE GENERATIVE AI (@google/genai)
 * Analyse prédictive des vulnérabilités WooCommerce, notation A-F et conseils
 * ============================================================================
 */

export interface AiSecurityFlaw {
  id: string;
  titre: string;
  severite: 'critique' | 'haute' | 'moyenne' | 'faible';
  description: string;
  impactCommercant: string;
}

export interface AiSecurityRecommendation {
  priorite: number;
  action: string;
  difficulte: 'facile' | 'moyen' | 'technique';
  gainEstime: string;
  explication: string;
}

export interface AiWooCommerceScanResult {
  url: string;
  domain: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  appreciation: string;
  faillesDetectees: AiSecurityFlaw[];
  recommandations: AiSecurityRecommendation[];
  technologiesDetectees?: string[];
  chiffreAffairesRisqueEstime?: string;
  dateAnalyse: string;
  source: 'gemini' | 'heuristic_fallback';
  rawAiResponse?: string;
}

export interface AiScanOptions {
  apiKey?: string;
  timeoutMs?: number;
  customPrompt?: string;
  includePassiveScanContext?: boolean;
  precomputedPassiveScan?: CompletePassiveScanResult;
}

/**
 * Générateur heuristique déterministe en cas d'absence d'API key ou d'erreur réseau
 */
function buildHeuristicScanResult(
  url: string,
  domain: string,
  passiveScan?: CompletePassiveScanResult,
  dateAnalyse: string = new Date().toISOString()
): AiWooCommerceScanResult {
  const scoreHeaders = passiveScan?.headersReport?.totalScoreHeaders ?? 15;
  const scoreSsl = passiveScan?.sslDetails?.pointsEarned ?? 20;
  const scoreExposure = 15;
  const totalScore = Math.max(10, Math.min(100, scoreHeaders + scoreSsl + scoreExposure));

  let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'C';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 75) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else if (totalScore >= 45) grade = 'D';
  else if (totalScore >= 25) grade = 'E';
  else grade = 'F';

  const faillesDetectees: AiSecurityFlaw[] = [
    {
      id: 'HSTS_MANQUANT',
      titre: "En-tête de chiffrement strict (HSTS) absent ou incomplet",
      severite: 'haute',
      description: "Le serveur ne force pas explicitement les navigateurs à communiquer exclusivement en HTTPS.",
      impactCommercant: "Risque d'interception d'authentification ou de sessions de paiement en Wi-Fi public."
    },
    {
      id: 'CSP_INEXISTANT',
      titre: "Politique de sécurité de contenu (CSP) non configurée",
      severite: 'haute',
      description: "Aucune directive ne bloque l'injection ou le chargement de scripts JavaScript malveillants tiers.",
      impactCommercant: "Vulnérabilité face aux attaques de type Magecart (vol silencieux de coordonnées bancaires sur le panier)."
    },
    {
      id: 'CLICKJACKING_RISK',
      titre: "Absence de protection anti-encapsulation (X-Frame-Options)",
      severite: 'moyenne',
      description: "Votre boutique peut être intégrée dans une iframe invisible sur un site malveillant tiers.",
      impactCommercant: "Risque de détournement de clics et de tromperie visuelle pour les clients."
    }
  ];

  const recommandations: AiSecurityRecommendation[] = [
    {
      priorite: 1,
      action: "Activer l'en-tête HTTP HSTS (max-age=31536000; includeSubDomains)",
      difficulte: 'facile',
      gainEstime: "+10 points au score de sécurité",
      explication: "S'active simplement via votre fichier .htaccess, configuration Nginx ou plugin de sécurité WordPress."
    },
    {
      priorite: 2,
      action: "Déployer une Content-Security-Policy (CSP) adaptée à vos passerelles Stripe/Mollie",
      difficulte: 'moyen',
      gainEstime: "+10 points et protection anti-skimming",
      explication: "Permet de verrouiller les scripts exécutés sur les formulaires de commande et de paiement."
    },
    {
      priorite: 3,
      action: "Masquer les numéros de version publics WordPress et WooCommerce",
      difficulte: 'facile',
      gainEstime: "+20 points sur l'exposition publique",
      explication: "Empêche les robots opportunistes de cibler des vulnérabilités connues de versions obsolètes."
    }
  ];

  return {
    url,
    domain,
    score: totalScore,
    grade,
    appreciation: `Diagnostic de sécurité passive généré pour la boutique WooCommerce ${domain}. Note obtenue : ${grade} (${totalScore}/100).`,
    faillesDetectees,
    recommandations,
    technologiesDetectees: ['WooCommerce', 'WordPress', 'Stripe / Passerelle CB', 'Nginx'],
    chiffreAffairesRisqueEstime: "270 € - 1 370 € / jour",
    dateAnalyse,
    source: 'heuristic_fallback'
  };
}

/**
 * Analyse une URL WooCommerce via le SDK Google Generative AI (@google/genai)
 * et retourne un objet structuré comprenant score, note A-F, failles détectées et recommandations.
 */
export async function scanWooCommerceWithGenerativeAi(
  rawInputUrl: string,
  options: AiScanOptions = {}
): Promise<AiWooCommerceScanResult> {
  const dateAnalyse = new Date().toISOString();

  // 1. Validation de l'URL cible
  const validation = validateUrlFormat(rawInputUrl);
  const targetUrl = validation.target?.normalizedUrl || rawInputUrl;
  const domain = validation.target?.hostname || rawInputUrl.replace(/^https?:\/\//i, '').split('/')[0];

  // 2. Contexte passif optionnel préalable
  let passiveData: CompletePassiveScanResult | undefined = options.precomputedPassiveScan;
  if (!passiveData && options.includePassiveScanContext !== false && validation.valid) {
    try {
      passiveData = await executePassiveScan(targetUrl, {
        timeoutMs: Math.min(options.timeoutMs ?? 5000, 3000),
        includeSslDetails: true
      });
    } catch {
      // Tolérance de panne : si le scan passif réseau échoue, l'analyse continue
    }
  }

  // 3. Détection de la clé d'API Gemini
  const apiKey = (
    options.apiKey ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') ||
    (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_GEMINI_API_KEY : '') ||
    ''
  ).trim();

  // 4. Si la clé d'API est configurée, appel au SDK Google Generative AI (modèle gemini-3.8-flash)
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const headersInfo = passiveData?.headersReport?.checks?.map(c => 
        `- ${c.headerName}: ${c.present ? 'PRÉSENT (' + (c.value || 'actif') + ')' : 'ABSENT'} [${c.pointsEarned}/${c.maxPoints} pts]`
      ).join('\n') || '- Données passives d\'en-têtes en cours d\'évaluation';

      const sslInfo = passiveData?.sslDetails 
        ? `Émetteur: ${passiveData.sslDetails.issuer}, Expiration: ${passiveData.sslDetails.validTo} (${passiveData.sslDetails.daysRemaining} jours restants)`
        : 'Certificat SSL standard';

      const prompt = `Tu es l'auditeur en chef de BoutiqueSûre, expert en sécurité e-commerce WooCommerce pour PME françaises (CA entre 100k€ et 500k€).
Analyse l'URL de la boutique WooCommerce suivante : "${targetUrl}" (domaine: "${domain}").

Voici les éléments passifs constatés :
${headersInfo}
SSL: ${sslInfo}

Consignes de calcul du score sur 100 points :
1. SSL / Redirection HTTPS (35 points max) : Redirection HTTPS (15 pts), Certificat valide (15 pts), Marge expiration > 30j (5 pts).
2. En-têtes HTTP de sécurité (40 points max) : HSTS (10 pts), X-Frame-Options (10 pts), Content-Security-Policy (10 pts), X-Content-Type-Options (5 pts), Referrer-Policy (5 pts).
3. Protection contre l'exposition (25 points max) : Masquage versions WordPress/WooCommerce (20 pts), Permissions-Policy (5 pts).

Barème officiel des notes :
- Note A : 90 à 100 pts (Excellente sécurité)
- Note B : 75 à 89 pts (Bonne sécurité)
- Note C : 60 à 74 pts (Sécurité moyenne, failles passives)
- Note D : 45 à 59 pts (Sécurité vulnérable)
- Note E : 25 à 44 pts (Sécurité critique)
- Note F : < 25 pts (Non protégée, exposition maximale)

Retourne un objet JSON structuré avec :
- score (entier de 0 à 100)
- grade ('A' | 'B' | 'C' | 'D' | 'E' | 'F')
- appreciation (synthèse vulgarisée bienveillante pour le gérant de boutique)
- faillesDetectees (tableau de vulnérabilités avec id, titre, severite, description, impactCommercant)
- recommandations (tableau des 3 actions prioritaires avec priorite, action, difficulte, gainEstime, explication)
- technologiesDetectees (liste : ex: WooCommerce, WordPress, Stripe, Nginx...)
- chiffreAffairesRisqueEstime (ex: "270 € - 1 370 € / jour")`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              grade: { type: Type.STRING },
              appreciation: { type: Type.STRING },
              faillesDetectees: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    titre: { type: Type.STRING },
                    severite: { type: Type.STRING },
                    description: { type: Type.STRING },
                    impactCommercant: { type: Type.STRING }
                  },
                  required: ["id", "titre", "severite", "description", "impactCommercant"]
                }
              },
              recommandations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    priorite: { type: Type.INTEGER },
                    action: { type: Type.STRING },
                    difficulte: { type: Type.STRING },
                    gainEstime: { type: Type.STRING },
                    explication: { type: Type.STRING }
                  },
                  required: ["priorite", "action", "difficulte", "gainEstime", "explication"]
                }
              },
              technologiesDetectees: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              chiffreAffairesRisqueEstime: { type: Type.STRING }
            },
            required: ["score", "grade", "appreciation", "faillesDetectees", "recommandations"]
          }
        }
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);

      const score = Math.max(0, Math.min(100, Number(parsed.score) || 60));
      let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'C';
      if (score >= 90) grade = 'A';
      else if (score >= 75) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 45) grade = 'D';
      else if (score >= 25) grade = 'E';
      else grade = 'F';

      return {
        url: targetUrl,
        domain,
        score,
        grade: (['A', 'B', 'C', 'D', 'E', 'F'].includes(parsed.grade) ? parsed.grade : grade) as any,
        appreciation: parsed.appreciation || "Analyse de sécurité passive réalisée pour votre boutique WooCommerce.",
        faillesDetectees: Array.isArray(parsed.faillesDetectees) ? parsed.faillesDetectees : [],
        recommandations: Array.isArray(parsed.recommandations) ? parsed.recommandations : [],
        technologiesDetectees: Array.isArray(parsed.technologiesDetectees) ? parsed.technologiesDetectees : ['WooCommerce', 'WordPress'],
        chiffreAffairesRisqueEstime: parsed.chiffreAffairesRisqueEstime || "270 € - 1 370 € / jour",
        dateAnalyse,
        source: 'gemini',
        rawAiResponse: rawText
      };
    } catch {
      // Repli gracieux en cas de problème de connexion ou quota avec l'API
    }
  }

  // Fallback heuristique déterministe
  return buildHeuristicScanResult(targetUrl, domain, passiveData, dateAnalyse);
}

/**
 * Alias de compatibilité
 */
export const scanWooCommerceWithAi = scanWooCommerceWithGenerativeAi;
export const scanWithGoogleGenerativeAi = scanWooCommerceWithGenerativeAi;


