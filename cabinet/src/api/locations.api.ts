import api from './axios';
import type { ApiResponse, Region, District } from '@/types';

export const locationsApi = {
  getRegions: () =>
    api.get<ApiResponse<Region[]>>('/locations/regions'),

  getDistricts: (regionId?: number) =>
    api.get<ApiResponse<District[]>>('/locations/districts', {
      params: regionId ? { regionId } : undefined,
    }),
};
