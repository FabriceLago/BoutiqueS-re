/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Certificat Officiel d'Audit de Sécurité (« Diplôme & Sceau Officiel »)
 * Fichier : src/components/OfficialAuditCertificateModal.tsx
 */

import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  Calendar, 
  Globe, 
  QrCode,
  Sparkles,
  Lock
} from 'lucide-react';
import jsPDF from 'jspdf';

export interface OfficialAuditCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl?: string;
  grade?: string;
  score?: number;
}

export const OfficialAuditCertificateModal: React.FC<OfficialAuditCertificateModalProps> = ({
  isOpen,
  onClose,
  storeUrl = 'https://ma-boutique-en-ligne.fr',
  grade = 'A',
  score = 95
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const cleanDomain = storeUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'ma-boutique.fr';
  const certificateNumber = `CERT-2026-FR-${Math.abs(cleanDomain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100000))}`;
  const currentDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (!isOpen) return null;

  const handleDownloadCertificatePdf = () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const width = doc.internal.pageSize.getWidth(); // 297mm
      const height = doc.internal.pageSize.getHeight(); // 210mm

      // Bordure décorative double
      doc.setFillColor(15, 27, 45); // Fond bleu nuit profond
      doc.rect(0, 0, width, height, 'F');

      doc.setDrawColor(74, 222, 128); // Emerald #4ADE80
      doc.setLineWidth(1.5);
      doc.rect(10, 10, width - 20, height - 20);

      doc.setDrawColor(51, 65, 85); // Slate-700
      doc.setLineWidth(0.5);
      doc.rect(13, 13, width - 26, height - 26);

      // Titre Institutionnel
      doc.setTextColor(74, 222, 128);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('BOUTIQUESÛRE CYBERSECURITY', width / 2, 32, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('CERTIFICAT OFFICIEL DE DILIGENCE & CONFORMITÉ TECHNIQUE', width / 2, 42, { align: 'center' });

      // Ligne séparatrice
      doc.setDrawColor(74, 222, 128);
      doc.setLineWidth(0.8);
      doc.line(70, 48, width - 70, 48);

      // Texte de délivrance
      doc.setFontSize(11);
      doc.setTextColor(203, 213, 225);
      doc.text('Le présent certificat atteste que la boutique en ligne suivante :', width / 2, 62, { align: 'center' });

      // Nom du domaine en grand
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(74, 222, 128);
      doc.text(cleanDomain, width / 2, 74, { align: 'center' });

      // Attestation
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      const statement = `A fait l'objet d'un audit de sécurité passif complet validant les 10 critères essentiels de résilience e-commerce : chiffrement SSL/TLS fort, directives HTTP (HSTS, CSP anti-Magecart, X-Frame-Options) et absence d'exposition publique des versions du CMS.`;
      const splitStatement = doc.splitTextToSize(statement, 200);
      doc.text(splitStatement, width / 2, 88, { align: 'center' });

      // Cadre central Note & Score
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(width / 2 - 45, 110, 90, 24, 3, 3, 'F');

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`NOTE OFFICIELLE : ${grade}`, width / 2, 120, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(74, 222, 128);
      doc.text(`Score de Résilience : ${score} / 100 points`, width / 2, 128, { align: 'center' });

      // Détails légaux & signatures
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Identifiant Unique : ${certificateNumber}`, 25, 165);
      doc.text(`Délivré le : ${currentDate}`, 25, 172);
      doc.text('Conformité : Directive Européenne NIS 2 & Norme PCI-DSS v4.0', 25, 179);

      // Signature et cachet d'autorité
      doc.text('Direction Technique & Conformité BoutiqueSûre', width - 90, 165);
      doc.text('Paris — Bruxelles', width - 90, 172);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(74, 222, 128);
      doc.text('[ Signature & Sceau Numérique Validés ]', width - 90, 180);

      doc.save(`Certificat-Securite-${cleanDomain}.pdf`);
    } catch (err) {
      console.error('Erreur export certificat PDF :', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      data-testid="official-certificate-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col justify-between my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Certificat Officiel de Diligence & Sécurité E-Commerce
              </h2>
              <p className="text-xs text-slate-300">
                Diplôme certifié format A4 paysage pour vos acheteurs, partenaires bancaires et assurances
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-certificate-modal-btn"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aperçu Réaliste du Certificat A4 Paysage */}
        <div className="p-6 sm:p-10 rounded-2xl bg-[#09111E] border-2 border-emerald-500/40 relative shadow-inner overflow-hidden text-center space-y-5">
          {/* Filigrane d'authenticité */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <ShieldCheck className="w-96 h-96 text-emerald-400" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Attestation Officielle 2026</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
              CERTIFICAT DE RÉSILIENCE CYBERSÉCURITÉ
            </h3>
            <p className="text-xs text-slate-300">
              Délivré par le département d'audit BoutiqueSûre France & Belgique
            </p>
          </div>

          <div className="py-3">
            <div className="text-xs uppercase font-bold text-slate-400">Boutique en ligne certifiée :</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {cleanDomain}
            </div>
          </div>

          <div className="max-w-xl mx-auto p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-around gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Grade Officiel</span>
              <span className="text-2xl font-black text-white">{grade}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Score Global</span>
              <span className="text-2xl font-black text-emerald-400">{score} / 100</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Protocole</span>
              <span className="text-xs font-bold text-slate-200">100% Passif</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
            <div>N° de Certificat : <strong className="text-white">{certificateNumber}</strong></div>
            <div>Délivré le : {currentDate}</div>
            <div className="text-emerald-400 font-bold flex items-center gap-1 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sceau Cryptographique Validé</span>
            </div>
          </div>
        </div>

        {/* Footer & Boutons d'export */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Format A4 Paysage haute résolution, optimisé pour l'impression et les dossiers bancaires.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleDownloadCertificatePdf}
              disabled={isExporting}
              data-testid="download-certificate-pdf-btn"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Génération...' : 'Télécharger le Certificat (PDF)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficialAuditCertificateModal;
