import { useCallback, useEffect, useState } from 'react';

import { toApiError, type ApiError } from '@/shared/api/httpClient';

type AsyncState<T> = {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
};

export function useAsync<T>(factory: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  const execute = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await factory();
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      const apiError = toApiError(error);
      setState({ data: null, error: apiError, loading: false });
      throw apiError;
    }
  }, [factory]);

  useEffect(() => {
    void execute().catch(() => undefined);
  }, [execute]);

  return {
    ...state,
    reload: execute,
  };
}
