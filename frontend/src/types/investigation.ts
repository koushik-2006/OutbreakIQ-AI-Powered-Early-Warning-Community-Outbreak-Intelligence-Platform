import { AlertSeverity } from './alert';

export type InvestigationStatus = 'open' | 'in_progress' | 'verified_outbreak' | 'false_positive' | 'closed';
export type InvestigationPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface InvestigationNote {
  id: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  content: string;
  isOutcome?: boolean;
}

export interface InvestigationTimelineEvent {
  id: string;
  timestamp: string;
  eventType: 'created' | 'status_changed' | 'assigned' | 'note_added' | 'evidence_attached' | 'closed';
  actorName: string;
  details: string;
}

export interface Investigation {
  id: string;
  title: string;
  alertId: string;
  alertTitle: string;
  regionId: string;
  regionName: string;
  assignedTo: string;
  assignedToEmail: string;
  status: InvestigationStatus;
  priority: InvestigationPriority;
  severity: AlertSeverity;
  createdAt: string;
  updatedAt: string;
  summary: string;
  hypothesis: string;
  verificationOutcome?: string;
  notes: InvestigationNote[];
  timeline: InvestigationTimelineEvent[];
}
