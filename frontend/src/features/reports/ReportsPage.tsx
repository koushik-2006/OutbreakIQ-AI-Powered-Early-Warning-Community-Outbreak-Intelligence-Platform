import React, { useState } from 'react';
import { 
  TrendingUp, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Layers, 
  BarChart3, 
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { MOCK_REGIONS, MOCK_DAILY_TRENDS, MOCK_KPIS } from '../../mocks/mockData';

export const ReportsPage: React.FC = () => {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [reportPeriod, setReportPeriod] = useState('14d');

  // Chart data comparing top regions
  const comparisonData = MOCK_REGIONS.slice(0, 6).map(r => ({
    name: r.name.replace(' District', '').replace(' County', ''),
    reportedCases: r.reportedCases,
    activeAlerts: r.activeAlerts * 100, // scaled for visual
    completeness: r.dataCompleteness,
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Region_ID', 'Region_Name', 'Risk_Level', 'Population', 'Reported_Cases', 'Active_Alerts', 'Data_Completeness'];
    const rows = MOCK_REGIONS.map(r => [
      r.id,
      r.name,
      r.riskLevel,
      r.population,
      r.reportedCases,
      r.activeAlerts,
      r.dataCompleteness + '%'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outbreak_surveillance_report_${reportPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 print:bg-white print:text-black">
      {/* Page Header */}
      <div className="print:hidden">
        <PageHeader
          title="Epidemiological Analytics & Surveillance Reports"
          subtitle="Generate aggregated regional intelligence summaries, comparative benchmarks, and printable audit reports"
          badge="SYNTHETIC DEMO DATASET"
          badgeColor="bg-slate-800 text-slate-300 border-slate-700"
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Report
              </Button>
              <Button
                variant="cyan"
                size="sm"
                onClick={handleExportCsv}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export Aggregated CSV
              </Button>
            </div>
          }
        />
      </div>

      {/* Printable Report Header (Visible only when printing) */}
      <div className="hidden print:block mb-8 pb-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold">OutbreakIQ Surveillance Intelligence Briefing</h1>
        <p className="text-xs text-gray-600 mt-1">Generated: {new Date().toLocaleDateString()} • Authorized De-Identified Telemetry Report</p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0F1527] border border-white/5 print:hidden">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs font-semibold text-white">Jurisdiction Scope:</span>
          <select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-cyan"
          >
            <option value="all">All 12 Monitored Jurisdictions</option>
            <option value="reg-central">Central District</option>
            <option value="reg-north">North County</option>
            <option value="reg-west">West Valley</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Calendar className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setReportPeriod('7d')}
            className={`px-2.5 py-1 rounded-lg ${reportPeriod === '7d' ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setReportPeriod('14d')}
            className={`px-2.5 py-1 rounded-lg ${reportPeriod === '14d' ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Past 14 Days
          </button>
          <button
            onClick={() => setReportPeriod('30d')}
            className={`px-2.5 py-1 rounded-lg ${reportPeriod === '30d' ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Past 30 Days
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/5 print:border-gray-300">
          <span className="text-xs text-slate-400 print:text-gray-600">Total Syndromic Encounters</span>
          <p className="text-2xl font-bold text-white print:text-black font-display mt-1">{MOCK_KPIS.totalReportedCases}</p>
          <span className="text-[10px] text-rose-400 font-mono">+18% vs baseline</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5 print:border-gray-300">
          <span className="text-xs text-slate-400 print:text-gray-600">Active Anomaly Signals</span>
          <p className="text-2xl font-bold text-rose-400 font-display mt-1">{MOCK_KPIS.activeAlerts}</p>
          <span className="text-[10px] text-slate-400 font-mono">1 Critical, 2 Medium</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5 print:border-gray-300">
          <span className="text-xs text-slate-400 print:text-gray-600">Mean Anomaly Confidence</span>
          <p className="text-2xl font-bold text-brand-cyan font-display mt-1">{MOCK_KPIS.avgSignalConfidence}%</p>
          <span className="text-[10px] text-emerald-400 font-mono">Cross-validated</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5 print:border-gray-300">
          <span className="text-xs text-slate-400 print:text-gray-600">Open Field Inquiries</span>
          <p className="text-2xl font-bold text-purple-400 font-display mt-1">{MOCK_KPIS.underInvestigation}</p>
          <span className="text-[10px] text-slate-400 font-mono">Active triage</span>
        </div>
      </div>

      {/* Regional Comparison Bar Chart */}
      <div className="glass-card rounded-3xl p-6 border border-white/5 print:border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white print:text-black flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-cyan" />
              Regional Case Volume & Anomaly Correlation
            </h3>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">Comparative volume across high-traffic community districts</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#F1F5F9' }}
              />
              <Bar dataKey="reportedCases" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Reported Encounters" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Trend Multi-Series Chart */}
      <div className="glass-card rounded-3xl p-6 border border-white/5 print:border-gray-300">
        <h3 className="text-base font-bold text-white print:text-black mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          Multi-Stream Anomaly Progression (14 Days)
        </h3>
        <p className="text-xs text-slate-400 print:text-gray-600 mb-4">Synchronized escalation across fever presentations, cough medicine sales, and baseline</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_DAILY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#F1F5F9' }}
              />
              <Line type="monotone" dataKey="baselineExpected" stroke="#64748B" strokeDasharray="4 4" dot={false} name="Expected Baseline" />
              <Line type="monotone" dataKey="feverCases" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} name="Fever Complaints" />
              <Line type="monotone" dataKey="coughSyrupSales" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} name="Cough OTC Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
