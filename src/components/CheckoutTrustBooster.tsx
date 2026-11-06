/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Audit « Checkout Trust Booster » (Psychologie & Réassurance Panier)
 * Fichier : src/components/CheckoutTrustBooster.tsx
 */

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  CreditCard, 
  Truck, 
  PhoneCall, 
  Star, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';

export interface CheckoutTrustBoosterProps {
  storeUrl?: string;
  grade?: string;
  score?: number;
}

export const CheckoutTrustBooster: React.FC<CheckoutTrustBoosterProps> = ({
  storeUrl = 'https://ma-boutique-en-ligne.fr',
  grade = 'C',
  score = 65
}) => {
  // 6 Piliers psychologiques d'achat
  const [reassuranceItems, setReassuranceItems] = useState([
    {
      id: 'ssl_lock',
      name: 'Cadenas & Chiffrement Bancaire 256 bits',
      category: 'Technique',
      icon: ShieldCheck,
      present: true,
      impact: '+5% de conversion',
      desc: 'Visible dès l\'étape panier, rassure contre l\'interception de données.'
    },
    {
      id: 'payment_logos',
      name: 'Badges CB, Visa, Mastercard & 3D Secure v2',
      category: 'Paiement',
      icon: CreditCard,
      present: grade === 'A' || grade === 'B',
      impact: '+8% de confiance',
      desc: 'Les acheteurs recherchent des logos familiers avant d\'entrer leur numéro de carte.'
    },
    {
      id: 'returns_policy',
      name: 'Garantie Retours 14 Jours & Remboursement Clair',
      category: 'Légal & Sérénité',
      icon: RotateCcw,
      present: true,
      impact: '+6% de passage à l\'acte',
      desc: 'Supprime la peur d\'acheter un produit non adapté ou défectueux.'
    },
    {
      id: 'customer_reviews',
      name: 'Avis Clients Vérifiés (Trustpilot / Avis Vérifiés)',
      category: 'Preuve Sociale',
      icon: Star,
      present: grade === 'A',
      impact: '+9% de transformation',
      desc: '70% des consommateurs consultent les avis avant de finaliser un paiement.'
    },
    {
      id: 'carrier_logos',
      name: 'Transporteurs Reconnus (Colissimo, Mondial Relay)',
      category: 'Livraison',
      icon: Truck,
      present: true,
      impact: '+4% d\'abandon évité',
      desc: 'La clarté des modes d\'expédition évite les surprises de frais cachés.'
    },
    {
      id: 'contact_support',
      name: 'Support Client & Téléphone / WhatsApp Visible',
      category: 'Humain',
      icon: PhoneCall,
      present: grade === 'A' || grade === 'B',
      impact: '+5% de réassurance',
      desc: 'Savoir qu\'un humain répond en cas de problème débloque les paniers hésitants.'
    }
  ]);

  const toggleItem = (id: string) => {
    setReassuranceItems(prev => prev.map(item => 
      item.id === id ? { ...item, present: !item.present } : item
    ));
  };

  const presentCount = reassuranceItems.filter(i => i.present).length;
  const buyerTrustScore = Math.round((presentCount / reassuranceItems.length) * 100);

  // Simulateur de conversion
  const [monthlyOrders, setMonthlyOrders] = useState<number>(120);
  const [avgCart, setAvgCart] = useState<number>(75);

  const currentRevenue = monthlyOrders * avgCart;
  const potentialBoostPercent = (6 - presentCount) * 3.5; // +3.5% par élément manquant corrigé
  const additionalMonthlyRevenue = Math.round((currentRevenue * potentialBoostPercent) / 100);

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      data-testid="checkout-trust-booster"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Audit « Checkout Trust Booster » : Réassurance & Conversion Panier
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Évaluez l'impact psychologique de votre page de commande : 1 achat sur 4 est abandonné par simple méfiance de l'acheteur.
          </p>
        </div>

        {/* Score de confiance acheteur */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Trust Score Acheteur</div>
            <div className="text-base font-black text-emerald-400">{buyerTrustScore}% d'indice</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/30">
            {presentCount}/6
          </div>
        </div>
      </div>

      {/* Grille des 6 piliers interactifs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {reassuranceItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                item.present
                  ? 'bg-slate-950/70 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    item.present
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.present ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{item.present ? 'Actif' : 'Manquant'}</span>
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white">
                  {item.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Gain estimé :</span>
                <span className="font-bold text-emerald-400">{item.impact}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini-Simulateur de Gain Financier Panier */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-950 to-slate-900 border border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-extrabold text-white">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Simulation de Chiffre d'Affaires Récupéré au Panier</span>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            +{potentialBoostPercent}% de conversion potentiel
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Commandes mensuelles :</span>
              <span className="text-emerald-400 font-bold">{monthlyOrders} / mois</span>
            </div>
            <input 
              type="range"
              min="20"
              max="500"
              step="10"
              value={monthlyOrders}
              onChange={(e) => setMonthlyOrders(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Panier moyen (€ TTC) :</span>
              <span className="text-emerald-400 font-bold">{avgCart} €</span>
            </div>
            <input 
              type="range"
              min="20"
              max="250"
              step="5"
              value={avgCart}
              onChange={(e) => setAvgCart(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 text-center sm:text-left">
            <span>En activant les 6 réassurances sur votre page de commande :</span>
            <div className="text-[11px] text-slate-400">Moins d'hésitations, réduction des paniers orphelins.</div>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <span className="text-xs text-slate-400">Gain estimé :</span>
            <div className="text-lg font-black text-emerald-400">
              +{additionalMonthlyRevenue.toLocaleString('fr-FR')} € / mois
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutTrustBooster;
