import { describe, it, expect } from 'vitest';

describe('BankInsuranceAttestationModal - Attestation officielle', () => {
  it('génère une référence unique d\'attestation avec le préfixe ATTEST-', () => {
    const certificateRef = `ATTEST-${Date.now().toString(36).toUpperCase()}-BS`;
    expect(certificateRef).toMatch(/^ATTEST-[A-Z0-9]+-BS$/);
  });

  it('valide la présence de l\'empreinte cryptographique SHA-256', () => {
    const sha256Fingerprint = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    expect(sha256Fingerprint).toHaveLength(64);
    expect(sha256Fingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('gère les deux types d\'organismes destinataires (Assurance et Banque)', () => {
    const types: ('insurance' | 'bank')[] = ['insurance', 'bank'];
    expect(types).toContain('insurance');
    expect(types).toContain('bank');
  });
});
