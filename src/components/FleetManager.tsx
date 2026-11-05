/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Gestionnaire de Flotte Multi-Boutiques pour Agences & Réseaux
 * Fichier : src/components/FleetManager.tsx
 *
 * Permet aux agences web, franchises et infogérants de piloter un parc de plusieurs
 * boutiques WooCommerce avec score consolidé, alertes de risque et export CSV.
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Layers,
  CheckCircle2
} from 'lucide-react';

export interface FleetStoreItem {
  id: string;
  domain: string;
  clientName: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  score: number;
  lastAuditDate: string;
  monthlyRevenueEst: number;
}

export const DEFAULT_FLEET_STORES: FleetStoreItem[] = [
  { id: 'fleet-1', domain: 'chocolaterie-artisanale.fr', clientName: 'Maison Guérin', grade: 'A', score: 94, lastAuditDate: '2026-11-04', monthlyRevenueEst: 35000 },
  { id: 'fleet-2', domain: 'mode-ethique-paris.com', clientName: 'Studio Vert', grade: 'C', score: 68, lastAuditDate: '2026-11-03', monthlyRevenueEst: 48000 },
  { id: 'fleet-3', domain: 'cosmetiques-bio-provence.fr', clientName: 'BioProvence', grade: 'E', score: 38, lastAuditDate: '2026-11-02', monthlyRevenueEst: 22000 },
  { id: 'fleet-4', domain: 'mobilier-scandinave-design.be', clientName: 'Nordic Concept', grade: 'B', score: 86, lastAuditDate: '2026-11-01', monthlyRevenueEst: 65000 }
];

export interface FleetManagerProps {
  onSelectAuditUrl?: (url: string, email: string) => void;
}

export const FleetManager: React.FC<FleetManagerProps> = ({ onSelectAuditUrl }) => {
  const [fleetStores, setFleetStores] = useState<FleetStoreItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('boutiquesure_fleet_stores');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_FLEET_STORES;
  });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'risk' | 'secure'>('all');
  const [newDomain, setNewDomain] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newGrade, setNewGrade] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('C');
  const [newScore, setNewScore] = useState<number>(65);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const saveStores = (updated: FleetStoreItem[]) => {
    setFleetStores(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('boutiquesure_fleet_stores', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    const cleanDomain = newDomain.trim().replace(/^https?:\/\//i, '').split('/')[0];
    const newStore: FleetStoreItem = {
      id: `fleet-${Date.now()}`,
      domain: cleanDomain,
      clientName: newClient.trim() || cleanDomain,
      grade: newGrade,
      score: newScore,
      lastAuditDate: new Date().toISOString().slice(0, 10),
      monthlyRevenueEst: 30000
    };

    saveStores([newStore, ...fleetStores]);
    setNewDomain('');
    setNewClient('');
    setIsFormOpen(false);
  };

  const handleDeleteStore = (id: string) => {
    saveStores(fleetStores.filter(s => s.id !== id));
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Domaine', 'Client', 'Note', 'Score', 'Dernier Scan', 'CA Mensuel Estime'];
    const rows = fleetStores.map(s => [
      s.id,
      s.domain,
      `"${s.clientName.replace(/"/g, '""')}"`,
      s.grade,
      String(s.score),
      s.lastAuditDate,
      String(s.monthlyRevenueEst)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flotte_agences_boutiquesure_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fleetAverageScore = useMemo(() => {
    if (fleetStores.length === 0) return 0;
    const sum = fleetStores.reduce((acc, s) => acc + s.score, 0);
    return Math.round(sum / fleetStores.length);
  }, [fleetStores]);

  const averageGrade = fleetAverageScore >= 90 ? 'A' : fleetAverageScore >= 75 ? 'B' : fleetAverageScore >= 60 ? 'C' : 'E';

  const riskCount = useMemo(() => {
    return fleetStores.filter(s => ['C', 'D', 'E', 'F'].includes(s.grade)).length;
  }, [fleetStores]);

  const secureCount = useMemo(() => {
    return fleetStores.filter(s => ['A', 'B'].includes(s.grade)).length;
  }, [fleetStores]);

  const totalRevenue = useMemo(() => {
    return fleetStores.reduce((acc, s) => acc + s.monthlyRevenueEst, 0);
  }, [fleetStores]);

  const filteredStores = fleetStores.filter(s => {
    const matchesSearch = s.domain.toLowerCase().includes(search.toLowerCase()) ||
                          s.clientName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'risk') return ['C', 'D', 'E', 'F'].includes(s.grade);
    if (filter === 'secure') return ['A', 'B'].includes(s.grade);
    return true;
  });

  return (
    <div className="space-y-6" data-testid="fleet-manager-section">
      
      {/* En-tête Flotte Agences */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg sm:text-xl font-black text-white">Gestion de Flotte Multi-Boutiques</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
              Agences & Multi-Sites
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Espace Agences & E-Commerçants Multi-Sites : supervisez l'hygiène de sécurité et la conformité de l'ensemble de votre parc.
          </p>
        </div>
      </div>

      {/* 4 KPIs de la Flotte */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" data-testid="fleet-kpis-grid">
        
        {/* KPI 1 : Total Flotte */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Boutiques Gérées</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white" data-testid="fleet-total-count">
            {fleetStores.length} sites
          </div>
          <div className="text-[11px] text-slate-400">Parc e-commerce unifié</div>
        </div>

        {/* KPI 2 : Score Moyen */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Score Moyen Flotte</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-2" data-testid="fleet-average-score">
            <span>{fleetAverageScore}/100</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Note {averageGrade}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Maturité globale du parc</div>
        </div>

        {/* KPI 3 : Boutiques à Risque */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Boutiques à Risque</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400" data-testid="fleet-risk-count">
            {riskCount} alerte(s)
          </div>
          <div className="text-[11px] text-slate-400">Notes C, D, E ou F à corriger</div>
        </div>

        {/* KPI 4 : CA Protégé */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Volume d'Affaires</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {totalRevenue.toLocaleString('fr-FR')} €/m
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">{secureCount} boutique(s) Note A/B</div>
        </div>

      </div>

      {/* Barre d'outils & Filtres */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Recherche et Filtres */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une boutique ou un client..."
              data-testid="fleet-search-input"
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              data-testid="fleet-filter-all"
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Toutes ({fleetStores.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('risk')}
              data-testid="fleet-filter-risk"
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${filter === 'risk' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}
            >
              À Risque ({riskCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('secure')}
              data-testid="fleet-filter-secure"
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${filter === 'secure' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'}`}
            >
              Sécurisées ({secureCount})
            </button>
          </div>
        </div>

        {/* Boutons d'action : Ajouter + Export CSV */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            data-testid="fleet-add-store-btn"
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une boutique</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            data-testid="fleet-export-csv-btn"
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exporter la flotte au format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

      </div>

      {/* Formulaire rétractable d'ajout de boutique */}
      {isFormOpen && (
        <form 
          onSubmit={handleAddStore}
          data-testid="fleet-add-form"
          className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 animate-fade-in shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Intégrer une nouvelle boutique au parc géré</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Annuler
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Domaine de la boutique * :</label>
              <input
                type="text"
                required
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="ex: ma-boutique.fr"
                data-testid="fleet-input-domain"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Nom du client / Marque :</label>
              <input
                type="text"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="ex: SAS Mode & Co"
                data-testid="fleet-input-client"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Note attribuée :</label>
              <select
                value={newGrade}
                onChange={(e) => {
                  const g = e.target.value as any;
                  setNewGrade(g);
                  setNewScore(g === 'A' ? 95 : g === 'B' ? 82 : g === 'C' ? 65 : 35);
                }}
                data-testid="fleet-select-grade"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="A">Note A (Excellente)</option>
                <option value="B">Note B (Bonne)</option>
                <option value="C">Note C (Moyenne)</option>
                <option value="D">Note D (Vulnérable)</option>
                <option value="E">Note E (Critique)</option>
                <option value="F">Note F (Non protégée)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                data-testid="fleet-submit-store-btn"
                className="w-full px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                Valider et Enregistrer
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tableau de la Flotte */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" data-testid="fleet-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3 px-4">Boutique & Domaine</th>
                <th className="py-3 px-4">Client / Marque</th>
                <th className="py-3 px-4">Dernier Scan</th>
                <th className="py-3 px-4">Note & Score</th>
                <th className="py-3 px-4">État & Risque</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Aucune boutique trouvée dans la flotte pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const isRisk = ['C', 'D', 'E', 'F'].includes(store.grade);
                  return (
                    <tr 
                      key={store.id} 
                      data-testid={`fleet-row-${store.id}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isRisk ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                          <span className="font-mono text-white font-bold">{store.domain}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {store.clientName}
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {store.lastAuditDate}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            store.grade === 'A' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            store.grade === 'B' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                            store.grade === 'C' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            Note {store.grade}
                          </span>
                          <span className="text-slate-400 text-[11px]">({store.score}/100)</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isRisk ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Action Requise</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sécurisé</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectAuditUrl && (
                            <button
                              type="button"
                              onClick={() => onSelectAuditUrl(`https://${store.domain}`, `contact@${store.domain}`)}
                              data-testid={`fleet-audit-btn-${store.id}`}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                              title="Ouvrir le bulletin de santé"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteStore(store.id)}
                            data-testid={`fleet-delete-btn-${store.id}`}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Supprimer de la flotte"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
