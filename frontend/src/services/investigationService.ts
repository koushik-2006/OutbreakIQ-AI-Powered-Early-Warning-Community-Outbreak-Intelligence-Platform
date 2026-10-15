import { Investigation, InvestigationStatus, InvestigationNote } from '../types/investigation';
import { apiClient } from './apiClient';
import { MOCK_INVESTIGATIONS } from '../mocks/mockData';

let localInvestigations = [...MOCK_INVESTIGATIONS];

export const investigationService = {
  async getInvestigations(): Promise<Investigation[]> {
    try {
      return await apiClient.get<Investigation[]>('/api/v1/investigations');
    } catch {
      return localInvestigations;
    }
  },

  async getInvestigationById(id: string): Promise<Investigation | null> {
    try {
      return await apiClient.get<Investigation>(`/api/v1/investigations/${id}`);
    } catch {
      const inv = localInvestigations.find(i => i.id === id);
      return inv || null;
    }
  },

  async updateStatus(id: string, status: InvestigationStatus, verificationOutcome?: string): Promise<Investigation> {
    try {
      return await apiClient.patch<Investigation>(`/api/v1/investigations/${id}`, { status, verificationOutcome });
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
      return await apiClient.post<InvestigationNote>(`/api/v1/investigations/${id}/notes`, { content: noteContent });
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
      return await apiClient.post<Investigation>('/api/v1/investigations', data);
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
