import { mockClient } from '@/shared/api/httpClient';

import type { MarketingContent } from '../types';

export const contentApi = {
  getMarketing: async () => {
    const { data } = await mockClient.get<MarketingContent>('/marketing.json');
    return data;
  },
};
