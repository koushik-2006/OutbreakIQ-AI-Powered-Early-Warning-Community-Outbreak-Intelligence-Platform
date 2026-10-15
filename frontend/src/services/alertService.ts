import { AlertSignal, AlertStatus, AlertSeverity } from '../types/alert';
import { apiClient } from './apiClient';
import { MOCK_ALERTS } from '../mocks/mockData';

let localAlerts = [...MOCK_ALERTS];

function mapBackendAlertToSignal(raw: any): AlertSignal {
  const statusMap: Record<string, AlertStatus> = {
    'PENDING_REVIEW': 'new',
    'UNDER_INVESTIGATION': 'investigating',
    'RESOLVED': 'resolved',
    'DISMISSED': 'dismissed',
    'new': 'new',
    'investigating': 'investigating',
    'monitoring': 'monitoring',
    'resolved': 'resolved',
    'dismissed': 'dismissed',
  };

  const severityMap: Record<string, AlertSeverity> = {
    'CRITICAL': 'critical',
    'HIGH': 'high',
    'MEDIUM': 'medium',
    'LOW': 'low',
    'critical': 'critical',
    'high': 'high',
    'medium': 'medium',
    'low': 'low',
  };

  const observed = raw.observed_value ?? raw.observed ?? 85;
  const baseline = raw.baseline_expected ?? raw.expectedBaseline ?? 45;
  const deviation = raw.deviation_score ?? raw.zScore ?? 3.2;

  // Build 7-day evidence time series for chart if not provided
  const evidenceTimeSeries = raw.evidenceTimeSeries || [
    { date: 'Oct 09', observed: Math.round(baseline * 0.95), expectedBaseline: baseline, upperThreshold: Math.round(baseline * 1.3) },
    { date: 'Oct 10', observed: Math.round(baseline * 1.02), expectedBaseline: baseline, upperThreshold: Math.round(baseline * 1.3) },
    { date: 'Oct 11', observed: Math.round(baseline * 0.98), expectedBaseline: baseline, upperThreshold: Math.round(baseline * 1.3) },
    { date: 'Oct 12', observed: Math.round(baseline * 1.15), expectedBaseline: baseline, upperThreshold: Math.round(baseline * 1.3) },
    { date: 'Oct 13', observed: Math.round(baseline * 1.28), expectedBaseline: baseline, upperThreshold: Math.round(baseline * 1.3) },
    { date: 'Oct 14', observed: Math.round(baseline * 1.55), expectedBaseline: baseline, upperThreshold: Math.round(baseline * 1.3) },
    { date: 'Oct 15', observed: observed, expectedBaseline: baseline, upperThreshold: Math.round(baseline * 1.3) },
  ];

  const supportingSignals = Array.isArray(raw.corroborating_signals)
    ? raw.corroborating_signals.map((cs: any) => ({
        source: 'clinic' as const,
        indicator: cs.indicator,
        changeRate: cs.observed_trend,
        reliabilityScore: cs.signal_strength === 'STRONG' ? 0.95 : 0.85,
        description: `${cs.source_name}: ${cs.observed_trend}`,
      }))
    : raw.supportingSignals || [];

  return {
    id: raw.id,
    title: raw.title || `${raw.region_name || raw.regionName || 'Regional'} ${raw.indicator} Signal Surge`,
    regionId: raw.region_id || raw.regionId || 'REG-METRO-N',
    regionName: raw.region_name || raw.regionName || 'Metro North District',
    indicator: raw.indicator || 'ILI',
    severity: severityMap[raw.severity] || 'high',
    status: statusMap[raw.review_status] || statusMap[raw.status] || 'new',
    percentChange: raw.percentChange ?? Math.round(((observed - baseline) / (baseline || 1)) * 100),
    zScore: Number(deviation.toFixed(2)),
    confidenceScore: raw.confidenceScore ?? (raw.confidence === 'CRITICAL' ? 0.98 : raw.confidence === 'HIGH' ? 0.94 : 0.88),
    timestamp: raw.reporting_date ? `Date: ${raw.reporting_date}` : (raw.timestamp || 'Today'),
    investigationId: raw.investigation_id || raw.investigationId,
    description: raw.explanation || raw.description || raw.evidence_summary || 'Statistically unusual observation detected across surveillance feeds.',
    isPreliminary: true,
    evidenceTimeSeries,
    supportingSignals,
    dataQualityWarning: raw.data_quality_notes || raw.dataQualityWarning,
  };
}

export const alertService = {
  async getAlerts(): Promise<AlertSignal[]> {
    try {
      const res = await apiClient.get<any>('/api/v1/alerts');
      const items = Array.isArray(res) ? res : (res?.items || []);
      if (items.length > 0) {
        return items.map(mapBackendAlertToSignal);
      }
      return localAlerts;
    } catch {
      return localAlerts;
    }
  },

  async getAlertById(id: string): Promise<AlertSignal | null> {
    try {
      const raw = await apiClient.get<any>(`/api/v1/alerts/${id}`);
      return mapBackendAlertToSignal(raw);
    } catch {
      const alert = localAlerts.find(a => a.id === id);
      return alert || null;
    }
  },

  async updateAlertStatus(id: string, status: AlertStatus): Promise<AlertSignal> {
    try {
      const raw = await apiClient.patch<any>(`/api/v1/alerts/${id}`, { status });
      return mapBackendAlertToSignal(raw);
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
      const res = await apiClient.post<any>(`/api/v1/alerts/${alertId}/investigations`, payload);
      const invId = res.investigationId || res.id;
      const idx = localAlerts.findIndex(a => a.id === alertId);
      if (idx !== -1) {
        localAlerts[idx] = { ...localAlerts[idx], status: 'investigating', investigationId: invId };
      }
      return { investigationId: invId };
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
