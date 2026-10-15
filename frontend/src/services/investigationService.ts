import { Investigation, InvestigationStatus, InvestigationNote } from '../types/investigation';
import { apiClient } from './apiClient';
import { MOCK_INVESTIGATIONS } from '../mocks/mockData';

let localInvestigations = [...MOCK_INVESTIGATIONS];

function mapBackendInvestigation(item: any): Investigation {
  const statusMap: Record<string, InvestigationStatus> = {
    'OPEN': 'open',
    'IN_PROGRESS': 'in_progress',
    'RESOLVED': 'verified_outbreak',
    'CLOSED': 'closed',
    'open': 'open',
    'in_progress': 'in_progress',
    'verified_outbreak': 'verified_outbreak',
    'false_positive': 'false_positive',
    'closed': 'closed',
  };

  const timeline = Array.isArray(item.timeline)
    ? item.timeline.map((t: any, idx: number) => ({
        id: t.id || `tl-${idx}`,
        timestamp: typeof t.timestamp === 'string' ? t.timestamp.substring(0, 16).replace('T', ' ') : 'Recent',
        eventType: (t.action === 'INVESTIGATION_OPENED' ? 'created' : t.action === 'NOTE_ADDED' ? 'note_added' : 'status_changed') as any,
        actorName: t.author || t.actorName || 'System',
        details: t.details || t.action || 'Updated case log',
      }))
    : [];

  return {
    id: item.id,
    title: item.title,
    alertId: item.alert_id || item.alertId || 'ALT-001',
    alertTitle: item.alertTitle || `Surveillance Alert (${item.indicator || 'ILI'})`,
    regionId: item.region_id || item.regionId || 'REG-METRO-N',
    regionName: item.regionName || (item.region_id === 'REG-METRO-N' ? 'Metro North District' : 'Surveillance Region'),
    assignedTo: item.assigned_to || item.assignedTo || 'Dr. Sarah Lin, MPH',
    assignedToEmail: item.assignedToEmail || 'slin@publichealth.gov',
    status: statusMap[item.status] || 'open',
    priority: (item.priority || 'high') as any,
    severity: (item.severity || 'high') as any,
    createdAt: typeof item.created_at === 'string' ? item.created_at.substring(0, 16).replace('T', ' ') : (item.createdAt || 'Today'),
    updatedAt: typeof item.updated_at === 'string' ? item.updated_at.substring(0, 16).replace('T', ' ') : (item.updatedAt || 'Recent'),
    summary: item.resolution_summary || item.summary || 'Epidemiological investigation opened to evaluate localized signal deviation.',
    hypothesis: item.hypothesis || 'Multi-source surveillance identified abnormal syndromic count increase.',
    verificationOutcome: item.outcome || item.verificationOutcome,
    notes: Array.isArray(item.notes) ? item.notes : [],
    timeline,
  };
}

export const investigationService = {
  async getInvestigations(): Promise<Investigation[]> {
    try {
      const res = await apiClient.get<any>('/api/v1/investigations');
      const items = Array.isArray(res) ? res : (res?.items || []);
      if (items.length > 0) {
        return items.map(mapBackendInvestigation);
      }
      return localInvestigations;
    } catch {
      return localInvestigations;
    }
  },

  async getInvestigationById(id: string): Promise<Investigation | null> {
    try {
      const raw = await apiClient.get<any>(`/api/v1/investigations/${id}`);
      return mapBackendInvestigation(raw);
    } catch {
      const inv = localInvestigations.find(i => i.id === id);
      return inv || null;
    }
  },

  async updateStatus(id: string, status: InvestigationStatus, verificationOutcome?: string): Promise<Investigation> {
    try {
      const backendStatusMap: Record<string, string> = {
        'open': 'OPEN',
        'in_progress': 'IN_PROGRESS',
        'verified_outbreak': 'RESOLVED',
        'false_positive': 'CLOSED',
        'closed': 'CLOSED',
      };
      const raw = await apiClient.patch<any>(`/api/v1/investigations/${id}`, {
        status: backendStatusMap[status] || 'IN_PROGRESS',
        outcome: verificationOutcome,
      });
      return mapBackendInvestigation(raw);
    } catch {
      const idx = localInvestigations.findIndex(i => i.id === id);
      if (idx !== -1) {
        localInvestigations[idx] = {
          ...localInvestigations[idx],
          status,
          verificationOutcome: verificationOutcome || localInvestigations[idx].verificationOutcome,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          timeline: [
            ...localInvestigations[idx].timeline,
            {
              id: 'tl-' + Date.now(),
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              eventType: 'status_changed',
              actorName: 'Current User',
              details: `Investigation status changed to ${status.toUpperCase()}`,
            }
          ]
        };
        return localInvestigations[idx];
      }
      throw new Error('Investigation not found');
    }
  },

  async addNote(id: string, noteContent: string, authorName: string, authorRole: string): Promise<InvestigationNote> {
    try {
      await apiClient.post<any>(`/api/v1/investigations/${id}/notes`, { note: noteContent, content: noteContent });
      const newNote: InvestigationNote = {
        id: 'note-' + Date.now(),
        authorName,
        authorRole,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        content: noteContent,
      };
      return newNote;
    } catch {
      const newNote: InvestigationNote = {
        id: 'note-' + Date.now(),
        authorName,
        authorRole,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        content: noteContent,
      };
      const idx = localInvestigations.findIndex(i => i.id === id);
      if (idx !== -1) {
        localInvestigations[idx].notes.push(newNote);
        localInvestigations[idx].timeline.push({
          id: 'tl-' + Date.now(),
          timestamp: newNote.timestamp,
          eventType: 'note_added',
          actorName: authorName,
          details: 'Added field investigation note.',
        });
      }
      return newNote;
    }
  },

  async createInvestigation(data: Partial<Investigation>): Promise<Investigation> {
    try {
      const res = await apiClient.post<any>('/api/v1/investigations', {
        alert_id: data.alertId || 'ALT-01',
        title: data.title || 'Untitled Investigation',
        assigned_to: data.assignedTo || 'dr_chen',
        initial_notes: data.summary,
      });
      return mapBackendInvestigation(res);
    } catch {
      const newInv: Investigation = {
        id: 'inv-' + Math.floor(100 + Math.random() * 900),
        title: data.title || 'Untitled Investigation',
        alertId: data.alertId || 'alt-custom',
        alertTitle: data.alertTitle || 'Manual Investigation',
        regionId: data.regionId || 'reg-central',
        regionName: data.regionName || 'Central District',
        assignedTo: data.assignedTo || 'Unassigned',
        assignedToEmail: 'healthdept@publichealth.gov',
        status: 'open',
        priority: data.priority || 'medium',
        severity: data.severity || 'medium',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        summary: data.summary || '',
        hypothesis: data.hypothesis || '',
        notes: [],
        timeline: [
          {
            id: 'tl-' + Date.now(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            eventType: 'created',
            actorName: 'Current User',
            details: 'Investigation initialized manually.',
          }
        ],
      };
      localInvestigations.unshift(newInv);
      return newInv;
    }
  }
};
