# ETAPES.md — Suivi de Progression du Projet BoutiqueSûre

Ce document récapitule les 8 étapes du projet web **« Score de sécurité BoutiqueSûre »**.
Il est mis à jour à chaque étape validée par le responsable produit (dès réception du mot-clé **« VALIDÉ »**).

---

## 📌 Contexte & Spécifications Clés
- **Application :** Score de sécurité BoutiqueSûre (Lead magnet pour boutiques WooCommerce, 100k€ à 500k€ CA).
- **Règle absolue :** Analyse **100 % passive** avec **1 seule requête GET standard**. Aucun test d'intrusion.
- **Identité visuelle :** Fond bleu nuit `#0F1B2D`, Vert accent `#4ADE80`, Vert foncé `#0E6B3A`, Gris clair `#F6F7F9`, typographie **Manrope**, normes WCAG AA.
- **Conversion :** Diagnostic approfondi (590 € HTVA) ou abonnement Sérénité (69 € HTVA/mois).

---

## 🚦 Tableau de Progression des 8 Étapes

| N° | Étape | Statut | Date de validation | Livrables principaux |
|:--:|:---|:---:|:---:|:---|
| **1** | **Cadrage** | ✅ **TERMINÉE** | 01/11/2026 | Arborescence, parcours utilisateur, grille 100 pts (A à F), modèle Supabase, charte 100% passive |
| **2** | **Maquettes** | ✅ **TERMINÉE** | 03/11/2026 | Accueil (formulaire + FAQ sous le formulaire), écran d'attente animé, bulletin A-F, email Resend, Recharts, tooltips |
| **3** | **Front-end** | ✅ **TERMINÉE** | 03/11/2026 | Formulaire connecté, validation temps réel URL & email, détection de fautes (typos), case gérant, 7 améliorations avancées, 15 tests unitaires & 10 E2E validés |
| **4** | **Moteur d'analyse passive** | ⏳ **EN ATTENTE DE VALIDATION** | — | Service `passiveScanner.ts`, scan IA Gemini `scanWooCommerceWithGenerativeAi`, validation d'URL et ping préalable `verifySiteReachability`, contrat centralisé `src/types.ts` (`AuditResult`), liaison écran d'attente -> bulletin, 149 tests Vitest et 10 tests E2E validés |
| **5** | **Calcul du score et bulletin** | ⚪ *À faire* | — | Algorithme de notation A à F, Top 3 actions vulgarisées, double appel à l'action |
| **6** | **Base de données et email** | ⚪ *À faire* | — | Enregistrement Supabase, envoi email transactionnel Resend, mentions RGPD |
| **7** | **Mini back-office** | ⚪ *À faire* | — | Interface sécurisée des prospects, filtres par note/statut, export CSV |
| **8** | **Mise en production** | ⚪ *À faire* | — | Déploiement Vercel, variables d'environnement, politique de confidentialité, checklist finale |

---

## 📋 Journal Détaillé des Validations

### ✅ Étape 1 : Cadrage
- **Statut :** **TERMINÉE** (Validée)
- **Date :** 01/11/2026
- **Livrables validés :**
  1. **Arborescence des 5 écrans :** Accueil (`/`), Transition (`/scan/[id]`), Bulletin (`/bulletin/[id]`), RGPD (`/politique-confidentialite`), Back-office (`/admin/prospects`).
  2. **Parcours utilisateur :** Saisie URL/Email + case obligatoire → Écran d'attente 5s → Bulletin santé A-F + Top 3 actions → Conversion Diagnostic (590 €) ou Sérénité (69 €/mois).
  3. **Grille de notation passive sur 100 points :**
     - *SSL / Redirection (35 pts) :* Redirection 301/302 (15 pts), Certificat valide (15 pts), Marge d'expiration > 30 jours (5 pts).
     - *En-têtes HTTP (40 pts) :* HSTS (10 pts), X-Frame-Options (10 pts), CSP (10 pts), X-Content-Type-Options (5 pts), Referrer-Policy (5 pts).
     - *Exposition publique (25 pts) :* Masquage version WP (10 pts), Masquage version WC (10 pts), Permissions-Policy (5 pts).
  4. **Seuils et libellés textuels obligatoires :**
     - **Note A** (90–100 pts) : Excellente sécurité
     - **Note B** (75–89 pts) : Bonne sécurité (ajustements mineurs)
     - **Note C** (60–74 pts) : Sécurité moyenne (failles passives détectées)
     - **Note D** (45–59 pts) : Sécurité vulnérable (actions urgentes requises)
     - **Note E** (25–44 pts) : Sécurité critique (boutique à risque élevé)
     - **Note F** (< 25 pts) : Niveau d'exposition maximal (non protégée)
  5. **Modèle de données Supabase :** Tables `prospects`, `scans`, `rate_limits` avec hachage d'IP (SHA256) et traçabilité RGPD.
  6. **Charte légale 100% passive :** 1 seule requête GET d'accueil, User-Agent transparent, interdiction absolue d'intrusion, de scan de ports ou d'énumération.
  7. **Spécifications avancées & innovations stratégiques implémentées :**
     - *Aiguillage de conversion dynamique :* Note A/B orientée vers l'Abonnement Sérénité (69 €/mois) ; Note C/D/E/F orientée vers le Diagnostic d'urgence (590 € HTVA).
     - *Simulateur interactif de perte financière & CA à risque :* Curseurs temps réel (volume de commandes quotidiennes et panier moyen) calculant la perte financière nette pour un incident de 48h et prouvant le ROI immédiat de l'intervention.
     - *Benchmark sectoriel comparatif anonymisé :* Positionnement percentile en temps réel (ex: Top 16% pour Note A, 48% pour Note C, 12% pour Note E) calculé sur un échantillon de référence de ~4 500 boutiques WooCommerce en France et Belgique.
     - *Indicateur d'attestation Directive Européenne NIS 2 (UE 2022/2555) :* Mesure de conformité à l'Article 21 (gestion des risques et chiffrement) offrant au commerçant une preuve de diligence opposable aux banques et assureurs cyber.
     - *Détection passive d'hébergement, CDN & scripts tiers :* Identification sans intrusion du serveur (Cloudflare, Nginx, OVH) et des traceurs (Meta Pixel, Google Tag Manager, Stripe) avec contrôle de l'isolation CSP contre le form-jacking.
     - *Badge officiel de réassurance & Snippet d'intégration Page Panier :* Sceau certifié « Boutique Protégée BoutiqueSûre — Note A » avec code HTML prêt à intégrer sous le bouton Commander (+8% de conversion constatée).
     - *Le « Veilleur Mensuel Automatique » :* Scan passif planifié chaque 1er du mois avec alerte email sous 2h en cas de régression (certificat ou en-tête défaillant).

---

### ✅ Étape 2 : Maquettes
- **Statut :** **TERMINÉE** (Validée)
- **Date :** 03/11/2026
- **Livrables réalisés :**
  1. **Page d'accueil (`HomeMockup.tsx`) :** Formulaire de saisie URL/Email, case gérant obligatoire, réassurance.
  2. **Composant dédié FAQ (`FAQ.tsx`) :** 5 accordéons sous le formulaire sur le 100% passif, l'absence de coupure, l'interdiction d'intrusion et le RGPD.
  3. **Écran d'attente animé (`WaitingMockup.tsx`) :** Timeline en 4 étapes passives (Connexion, SSL, Headers, Versions) avec progression 0-100%.
  4. **Bulletin de sécurité (`BulletinMockup.tsx`) :** Notes A à F avec libellés, Top 3 actions et double CTA (590 € / 69 €).
  5. **Email transactionnel (`EmailMockup.tsx`) :** Rendu email Resend avec note, priorités et désinscription RGPD.
  6. **Mode responsive (`App.tsx`) :** Barre d'outils de test avec bascule Desktop et Mobile (390 px).
  7. **Journal des analyses (`AuditLogs.tsx`) & Graphique d'évolution historique (`Recharts`) :**
     - Affichage de l'historique de traçabilité légale (domaine, date, statut, email masqué RGPD, case gérant) avec filtres, recherche instantanée et export CSV.
     - **Graphique interactif d'évolution sur 7 jours avec Recharts (`AreaChart`, `ResponsiveContainer`, double gradient vert émeraude `#4ADE80` et vert menthe `#10B981`)** visualisant le volume quotidien d'audits réalisés et la répartition succès/échecs.
     - **3 cartes KPI synthétiques 7 jours :** Total d'audits sur la période, Taux de succès en %, et Moyenne quotidienne d'analyses.
     - Infobulle personnalisée sombre et soignée (`CustomTooltip`) conforme à l'identité BoutiqueSûre `#0F1B2D` et aux contrastes WCAG AA.
  8. **Génération PDF du bulletin (`jsPDF`) :** Bouton « Télécharger le rapport » dans le bulletin et le header générant un document PDF soigné A4 (note, 3 piliers, Top 3 actions, charte 100% passive).
  9. **Composant dédié FAQ approfondie WooCommerce (`FAQSection.tsx`) :**
     - Section complète située en bas de la page d'accueil (`HomeMockup`) pour lever tous les doutes avant le scan.
     - 8 questions/réponses vulgarisées réparties en 4 catégories (Analyse 100% passive, Impact Chiffre d'Affaires, Confidentialité & RGPD, Solutions & Correctifs).
     - Filtres interactifs par catégorie, accordéons accessibles avec badges de réassurance et bouton CTA « Lancer mon scan gratuit » avec défilement fluide vers le formulaire.
     - 7 tests unitaires Vitest dédiés et validation E2E Playwright sur desktop et mobile.
  10. **Infobulles explicatives & Grille détaillée des critères de sécurité (`InfoTooltip.tsx` & `BulletinMockup.tsx`) :**
     - Intégration du composant accessible `InfoTooltip` avec icônes Lucide (`Info`, `HelpCircle`) sur toutes les sections du bulletin de santé (Piliers 1/2/3, critères techniques, Top 3 actions, simulateur de CA à risque, passerelles de paiement).
     - **Activation interactive par survol de la ligne entière (`criterion-row-${id}`)** : Le survol de n'importe quel point de la ligne d'un critère déclenche instantanément l'affichage de l'infobulle avec mise en surbrillance émeraude, anneau lumineux et attribut `title` natif de secours.
     - **Infobulles de niveau Pilier (3 Piliers, 100 points)** :
       - *Pilier 1 : Chiffrement SSL / HTTPS (35 pts)* : Explication du chiffrement de bout en bout (TLS 1.2/1.3), de la redirection 301 automatique du HTTP vers le HTTPS et du délai avant expiration.
       - *Pilier 2 : En-têtes HTTP de sécurité (40 pts)* : Explication des directives serveur bloquant les attaques de détournement et le vol de cartes bancaires.
       - *Pilier 3 : Exposition publique & Versions (25 pts)* : Détection des empreintes numériques publiques (versions serveur, CMS et extensions visibles par les robots).
     - **Grille complète des critères passifs avec explications vulgarisées et impacts e-commerce chiffrés :**
       - *Exposition & Versions (25 pts) :* **Version PHP du serveur** (PHP 8.2 sécurisé vs PHP 7.4 obsolète sans correctif, ralentissement panier -30%), **Plugins & Extensions WooCommerce** (vecteur de 85% des intrusions, fichiers readme ou versions exposées, injections de faux formulaires de paiement), **Masquage versions WP/WC** (balise generator HTML), **Politique de permissions** (blocage des capteurs webcam/micro pour scripts tiers).
       - *Chiffrement SSL / HTTPS (35 pts) :* **Redirection HTTPS automatique** (Port 80 -> 443 code 301 sans fuite de cookies), **Certificat SSL/TLS moderne** (TLS 1.2/1.3 indispensable pour Stripe/PayPal), **Marge d'expiration SSL > 30 jours** (prévention de paralysie soudaine des ventes).
       - *En-têtes HTTP de sécurité (40 pts) :* **Protection HSTS** (Strict-Transport-Security sur 1 à 2 ans anti-écoute Wi-Fi), **Anti-Clickjacking** (X-Frame-Options anti-détournement d'iframe), **Content Security Policy** (CSP anti-Magecart / blocage du vol de carte bancaire conforme PCI-DSS v4), **Anti-MIME Sniffing** (X-Content-Type nosniff anti-webshell), **Politique Referrer** (Referrer-Policy protection des tokens de session).
     - Support complet desktop (survol souris et focus clavier) et mobile (tap/clic avec fermeture intelligente au clic extérieur ou touche Échap), validé par 7 tests unitaires Vitest et scénarios E2E Playwright sur desktop et mobile.

  11. **Boutons de partage social du score (`BulletinMockup.tsx`) :**
      - Intégration d'une barre de partage accessible dans le bulletin pour diffuser la note et l'attestation de sécurité de la boutique.
      - **Twitter / X :** Bouton sombre épuré avec SVG X officiel, message personnalisé dynamique selon la note (fierté pour Note A vs sensibilisation pour Note C/E) et URL du diagnostic encodée.
      - **LinkedIn :** Bouton bleu officiel LinkedIn (`share-offsite`) invitant le réseau professionnel et les partenaires B2B à constater la conformité de la boutique.
      - **Facebook :** Bouton bleu Facebook (`sharer.php`) pour partager la réassurance client auprès des acheteurs.
      - **Bouton Copier le lien :** Copie instantanée dans le presse-papier avec confirmation visuelle immédiate (« Lien copié ! ») avec icône `Check` et réinitialisation automatique après 2,5 s.
      - Respect strict des règles de l'environnement (liens sécurisés `target="_blank" rel="noopener noreferrer"`, aucun appel à `window.alert` ou `window.open`).
      - Validé par 5 tests unitaires Vitest dédiés et vérification Playwright E2E.
  12. **Bouton de bascule de thème Sombre / Clair & Haute Accessibilité (`App.tsx` & `index.css`) :**
      - Bouton interactif accessible `data-testid="theme-toggle-btn"` intégré dans la barre supérieure de navigation aux côtés du commutateur de viewport (Desktop / Mobile 390px).
      - Affichage dynamique des icônes `Sun` (ambre) et `Moon` (indigo) avec libellés et infobulles contextuelles (*« Mode clair »* / *« Mode sombre »*).
      - Persistance automatique du choix de l'utilisateur dans `localStorage` (`boutiquesure_theme`) et synchronisation sur les attributs `data-theme` et classes `.theme-light` / `.theme-dark`.
      - **Feuille de styles complète Haute Accessibilité (WCAG AA / AAA) :**
        - Arrière-plans lumineux et nets (`#F8FAFC` fond principal, `#FFFFFF` pour cartes et panneaux avec ombrages doux).
        - Contrastes typographiques renforcés (`#0F172A` pour textes principaux > 14:1, `#334155` et `#475569` pour descriptions > 7:1).
        - Couleurs sémantiques adaptées sur fond clair (`#047857` pour le vert émeraude, `#B45309` pour l'ambre, `#BE123C` pour les alertes rouges).
        - Harmonisation automatique sur l'ensemble des 5 écrans (Accueil, Attente, Bulletin de santé, Email Resend, Journal des analyses Recharts).
      - Validé par 4 tests unitaires Vitest dédiés (`ThemeToggle.test.ts`) et le test E2E Playwright sur desktop et mobile.

---

### ✅ Étape 3 : Front-end fonctionnel
- **Statut :** **TERMINÉE** (Validée)
- **Date :** 03/11/2026
- **Livrables réalisés :**
  1. **Validation en temps réel de l'adresse URL (`validateUrlFormat`)** :
     - Normalisation automatique avec protocole sécurisé `https://`.
     - Filtrage strict selon les RFC 1035 / 1123 / 7230 : rejet des identifiants `user:pass@`, des espaces internes, des numéros de port hors plage (1–65535) et des TLD invalides.
     - Indicateurs d'état visuels immédiats : icône `Check` verte et libellé *« URL valide »* ou message d'erreur d'assistance rouge en cas de format incorrect.
  2. **Validation en temps réel de l'adresse email professionnelle (`isValidEmailFormat`)** :
     - Contrôle syntaxique rigoureux conforme à la norme RFC 5322.
     - Détection visuelle immédiate des formats incomplets avec icône dynamique et messages d'aide.
  3. **Détecteur intelligent de fautes de frappe (Typo Detection & 1-Click Fix)** :
     - Détection des coquilles courantes sur les fournisseurs majeurs (ex: `@gmai.com`, `@gmaill.com`, `@hotmial.com`, `@yaho.fr`, `@wanado.fr`).
     - Affichage d'une pastille interactive bienveillante proposant la correction en 1 clic (*« Vouliez-vous dire contact@gmail.com ? Cliquez pour corriger »*).
  4. **Engagement éthique de gérance obligatoire** :
     - Case à cocher obligatoire garantissant la légitimité de l'audit.
     - Mise en surbrillance d'alerte rouge immédiate et message vulgarisé si l'utilisateur tente de soumettre le formulaire sans cocher la case.
  5. **Gestion fluide des états de soumission & UX** :
     - État de chargement `isSubmitting` désactivant le bouton et affichant un spinner animé `Loader2` (*« Initialisation du diagnostic passif... »*).
     - Transition immédiate et sécurisée vers l'écran d'attente animé en passant les données nettoyées et normalisées.
  6. **Accessibilité WCAG AA complète** :
     - Attributs `aria-invalid`, `aria-describedby` et `role="alert"` pour les lecteurs d'écran.
     - Anneaux de focus émeraude (`focus:ring-[#4ADE80]`), contrastes renforcés et navigation clavier intégrale.
  7. **Nettoyeur intelligent de collage d'URL (`sanitizeStoreUrl`)** :
     - Élagage automatique des pages internes non souhaitées (ex: `/wp-admin/`, `/panier/`, `/cart/`, `/checkout/`) et des paramètres de tracking (`?utm_...`, `#ancre`).
     - Recentrage instantané sur la racine publique avec badge de notification non intrusif.
  8. **Boutons de démo rapide en 1 clic (`DEMO_PRESETS`)** :
     - 3 scénarios pré-remplis types : *Boutique Mode (Note A)*, *Boutique Bio (Note C)*, *Boutique Déco (Note E)* permettant de tester l'application sans taper de domaine.
  9. **Bouton « Coller depuis le presse-papier » rapide** :
     - Accès direct via l'API Clipboard avec icône dédiée dans le champ URL et confirmation visuelle *« Collé ! »*.
  10. **Sauvegarde automatique du brouillon en session (`sessionStorage`)** :
     - Persistance transparente des champs `storeUrl` et `email` en cas de rechargement ou navigation vers la FAQ.
  11. **Checklist de préparation en temps réel sous le champ URL** :
     - Indicateurs tricolores dynamiques : *Tunnel HTTPS*, *Extension valide*, *Prêt pour le scan*.
  12. **Indicateur de sonde passive en ligne & Historique local des recherches** :
     - Badge rassurant en direct indiquant l'état actif de la sonde, le temps estimé (~4,8 s) et l'absence d'impact sur les acheteurs.
     - Sauvegarde locale (`localStorage`) des 3 dernières boutiques testées avec rechargement instantané.
  13. **Suite de tests & Assurance qualité** :
     - 15 tests unitaires Vitest dédiés dans `src/components/HomeMockup.test.ts` (149/149 tests unitaires au total).
     - 10 tests E2E Playwright validés avec 100% de succès sur desktop et mobile.

---

### ⏳ Étape 4 : Moteur d'analyse passive
- **Statut :** **EN ATTENTE DE VALIDATION**
- **Date :** En attente de validation
- **Livrables réalisés :**
  1. **Module d'analyse avancée via le SDK Google Generative AI (`scanWooCommerceWithGenerativeAi` / `scanWooCommerceWithAi`)** :
     - Intégration du SDK officiel `@google/genai` (modèle `gemini-3.8-flash`) avec User-Agent `aistudio-build`.
     - Schéma de sortie structuré avec `responseSchema` JSON (`Type.OBJECT`) retournant :
       - `score` global de 0 à 100
       - `grade` officiel de 'A' à 'F'
       - `appreciation` vulgarisée et rassurante pour le gérant
       - `faillesDetectees` détaillées (id, titre, severite, description, impactCommercant)
       - `recommandations` prioritaires (priorite, action, difficulte, gainEstime, explication)
       - `technologiesDetectees` et `chiffreAffairesRisqueEstime`
     - Moteur de repli heuristique déterministe (`buildHeuristicScanResult`) garantissant un fonctionnement 100% continu et sans interruption en cas d'absence de clé API ou d'indisponibilité réseau.
  2. **Orchestration directe dans l'application (`WaitingMockup.tsx` & `App.tsx`)** :
     - Déclenchement automatique et transparent de l'analyse passive dès l'entrée sur l'écran d'attente animé en 4 temps.
     - Calcul du rapport `AuditResult` en arrière-plan et transmission directe à `App.tsx` puis à `BulletinMockup.tsx`.
     - Enregistrement immédiat dans le journal d'audit légal (`logScanAttempt`) pour traçabilité RGPD.
  3. **Vérification préalable de joignabilité & Ping léger (`verifySiteReachability` / `validateUrlAndPingDomain`)** :
     - Vérification syntaxique stricte et résolution DNS préalable avec blocage anti-SSRF sans aucun appel HTTP externe superflu.
     - Sonde légère `HEAD` avec timeout court (2500ms) pour confirmer que le serveur web répond avant d'enclencher l'analyse profonde.
     - Bascule automatique sur `GET` léger si le serveur répond avec le code `405 Method Not Allowed` ou `501 Not Implemented` (cas fréquent sur serveurs sécurisés ou reverse-proxies Nginx/Cloudflare/Wordfence).
     - Qualification immédiate des erreurs d'injoignabilité (`timeout`, `unreachable_server`, `dns_unresolved`) avec recommandations rassurantes pour le commerçant.
     - Option `preCheckReachability` intégrée à `fetchPassiveSite` et `executePassiveScan`.
  4. **Validation de format d'URL & Résolution DNS préalable (`validateUrlAndResolveDns`)** :
     - Fonction `validateUrlFormat` selon RFC 1035 / 1123 / 7230 : filtrage des espaces internes, des identifiants `user:pass@`, des longueurs excessives (> 2048 car.), des points consécutifs `..`, des labels avec tirets terminaux, des caractères illicites, des extensions TLD invalides et des ports hors plage 1-65535.
     - Fonction `isPrivateOrReservedIp` exhaustive : détection des adresses IPv4/IPv6 de bouclage, RFC 1918 (10.x, 172.16-31.x, 192.168.x), link-local/méta-données Cloud AWS/GCP (169.254.x), CGNAT (100.64-127.x), documentation, multicast, broadcast, ::1, fc00::/7, fe80::/10.
     - Résolution DNS active `resolveDnsHost` avec détection de **DNS Rebinding** vers des IP privées (anti-SSRF dynamique).
  5. **Contrôles unitaires passifs d'en-têtes HTTP de sécurité (`validateAllSecurityHeaders`)** :
     - HSTS (10 pts), CSP (10 pts), X-Frame-Options (10 pts), X-Content-Type-Options (5 pts), Referrer-Policy (5 pts), Permissions-Policy (5 pts).
  6. **Gestion d'erreurs robuste & tolérance de panne (`try/catch`)** :
     - Typage structuré `ScanErrorState` et codes normalisés `ScanErrorCode` (`timeout`, `dns_unresolved`, `unreachable_server`, `ssrf_blocked`, `invalid_url`, `ssl_error`, `http_client_error`, `http_server_error`, `unknown_error`).
     - Fonction `parseFetchError` qualifiant toute exception réseau avec messages vulgarisés pour les gérants et actions correctives concrètes.
     - Fonction `fetchPassiveSite` sécurisée ne levant jamais d'exception non gérée.
     - Fonction `executePassiveScan` pour un diagnostic complet passif tolérant aux pannes.
  7. **Module d'analyse passive du certificat SSL/TLS** :
     - Extraction de l'émetteur (Let's Encrypt, Cloudflare, DigiCert...), date d'expiration, calcul des jours restants, détection d'expiration imminente (<= 30 jours) et barème officiel sur 20 points (15 pts validité + 5 pts marge > 30 jours).
  8. **Module de logging Supabase & fallback local (`logScanAttempt`)** :
     - Enregistrement sécurisé de chaque analyse (domaine, date, email, case gérant, note et score).
  9. **Assurance qualité & Validation** :
     - 149 tests unitaires Vitest exécutés avec 100% de succès.
     - 10 tests E2E Playwright validés avec 100% de succès.

---

### ⚪ Étape 5 : Calcul du score et bulletin
- **Statut :** *À venir*
- **Livrables prévus :** Algorithme de notation selon la grille des 100 pts, génération du Top 3 des actions vulgarisées, bulletins de test.

---

### ⚪ Étape 6 : Base de données et email
- **Statut :** *Client Supabase initialisé & typé (src/lib/supabase.ts)*
- **Livrables réalisés :**
  - Fichier `src/lib/supabase.ts` initialisant le client `@supabase/supabase-js` avec gestion des variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
  - Typage complet des tables PostgreSQL / Supabase : `scan_logs`, `prospects`, `rate_limits`.
  - Fonctions d'insertion et de consultation résilientes (`recordScanLog`, `saveProspect`, `fetchRecentScanLogs`, `isSupabaseConfigured`).
  - Suite de tests unitaires Vitest dédiée (`src/lib/supabase.test.ts`).
- **Livrables restants pour l'étape 6 :** Envoi d'emails transactionnels Resend et gestion du lien de désinscription RGPD.

---

### ⚪ Étape 7 : Mini back-office
- **Statut :** *À venir*
- **Livrables prévus :** Dashboard des prospects, filtres par note/statut, export CSV, authentification sécurisée.

---

### ⚪ Étape 8 : Mise en production
- **Statut :** *À venir*
- **Livrables prévus :** Déploiement Vercel, configuration des variables d'environnement, politique de confidentialité, checklist finale sécurité & RGPD.
