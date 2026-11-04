/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires des utilitaires de scan (src/lib/scanner.test.ts)
 * Validation de l'extraction et conformité des en-têtes HTTP de sécurité (Vitest)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  sanitizeAndValidateUrl,
  validateUrlFormat,
  isPrivateOrReservedIp,
  resolveDnsHost,
  validateUrlAndResolveDns,
  validateHstsHeader,
  validateCspHeader,
  validateXFrameOptions,
  validateXContentTypeOptions,
  validateReferrerPolicy,
  validatePermissionsPolicy,
  validateAllSecurityHeaders,
  fetchPassiveSite,
  logScanAttempt,
  getLocalScanLogs,
  clearLocalScanLogs,
  parseCertificateDates,
  extractIssuerSummary,
  evaluateSslCertificate,
  extractSslFromPeerCertificate,
  extractSslDetailsFromFetchResponse,
  fetchSslCertificateDetails,
  parseFetchError,
  executePassiveScan,
  verifySiteReachability,
  validateUrlAndPingDomain,
  scanWooCommerceWithGenerativeAi,
  scanWooCommerceWithAi,
  AiWooCommerceScanResult,
  ReachabilityCheckResult,
  VerifyReachabilityOptions,
  ScanErrorCode,
  ScanErrorState,
  DnsResolutionDetails,
  UrlFormatValidationResult,
  UrlAndDnsValidationResult
} from './scanner.ts';

describe('1. Validation d\'URL et protection anti-SSRF (sanitizeAndValidateUrl)', () => {
  it('doit normaliser une URL valide et extraire le nom de domaine', () => {
    const res = sanitizeAndValidateUrl('boutique-chaussures.fr');
    expect(res.valid).toBe(true);
    expect(res.target?.normalizedUrl).toBe('https://boutique-chaussures.fr');
    expect(res.target?.hostname).toBe('boutique-chaussures.fr');
  });

  it('doit accepter http et https en conservant les chemins légitimes', () => {
    const res = sanitizeAndValidateUrl('https://maboutique.com/shop');
    expect(res.valid).toBe(true);
    expect(res.target?.hostname).toBe('maboutique.com');
  });

  it('doit bloquer les adresses IP privées et internes (anti-SSRF strict)', () => {
    expect(sanitizeAndValidateUrl('http://127.0.0.1').valid).toBe(false);
    expect(sanitizeAndValidateUrl('http://localhost').valid).toBe(false);
    expect(sanitizeAndValidateUrl('http://192.168.1.1').valid).toBe(false);
    expect(sanitizeAndValidateUrl('http://10.0.0.1').valid).toBe(false);
    expect(sanitizeAndValidateUrl('http://172.16.0.1').valid).toBe(false);
    expect(sanitizeAndValidateUrl('http://169.254.169.254').valid).toBe(false);
  });

  it('doit rejeter les chaînes vides ou invalides', () => {
    expect(sanitizeAndValidateUrl('').valid).toBe(false);
    expect(sanitizeAndValidateUrl('invalid-no-dot').valid).toBe(false);
  });
});

describe('2. Validation des en-têtes de sécurité HTTP (Extraction & Règles)', () => {
  // A. HSTS
  it('doit valider l\'en-tête HSTS quand max-age >= 30 jours (10 pts)', () => {
    const checkOk = validateHstsHeader('max-age=31536000; includeSubDomains');
    expect(checkOk.present).toBe(true);
    expect(checkOk.isValid).toBe(true);
    expect(checkOk.pointsEarned).toBe(10);
    expect(checkOk.details).toContain('HSTS actif et valide');

    const checkShort = validateHstsHeader('max-age=3600');
    expect(checkShort.present).toBe(true);
    expect(checkShort.isValid).toBe(false);
    expect(checkShort.pointsEarned).toBe(5);
    expect(checkShort.recommendation).toBeDefined();

    const checkMissing = validateHstsHeader(undefined);
    expect(checkMissing.present).toBe(false);
    expect(checkMissing.isValid).toBe(false);
    expect(checkMissing.pointsEarned).toBe(0);
    expect(checkMissing.urgency).toBe('critique');
  });

  // B. Content-Security-Policy (CSP)
  it('doit valider la présence d\'une politique CSP avec directives (10 pts)', () => {
    const checkOk = validateCspHeader("default-src 'self' https:; script-src 'self' https://js.stripe.com");
    expect(checkOk.present).toBe(true);
    expect(checkOk.isValid).toBe(true);
    expect(checkOk.pointsEarned).toBe(10);
    expect(checkOk.details).toContain('restreignant les sources');

    const checkMinimal = validateCspHeader("script-src 'self'");
    expect(checkMinimal.present).toBe(true);
    expect(checkMinimal.isValid).toBe(true);
    expect(checkMinimal.pointsEarned).toBe(10);

    const checkMissing = validateCspHeader(undefined);
    expect(checkMissing.present).toBe(false);
    expect(checkMissing.isValid).toBe(false);
    expect(checkMissing.pointsEarned).toBe(0);
    expect(checkMissing.urgency).toBe('critique');
  });

  // C. X-Frame-Options & CSP frame-ancestors
  it('doit valider X-Frame-Options (DENY, SAMEORIGIN ou via CSP frame-ancestors)', () => {
    const checkSameOrigin = validateXFrameOptions('SAMEORIGIN');
    expect(checkSameOrigin.present).toBe(true);
    expect(checkSameOrigin.isValid).toBe(true);
    expect(checkSameOrigin.pointsEarned).toBe(10);

    const checkDeny = validateXFrameOptions('DENY');
    expect(checkDeny.present).toBe(true);
    expect(checkDeny.isValid).toBe(true);

    const checkCspAncestors = validateXFrameOptions(undefined, "default-src 'self'; frame-ancestors 'none';");
    expect(checkCspAncestors.present).toBe(true);
    expect(checkCspAncestors.isValid).toBe(true);
    expect(checkCspAncestors.pointsEarned).toBe(10);

    const checkMissing = validateXFrameOptions(undefined);
    expect(checkMissing.present).toBe(false);
    expect(checkMissing.isValid).toBe(false);
    expect(checkMissing.pointsEarned).toBe(0);
  });

  // D. X-Content-Type-Options
  it('doit valider X-Content-Type-Options: nosniff (5 pts)', () => {
    const checkOk = validateXContentTypeOptions('nosniff');
    expect(checkOk.present).toBe(true);
    expect(checkOk.isValid).toBe(true);
    expect(checkOk.pointsEarned).toBe(5);

    const checkMissing = validateXContentTypeOptions(undefined);
    expect(checkMissing.present).toBe(false);
    expect(checkMissing.isValid).toBe(false);
    expect(checkMissing.pointsEarned).toBe(0);
  });

  // E. Referrer-Policy
  it('doit valider Referrer-Policy avec les directives sécurisées (5 pts)', () => {
    const checkStrictOrigin = validateReferrerPolicy('strict-origin-when-cross-origin');
    expect(checkStrictOrigin.present).toBe(true);
    expect(checkStrictOrigin.isValid).toBe(true);
    expect(checkStrictOrigin.pointsEarned).toBe(5);

    const checkNoReferrer = validateReferrerPolicy('no-referrer');
    expect(checkNoReferrer.present).toBe(true);
    expect(checkNoReferrer.isValid).toBe(true);

    const checkUnsafe = validateReferrerPolicy('unsafe-url');
    expect(checkUnsafe.present).toBe(true);
    expect(checkUnsafe.isValid).toBe(false);
    expect(checkUnsafe.pointsEarned).toBe(0);

    const checkMissing = validateReferrerPolicy(undefined);
    expect(checkMissing.present).toBe(false);
    expect(checkMissing.pointsEarned).toBe(0);
  });

  // F. Permissions-Policy
  it('doit valider la présence de Permissions-Policy (5 pts)', () => {
    const checkOk = validatePermissionsPolicy('camera=(), microphone=()');
    expect(checkOk.present).toBe(true);
    expect(checkOk.isValid).toBe(true);
    expect(checkOk.pointsEarned).toBe(5);

    const checkMissing = validatePermissionsPolicy(undefined);
    expect(checkMissing.present).toBe(false);
    expect(checkMissing.pointsEarned).toBe(0);
  });

  // G. Rapport consolidé de tous les en-têtes
  it('doit calculer le score global des en-têtes HTTP (validateAllSecurityHeaders)', () => {
    const headersParfaits = {
      'strict-transport-security': 'max-age=31536000',
      'content-security-policy': "default-src 'self'",
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=()'
    };

    const reportParfait = validateAllSecurityHeaders('maboutique.fr', headersParfaits);
    expect(reportParfait.totalScoreHeaders).toBe(45); // 10 + 10 + 10 + 5 + 5 + 5 = 45
    expect(reportParfait.hsts.isValid).toBe(true);
    expect(reportParfait.csp.isValid).toBe(true);
    expect(reportParfait.xFrameOptions.isValid).toBe(true);
    expect(reportParfait.checks.length).toBe(6);

    const headersVides = {};
    const reportVide = validateAllSecurityHeaders('maboutique-sans-headers.fr', headersVides);
    expect(reportVide.totalScoreHeaders).toBe(0);
    expect(reportVide.hsts.present).toBe(false);
    expect(reportVide.csp.present).toBe(false);
  });
});

describe('3. Requête fetch passive (fetchPassiveSite)', () => {
  it('doit exécuter une seule requête GET avec User-Agent transparent et normaliser les en-têtes', async () => {
    const mockHeaders = new Headers();
    mockHeaders.set('Strict-Transport-Security', 'max-age=31536000');
    mockHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    mockHeaders.set('Content-Type', 'text/html; charset=UTF-8');

    const mockResponse = {
      status: 200,
      url: 'https://maboutique-mode.fr/',
      headers: mockHeaders,
      text: async () => '<html><head><title>Boutique</title></head><body>OK</body></html>'
    };

    const globalFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as unknown as Response);

    const result = await fetchPassiveSite('https://maboutique-mode.fr');

    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(result.statusCode).toBe(200);
    expect(result.isHttps).toBe(true);
    expect(result.headers['strict-transport-security']).toBe('max-age=31536000');
    expect(result.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(result.headers['content-type']).toBe('text/html; charset=UTF-8');

    globalFetch.mockRestore();
  });
});

describe('4. Module de logging Supabase (Journal des analyses)', () => {
  it('doit enregistrer une tentative d\'analyse avec domaine, date et email dans Supabase', async () => {
    let insertedPayload: any = null;
    const mockSupabaseClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockImplementation(async (payload) => {
          insertedPayload = payload;
          return { data: [payload], error: null };
        })
      })
    };

    const logEntry = {
      domain: 'maboutique-mode.fr',
      email: 'gerant@maboutique-mode.fr',
      isOwnerConfirmed: true,
      status: 'success' as const,
      score: 75,
      grade: 'B'
    };

    const res = await logScanAttempt(logEntry, mockSupabaseClient);

    expect(res.success).toBe(true);
    expect(res.source).toBe('supabase');
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('scan_logs');
    expect(insertedPayload.domain).toBe('maboutique-mode.fr');
    expect(insertedPayload.email).toBe('gerant@maboutique-mode.fr');
    expect(insertedPayload.is_owner_confirmed).toBe(true);
    expect(insertedPayload.created_at).toBeDefined();
  });

  it('doit archiver en local de manière résiliente en l\'absence de client Supabase', async () => {
    clearLocalScanLogs();

    const logEntry = {
      domain: 'boutique-second.fr',
      email: 'contact@boutique-second.fr',
      isOwnerConfirmed: true,
      status: 'rate_limited' as const
    };

    const res = await logScanAttempt(logEntry);

    expect(res.success).toBe(true);
    expect(res.source).toBe('local_fallback');

    const logs = getLocalScanLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].domain).toBe('boutique-second.fr');
    expect(logs[0].email).toBe('contact@boutique-second.fr');
    expect(logs[0].status).toBe('rate_limited');
  });
});

describe('5. Extraction et validation passive du certificat SSL/TLS (src/lib/scanner.ts)', () => {
  const fixedRefDate = new Date('2026-11-01T12:00:00Z');

  describe('A. parseCertificateDates', () => {
    it('doit calculer correctement les jours restants et le statut valide (> 30j)', () => {
      const validFrom = '2026-10-01T00:00:00Z';
      const validTo = '2027-01-01T00:00:00Z'; // 60 jours restants
      const res = parseCertificateDates(validFrom, validTo, fixedRefDate);

      expect(res.isExpired).toBe(false);
      expect(res.isExpiringSoon).toBe(false);
      expect(res.daysRemaining).toBe(60);
      expect(res.validTo).toBe('2027-01-01T00:00:00.000Z');
    });

    it('doit détecter un certificat expirant sous 30 jours (isExpiringSoon)', () => {
      const validFrom = '2026-08-01T00:00:00Z';
      const validTo = '2026-11-15T00:00:00Z'; // 13 jours restants
      const res = parseCertificateDates(validFrom, validTo, fixedRefDate);

      expect(res.isExpired).toBe(false);
      expect(res.isExpiringSoon).toBe(true);
      expect(res.daysRemaining).toBe(13);
    });

    it('doit identifier un certificat déjà expiré', () => {
      const validFrom = '2026-01-01T00:00:00Z';
      const validTo = '2026-10-20T00:00:00Z'; // Expiré
      const res = parseCertificateDates(validFrom, validTo, fixedRefDate);

      expect(res.isExpired).toBe(true);
      expect(res.isExpiringSoon).toBe(false);
      expect(res.daysRemaining).toBeLessThan(0);
    });
  });

  describe('B. extractIssuerSummary', () => {
    it('doit extraire une autorité depuis un objet avec Organisation et Common Name', () => {
      const issuerObj = { O: "Let's Encrypt", CN: 'R3', C: 'US' };
      const summary = extractIssuerSummary(issuerObj);
      expect(summary.issuer).toBe("Let's Encrypt (R3)");
      expect(summary.issuerOrg).toBe("Let's Encrypt");
    });

    it('doit formater une autorité depuis une chaîne au format X.509', () => {
      const issuerStr = 'CN=Cloudflare Inc ECC CA-3, O=Cloudflare, Inc., C=US';
      const summary = extractIssuerSummary(issuerStr);
      expect(summary.issuer).toContain('Cloudflare');
    });

    it('doit gérer les autorités inconnues ou indéfinies', () => {
      expect(extractIssuerSummary(undefined).issuer).toBe('Autorité inconnue');
    });
  });

  describe('C. evaluateSslCertificate (Barème BoutiqueSûre 20 pts)', () => {
    it('doit attribuer 20/20 pour un certificat valide avec plus de 30 jours de marge', () => {
      const res = evaluateSslCertificate({
        isValid: true,
        issuer: { O: "Let's Encrypt", CN: 'E1' },
        subject: 'maboutique-mode.fr',
        validFrom: '2026-10-01T00:00:00Z',
        validTo: '2027-01-15T00:00:00Z',
        protocol: 'TLSv1.3',
        referenceDate: fixedRefDate
      });

      expect(res.isValid).toBe(true);
      expect(res.status).toBe('valid');
      expect(res.pointsEarned).toBe(20);
      expect(res.maxPoints).toBe(20);
      expect(res.urgency).toBe('info');
      expect(res.details).toContain("Let's Encrypt");
      expect(res.details).toContain('Marge confortable');
    });

    it('doit attribuer 15/20 et alerter pour un certificat expirant sous 30 jours', () => {
      const res = evaluateSslCertificate({
        isValid: true,
        issuer: 'Sectigo RSA Domain Validation Secure Server CA',
        subject: 'maboutique-chaussures.fr',
        validFrom: '2025-11-01T00:00:00Z',
        validTo: '2026-11-12T00:00:00Z', // 10 jours restants
        referenceDate: fixedRefDate
      });

      expect(res.isValid).toBe(true);
      expect(res.status).toBe('expiring_soon');
      expect(res.pointsEarned).toBe(15);
      expect(res.urgency).toBe('urgent');
      expect(res.recommendation).toBeDefined();
    });

    it('doit attribuer 0/20 pour un certificat expiré', () => {
      const res = evaluateSslCertificate({
        isValid: true,
        issuer: "Let's Encrypt",
        subject: 'boutique-oubliee.fr',
        validFrom: '2026-05-01T00:00:00Z',
        validTo: '2026-10-25T00:00:00Z',
        referenceDate: fixedRefDate
      });

      expect(res.isValid).toBe(false);
      expect(res.status).toBe('expired');
      expect(res.pointsEarned).toBe(0);
      expect(res.urgency).toBe('critique');
    });

    it('doit attribuer 0/20 si la boutique est en HTTP non chiffré', () => {
      const res = evaluateSslCertificate({
        isHttps: false,
        subject: 'insecure-store.com',
        referenceDate: fixedRefDate
      });

      expect(res.isValid).toBe(false);
      expect(res.status).toBe('no_ssl');
      expect(res.pointsEarned).toBe(0);
      expect(res.urgency).toBe('critique');
    });

    it('doit attribuer 0/20 pour un certificat auto-signé ou non autorisé', () => {
      const res = evaluateSslCertificate({
        isValid: false,
        rawError: 'DEPTH_ZERO_SELF_SIGNED_CERT',
        referenceDate: fixedRefDate
      });

      expect(res.isValid).toBe(false);
      expect(res.status).toBe('invalid');
      expect(res.pointsEarned).toBe(0);
      expect(res.urgency).toBe('critique');
    });
  });

  describe('D. extractSslFromPeerCertificate (Format socket Node TLS)', () => {
    it('doit convertir un objet peerCert de socket Node.js', () => {
      const mockPeerCert = {
        subject: { CN: 'maboutique-maroquinerie.be' },
        issuer: { O: 'Google Trust Services LLC', CN: 'WE1' },
        valid_from: 'Oct 01 00:00:00 2026 GMT',
        valid_to: 'Dec 30 23:59:59 2026 GMT'
      };

      const res = extractSslFromPeerCertificate(mockPeerCert, true, fixedRefDate, {
        protocol: 'TLSv1.3',
        cipher: 'TLS_AES_256_GCM_SHA384'
      });

      expect(res.isValid).toBe(true);
      expect(res.subject).toBe('maboutique-maroquinerie.be');
      expect(res.issuer).toContain('Google Trust Services');
      expect(res.protocol).toBe('TLSv1.3');
      expect(res.pointsEarned).toBe(20);
    });
  });

  describe('E. fetchSslCertificateDetails & extractSslDetailsFromFetchResponse', () => {
    it('doit extraire les détails depuis une réponse fetch ou des en-têtes proxy', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('x-ssl-issuer', "Let's Encrypt Authority X3");
      mockHeaders.set('x-ssl-valid-to', '2027-02-01T00:00:00Z');
      mockHeaders.set('x-ssl-valid-from', '2026-10-01T00:00:00Z');

      const mockResponse = {
        url: 'https://maboutique-mode.fr/',
        status: 200,
        headers: mockHeaders
      } as unknown as Response;

      const res = extractSslDetailsFromFetchResponse(mockResponse, {
        referenceDate: fixedRefDate,
        targetHostname: 'maboutique-mode.fr'
      });

      expect(res.isValid).toBe(true);
      expect(res.issuer).toContain("Let's Encrypt");
      expect(res.daysRemaining).toBeGreaterThan(60);
      expect(res.pointsEarned).toBe(20);
    });

    it('doit intégrer les détails SSL dans fetchPassiveSite lorsque includeSslDetails est activé', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('Strict-Transport-Security', 'max-age=31536000');
      mockHeaders.set('x-ssl-issuer', 'Cloudflare, Inc. ECC CA-3');

      const mockResponse = {
        status: 200,
        url: 'https://boutique-test-ssl.fr/',
        headers: mockHeaders,
        text: async () => '<html><body>OK</body></html>'
      };

      const globalFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as unknown as Response);

      const result = await fetchPassiveSite('https://boutique-test-ssl.fr', {
        includeSslDetails: true
      });

      expect(result.isHttps).toBe(true);
      expect(result.sslDetails).toBeDefined();
      expect(result.sslDetails?.isValid).toBe(true);

      globalFetch.mockRestore();
    });
  });
});

describe('6. Gestion d\'erreurs robuste et tolérance de panne (parseFetchError & fetchPassiveSite)', () => {
  describe('A. parseFetchError - Qualification des pannes réseau', () => {
    it('doit qualifier un timeout (AbortError ou TimeoutError) avec message vulgarisé et suggestion', () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      const parsed = parseFetchError(abortError, 'https://boutique-lente.fr', 8000);
      expect(parsed.code).toBe('timeout');
      expect(parsed.canRetry).toBe(true);
      expect(parsed.message).toContain('délai imparti');
      expect(parsed.message).toContain('8s');
      expect(parsed.suggestedAction).toContain('serveur web répond rapidement');
    });

    it('doit qualifier une erreur de timeout avec ETIMEDOUT', () => {
      const timeoutErr: any = new Error('connect ETIMEDOUT');
      timeoutErr.code = 'ETIMEDOUT';

      const parsed = parseFetchError(timeoutErr, 'https://boutique-timeout.fr', 5000);
      expect(parsed.code).toBe('timeout');
      expect(parsed.canRetry).toBe(true);
    });

    it('doit qualifier un nom de domaine introuvable (ENOTFOUND / DNS)', () => {
      const dnsErr: any = new Error('fetch failed');
      dnsErr.cause = { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND domaine-inexistant.fr' };

      const parsed = parseFetchError(dnsErr, 'https://domaine-inexistant.fr');
      expect(parsed.code).toBe('dns_unresolved');
      expect(parsed.canRetry).toBe(false);
      expect(parsed.message).toContain('domaine introuvable');
      expect(parsed.suggestedAction).toContain('zone DNS');
    });

    it('doit qualifier un serveur inaccessible ou port fermé (ECONNREFUSED)', () => {
      const connErr: any = new Error('fetch failed');
      connErr.cause = { code: 'ECONNREFUSED', message: 'connect ECONNREFUSED 198.51.100.1:443' };

      const parsed = parseFetchError(connErr, 'https://boutique-fermee.fr');
      expect(parsed.code).toBe('unreachable_server');
      expect(parsed.canRetry).toBe(true);
      expect(parsed.message).toContain('Impossible d\'établir une connexion');
      expect(parsed.suggestedAction).toContain('Nginx ou Apache');
    });

    it('doit qualifier une erreur de poignée de main SSL/TLS', () => {
      const sslErr: any = new Error('certificate has expired');
      sslErr.code = 'CERT_HAS_EXPIRED';

      const parsed = parseFetchError(sslErr, 'https://boutique-ssl-expire.fr');
      expect(parsed.code).toBe('ssl_error');
      expect(parsed.canRetry).toBe(false);
      expect(parsed.message).toContain('SSL/TLS');
    });

    it('doit gérer les erreurs génériques avec fallback propre', () => {
      const genericErr = new Error('Unexpected network glitch');
      const parsed = parseFetchError(genericErr, 'https://boutique-glitch.fr');

      expect(parsed.code).toBe('unknown_error');
      expect(parsed.canRetry).toBe(true);
      expect(parsed.technicalDetails).toContain('Unexpected network glitch');
    });
  });

  describe('B. fetchPassiveSite - Résilience face aux pannes sans exception non gérée', () => {
    it('doit interdire les URLs privées ou locales (anti-SSRF) et retourner un code ssrf_blocked sans crash', async () => {
      const result = await fetchPassiveSite('http://127.0.0.1:8080');

      expect(result.isSuccess).toBe(false);
      expect(result.statusCode).toBe(0);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('ssrf_blocked');
      expect(result.error?.canRetry).toBe(false);
      expect(result.error?.message).toContain('interdite');
    });

    it('doit rejeter les URLs mal formatées avec code invalid_url sans crash', async () => {
      const result = await fetchPassiveSite('not_a_valid_url');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('invalid_url');
      expect(result.error?.canRetry).toBe(false);
    });

    it('doit intercepter un timeout fetch sans lever d\'exception', async () => {
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(abortErr);

      const result = await fetchPassiveSite('https://boutique-lente.fr', { timeoutMs: 3000 });

      expect(result.isSuccess).toBe(false);
      expect(result.statusCode).toBe(0);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('timeout');
      expect(result.error?.canRetry).toBe(true);

      fetchSpy.mockRestore();
    });

    it('doit intercepter un échec DNS (ENOTFOUND) et retourner l\'erreur structurée', async () => {
      const dnsErr: any = new Error('fetch failed');
      dnsErr.cause = { code: 'ENOTFOUND' };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(dnsErr);

      const result = await fetchPassiveSite('https://boutique-fantome.fr');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('dns_unresolved');
      expect(result.error?.canRetry).toBe(false);

      fetchSpy.mockRestore();
    });

    it('doit qualifier une réponse HTTP 403 Forbidden sans planter', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('Server', 'cloudflare');

      const mockResponse = {
        status: 403,
        statusText: 'Forbidden',
        url: 'https://boutique-bloquee.fr',
        headers: mockHeaders,
        text: async () => '<html><body>403 Forbidden</body></html>'
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as unknown as Response);

      const result = await fetchPassiveSite('https://boutique-bloquee.fr');

      expect(result.isSuccess).toBe(false);
      expect(result.statusCode).toBe(403);
      expect(result.error?.code).toBe('http_client_error');
      expect(result.error?.message).toContain('403');

      fetchSpy.mockRestore();
    });

    it('doit qualifier une réponse HTTP 500 Server Error sans planter', async () => {
      const mockHeaders = new Headers();
      const mockResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        url: 'https://boutique-panne.fr',
        headers: mockHeaders,
        text: async () => '<html><body>Internal Error</body></html>'
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as unknown as Response);

      const result = await fetchPassiveSite('https://boutique-panne.fr');

      expect(result.isSuccess).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error?.code).toBe('http_server_error');
      expect(result.error?.canRetry).toBe(true);

      fetchSpy.mockRestore();
    });
  });

  describe('C. executePassiveScan - Cycle complet d\'analyse sécurisée', () => {
    it('doit exécuter une analyse complète sans incident sur un site opérationnel', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('Strict-Transport-Security', 'max-age=31536000');
      mockHeaders.set('Content-Security-Policy', "default-src 'self'");
      mockHeaders.set('X-Frame-Options', 'SAMEORIGIN');
      mockHeaders.set('X-Content-Type-Options', 'nosniff');
      mockHeaders.set('x-ssl-issuer', 'Let\'s Encrypt');

      const mockResponse = {
        status: 200,
        statusText: 'OK',
        url: 'https://maboutique-ok.fr/',
        headers: mockHeaders,
        text: async () => '<html><head><title>Boutique</title></head><body><h1>Bienvenue</h1></body></html>'
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as unknown as Response);

      const result = await executePassiveScan('https://maboutique-ok.fr');

      expect(result.success).toBe(true);
      expect(result.targetDomain).toBe('maboutique-ok.fr');
      expect(result.headersReport).toBeDefined();
      expect(result.headersReport?.hsts.isValid).toBe(true);
      expect(result.headersReport?.csp.isValid).toBe(true);

      fetchSpy.mockRestore();
    });

    it('doit renvoyer une erreur structurée sans crash sur une tentative d\'URL locale', async () => {
      const result = await executePassiveScan('http://localhost:3000');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('ssrf_blocked');
    });

    it('doit renvoyer une erreur structurée propre sur échec de connexion', async () => {
      const connErr: any = new Error('fetch failed');
      connErr.cause = { code: 'ECONNREFUSED' };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(connErr);

      const result = await executePassiveScan('https://boutique-offline.fr');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('unreachable_server');

      fetchSpy.mockRestore();
    });
  });
});

describe('7. Validation avancée de format d\'URL et résolution DNS préalable', () => {
  describe('A. Validation de format d\'URL et filtrage anti-SSRF statique (validateUrlFormat)', () => {
    it('doit accepter les URLs WooCommerce bien formées et normaliser l\'adresse', () => {
      const res = validateUrlFormat('https://shop.ma-boutique-bio.fr/produits?cat=1');
      expect(res.valid).toBe(true);
      expect(res.target?.hostname).toBe('shop.ma-boutique-bio.fr');
      expect(res.target?.protocol).toBe('https:');
      expect(res.target?.normalizedUrl).toBe('https://shop.ma-boutique-bio.fr/produits');
    });

    it('doit rejeter les URLs contenant des espaces internes', () => {
      const res = validateUrlFormat('https://ma boutique.fr');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('espaces');
      expect(res.errorState?.code).toBe('invalid_url');
    });

    it('doit rejeter les URLs contenant des identifiants d\'authentification (userinfo)', () => {
      const res = validateUrlFormat('https://admin:secret123@ma-boutique.fr');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('identifiants d\'authentification');
      expect(res.errorState?.code).toBe('invalid_url');
    });

    it('doit rejeter les URLs dépassant 2048 caractères', () => {
      const longPath = 'a'.repeat(2100);
      const res = validateUrlFormat(`https://ma-boutique.fr/${longPath}`);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('longueur maximale');
      expect(res.errorState?.code).toBe('invalid_url');
    });

    it('doit rejeter les domaines avec des points consécutifs', () => {
      const res = validateUrlFormat('https://ma-boutique..fr');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('points consécutifs');
    });

    it('doit rejeter les labels commençant ou se terminant par un tiret', () => {
      expect(validateUrlFormat('https://-maboutique.fr').valid).toBe(false);
      expect(validateUrlFormat('https://maboutique-.fr').valid).toBe(false);
    });

    it('doit rejeter les caractères non autorisés dans le nom de domaine', () => {
      expect(validateUrlFormat('https://ma$boutique.fr').valid).toBe(false);
      expect(validateUrlFormat('https://ma_boutique!.fr').valid).toBe(false);
    });

    it('doit rejeter les extensions de domaine (TLD) invalides ou purement numériques', () => {
      expect(validateUrlFormat('https://ma-boutique.123').valid).toBe(false);
      expect(validateUrlFormat('https://ma-boutique.x').valid).toBe(false);
    });

    it('doit valider les numéros de port autorisés et rejeter les ports invalides', () => {
      const validPort = validateUrlFormat('https://ma-boutique.fr:8443');
      expect(validPort.valid).toBe(true);

      const invalidPort = validateUrlFormat('https://ma-boutique.fr:99999');
      expect(invalidPort.valid).toBe(false);
      expect(invalidPort.error).toContain('port');
    });

    it('doit identifier exhaustivement les adresses IP privées et réservées (isPrivateOrReservedIp)', () => {
      // IPv4
      expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('127.8.9.10')).toBe(true);
      expect(isPrivateOrReservedIp('0.0.0.0')).toBe(true);
      expect(isPrivateOrReservedIp('10.254.1.1')).toBe(true);
      expect(isPrivateOrReservedIp('192.168.10.5')).toBe(true);
      expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true);
      expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true); // AWS/GCP metadata
      expect(isPrivateOrReservedIp('100.64.0.1')).toBe(true);      // CGNAT
      expect(isPrivateOrReservedIp('192.0.2.1')).toBe(true);       // Test-Net
      expect(isPrivateOrReservedIp('255.255.255.255')).toBe(true); // Broadcast

      // IPv6
      expect(isPrivateOrReservedIp('::1')).toBe(true);
      expect(isPrivateOrReservedIp('fc00::1')).toBe(true);
      expect(isPrivateOrReservedIp('fd12:3456:789a::1')).toBe(true);
      expect(isPrivateOrReservedIp('fe80::1')).toBe(true);
      expect(isPrivateOrReservedIp('::ffff:192.168.1.1')).toBe(true);

      // IP Publiques légitimes
      expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
      expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
      expect(isPrivateOrReservedIp('93.184.216.34')).toBe(false);
      expect(isPrivateOrReservedIp('172.32.0.1')).toBe(false); // Hors plage 172.16-31
    });

    it('doit bloquer les domaines internes et locaux (.localhost, .local, .internal, .lan)', () => {
      expect(validateUrlFormat('http://boutique.localhost').errorState?.code).toBe('ssrf_blocked');
      expect(validateUrlFormat('http://service.local').errorState?.code).toBe('ssrf_blocked');
      expect(validateUrlFormat('http://db.internal').errorState?.code).toBe('ssrf_blocked');
      expect(validateUrlFormat('http://router.lan').errorState?.code).toBe('ssrf_blocked');
    });
  });

  describe('B. Résolution DNS et détection DNS Rebinding (resolveDnsHost)', () => {
    it('doit utiliser un résolveur injecté personnalisé et extraire les adresses IP', async () => {
      const mockResolver = vi.fn().mockResolvedValue([
        { address: '93.184.216.34', family: 4 },
        { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 }
      ]);

      const res = await resolveDnsHost('example.com', { dnsResolver: mockResolver });

      expect(res.resolved).toBe(true);
      expect(res.primaryIp).toBe('93.184.216.34');
      expect(res.ipAddresses).toHaveLength(2);
      expect(res.isPrivateOrLocal).toBe(false);
      expect(mockResolver).toHaveBeenCalledWith('example.com');
    });

    it('doit détecter une tentative de DNS Rebinding vers une IP privée', async () => {
      const mockResolver = vi.fn().mockResolvedValue([
        { address: '127.0.0.1', family: 4 }
      ]);

      const res = await resolveDnsHost('rebind.evil-domain.com', { dnsResolver: mockResolver });

      expect(res.resolved).toBe(true);
      expect(res.isPrivateOrLocal).toBe(true);
      expect(res.primaryIp).toBe('127.0.0.1');
    });

    it('doit signaler un échec de résolution quand le résolveur renvoie une liste vide ou lève une erreur', async () => {
      const mockResolver = vi.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));

      const res = await resolveDnsHost('domaine-inexistant-fantome.fr', { dnsResolver: mockResolver });

      expect(res.resolved).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('C. Validation composite format et DNS (validateUrlAndResolveDns)', () => {
    it('doit rejeter immédiatement sans appel DNS si le format est invalide', async () => {
      const mockResolver = vi.fn();
      const res = await validateUrlAndResolveDns('pas_une_url_valide', { dnsResolver: mockResolver });

      expect(res.valid).toBe(false);
      expect(res.errorState?.code).toBe('invalid_url');
      expect(mockResolver).not.toHaveBeenCalled();
    });

    it('doit rejeter immédiatement sans appel DNS si la cible est un localhost statique', async () => {
      const mockResolver = vi.fn();
      const res = await validateUrlAndResolveDns('http://127.0.0.1', { dnsResolver: mockResolver });

      expect(res.valid).toBe(false);
      expect(res.errorState?.code).toBe('ssrf_blocked');
      expect(mockResolver).not.toHaveBeenCalled();
    });

    it('doit renvoyer une erreur structurée dns_unresolved lorsque la résolution DNS échoue', async () => {
      const mockResolver = vi.fn().mockResolvedValue([]);
      const res = await validateUrlAndResolveDns('https://boutique-introuvable-999.fr', {
        checkDns: true,
        dnsResolver: mockResolver
      });

      expect(res.valid).toBe(false);
      expect(res.errorState?.code).toBe('dns_unresolved');
      expect(res.errorState?.message).toContain('Nom de domaine introuvable');
      expect(res.errorState?.suggestedAction).toContain('zone DNS');
    });

    it('doit bloquer avec code ssrf_blocked si le domaine résout vers une IP interne (DNS Rebinding)', async () => {
      const mockResolver = vi.fn().mockResolvedValue(['192.168.1.254']);
      const res = await validateUrlAndResolveDns('https://boutique-rebind.fr', {
        checkDns: true,
        dnsResolver: mockResolver
      });

      expect(res.valid).toBe(false);
      expect(res.errorState?.code).toBe('ssrf_blocked');
      expect(res.errorState?.message).toContain('adresse IP interne ou privée');
    });

    it('doit valider avec succès un domaine public valide', async () => {
      const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);
      const res = await validateUrlAndResolveDns('https://boutique-valide.fr', {
        checkDns: true,
        dnsResolver: mockResolver
      });

      expect(res.valid).toBe(true);
      expect(res.target?.hostname).toBe('boutique-valide.fr');
      expect(res.dns?.primaryIp).toBe('93.184.216.34');
      expect(res.dns?.resolved).toBe(true);
    });
  });

  describe('D. Filtrage préalable dans fetchPassiveSite avant déclenchement fetch', () => {
    it('ne doit JAMAIS appeler fetch si le format d\'URL est invalide', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const result = await fetchPassiveSite('bad_format_url');

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('invalid_url');
      fetchSpy.mockRestore();
    });

    it('ne doit JAMAIS appeler fetch si le nom de domaine ne résout pas en DNS', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const mockResolver = vi.fn().mockRejectedValue(new Error('ENOTFOUND'));

      const result = await fetchPassiveSite('https://boutique-dns-ko.fr', {
        checkDns: true,
        dnsResolver: mockResolver
      });

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('dns_unresolved');
      fetchSpy.mockRestore();
    });

    it('ne doit JAMAIS appeler fetch si le domaine résout vers une IP privée (DNS Rebinding)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const mockResolver = vi.fn().mockResolvedValue(['10.0.0.1']);

      const result = await fetchPassiveSite('https://boutique-rebind.fr', {
        checkDns: true,
        dnsResolver: mockResolver
      });

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('ssrf_blocked');
      fetchSpy.mockRestore();
    });
  });
});

describe('9. Vérification préalable de joignabilité (verifySiteReachability / validateUrlAndPingDomain)', () => {
  it('doit rejeter immédiatement une URL à syntaxe invalide sans effectuer de requête fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await verifySiteReachability('url-sans-extension-invalide');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.valid).toBe(false);
    expect(result.reachable).toBe(false);
    expect(result.errorState?.code).toBe('invalid_url');
    expect(result.error).toContain('Nom de domaine invalide');
    fetchSpy.mockRestore();
  });

  it('doit bloquer immédiatement une adresse privée ou locale (anti-SSRF) sans fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await verifySiteReachability('http://127.0.0.1:8080');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.valid).toBe(false);
    expect(result.reachable).toBe(false);
    expect(result.errorState?.code).toBe('ssrf_blocked');
    expect(result.error).toContain('Analyse interdite');
    fetchSpy.mockRestore();
  });

  it('doit échouer avec code dns_unresolved sans fetch si la résolution DNS échoue', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const mockResolver = vi.fn().mockRejectedValue(new Error('ENOTFOUND'));

    const result = await verifySiteReachability('https://boutique-introuvable-xyz.fr', {
      checkDns: true,
      dnsResolver: mockResolver
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.valid).toBe(false);
    expect(result.reachable).toBe(false);
    expect(result.errorState?.code).toBe('dns_unresolved');
    fetchSpy.mockRestore();
  });

  it('doit bloquer sans fetch si la résolution DNS aboutit à une IP privée (DNS Rebinding)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const mockResolver = vi.fn().mockResolvedValue(['192.168.1.100']);

    const result = await verifySiteReachability('https://boutique-rebind.fr', {
      checkDns: true,
      dnsResolver: mockResolver
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.valid).toBe(false);
    expect(result.reachable).toBe(false);
    expect(result.errorState?.code).toBe('ssrf_blocked');
    fetchSpy.mockRestore();
  });

  it('doit réussir avec une requête HEAD légère quand le serveur répond 200', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      url: 'https://maboutique-woo.fr',
      headers: new Headers({ 'server': 'nginx' }),
      body: null
    });

    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await verifySiteReachability('https://maboutique-woo.fr', {
      checkDns: true,
      dnsResolver: mockResolver,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    expect(result.valid).toBe(true);
    expect(result.reachable).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.methodUsed).toBe('HEAD');
    expect(result.finalUrl).toBe('https://maboutique-woo.fr');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://maboutique-woo.fr',
      expect.objectContaining({ method: 'HEAD' })
    );
  });

  it('doit basculer automatiquement sur GET si le serveur refuse HEAD avec 405 Method Not Allowed', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        status: 405,
        url: 'https://maboutique-woo.fr',
        headers: new Headers(),
        body: null
      })
      .mockResolvedValueOnce({
        status: 200,
        url: 'https://maboutique-woo.fr',
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          cancel: vi.fn().mockResolvedValue(undefined)
        }
      });

    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await verifySiteReachability('https://maboutique-woo.fr', {
      checkDns: true,
      dnsResolver: mockResolver,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    expect(result.valid).toBe(true);
    expect(result.reachable).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.methodUsed).toBe('GET');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][1].method).toBe('HEAD');
    expect(mockFetch.mock.calls[1][1].method).toBe('GET');
  });

  it('doit basculer automatiquement sur GET si le serveur refuse HEAD avec 501 Not Implemented', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        status: 501,
        url: 'https://maboutique-woo.fr',
        headers: new Headers(),
        body: null
      })
      .mockResolvedValueOnce({
        status: 200,
        url: 'https://maboutique-woo.fr',
        headers: new Headers(),
        body: null
      });

    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await verifySiteReachability('https://maboutique-woo.fr', {
      checkDns: true,
      dnsResolver: mockResolver,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    expect(result.valid).toBe(true);
    expect(result.reachable).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.methodUsed).toBe('GET');
  });

  it('doit basculer sur GET si HEAD lance une exception réseau de méthode non supportée', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('Method HEAD not supported'))
      .mockResolvedValueOnce({
        status: 200,
        url: 'https://maboutique-woo.fr',
        headers: new Headers(),
        body: null
      });

    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await verifySiteReachability('https://maboutique-woo.fr', {
      checkDns: true,
      dnsResolver: mockResolver,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    expect(result.reachable).toBe(true);
    expect(result.methodUsed).toBe('GET');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('doit qualifier une erreur de timeout avec code timeout et reachable: false', async () => {
    const abortErr: any = new Error('The operation was aborted');
    abortErr.name = 'AbortError';

    const mockFetch = vi.fn().mockRejectedValue(abortErr);
    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await verifySiteReachability('https://maboutique-woo.fr', {
      checkDns: true,
      dnsResolver: mockResolver,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    expect(result.valid).toBe(true);
    expect(result.reachable).toBe(false);
    expect(result.errorState?.code).toBe('timeout');
    expect(result.errorState?.canRetry).toBe(true);
    expect(result.errorState?.message).toContain('délai');
  });

  it('doit qualifier un refus de connexion avec code unreachable_server et reachable: false', async () => {
    const connErr: any = new Error('connect ECONNREFUSED 93.184.216.34:443');
    connErr.code = 'ECONNREFUSED';

    const mockFetch = vi.fn().mockRejectedValue(connErr);
    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await verifySiteReachability('https://maboutique-woo.fr', {
      checkDns: true,
      dnsResolver: mockResolver,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    expect(result.valid).toBe(true);
    expect(result.reachable).toBe(false);
    expect(result.errorState?.code).toBe('unreachable_server');
    expect(result.errorState?.message).toContain('Impossible d\'établir une connexion');
  });

  it('doit considérer le serveur comme reachable même avec code HTTP 403 Forbidden', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 403,
      url: 'https://maboutique-woo.fr',
      headers: new Headers(),
      body: null
    });

    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await verifySiteReachability('https://maboutique-woo.fr', {
      checkDns: true,
      dnsResolver: mockResolver,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    expect(result.valid).toBe(true);
    expect(result.reachable).toBe(true);
    expect(result.statusCode).toBe(403);
  });

  it('doit honorer l\'option preferredMethod: GET directement sans appeler HEAD', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      url: 'https://maboutique-woo.fr',
      headers: new Headers(),
      body: null
    });

    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await verifySiteReachability('https://maboutique-woo.fr', {
      preferredMethod: 'GET',
      checkDns: true,
      dnsResolver: mockResolver,
      fetchFn: mockFetch as unknown as typeof fetch
    });

    expect(result.reachable).toBe(true);
    expect(result.methodUsed).toBe('GET');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://maboutique-woo.fr',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('doit vérifier que l\'alias validateUrlAndPingDomain fonctionne identiquement', async () => {
    expect(validateUrlAndPingDomain).toBe(verifySiteReachability);
  });

  it('doit permettre à fetchPassiveSite avec preCheckReachability d\'avorter tôt si le serveur est inaccessible', async () => {
    const timeoutErr: any = new Error('The operation was aborted');
    timeoutErr.name = 'AbortError';

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(timeoutErr);
    const mockResolver = vi.fn().mockResolvedValue(['93.184.216.34']);

    const result = await fetchPassiveSite('https://boutique-slow-unreachable.fr', {
      preCheckReachability: true,
      checkDns: true,
      dnsResolver: mockResolver
    });

    expect(result.isSuccess).toBe(false);
    expect(result.error?.code).toBe('timeout');
    expect(result.html).toBe('');

    fetchSpy.mockRestore();
  });
});

describe('10. Analyse intelligente WooCommerce avec le SDK Google Generative AI (scanWooCommerceWithGenerativeAi)', () => {
  it('doit retourner un objet structuré complet avec score, grade, failles et recommandations en mode heuristique/fallback', async () => {
    const result = await scanWooCommerceWithGenerativeAi('https://ma-boutique-vetements.fr', {
      includePassiveScanContext: false
    });

    expect(result).toBeDefined();
    expect(result.url).toBe('https://ma-boutique-vetements.fr');
    expect(result.domain).toBe('ma-boutique-vetements.fr');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'E', 'F']).toContain(result.grade);

    // Vérification des failles détectées
    expect(Array.isArray(result.faillesDetectees)).toBe(true);
    expect(result.faillesDetectees.length).toBeGreaterThan(0);
    result.faillesDetectees.forEach((faille) => {
      expect(faille.id).toBeDefined();
      expect(faille.titre).toBeDefined();
      expect(['critique', 'haute', 'moyenne', 'faible']).toContain(faille.severite);
      expect(faille.description).toBeDefined();
      expect(faille.impactCommercant).toBeDefined();
    });

    // Vérification des recommandations
    expect(Array.isArray(result.recommandations)).toBe(true);
    expect(result.recommandations.length).toBeGreaterThan(0);
    result.recommandations.forEach((rec) => {
      expect(typeof rec.priorite).toBe('number');
      expect(rec.action).toBeDefined();
      expect(['facile', 'moyen', 'technique']).toContain(rec.difficulte);
      expect(rec.gainEstime).toBeDefined();
      expect(rec.explication).toBeDefined();
    });

    expect(result.dateAnalyse).toBeDefined();
  });

  it('doit vérifier que l\'alias scanWooCommerceWithAi pointe sur la fonction principale', async () => {
    expect(scanWooCommerceWithAi).toBe(scanWooCommerceWithGenerativeAi);
  });

  it('doit intégrer le contexte passif pré-calculé pour affiner la notation', async () => {
    const mockPassiveScan: any = {
      targetDomain: 'chaussures-pro.fr',
      headersReport: {
        totalScoreHeaders: 35,
        checks: [
          { headerName: 'Strict-Transport-Security', present: true, pointsEarned: 10, maxPoints: 10 },
          { headerName: 'Content-Security-Policy', present: true, pointsEarned: 10, maxPoints: 10 }
        ]
      },
      sslDetails: {
        issuer: "Let's Encrypt",
        validTo: '2026-12-31T00:00:00.000Z',
        daysRemaining: 180,
        pointsEarned: 20
      }
    };

    const result = await scanWooCommerceWithGenerativeAi('https://chaussures-pro.fr', {
      precomputedPassiveScan: mockPassiveScan
    });

    expect(result.domain).toBe('chaussures-pro.fr');
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(['A', 'B', 'C']).toContain(result.grade);
  });
});
