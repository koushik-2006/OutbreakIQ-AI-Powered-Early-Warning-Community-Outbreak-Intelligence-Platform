import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ClipboardList, 
  User, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  FileCheck,
  History,
  Tag
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { investigationService } from '../../services/investigationService';
import { Investigation, InvestigationStatus } from '../../types/investigation';

export const InvestigationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showFalseAlarmModal, setShowFalseAlarmModal] = useState(false);

  const fetchInvestigation = async () => {
    if (!id) return;
    try {
      const data = await investigationService.getInvestigationById(id);
      setInvestigation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigation();
  }, [id]);

  if (isLoading || !investigation) {
    return <LoadingState message="Loading Field Investigation Dossier..." />;
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsUpdating(true);
    try {
      await investigationService.addNote(
        investigation.id,
        newNoteText.trim(),
        user?.name || 'Dr. Sarah Lin, MPH',
        user?.role ? user.role.replace('_', ' ').toUpperCase() : 'EPIDEMIOLOGIST'
      );
      setNewNoteText('');
      await fetchInvestigation();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: InvestigationStatus, outcome?: string) => {
    setIsUpdating(true);
    try {
      await investigationService.updateStatus(investigation.id, newStatus, outcome);
      setShowVerifyModal(false);
      setShowFalseAlarmModal(false);
      await fetchInvestigation();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/investigations" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Field Investigations</span>
      </Link>

      {/* Page Header */}
      <PageHeader
        title={investigation.title}
        subtitle={`Incident ID: ${investigation.id} • Assigned to ${investigation.assignedTo}`}
        badge={investigation.status.toUpperCase().replace(/_/g, ' ')}
        badgeColor={
          investigation.status === 'verified_outbreak' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
          investigation.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
          investigation.status === 'false_positive' ? 'bg-slate-700/40 text-slate-400 border-slate-600' :
          'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {investigation.status === 'open' && (
              <Button
                variant="cyan"
                size="sm"
                isLoading={isUpdating}
                onClick={() => handleStatusChange('in_progress')}
              >
                Mark In Progress
              </Button>
            )}

            {investigation.status !== 'verified_outbreak' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowVerifyModal(true)}
              >
                Confirm Verified Outbreak
              </Button>
            )}

            {investigation.status !== 'false_positive' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
                onClick={() => setShowFalseAlarmModal(true)}
              >
                Close as False Alarm
              </Button>
            )}
          </div>
        }
      />

      {/* Outcome Banner if verified */}
      {investigation.verificationOutcome && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-start gap-3 shadow-glow-violet">
          <FileCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider font-mono">
              Verification Outcome Confirmed
            </h4>
            <p className="text-xs text-purple-300 mt-1 leading-relaxed">
              {investigation.verificationOutcome}
            </p>
          </div>
        </div>
      )}

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Summary, Hypothesis, and Linked Alert */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Investigation Overview</h3>
            
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Summary</span>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">{investigation.summary}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Working Epidemiological Hypothesis</span>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {investigation.hypothesis}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Linked Surveillance Signal:</span>
              <Link to={`/alerts/${investigation.alertId}`} className="text-brand-cyan hover:underline font-mono font-medium">
                {investigation.alertTitle} →
              </Link>
            </div>
          </div>

          {/* Field Notes Section */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-brand-cyan" />
              Epidemiologist Field Notes ({investigation.notes.length})
            </h3>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log microbiological swab findings, lab PCR results, or clinic contact tracing updates..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="cyan"
                  size="sm"
                  isLoading={isUpdating}
                  disabled={!newNoteText.trim()}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Append Note to Record
                </Button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3 pt-2">
              {investigation.notes.map((note) => (
                <div key={note.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{note.authorName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-purple-300 border border-brand-violet/30">
                        {note.authorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{note.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Audit Timeline & Metadata */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm mb-3">Incident Metadata</h4>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Jurisdiction</span>
              <strong className="text-white">{investigation.regionName}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Priority Level</span>
              <StatusBadge type="priority" value={investigation.priority} size="sm" />
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Lead Investigator</span>
              <span className="text-brand-cyan">{investigation.assignedTo}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Created Date</span>
              <span className="text-slate-300 font-mono">{investigation.createdAt}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Last Telemetry Sync</span>
              <span className="text-slate-300 font-mono">{investigation.updatedAt}</span>
            </div>
          </div>

          {/* Activity History Audit Trail */}
          <div className="glass-card rounded-3xl p-6 border border-white/5">
            <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-cyan" />
              Audit Trail & Timeline
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {investigation.timeline.map((evt) => (
                <div key={evt.id} className="relative text-xs">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-cyan shadow-glow-cyan" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200">{evt.actorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{evt.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Confirm Outbreak Modal */}
      <ConfirmDialog
        isOpen={showVerifyModal}
        title="Verify and Confirm Community Outbreak?"
        message="This action certifies that syndromic signals have been verified through microbiological testing and epidemiological contact tracing. An official health bulletin will be queued for public health authority review."
        confirmLabel="Confirm Outbreak"
        variant="primary"
        isLoading={isUpdating}
        onConfirm={() => handleStatusChange('verified_outbreak', 'Epidemiologically and microbiologically verified causative respiratory cluster. Targeted intervention initiated.')}
        onCancel={() => setShowVerifyModal(false)}
      />

      {/* False Alarm Modal */}
      <ConfirmDialog
        isOpen={showFalseAlarmModal}
        title="Close Investigation as False Alarm?"
        message="Closing this investigation will mark the anomaly as non-pathogenic noise and recalibrate model threshold sensitivities."
        confirmLabel="Close as False Alarm"
        variant="danger"
        isLoading={isUpdating}
        onConfirm={() => handleStatusChange('false_positive', 'Ruled out as a retail inventory reporting artifact without corresponding clinical morbidity.')}
        onCancel={() => setShowFalseAlarmModal(false)}
      />
    </div>
  );
};
