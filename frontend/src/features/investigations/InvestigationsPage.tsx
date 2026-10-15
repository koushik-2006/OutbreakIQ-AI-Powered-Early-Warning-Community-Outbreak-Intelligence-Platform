import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { investigationService } from '../../services/investigationService';
import { Investigation, InvestigationStatus } from '../../types/investigation';

export const InvestigationsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New investigation state
  const [newTitle, setNewTitle] = useState('');
  const [newRegion, setNewRegion] = useState('Central District');
  const [newSummary, setNewSummary] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchInvestigations = async () => {
    try {
      const data = await investigationService.getInvestigations();
      setInvestigations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const handleCreateInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      await investigationService.createInvestigation({
        title: newTitle,
        regionName: newRegion,
        summary: newSummary,
        assignedTo: 'Dr. Sarah Lin, MPH',
        priority: 'high',
        severity: 'high',
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewSummary('');
      await fetchInvestigations();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading Field Investigations..." />;
  }

  const filtered = investigations.filter(inv => {
    const matchesSearch = inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Investigation Management"
        subtitle="Operational triage, epidemiological verification, and incident management workflows"
        badge="HUMAN-IN-THE-LOOP"
        badgeColor="bg-brand-violet/20 text-purple-300 border-brand-violet/40"
        actions={
          <Button
            variant="cyan"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Open New Investigation
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, investigator, or region..."
            className="w-full bg-[#0F1527] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          {['all', 'open', 'in_progress', 'verified_outbreak', 'false_positive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl border capitalize transition-all ${
                statusFilter === st
                  ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Investigation List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((inv) => (
          <div key={inv.id} className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              {/* Top Row: Badges & ID */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-2 py-0.5 rounded-full font-semibold">
                  {inv.id}
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge type="priority" value={inv.priority} size="sm" />
                  <StatusBadge type="status" value={inv.status} size="sm" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-2">
                <Link to={`/investigations/${inv.id}`} className="hover:text-brand-cyan">
                  {inv.title}
                </Link>
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {inv.summary}
              </p>

              {/* Info Badges */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jurisdiction:</span>
                  <strong className="text-slate-200">{inv.regionName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Lead Investigator:</span>
                  <span className="text-brand-cyan font-medium">{inv.assignedTo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Linked Signal:</span>
                  <span className="text-slate-300 font-mono">{inv.alertTitle}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {inv.notes.length} notes • Updated {inv.updatedAt}
              </span>
              <Link to={`/investigations/${inv.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Open Workspace
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Investigation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0F1527] border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Open New Field Investigation</h3>
            <p className="text-xs text-slate-400 mb-4">Assign epidemiological review for a suspected anomaly cluster.</p>

            <form onSubmit={handleCreateInvestigation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Investigation Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. North County Upper Respiratory Syndrome Review"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jurisdiction / Region</label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Central District">Central District</option>
                  <option value="North County">North County</option>
                  <option value="West Valley">West Valley</option>
                  <option value="East Hills">East Hills</option>
                  <option value="South Bay">South Bay</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Summary & Working Hypothesis</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Summarize syndromic observations, suspected transmission vector, and deployment priority..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="cyan" size="sm" type="submit" isLoading={isCreating}>
                  Create Investigation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
