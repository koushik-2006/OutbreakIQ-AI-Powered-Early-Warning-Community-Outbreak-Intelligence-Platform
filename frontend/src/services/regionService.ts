import { Region, RegionTrendPoint } from '../types/region';
import { apiClient } from './apiClient';
import { MOCK_REGIONS } from '../mocks/mockData';

export const regionService = {
  async getRegions(): Promise<Region[]> {
    try {
      return await apiClient.get<Region[]>('/api/v1/regions');
    } catch {
      return MOCK_REGIONS;
    }
  },

  async getRegionById(id: string): Promise<Region | null> {
    try {
      return await apiClient.get<Region>(`/api/v1/regions/${id}`);
    } catch {
      const found = MOCK_REGIONS.find(r => r.id === id);
      return found || null;
    }
  },

  async getRegionTrends(id: string): Promise<RegionTrendPoint[]> {
    try {
      return await apiClient.get<RegionTrendPoint[]>(`/api/v1/regions/${id}/trends`);
    } catch {
      // Synthetic 14-day trend for region
      const points: RegionTrendPoint[] = [];
      const base = id === 'reg-central' ? 120 : 60;
      const multiplier = id === 'reg-central' ? 2.5 : 1.1;

      for (let i = 14; i >= 1; i--) {
        const date = `Oct ${String(15 - i).padStart(2, '0')}`;
        const growth = i <= 5 ? (6 - i) * 35 : 0;
        points.push({
          date,
          feverCases: Math.round(base + (i <= 5 ? growth * multiplier : Math.sin(i) * 10)),
          coughSyrupSales: Math.round(base * 2.5 + (i <= 6 ? growth * 1.8 : Math.cos(i) * 15)),
          iliVisits: Math.round(base * 0.4 + (i <= 4 ? growth * 0.8 : 5)),
          baseline: base,
        });
      }
      return points;
    }
  }
};
