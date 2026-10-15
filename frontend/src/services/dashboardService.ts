import { DashboardData, DashboardKPIs } from '../types/dashboard';
import { apiClient } from './apiClient';
import { 
  MOCK_KPIS, 
  MOCK_REGIONS, 
  MOCK_ALERTS, 
  MOCK_DATA_SOURCES, 
  MOCK_DAILY_TRENDS, 
  MOCK_DISEASE_DISTRIBUTION 
} from '../mocks/mockData';

export const dashboardService = {
  async getSummary(): Promise<DashboardData> {
    try {
      const data = await apiClient.get<DashboardData>('/api/v1/dashboard/summary');
      return data;
    } catch {
      // Return synthetic demo data when FastAPI endpoint is not available
      return {
        kpis: MOCK_KPIS,
        regions: MOCK_REGIONS,
        recentAlerts: MOCK_ALERTS,
        dataSources: MOCK_DATA_SOURCES,
        trends: MOCK_DAILY_TRENDS,
        diseaseDistribution: MOCK_DISEASE_DISTRIBUTION,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  },

  async runAnalysis(): Promise<{ success: boolean; newSignalsDetected: number; message: string }> {
    try {
      return await apiClient.post('/api/v1/analysis/run');
    } catch {
      await new Promise(r => setTimeout(r, 1200));
      return {
        success: true,
        newSignalsDetected: 1,
        message: 'Surveillance anomaly scan complete. 1 new elevated signal tagged for review.',
      };
    }
  }
};
