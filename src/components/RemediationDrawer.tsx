/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Composant Tiroir & Modal de Remédiation Technique
 * Fichier : src/components/RemediationDrawer.tsx
 * 
 * Générateur de correctifs serveur prêts à l'emploi (.htaccess, Nginx, functions.php)
 * avec simulateur de score en direct (Avant / Après remédiation).
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Sliders, 
  Sparkles, 
  Lock, 
  Server, 
  Layers, 
  CheckCircle2, 
  Info, 
  ExternalLink 
} from 'lucide-react';

export interface RemediationSnippet {
  id: string;
  name: string;
  pillarId: 'ssl' | 'headers' | 'exposure';
  pillarName: string;
  pointsGain: number;
  difficulty: 'Très facile' | 'Facile' | 'Modéré';
  estimatedTime: string;
  targetFile: {
    apache: string;
    nginx: string;
    wordpress: string;
  };
  explanation: string;
  whyItMatters: string;
  snippets: {
    apache: string;
    nginx: string;
    wordpress: string;
  };
  testCommand?: string;
}

export const REMEDIATION_SNIPPETS: Record<string, RemediationSnippet> = {
  'ssl-redirect': {
    id: 'ssl-redirect',
    name: 'Redirection automatique HTTPS (Code 301)',
    pillarId: 'ssl',
    pillarName: 'Chiffrement SSL / HTTPS',
    pointsGain: 15,
    difficulty: 'Très facile',
    estimatedTime: '2 minutes',
    targetFile: {
      apache: 'Racine du site : /.htaccess (au tout début du fichier)',
      nginx: '/etc/nginx/sites-available/votre-boutique.conf',
      wordpress: 'wp-content/themes/votre-theme-enfant/functions.php'
    },
    explanation: 'Bascule immédiatement tout visiteur arrivant sur le port HTTP (80) vers le protocole sécurisé HTTPS (443) avec un code de redirection permanente 301.',
    whyItMatters: 'Bloque le vol d\'identifiants et de paniers sur les réseaux Wi-Fi publics et préserve le référencement SEO Google.',
    snippets: {
      apache: `# Redirection HTTPS permanente 301 BoutiqueSûre
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>`,
      nginx: `# Redirection HTTP vers HTTPS dans le bloc serveur port 80
server {
    listen 80;
    listen [::]:80;
    server_name maboutique.fr www.maboutique.fr;
    return 301 https://$host$request_uri;
}`,
      wordpress: `// Redirection HTTPS automatique via WordPress
add_action('init', function() {
    if (!is_ssl() && !is_admin()) {
        wp_safe_redirect('https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'], 301);
        exit;
    }
});`
    },
    testCommand: 'curl -I http://maboutique.fr (doit retourner HTTP/1.1 301 Moved Permanently)'
  },

  'header-hsts': {
    id: 'header-hsts',
    name: 'En-tête Strict-Transport-Security (HSTS)',
    pillarId: 'headers',
    pillarName: 'En-têtes HTTP de sécurité',
    pointsGain: 10,
    difficulty: 'Très facile',
    estimatedTime: '2 minutes',
    targetFile: {
      apache: 'Racine du site : /.htaccess',
      nginx: '/etc/nginx/sites-available/votre-boutique.conf',
      wordpress: 'wp-content/themes/votre-theme-enfant/functions.php'
    },
    explanation: 'Ordonne aux navigateurs de ne communiquer qu\'en HTTPS pendant 1 an minimum, bloquant toute tentative de rétrogradation d\'écoute (SSL Strip).',
    whyItMatters: 'Indispensable pour la conformité bancaire PCI-DSS v4 et la sécurité des paiements Stripe/PayPal.',
    snippets: {
      apache: `# Protection HSTS 1 an avec sous-domaines (BoutiqueSûre)
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>`,
      nginx: `# Directive HSTS dans le bloc HTTPS (port 443)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`,
      wordpress: `// Injection de l'en-tête HSTS dans WordPress
add_action('send_headers', function() {
    if (is_ssl()) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    }
});`
    },
    testCommand: 'curl -s -I https://maboutique.fr | grep -i strict-transport-security'
  },

  'header-xframe': {
    id: 'header-xframe',
    name: 'Protection Anti-Clickjacking (X-Frame-Options)',
    pillarId: 'headers',
    pillarName: 'En-têtes HTTP de sécurité',
    pointsGain: 10,
    difficulty: 'Très facile',
    estimatedTime: '2 minutes',
    targetFile: {
      apache: 'Racine du site : /.htaccess',
      nginx: '/etc/nginx/sites-available/votre-boutique.conf',
      wordpress: 'wp-content/themes/votre-theme-enfant/functions.php'
    },
    explanation: 'Interdit le chargement de votre boutique dans une iframe invisible sur un site malveillant tiers.',
    whyItMatters: 'Empêche les cybercriminels de tromper vos acheteurs en plaçant un faux bouton d\'achat par-dessus votre panier.',
    snippets: {
      apache: `# Bloque l'embarquement dans des iframes tierces
<IfModule mod_headers.c>
    Header always append X-Frame-Options "SAMEORIGIN"
</IfModule>`,
      nginx: `# Protection anti-clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;`,
      wordpress: `// Interdire l'inclusion en iframe externe
add_action('send_headers', function() {
    header('X-Frame-Options: SAMEORIGIN');
});`
    },
    testCommand: 'curl -s -I https://maboutique.fr | grep -i x-frame-options'
  },

  'header-csp': {
    id: 'header-csp',
    name: 'Content-Security-Policy (CSP anti-Magecart)',
    pillarId: 'headers',
    pillarName: 'En-têtes HTTP de sécurité',
    pointsGain: 10,
    difficulty: 'Modéré',
    estimatedTime: '5 minutes',
    targetFile: {
      apache: 'Racine du site : /.htaccess',
      nginx: '/etc/nginx/sites-available/votre-boutique.conf',
      wordpress: 'wp-content/themes/votre-theme-enfant/functions.php'
    },
    explanation: 'Définit une liste blanche stricte des domaines autorisés à exécuter des scripts sur votre boutique (WooCommerce, Stripe, Google Analytics).',
    whyItMatters: 'Neutralise le skimming de carte bancaire (attaques Magecart) en empêchant les scripts pirates d\'exfiltrer les numéros de CB.',
    snippets: {
      apache: `# Politique de sécurité des contenus (CSP) adaptée WooCommerce & Stripe
<IfModule mod_headers.c>
    Header set Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; script-src 'self' https://js.stripe.com https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com;"
</IfModule>`,
      nginx: `# En-tête CSP autorisant Stripe et les scripts de paiement
add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; script-src 'self' https://js.stripe.com https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com;" always;`,
      wordpress: `// En-tête Content Security Policy pour WooCommerce
add_action('send_headers', function() {
    header("Content-Security-Policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; script-src 'self' https://js.stripe.com https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com;");
});`
    },
    testCommand: 'curl -s -I https://maboutique.fr | grep -i content-security-policy'
  },

  'header-content-type': {
    id: 'header-content-type',
    name: 'Protection Anti-MIME Sniffing (X-Content-Type-Options)',
    pillarId: 'headers',
    pillarName: 'En-têtes HTTP de sécurité',
    pointsGain: 5,
    difficulty: 'Très facile',
    estimatedTime: '1 minute',
    targetFile: {
      apache: 'Racine du site : /.htaccess',
      nginx: '/etc/nginx/sites-available/votre-boutique.conf',
      wordpress: 'wp-content/themes/votre-theme-enfant/functions.php'
    },
    explanation: 'Force le navigateur à respecter scrupuleusement le type MIME déclaré sans tenter de deviner le contenu.',
    whyItMatters: 'Empêche l\'exécution de faux scripts PHP déguisés en fichiers images .jpg téléversés dans WordPress.',
    snippets: {
      apache: `# Empêche le navigateur de réinterpréter les types de fichiers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
</IfModule>`,
      nginx: `# Anti-MIME sniffing
add_header X-Content-Type-Options "nosniff" always;`,
      wordpress: `// Protection nosniff WordPress
add_action('send_headers', function() {
    header('X-Content-Type-Options: nosniff');
});`
    },
    testCommand: 'curl -s -I https://maboutique.fr | grep -i x-content-type-options'
  },

  'header-referrer': {
    id: 'header-referrer',
    name: 'Politique Referrer (Referrer-Policy)',
    pillarId: 'headers',
    pillarName: 'En-têtes HTTP de sécurité',
    pointsGain: 5,
    difficulty: 'Très facile',
    estimatedTime: '1 minute',
    targetFile: {
      apache: 'Racine du site : /.htaccess',
      nginx: '/etc/nginx/sites-available/votre-boutique.conf',
      wordpress: 'wp-content/themes/votre-theme-enfant/functions.php'
    },
    explanation: 'Contrôle la transmission de l\'URL d\'origine lors de clics vers des domaines externes.',
    whyItMatters: 'Évite la fuite de paramètres sensibles (tokens de commande, identifiants de session) vers les régies publicitaires.',
    snippets: {
      apache: `# Protection des données d'URL transmises à des tiers
<IfModule mod_headers.c>
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`,
      nginx: `# Referrer Policy équilibrée
add_header Referrer-Policy "strict-origin-when-cross-origin" always;`,
      wordpress: `// Masquer les chemins d'URL complets aux sites tiers
add_action('send_headers', function() {
    header('Referrer-Policy: strict-origin-when-cross-origin');
});`
    },
    testCommand: 'curl -s -I https://maboutique.fr | grep -i referrer-policy'
  },

  'exposure-generator': {
    id: 'exposure-generator',
    name: 'Masquage des versions WordPress & WooCommerce',
    pillarId: 'exposure',
    pillarName: 'Exposition publique & Versions',
    pointsGain: 10,
    difficulty: 'Facile',
    estimatedTime: '3 minutes',
    targetFile: {
      apache: 'Racine du site : /.htaccess',
      nginx: '/etc/nginx/sites-available/votre-boutique.conf',
      wordpress: 'wp-content/themes/votre-theme-enfant/functions.php'
    },
    explanation: 'Supprime la balise meta generator et bloque l\'accès aux fichiers readme.html qui trahissent les numéros de version de WordPress et WooCommerce.',
    whyItMatters: 'Rend votre boutique invisible pour les robots scanners qui ciblent les versions présentant des failles connues.',
    snippets: {
      apache: `# Bloquer l'accès direct aux fichiers d'informations de version
<FilesMatch "^(readme|changelog|license)\.(html|txt|md)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>`,
      nginx: `# Bloquer les fichiers d'empreinte logicielle
location ~* /(readme|changelog|license)\.(html|txt|md) {
    deny all;
}`,
      wordpress: `// Masquer la version WordPress et WooCommerce du code source
remove_action('wp_head', 'wp_generator');
add_filter('the_generator', '__return_empty_string');

// Supprimer le paramètre ?ver= des styles et scripts chargés
add_filter('style_loader_src', function($src) {
    return $src ? remove_query_arg('ver', $src) : $src;
}, 9999);
add_filter('script_loader_src', function($src) {
    return $src ? remove_query_arg('ver', $src) : $src;
}, 9999);`
    },
    testCommand: 'Vérifier la source de la page d\'accueil : la balise <meta name="generator"> doit avoir disparu.'
  },

  'exposure-permissions': {
    id: 'exposure-permissions',
    name: 'Politique de permissions (Permissions-Policy)',
    pillarId: 'exposure',
    pillarName: 'Exposition publique & Versions',
    pointsGain: 5,
    difficulty: 'Très facile',
    estimatedTime: '2 minutes',
    targetFile: {
      apache: 'Racine du site : /.htaccess',
      nginx: '/etc/nginx/sites-available/votre-boutique.conf',
      wordpress: 'wp-content/themes/votre-theme-enfant/functions.php'
    },
    explanation: 'Désactive l\'accès aux capteurs matériels sensibles (caméra, microphone, géolocalisation) pour les scripts tiers.',
    whyItMatters: 'Empêche des traceurs malveillants d\'interroger le matériel des visiteurs de votre e-commerce.',
    snippets: {
      apache: `# Désactivation des capteurs non requis pour un e-commerce
<IfModule mod_headers.c>
    Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>`,
      nginx: `# Permissions Policy stricte
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;`,
      wordpress: `// Désactiver les accès caméra/micro pour les scripts tiers
add_action('send_headers', function() {
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
});`
    },
    testCommand: 'curl -s -I https://maboutique.fr | grep -i permissions-policy'
  }
};

export interface RemediationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSnippetId?: string;
  baseScore: number;
  baseGrade: string;
  appliedFixes: string[];
  onToggleFix: (id: string) => void;
  onResetFixes?: () => void;
}

export const RemediationDrawer: React.FC<RemediationDrawerProps> = ({
  isOpen,
  onClose,
  initialSnippetId = 'header-hsts',
  baseScore,
  baseGrade,
  appliedFixes,
  onToggleFix,
  onResetFixes
}) => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(initialSnippetId);
  const [activeTab, setActiveTab] = useState<'apache' | 'nginx' | 'wordpress'>('apache');
  const [copied, setCopied] = useState<boolean>(false);

  // Synchronise le snippet sélectionné si initialSnippetId change à l'ouverture
  React.useEffect(() => {
    if (initialSnippetId && REMEDIATION_SNIPPETS[initialSnippetId]) {
      setSelectedSnippetId(initialSnippetId);
    }
  }, [initialSnippetId]);

  const currentSnippet = REMEDIATION_SNIPPETS[selectedSnippetId] || REMEDIATION_SNIPPETS['header-hsts'];

  // Calcul du score simulé en direct avec les correctifs appliqués
  const simulatedScore = useMemo(() => {
    let score = baseScore;
    appliedFixes.forEach(fixId => {
      const snip = REMEDIATION_SNIPPETS[fixId];
      if (snip) {
        score += snip.pointsGain;
      }
    });
    return Math.min(100, score);
  }, [baseScore, appliedFixes]);

  // Calcul de la note simulée
  const simulatedGrade = useMemo(() => {
    if (simulatedScore >= 90) return 'A';
    if (simulatedScore >= 75) return 'B';
    if (simulatedScore >= 60) return 'C';
    if (simulatedScore >= 45) return 'D';
    if (simulatedScore >= 25) return 'E';
    return 'F';
  }, [simulatedScore]);

  // Copie dans le presse-papier
  const handleCopyCode = async () => {
    const code = currentSnippet.snippets[activeTab];
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignoré
    }
  };

  const isCurrentFixApplied = appliedFixes.includes(currentSnippet.id);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      data-testid="remediation-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remediation-modal-title"
    >
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-[#0F1B2D] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-['Manrope',sans-serif]"
        data-testid="remediation-drawer-content"
      >
        {/* En-tête du modal */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Générateur de Correctifs Serveur
                </span>
                <span className="text-xs text-slate-400">• Prêt à copier-coller</span>
              </div>
              <h2 id="remediation-modal-title" className="text-lg sm:text-xl font-black text-white mt-1">
                Remédiation technique & Snippets de configuration
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="remediation-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer le générateur de correctifs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de simulation de score dynamique "Avant / Après" */}
        <div 
          className="px-4 sm:px-6 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          data-testid="remediation-score-simulator-bar"
        >
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-200">
                Simulateur en direct de remédiation :
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className="text-slate-400">Score initial : <strong className="text-white">{baseScore}/100 ({baseGrade})</strong></span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">
                  Score simulé : {simulatedScore}/100 ({simulatedGrade})
                </span>
                {simulatedScore > baseScore && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold">
                    +{simulatedScore - baseScore} pts gagnés
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">
              {appliedFixes.length} correctif(s) activé(s)
            </span>
            {appliedFixes.length > 0 && onResetFixes && (
              <button
                type="button"
                onClick={onResetFixes}
                data-testid="reset-simulated-fixes-btn"
                className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Corps principal : Sélecteur de correctifs à gauche + Code et explications à droite */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          
          {/* Colonne gauche (4/12) : Liste des correctifs disponibles */}
          <div className="md:col-span-4 p-4 space-y-2 bg-slate-900/40">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block px-2 mb-2">
              Choisir un correctif
            </span>
            <div className="space-y-1.5" data-testid="remediation-snippets-list">
              {Object.values(REMEDIATION_SNIPPETS).map((snip) => {
                const isSelected = selectedSnippetId === snip.id;
                const isApplied = appliedFixes.includes(snip.id);
                return (
                  <button
                    key={snip.id}
                    type="button"
                    onClick={() => setSelectedSnippetId(snip.id)}
                    data-testid={`snippet-select-${snip.id}`}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected 
                        ? 'bg-slate-800 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30' 
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate" title={snip.name}>
                        {snip.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                        <span className="text-emerald-400 font-semibold">+{snip.pointsGain} pts</span>
                        <span>•</span>
                        <span>{snip.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isApplied ? (
                        <span 
                          className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold"
                          title="Correctif inclus dans la simulation"
                        >
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {snip.difficulty === 'Très facile' ? '⚡' : '⚙️'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colonne droite (8/12) : Détail du snippet, Onglets Serveurs, Code & Instructions */}
          <div className="md:col-span-8 p-4 sm:p-6 space-y-5 bg-[#0F1B2D]">
            
            {/* Titre et badges d'impact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-emerald-400">
                  {currentSnippet.pillarName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    +{currentSnippet.pointsGain} points
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    {currentSnippet.difficulty} • ~{currentSnippet.estimatedTime}
                  </span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white" data-testid="current-snippet-title">
                {currentSnippet.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentSnippet.explanation}
              </p>
            </div>

            {/* Pourquoi c'est crucial pour l'e-commerce */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">Impact e-commerce : </strong>
                {currentSnippet.whyItMatters}
              </div>
            </div>

            {/* Onglets des environnements serveur */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold" data-testid="server-tabs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('apache')}
                    data-testid="tab-apache"
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'apache'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Apache / LiteSpeed (.htaccess)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('nginx')}
                    data-testid="tab-nginx"
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'nginx'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Nginx (nginx.conf)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('wordpress')}
                    data-testid="tab-wordpress"
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'wordpress'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    WordPress (functions.php)
                  </button>
                </div>

                {/* Bouton de copie 1-clic */}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  data-testid="copy-remediation-code-btn"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Code copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le snippet</span>
                    </>
                  )}
                </button>
              </div>

              {/* Emplacement du fichier cible */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Emplacement cible : </span>
                <code className="text-emerald-300 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  {currentSnippet.targetFile[activeTab]}
                </code>
              </div>

              {/* Bloc de code prêt à copier */}
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{activeTab === 'apache' ? '.htaccess' : activeTab === 'nginx' ? 'nginx.conf' : 'functions.php'}</span>
                  <span>Syntaxe prête à déployer</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[220px]" data-testid="remediation-code-block">
                  {currentSnippet.snippets[activeTab]}
                </pre>
              </div>

              {/* Commande de test de validation */}
              {currentSnippet.testCommand && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300">Comment vérifier que le correctif fonctionne ? </span>
                  <div className="mt-1 font-mono text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800/60 select-all">
                    {currentSnippet.testCommand}
                  </div>
                </div>
              )}
            </div>

            {/* Bascule pour inclure dans la simulation en direct */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
              <label 
                htmlFor="toggle-simulation-checkbox"
                className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-200"
              >
                <input
                  id="toggle-simulation-checkbox"
                  type="checkbox"
                  checked={isCurrentFixApplied}
                  onChange={() => onToggleFix(currentSnippet.id)}
                  data-testid="toggle-simulate-checkbox"
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                />
                <span>
                  Simuler l'application de ce correctif sur ma boutique (+{currentSnippet.pointsGain} pts)
                </span>
              </label>

              <button
                type="button"
                onClick={() => onToggleFix(currentSnippet.id)}
                data-testid="toggle-simulate-btn"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCurrentFixApplied
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                }`}
              >
                {isCurrentFixApplied ? 'Retirer de la simulation' : 'Activer dans la simulation'}
              </button>
            </div>

          </div>
        </div>

        {/* Pied de page du modal */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-400 text-center sm:text-left">
            Besoin d'un déploiement garanti sans risque pour vos ventes ? Nos experts appliquent et testent vos correctifs sous 24h.
          </p>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              data-testid="remediation-bottom-close-btn"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
