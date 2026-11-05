/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires de l'Attestation NIS 2
 * Fichier : src/components/NIS2AttestationModal.test.ts
 */

import { describe, it, expect } from 'vitest';
import { NIS2_ARTICLE_21_CRITERIA } from './NIS2AttestationModal.tsx';

describe('Attestation Officielle NIS 2 (NIS2AttestationModal)', () => {
  it('définit les 4 exigences majeures de l\'Article 21 de la Directive NIS 2', () => {
    expect(NIS2_ARTICLE_21_CRITERIA).toHaveLength(4);
    const refs = NIS2_ARTICLE_21_CRITERIA.map(c => c.articleRef);
    expect(refs).toContain('Art. 21.2.h');
    expect(refs).toContain('Art. 21.2.e');
    expect(refs).toContain('Art. 21.2.d');
    expect(refs).toContain('Art. 21.2.f');
  });

  it('fournit des descriptions claires et des preuves techniques pour chaque critère', () => {
    NIS2_ARTICLE_21_CRITERIA.forEach((crit) => {
      expect(crit.title).toBeTruthy();
      expect(crit.description.length).toBeGreaterThan(20);
      expect(crit.proof.length).toBeGreaterThan(15);
    });
  });

  it('couvre le chiffrement fort, les en-têtes HTTP, la chaîne d\'approvisionnement et l\'évaluation périodique', () => {
    const ids = NIS2_ARTICLE_21_CRITERIA.map(c => c.id);
    expect(ids).toEqual(['crypto', 'cyber_hygiene', 'supply_chain', 'audit_review']);
  });
});
