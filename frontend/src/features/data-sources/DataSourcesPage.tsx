import React, { useState, useEffect } from 'react';
import { 
  Database, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Download,
  Clock,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { dataSourceService } from '../../services/dataSourceService';
import { DataSource, CsvValidationSummary } from '../../types/dataSource';

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [validationSummary, setValidationSummary] = useState<CsvValidationSummary | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const data = await dataSourceService.getDataSources();
        setSources(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSources();
  }, []);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file (.csv)');
      return;
    }
    setUploadSuccessMessage(null);
    const summary = await dataSourceService.validateAndParseCsv(file);
    setValidationSummary(summary);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationSummary) return;
    setIsUploading(true);
    try {
      const dummyFile = new File(['dummy'], validationSummary.fileName);
      const res = await dataSourceService.uploadCsv(dummyFile);
      setUploadSuccessMessage(res.message);
      setValidationSummary(null);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleCsv = () => {
    const sample = `date,region_id,indicator_name,metric_value\n2026-10-15,reg-central,pediatric_fever_visits,340\n2026-10-15,reg-north,cough_syrup_otc_sales,680\n2026-10-15,reg-west,urgent_care_ili_cases,92\n2026-10-15,reg-east,antipyretic_sales,210`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outbreak_telemetry_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingState message="Loading Data Ingestion Feeds & Telemetry Sources..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sources & Ingestion Telemetry"
        subtitle="Manage authorized syndromic data feeds and batch ingest CSV observation records"
        badge="INGESTION ENGINE"
        badgeColor="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSampleCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Sample CSV Schema
          </Button>
        }
      />

      {/* Upload Success Alert */}
      {uploadSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p>{uploadSuccessMessage}</p>
          </div>
          <button onClick={() => setUploadSuccessMessage(null)} className="font-mono text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* CSV Drag & Drop Upload Panel */}
      <div className="glass-card rounded-3xl p-6 border border-white/5">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-brand-cyan" />
          Batch CSV Syndromic Ingestion
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Upload bulk observation logs from clinics, pharmacies, or school districts. Pre-validates required schemas before streaming to FastAPI backend.
        </p>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
            dragActive
              ? 'border-brand-cyan bg-brand-cyan/10'
              : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500'
          }`}
          onClick={() => document.getElementById('csvFileInput')?.click()}
        >
          <input
            id="csvFileInput"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-brand-cyan mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-semibold text-white">Drag and drop your syndromic CSV file here</h4>
          <p className="text-xs text-slate-400 mt-1">or click to browse from your workstation (.csv format up to 25MB)</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <span>Required Headers:</span>
            <span className="text-brand-cyan">date, region_id, indicator_name, metric_value</span>
          </div>
        </div>

        {/* Validation Results Preview */}
        {validationSummary && (
          <div className="mt-6 p-6 rounded-2xl bg-[#090D18] border border-slate-700/80 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>File: {validationSummary.fileName}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ({(validationSummary.fileSizeBytes / 1024).toFixed(1)} KB)
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Pre-import schema verification result</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setValidationSummary(null)}>
                  Discard
                </Button>
                <Button
                  variant="cyan"
                  size="sm"
                  isLoading={isUploading}
                  onClick={handleConfirmImport}
                  disabled={validationSummary.invalidRows > 0 || validationSummary.requiredColumnsMissing.length > 0}
                >
                  Confirm & Ingest ({validationSummary.validRows} Valid Rows)
                </Button>
              </div>
            </div>

            {/* Missing columns warning */}
            {validationSummary.requiredColumnsMissing.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  Missing required columns: <strong className="font-mono">{validationSummary.requiredColumnsMissing.join(', ')}</strong>
                </span>
              </div>
            )}

            {/* Validation Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Total Rows</span>
                <p className="text-xl font-bold text-white font-mono mt-0.5">{validationSummary.totalRows}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-emerald-400">Valid Rows</span>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{validationSummary.validRows}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <span className="text-amber-400">Duplicates / Warnings</span>
                <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">{validationSummary.warningRows}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <span className="text-rose-400">Invalid Rows</span>
                <p className="text-xl font-bold text-rose-400 font-mono mt-0.5">{validationSummary.invalidRows}</p>
              </div>
            </div>

            {/* Table Preview */}
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-2">Row</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Region ID</th>
                    <th className="pb-2">Indicator</th>
                    <th className="pb-2">Metric Value</th>
                    <th className="pb-2">Notes / Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {validationSummary.rows.map((row) => (
                    <tr key={row.rowNumber} className="hover:bg-slate-800/40">
                      <td className="py-2 text-slate-400">#{row.rowNumber}</td>
                      <td className="py-2">
                        {row.status === 'valid' && <span className="text-emerald-400 font-semibold">Valid</span>}
                        {row.status === 'warning' && <span className="text-amber-400 font-semibold">Warning</span>}
                        {row.status === 'invalid' && <span className="text-rose-400 font-semibold">Invalid</span>}
                      </td>
                      <td className="py-2 text-slate-200">{row.data.date || '—'}</td>
                      <td className="py-2 text-slate-200">{row.data.region_id || '—'}</td>
                      <td className="py-2 text-slate-200">{row.data.indicator_name || '—'}</td>
                      <td className="py-2 text-white font-bold">{row.data.metric_value || '—'}</td>
                      <td className="py-2 text-slate-400 text-[10px]">
                        {row.errors.length > 0 ? row.errors.join('; ') : 'Passed schema test'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Active Data Sources Health Table */}
      <div className="glass-card rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-cyan" />
              Connected Syndromic Telemetry Feeds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Continuous ingestion pipes streaming into the anomaly engine</p>
          </div>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> All Feeds Operational
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3">Data Source Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Today's Records</th>
                <th className="pb-3">Coverage</th>
                <th className="pb-3">Latency</th>
                <th className="pb-3">Security & Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5">
                    <span className="font-semibold text-white block">{src.name}</span>
                    <span className="text-[11px] text-slate-400">{src.authorizedOrganization}</span>
                  </td>
                  <td className="py-3.5 font-mono capitalize text-slate-300">
                    {src.type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {src.status}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-white font-bold">
                    {src.recordsToday.toLocaleString()}
                  </td>
                  <td className="py-3.5 font-mono text-emerald-400">
                    {src.dataCompleteness}%
                  </td>
                  <td className="py-3.5 font-mono text-slate-300">
                    {src.lastSync} ({src.latencyMinutes}m)
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                      {src.encryptionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
