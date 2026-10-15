import { AlertSignal, AlertStatus } from '../types/alert';
import { apiClient } from './apiClient';
import { MOCK_ALERTS } from '../mocks/mockData';

let localAlerts = [...MOCK_ALERTS];

export const alertService = {
  async getAlerts(): Promise<AlertSignal[]> {
    try {
      return await apiClient.get<AlertSignal[]>('/api/v1/alerts');
    } catch {
      return localAlerts;
    }
  },

  async getAlertById(id: string): Promise<AlertSignal | null> {
    try {
      return await apiClient.get<AlertSignal>(`/api/v1/alerts/${id}`);
    } catch {
      const alert = localAlerts.find(a => a.id === id);
      return alert || null;
    }
  },

  async updateAlertStatus(id: string, status: AlertStatus): Promise<AlertSignal> {
    try {
      return await apiClient.patch<AlertSignal>(`/api/v1/alerts/${id}`, { status });
    } catch {
      const idx = localAlerts.findIndex(a => a.id === id);
      if (idx !== -1) {
        localAlerts[idx] = { ...localAlerts[idx], status };
        return localAlerts[idx];
      }
      throw new Error('Alert not found');
    }
  },

  async createInvestigationFromAlert(alertId: string, payload: { title: string; assignedTo: string }): Promise<{ investigationId: string }> {
    try {
      return await apiClient.post<{ investigationId: string }>(`/api/v1/alerts/${alertId}/investigations`, payload);
    } catch {
      const invId = 'inv-' + Math.floor(100 + Math.random() * 900);
      const idx = localAlerts.findIndex(a => a.id === alertId);
      if (idx !== -1) {
        localAlerts[idx] = { ...localAlerts[idx], status: 'investigating', investigationId: invId };
      }
      return { investigationId: invId };
    }
  }
};
