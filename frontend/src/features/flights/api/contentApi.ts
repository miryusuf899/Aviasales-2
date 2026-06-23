import { apiClient, mockClient } from '@/shared/api/httpClient';
import { env } from '@/shared/config/env';

import type { MarketingContent } from '../types';

export const contentApi = {
  getMarketing: async () => {
    try {
      const { data } = await apiClient.get<MarketingContent>('/content/marketing');
      return data;
    } catch (error) {
      if (!env.useMockFallback) throw error;
      const { data } = await mockClient.get<MarketingContent>('/marketing.json');
      return data;
    }
  },
};
