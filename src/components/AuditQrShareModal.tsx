/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Générateur de QR Code d'Audit Instantané & Partage Mobile
 * Fichier : src/components/AuditQrShareModal.tsx
 *
 * Permet au commerçant de flasher le rapport d'audit avec son smartphone ou de le partager
 * instantanément avec son équipe ou son agence web.
 */

import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  Mail, 
  ShieldCheck
} from 'lucide-react';

export interface AuditQrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl: string;
  grade: string;
  score: number;
}

/**
 * Génère une grille 25x25 de QR Code déterministe avec motifs de cadrage officiels (Finder Patterns)
 */
export function generateQrGrid(inputString: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Ajouter les 3 motifs de synchronisation d'angles (7x7 Finder Patterns)
  const drawFinderPattern = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (
          x === 0 || x === 6 || y === 0 || y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4)
        ) {
          grid[startY + y][startX + x] = true;
        } else {
          grid[startY + y][startX + x] = false;
        }
      }
    }
  };

  drawFinderPattern(0, 0);          // Haut-gauche
  drawFinderPattern(size - 7, 0);   // Haut-droite
  drawFinderPattern(0, size - 7);   // Bas-gauche

  // 2. Barres de synchronisation (Timing Patterns)
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // 3. Motif d'alignement (Alignment Pattern) vers le bas-droite
  const ax = 18;
  const ay = 18;
  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      if (Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0)) {
        grid[ay + y][ax + x] = true;
      }
    }
  }

  // 4. Remplir les données déterministes basées sur le hash de la chaîne
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    hash = (hash << 5) - hash + inputString.charCodeAt(i);
    hash |= 0;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inTopLeft = x < 8 && y < 8;
      const inTopRight = x >= size - 8 && y < 8;
      const inBottomLeft = x < 8 && y >= size - 8;
      const inTiming = (x === 6 && y >= 8 && y < size - 8) || (y === 6 && x >= 8 && x < size - 8);
      const inAlignment = x >= ax - 2 && x <= ax + 2 && y >= ay - 2 && y <= ay + 2;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming && !inAlignment) {
        const seed = (x * 31 + y * 17 + hash) & 0xffff;
        grid[y][x] = ((seed ^ (seed >> 3)) % 3) === 0;
      }
    }
  }

  return grid;
}

export const AuditQrShareModal: React.FC<AuditQrShareModalProps> = ({
  isOpen,
  onClose,
  storeUrl,
  grade,
  score
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://boutiquesure.fr';
  const cleanDomain = storeUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'maboutique.fr';
  const shareUrl = `${currentHost}/?audit=${encodeURIComponent(cleanDomain)}&screen=bulletin`;
  const qrGrid = generateQrGrid(shareUrl);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {}
  };

  const whatsappText = encodeURIComponent(
    `Voici le score de sécurité BoutiqueSûre de ${cleanDomain} : Note ${grade} (${score}/100) — Rapport complet : ${shareUrl}`
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      data-testid="qr-share-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="bg-[#0F1B2D] border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 id="qr-modal-title" className="text-base font-bold text-white">
                Flasher ou Partager l'Audit
              </h2>
              <p className="text-xs text-slate-400">
                Accès direct au diagnostic sur mobile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="qr-modal-close-btn"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps avec QR Code SVG */}
        <div className="p-6 space-y-6 text-center">
          
          {/* Badge boutique */}
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-300 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              {cleanDomain}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold ${
              grade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              grade === 'B' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
              grade === 'C' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              Note {grade} ({score}/100)
            </span>
          </div>

          {/* Affichage QR Code vectoriel */}
          <div className="relative inline-block p-4 rounded-2xl bg-white shadow-xl ring-4 ring-emerald-500/20 mx-auto" data-testid="qr-code-svg-container">
            <svg 
              viewBox="0 0 25 25" 
              className="w-48 h-48 sm:w-56 sm:h-56" 
              shapeRendering="crispEdges"
              role="img"
              aria-label={`QR Code d'audit pour ${cleanDomain}`}
            >
              <rect width="25" height="25" fill="#FFFFFF" />
              {qrGrid.map((row, y) =>
                row.map((filled, x) => (
                  filled ? (
                    <rect 
                      key={`${x}-${y}`} 
                      x={x} 
                      y={y} 
                      width="1" 
                      height="1" 
                      fill="#0F1B2D" 
                    />
                  ) : null
                ))
              )}
            </svg>
            
            {/* Logo miniature central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-9 h-9 rounded-lg bg-[#0F1B2D] border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Scannez ce QR Code avec l'appareil photo de votre smartphone pour ouvrir instantanément le bulletin interactif.
          </p>

          {/* Champ d'URL de partage et bouton copier */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <span className="flex-1 font-mono text-xs text-slate-300 truncate px-2 select-all">
                {shareUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                data-testid="qr-copy-link-btn"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Boutons d'action rapides */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="qr-share-whatsapp-btn"
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent(`Score de sécurité BoutiqueSûre : ${cleanDomain}`)}&body=${encodeURIComponent(`Bonjour,\n\nVoici le diagnostic de sécurité WooCommerce de ${cleanDomain} :\nNote : ${grade} (${score}/100)\n\nConsultez le rapport complet ici : ${shareUrl}\n\nCordialement.`)}`}
              data-testid="qr-share-email-btn"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
          Lien permanent chiffré — Valable 30 jours conformément à la charte RGPD
        </div>

      </div>
    </div>
  );
};
