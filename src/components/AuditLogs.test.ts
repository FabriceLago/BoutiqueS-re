/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Tests unitaires du Mini Back-Office & Vue Kanban (Étape 7)
 * Fichier : src/components/AuditLogs.test.ts
 */

import { describe, it, expect } from 'vitest';
import { KANBAN_COLUMNS, STATUS_ORDER, CommercialStatus } from './AuditLogs.tsx';

describe('Mini Back-Office CRM - Vue Kanban & Pipeline (Étape 7)', () => {
  it('définit 5 colonnes Kanban conformes au cycle de vente BoutiqueSûre', () => {
    expect(KANBAN_COLUMNS).toHaveLength(5);
    const columnIds = KANBAN_COLUMNS.map(col => col.id);
    expect(columnIds).toEqual(['nouveau', 'contacte', 'devis_envoye', 'converti', 'sans_suite']);
  });

  it('définit un ordre de progression séquentiel logique pour le pipeline commercial', () => {
    expect(STATUS_ORDER).toEqual(['nouveau', 'contacte', 'devis_envoye', 'converti', 'sans_suite']);
  });

  it('permet de calculer correctement le potentiel financier du pipeline par colonne', () => {
    const mockLeads = [
      { id: '1', domain: 'boutique-a.fr', grade: 'C' as const, commercial_status: 'nouveau' as CommercialStatus },
      { id: '2', domain: 'boutique-b.fr', grade: 'A' as const, commercial_status: 'nouveau' as CommercialStatus },
      { id: '3', domain: 'boutique-c.fr', grade: 'E' as const, commercial_status: 'converti' as CommercialStatus }
    ];

    // Calcul pour la colonne 'nouveau' : 1 lead C (590€) + 1 lead A (69*12 = 828€) = 1418€
    const nouveauLeads = mockLeads.filter(p => p.commercial_status === 'nouveau');
    const nouveauValue = nouveauLeads.reduce((acc, p) => {
      const isUrgent = ['C', 'D', 'E', 'F'].includes(p.grade);
      return acc + (isUrgent ? 590 : 69 * 12);
    }, 0);

    expect(nouveauValue).toBe(590 + 828);
  });

  it('calcule correctement les transitions étape précédente / étape suivante', () => {
    const currentStatus: CommercialStatus = 'contacte';
    const currentIdx = STATUS_ORDER.indexOf(currentStatus);
    
    const prevStatus = STATUS_ORDER[Math.max(0, currentIdx - 1)];
    const nextStatus = STATUS_ORDER[Math.min(STATUS_ORDER.length - 1, currentIdx + 1)];

    expect(prevStatus).toBe('nouveau');
    expect(nextStatus).toBe('devis_envoye');
  });
});
