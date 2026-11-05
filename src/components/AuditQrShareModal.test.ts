/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour le Générateur de QR Code d'Audit Instantané
 */

import { describe, it, expect } from 'vitest';
import { generateQrGrid } from './AuditQrShareModal.tsx';

describe('Générateur de QR Code d\'Audit Instantané', () => {
  it('génère une matrice 25x25 valide avec motifs de calage', () => {
    const grid = generateQrGrid('https://boutiquesure.fr/?audit=maboutique.fr');
    expect(grid.length).toBe(25);
    expect(grid[0].length).toBe(25);

    // Vérification du Finder Pattern haut-gauche (7x7)
    expect(grid[0][0]).toBe(true);
    expect(grid[0][6]).toBe(true);
    expect(grid[6][0]).toBe(true);
    expect(grid[6][6]).toBe(true);
    // Centre du finder pattern
    expect(grid[3][3]).toBe(true);
  });

  it('génère des motifs reproductibles pour une même URL', () => {
    const grid1 = generateQrGrid('https://test.fr');
    const grid2 = generateQrGrid('https://test.fr');
    expect(grid1).toEqual(grid2);
  });

  it('génère des motifs différents pour des URLs différentes', () => {
    const gridA = generateQrGrid('https://boutique-a.fr');
    const gridB = generateQrGrid('https://boutique-b.fr');
    expect(gridA).not.toEqual(gridB);
  });
});
