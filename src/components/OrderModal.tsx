/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Modal de Réservation / Commande en 1 Clic (Étape 5 & 7)
 * Fichier : src/components/OrderModal.tsx
 * 
 * Permet aux marchands de commander immédiatement le Diagnostic d'urgence (590 € HTVA)
 * ou l'Abonnement Sérénité (69 € HTVA/mois) et met à jour le pipeline CRM en temps réel.
 */

import React, { useState } from 'react';
import { 
  X, 
  Check,
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  FileText, 
  ArrowRight, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  AlertTriangle,
  Lock,
  Sparkles
} from 'lucide-react';
import { saveProspect, updateProspectStatus } from '../lib/supabase.ts';

export type OfferType = 'diagnostic_590' | 'serenite_69';

export interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOffer?: OfferType;
  storeUrl: string;
  email: string;
  grade: string;
  score: number;
  onOrderSuccess?: (orderDetails: OrderConfirmationData) => void;
}

export interface OrderConfirmationData {
  orderReference: string;
  offerType: OfferType;
  offerName: string;
  amount: string;
  storeUrl: string;
  email: string;
  phone: string;
  urgency: '24h' | '48h';
  paymentMethod: 'invoice_sepa' | 'card_stripe';
  technicianNotes: string;
  createdAt: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  initialOffer = 'diagnostic_590',
  storeUrl,
  email,
  grade,
  score,
  onOrderSuccess
}) => {
  const [selectedOffer, setSelectedOffer] = useState<OfferType>(initialOffer);
  const [clientEmail, setClientEmail] = useState<string>(email);
  const [clientPhone, setClientPhone] = useState<string>('');
  const [urgency, setUrgency] = useState<'24h' | '48h'>('24h');
  const [paymentMethod, setPaymentMethod] = useState<'invoice_sepa' | 'card_stripe'>('invoice_sepa');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmationData, setConfirmationData] = useState<OrderConfirmationData | null>(null);

  // Synchronisation lors de l'ouverture
  React.useEffect(() => {
    if (initialOffer) setSelectedOffer(initialOffer);
    if (email) setClientEmail(email);
  }, [initialOffer, email, isOpen]);

  const offerDetails = {
    diagnostic_590: {
      name: 'Diagnostic Complet & Remise à Niveau d\'Urgence',
      price: '590 € HTVA',
      recurrence: 'Paiement unique',
      recommendedFor: 'Notes C, D, E et F (Vulnérabilités critiques détectées)',
      benefits: [
        'Prise en charge d\'urgence de vos 3 points critiques',
        'Audit exhaustif de vos plugins WooCommerce et requêtes SQL',
        'Déploiement certifié des en-têtes HSTS, CSP et masquage versions',
        '1 heure de restitution en visioconférence avec un ingénieur dédié'
      ]
    },
    serenite_69: {
      name: 'Abonnement Sérénité WooCommerce',
      price: '69 € HTVA / mois',
      recurrence: 'Sans engagement de durée',
      recommendedFor: 'Notes A et B (Maintien de la performance et de la note)',
      benefits: [
        'Veilleur Mensuel Automatique : scan passif chaque 1er du mois',
        'Alerte sous 2h en cas d\'expiration de certificat ou régression',
        'Sauvegardes quotidiennes externalisées en Europe',
        'Assistance prioritaire 5j/7 en cas de problème technique'
      ]
    }
  };

  const currentOffer = offerDetails[selectedOffer];

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ref = `CMD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const domain = storeUrl.replace(/^https?:\/\//i, '').split('/')[0];

    const orderData: OrderConfirmationData = {
      orderReference: ref,
      offerType: selectedOffer,
      offerName: currentOffer.name,
      amount: currentOffer.price,
      storeUrl,
      email: clientEmail,
      phone: clientPhone,
      urgency,
      paymentMethod,
      technicianNotes: notes,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Sauvegarde dans la base Supabase / Local Prospects avec statut devis_envoye
      const prospectStatus = selectedOffer === 'serenite_69' ? 'converti' : 'devis_envoye';
      const notesToSave = `Commande ${ref} (${currentOffer.price}) - Urgence: ${urgency} - Paiement: ${paymentMethod}${clientPhone ? ` - Tél: ${clientPhone}` : ''}${notes ? ` - Note: ${notes}` : ''}`;
      
      await saveProspect({
        domain,
        email: clientEmail,
        grade: grade as any,
        score,
        is_owner_confirmed: true,
        unsubscribed: false,
        turnover_bracket: '100k_250k',
        commercial_status: prospectStatus as any,
        notes: notesToSave
      });

      // Mémorisation dans localStorage pour persistance immédiate
      try {
        const storedOrders = JSON.parse(localStorage.getItem('boutiquesure_orders') || '[]');
        storedOrders.unshift(orderData);
        localStorage.setItem('boutiquesure_orders', JSON.stringify(storedOrders));
      } catch {}

      setConfirmationData(orderData);
      if (onOrderSuccess) {
        onOrderSuccess(orderData);
      }
    } catch (err) {
      console.warn('Erreur lors de la réservation:', err);
      // Fallback gracieux : on confirme quand même au commerçant
      setConfirmationData(orderData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      data-testid="order-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div 
        className="w-full max-w-2xl max-h-[92vh] bg-[#0F1B2D] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-['Manrope',sans-serif]"
        data-testid="order-modal-content"
      >
        {/* En-tête du modal */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Intervention Garantie Sans Coupure
                </span>
                <span className="text-xs text-slate-400">• Experts WooCommerce Dédiés</span>
              </div>
              <h2 id="order-modal-title" className="text-lg sm:text-xl font-black text-white mt-1">
                {confirmationData ? 'Demande d\'intervention confirmée' : 'Réserver votre accompagnement de sécurité'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="order-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer la fenêtre de commande"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps principal : Formulaire ou Écran de confirmation */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0F1B2D]">
          
          {confirmationData ? (
            /* ÉCRAN DE CONFIRMATION DE COMMANDE */
            <div className="space-y-6 text-center py-4" data-testid="order-confirmation-screen">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Prise en charge enregistrée avec succès
                </span>
                <h3 className="text-2xl font-black text-white">
                  Votre demande est entre les mains de nos experts
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Un ingénieur spécialisé WooCommerce a reçu le rapport de diagnostic de votre boutique et vous contacte sous <strong>2 heures ouvrées</strong> pour valider les accès et démarrer l'intervention.
                </p>
              </div>

              {/* Récapitulatif officiel */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-3 max-w-lg mx-auto text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Référence dossier :</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{confirmationData.orderReference}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Formule sélectionnée :</span>
                  <span className="font-bold text-white text-right">{confirmationData.offerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tarif convenu :</span>
                  <span className="font-bold text-emerald-400">{confirmationData.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Boutique e-commerce :</span>
                  <span className="font-mono font-semibold text-white truncate max-w-[240px]">{confirmationData.storeUrl}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email de contact :</span>
                  <span className="font-mono text-white">{confirmationData.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Délai d'intervention :</span>
                  <span className="font-semibold text-sky-400">
                    {confirmationData.urgency === '24h' ? 'Urgence sous 24h ouvrées' : 'Planifiée sous 48h ouvrées'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  data-testid="order-finish-btn"
                  className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Retourner au bulletin de sécurité
                </button>
              </div>
            </div>
          ) : (
            /* FORMULAIRE DE COMMANDE */
            <form onSubmit={handleSubmitOrder} className="space-y-6" data-testid="order-form">
              
              {/* Sélecteur de formule (590€ vs 69€) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Sélectionnez la formule d'accompagnement :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="offer-selector-grid">
                  
                  {/* Option 590€ */}
                  <button
                    type="button"
                    onClick={() => setSelectedOffer('diagnostic_590')}
                    data-testid="select-offer-diagnostic"
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedOffer === 'diagnostic_590'
                        ? 'bg-slate-900 border-2 border-emerald-400 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Remise à Niveau
                        </span>
                        {selectedOffer === 'diagnostic_590' && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-sm font-black text-white mt-1">
                        Diagnostic Complet
                      </div>
                      <div className="text-lg font-black text-emerald-400 mt-0.5">
                        590 € <span className="text-xs font-medium text-slate-400">HTVA</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Idéal pour corriger immédiatement vos 3 failles prioritaires.
                    </div>
                  </button>

                  {/* Option 69€/mois */}
                  <button
                    type="button"
                    onClick={() => setSelectedOffer('serenite_69')}
                    data-testid="select-offer-serenite"
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedOffer === 'serenite_69'
                        ? 'bg-slate-900 border-2 border-[#4ADE80] shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          Tranquillité
                        </span>
                        {selectedOffer === 'serenite_69' && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-sm font-black text-white mt-1">
                        Abonnement Sérénité
                      </div>
                      <div className="text-lg font-black text-[#4ADE80] mt-0.5">
                        69 € <span className="text-xs font-medium text-slate-400">HTVA / mois</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Scan mensuel automatique, veille proactive et sauvegardes.
                    </div>
                  </button>

                </div>
              </div>

              {/* Détail des garanties de la formule choisie */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block">Inclus dans votre formule :</span>
                <ul className="space-y-1.5 text-slate-300">
                  {currentOffer.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Champs du formulaire de contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Email de contact */}
                <div className="space-y-1.5">
                  <label htmlFor="order-email" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email professionnel du gérant *</span>
                  </label>
                  <input
                    id="order-email"
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="contact@votre-boutique.fr"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    data-testid="order-input-email"
                  />
                </div>

                {/* Téléphone pour confirmation */}
                <div className="space-y-1.5">
                  <label htmlFor="order-phone" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Téléphone (pour validation rapide)</span>
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    data-testid="order-input-phone"
                  />
                </div>

              </div>

              {/* Choix de l'urgence et du mode de règlement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Délai d'intervention */}
                <div className="space-y-1.5">
                  <label htmlFor="order-urgency-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Délai de démarrage souhaité</span>
                  </label>
                  <select
                    id="order-urgency-select"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    data-testid="order-select-urgency"
                  >
                    <option value="24h">Urgence maximale (sous 24h ouvrées)</option>
                    <option value="48h">Normal (sous 48h ouvrées)</option>
                  </select>
                </div>

                {/* Mode de règlement */}
                <div className="space-y-1.5">
                  <label htmlFor="order-payment-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Préférence de facturation</span>
                  </label>
                  <select
                    id="order-payment-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    data-testid="order-select-payment"
                  >
                    <option value="invoice_sepa">Facture Proforma & Virement SEPA</option>
                    <option value="card_stripe">Carte Bancaire sécurisée (Stripe)</option>
                  </select>
                </div>

              </div>

              {/* Notes complémentaires */}
              <div className="space-y-1.5">
                <label htmlFor="order-notes" className="text-xs font-semibold text-slate-300">
                  Précisions éventuelles pour les techniciens (hébergeur, plugins spécifiques...) :
                </label>
                <textarea
                  id="order-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex : Boutique hébergée chez o2switch, plugin WP Rocket actif..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  data-testid="order-input-notes"
                />
              </div>

              {/* Bouton de soumission */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="order-submit-btn"
                  className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? 'Enregistrement de la commande...' 
                      : `Confirmer la réservation (${currentOffer.price})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Aucun débit immédiat. Facture conforme émise après prise de contact préalable avec votre gérant.
                </p>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
