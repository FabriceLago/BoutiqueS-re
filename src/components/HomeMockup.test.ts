/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tests unitaires pour la validation front-end de la page d'accueil (Étape 3)
 */

import { describe, it, expect } from 'vitest';
import { 
  isValidEmailFormat, 
  detectEmailTypo, 
  sanitizeStoreUrl, 
  DEMO_PRESETS,
  isStoreName,
  formatStoreNameToDomain 
} from './HomeMockup';
import { validateUrlFormat } from '../lib/scanner';

describe('HomeMockup Front-end Validation (Étape 3)', () => {

  describe('Validation d\'URL en temps réel', () => {
    it('accepte une URL https valide de boutique', () => {
      const result = validateUrlFormat('https://maboutique-mode.fr');
      expect(result.valid).toBe(true);
      expect(result.target?.hostname).toBe('maboutique-mode.fr');
      expect(result.target?.normalizedUrl).toBe('https://maboutique-mode.fr');
    });

    it('normalise automatiquement une adresse saisie sans protocole', () => {
      const result = validateUrlFormat('ma-boutique-bio.com');
      expect(result.valid).toBe(true);
      expect(result.target?.normalizedUrl).toBe('https://ma-boutique-bio.com');
    });

    it('refuse une URL avec identifiants d\'authentification (user:pass@)', () => {
      const result = validateUrlFormat('https://admin:secret@maboutique.fr');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/identifiants d'authentification.*interdits/i);
    });

    it('refuse une URL avec un numéro de port invalide', () => {
      const result = validateUrlFormat('https://maboutique.fr:999999');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/port invalide/i);
    });

    it('refuse une URL vide ou contenant des espaces', () => {
      expect(validateUrlFormat('').valid).toBe(false);
      expect(validateUrlFormat('https://ma boutique.fr').valid).toBe(false);
    });
  });

  describe('Validation d\'Email en temps réel', () => {
    it('valide des adresses email conformes standard', () => {
      expect(isValidEmailFormat('contact@maboutique.fr')).toBe(true);
      expect(isValidEmailFormat('gerant.boutique@gmail.com')).toBe(true);
      expect(isValidEmailFormat('support+orders@eshop-france.co.uk')).toBe(true);
    });

    it('rejette les formats d\'email invalides', () => {
      expect(isValidEmailFormat('')).toBe(false);
      expect(isValidEmailFormat('contact')).toBe(false);
      expect(isValidEmailFormat('contact@')).toBe(false);
      expect(isValidEmailFormat('@domain.com')).toBe(false);
      expect(isValidEmailFormat('contact@domain')).toBe(false);
      expect(isValidEmailFormat('contact @domain.com')).toBe(false);
    });
  });

  describe('Détection intelligente de fautes de frappe (Typo Detection)', () => {
    it('détecte les coquilles courantes sur Gmail', () => {
      expect(detectEmailTypo('gerant@gmai.com')).toBe('gerant@gmail.com');
      expect(detectEmailTypo('contact@gmaill.com')).toBe('contact@gmail.com');
      expect(detectEmailTypo('directeur@gamil.com')).toBe('directeur@gmail.com');
    });

    it('détecte les coquilles courantes sur Hotmail, Yahoo et Wanadoo', () => {
      expect(detectEmailTypo('boutique@hotmial.com')).toBe('boutique@hotmail.com');
      expect(detectEmailTypo('ventes@yaho.fr')).toBe('ventes@yahoo.fr');
      expect(detectEmailTypo('client@wanado.fr')).toBe('client@wanadoo.fr');
    });

    it('retourne null si l\'adresse ne contient pas de faute répertoriée', () => {
      expect(detectEmailTypo('gerant@gmail.com')).toBeNull();
      expect(detectEmailTypo('contact@mon-domaine-perso.fr')).toBeNull();
      expect(detectEmailTypo('')).toBeNull();
    });
  });

  describe('Nettoyage intelligent d\'URL (Smart URL Sanitize)', () => {
    it('recentre une page d\'administration /wp-admin sur la racine publique', () => {
      const result = sanitizeStoreUrl('https://maboutique-mode.fr/wp-admin/edit.php');
      expect(result.wasModified).toBe(true);
      expect(result.cleanedUrl).toBe('https://maboutique-mode.fr');
      expect(result.message).toMatch(/accueil publique/i);
    });

    it('supprime les pages de checkout /panier ou /cart et les paramètres de tracking', () => {
      const result = sanitizeStoreUrl('https://maboutique.fr/panier/?utm_source=fb&gclid=123');
      expect(result.wasModified).toBe(true);
      expect(result.cleanedUrl).toBe('https://maboutique.fr');
    });

    it('retire les espaces insécables et caractères invisibles', () => {
      const result = sanitizeStoreUrl('  https://maboutique.fr  \u00A0');
      expect(result.cleanedUrl).toBe('https://maboutique.fr');
    });

    it('laisse intacte une URL de racine propre', () => {
      const result = sanitizeStoreUrl('https://maboutique-propre.com');
      expect(result.wasModified).toBe(false);
      expect(result.cleanedUrl).toBe('https://maboutique-propre.com');
    });
  });

  describe('Scénarios de démonstration pré-remplis (DEMO_PRESETS)', () => {
    it('définit les 3 scénarios démo types (A, C, E)', () => {
      expect(DEMO_PRESETS).toHaveLength(3);
      const ids = DEMO_PRESETS.map(p => p.id);
      expect(ids).toEqual(['demo-mode', 'demo-bio', 'demo-deco']);

      const modePreset = DEMO_PRESETS.find(p => p.id === 'demo-mode');
      expect(modePreset?.url).toContain('maboutique-mode.fr');
      expect(modePreset?.badge).toContain('Note A');

      const bioPreset = DEMO_PRESETS.find(p => p.id === 'demo-bio');
      expect(bioPreset?.badge).toContain('Note C');

      const decoPreset = DEMO_PRESETS.find(p => p.id === 'demo-deco');
      expect(decoPreset?.badge).toContain('Note E');
    });
  });

  describe('Détection et conversion du nom de boutique en ligne (Store Name Support)', () => {
    it('détecte correctement un nom de boutique commerciale', () => {
      expect(isStoreName('Ma Boutique Bio')).toBe(true);
      expect(isStoreName("L'Atelier Cuir")).toBe(true);
      expect(isStoreName('Chocolats de Paris')).toBe(true);
      expect(isStoreName('Maison du Thé')).toBe(true);
      expect(isStoreName('BoutiqueMode')).toBe(true);
    });

    it('distingue les URLs directes et domaines qualifiés', () => {
      expect(isStoreName('https://maboutique.fr')).toBe(false);
      expect(isStoreName('http://boutique-bio.com')).toBe(false);
      expect(isStoreName('boutique.fr')).toBe(false);
      expect(isStoreName('')).toBe(false);
    });

    it('convertit un nom avec espaces et accents en nom de domaine valide', () => {
      expect(formatStoreNameToDomain('Maison du Thé')).toBe('https://maison-du-the.fr');
      expect(formatStoreNameToDomain('Ma Boutique Bio')).toBe('https://ma-boutique-bio.fr');
      expect(formatStoreNameToDomain('Épicerie Fine & Bio')).toBe('https://epicerie-fine-et-bio.fr');
    });

    it('gère les apostrophes et caractères spéciaux', () => {
      expect(formatStoreNameToDomain("L'Atelier Cuir")).toBe('https://l-atelier-cuir.fr');
      expect(formatStoreNameToDomain("D'Art & d'Essai")).toBe('https://d-art-et-d-essai.fr');
    });

    it('applique une extension TLD personnalisée (.com, .be, .shop, .eu)', () => {
      expect(formatStoreNameToDomain('Chocolaterie de Bruxelles', 'be')).toBe('https://chocolaterie-de-bruxelles.be');
      expect(formatStoreNameToDomain('Mode & Tendances', 'com')).toBe('https://mode-et-tendances.com');
      expect(formatStoreNameToDomain('Concept Store', 'shop')).toBe('https://concept-store.shop');
      expect(formatStoreNameToDomain('Euro Boutique', 'eu')).toBe('https://euro-boutique.eu');
    });

    it('préserve les domaines ou URLs déjà complets sans duplication d\'extension', () => {
      expect(formatStoreNameToDomain('https://maboutique-existante.com')).toBe('https://maboutique-existante.com');
      expect(formatStoreNameToDomain('maboutique-existante.fr')).toBe('https://maboutique-existante.fr');
      expect(formatStoreNameToDomain('eshop.co.uk')).toBe('https://eshop.co.uk');
    });
  });

});
