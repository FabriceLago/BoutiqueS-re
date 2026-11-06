/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Plan de Continuité d'Urgence & Checklist Fort Knox (Soldes / Black Friday)
 * Fichier : src/components/EmergencyPlanModal.tsx
 */

import React, { useState } from 'react';
import { 
  X, 
  LifeBuoy, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileWarning, 
  Clock, 
  Zap, 
  ShieldAlert, 
  Download,
  Calendar
} from 'lucide-react';

export interface EmergencyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl?: string;
  email?: string;
}

export const EmergencyPlanModal: React.FC<EmergencyPlanModalProps> = ({
  isOpen,
  onClose,
  storeUrl = 'https://ma-boutique-en-ligne.fr',
  email = 'contact@ma-boutique-en-ligne.fr'
}) => {
  const [activeTab, setActiveTab] = useState<'fort_knox' | 'emergency_protocol' | 'cnil_72h'>('fort_knox');
  const [copiedCnil, setCopiedCnil] = useState<boolean>(false);

  const cleanDomain = storeUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'ma-boutique.fr';

  // Checklist Fort Knox
  const [fortKnoxTasks, setFortKnoxTasks] = useState([
    { id: '1', title: 'Sauvegarde complète externalisée vérifiée (< 24h)', checked: true, impact: 'Garantie de restauration en cas de crash' },
    { id: '2', title: 'Bascule passerelle de secours configurée (Stripe + PayPal)', checked: true, impact: 'Évite l\'arrêt des paiements si une passerelle bloque' },
    { id: '3', title: 'Activation du cache statique CDN (Cloudflare / Nginx)', checked: false, impact: 'Divise par 5 la charge sur le serveur lors des pics' },
    { id: '4', title: 'Double authentification (2FA) sur tous les comptes admins', checked: true, impact: 'Bloque le piratage des accès par mot de passe volé' },
    { id: '5', title: 'Limitation du taux de requêtes (Rate-Limiting sur le panier)', checked: false, impact: 'Empêche les robots de vider vos stocks artificiellement' },
    { id: '6', title: 'Vérification de la validité du certificat SSL (> 30 jours)', checked: true, impact: 'Évite l\'expiration surprise en plein pic de ventes' }
  ]);

  const toggleTask = (id: string) => {
    setFortKnoxTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const completedCount = fortKnoxTasks.filter(t => t.checked).length;

  const cnilTemplate = `FORMULAIRE DE NOTIFICATION DE VIOLATION DE DONNÉES (ARTICLE 33 DU RGPD)
Destinataire : Commission Nationale de l'Informatique et des Libertés (CNIL)
Date : ${new Date().toLocaleDateString('fr-FR')}

1. ORGANISME RESPONSABLE :
Nom commercial : ${cleanDomain}
Contact DPO / Gérant : ${email}
Boutique en ligne : ${storeUrl}

2. NATURE DE LA VIOLATION :
- Type d'incident : [Suspicion de script tiers malveillant / Tentative d'intrusion non autorisée]
- Date et heure de constatation : ${new Date().toLocaleString('fr-FR')}
- Données potentiellement impactées : Données de facturation (nom, adresse postale, email)
- Données de carte bancaire : NON IMPACTÉES (traitées via passerelle certifiée PCI-DSS niveau 1 tierce)

3. MESURES TECHNIQUES PRISES IMMÉDIATEMENT :
- Révocation des accès administrateurs et rotation des clés API
- Purge du cache et réinitialisation des certificats
- Diagnostic d'intégrité et verrouillage des en-têtes HTTP de sécurité avec BoutiqueSûre
- Analyse approfondie en cours par un expert en cybersécurité e-commerce

Signature du responsable du traitement :
Fait à Paris / Bruxelles, le ${new Date().toLocaleDateString('fr-FR')}
`;

  const handleCopyCnil = async () => {
    try {
      await navigator.clipboard.writeText(cnilTemplate);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = cnilTemplate;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedCnil(true);
    setTimeout(() => setCopiedCnil(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      data-testid="emergency-plan-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Plan de Continuité d'Urgence & Checklist Fort Knox
              </h2>
              <p className="text-xs text-slate-300">
                Protocoles d'action immédiats pour Soldes, Black Friday et gestion de crise
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-emergency-modal-btn"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('fort_knox')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'fort_knox'
                ? 'bg-emerald-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/50'
            }`}
          >
            1. Checklist Soldes & Black Friday
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency_protocol')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'emergency_protocol'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/50'
            }`}
          >
            2. Protocole Incident Piratage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cnil_72h')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cnil_72h'
                ? 'bg-sky-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-800/50'
            }`}
          >
            3. Modèle Notification CNIL 72h
          </button>
        </div>

        {/* Tab 1: Checklist Fort Knox */}
        {activeTab === 'fort_knox' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-white font-bold">Préparation aux pics de ventes :</span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                {completedCount} / {fortKnoxTasks.length} points vérifiés ({Math.round((completedCount / fortKnoxTasks.length) * 100)}%)
              </span>
            </div>

            <div className="space-y-2">
              {fortKnoxTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.checked
                      ? 'bg-slate-950/80 border-emerald-500/30'
                      : 'bg-slate-950/40 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.checked}
                      onChange={() => {}}
                      className="accent-emerald-400 h-4 w-4 rounded cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{task.title}</div>
                      <div className="text-[11px] text-slate-400">{task.impact}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    task.checked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {task.checked ? 'Prêt' : 'À faire'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Protocole Urgence */}
        {activeTab === 'emergency_protocol' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>En cas de comportement suspect ou défaillance du panier :</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                <li><strong className="text-white">Activez immédiatement le mode maintenance</strong> pour couper tout transit de données sensibles.</li>
                <li><strong className="text-white">Révoquez vos clés API de paiement</strong> dans le tableau de bord Stripe / PayPal / Mollie.</li>
                <li><strong className="text-white">Changez tous les mots de passe</strong> (FTP, base de données SQL, panneau d'administration CMS).</li>
                <li><strong className="text-white">Prévenez votre hébergeur</strong> et demandez la restauration de la sauvegarde saine de la veille.</li>
                <li><strong className="text-white">Contactez nos experts d'urgence BoutiqueSûre</strong> pour diagnostiquer le vecteur d'intrusion.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: CNIL 72h */}
        {activeTab === 'cnil_72h' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <p className="text-xs text-slate-300">
              L'Article 33 du RGPD impose de notifier la CNIL en moins de <strong>72 heures</strong> en cas de violation avérée. Ce modèle pré-rempli vous protège contre les amendes pour défaut de notification :
            </p>
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56">
              {cnilTemplate}
            </pre>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCopyCnil}
                data-testid="copy-cnil-template-btn"
                className="px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                {copiedCnil ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCnil ? 'Modèle copié !' : 'Copier la notification CNIL'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Conforme Art. 33 RGPD
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmergencyPlanModal;
