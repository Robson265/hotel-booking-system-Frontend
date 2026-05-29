/**
 * src/hooks/useAsync.ts
 *
 * A tiny helper hook that wraps an async function and tracks its
 * loading / error / data state so components stay clean.
 *
 * Usage:
 *   const { data, loading, error, run } = useAsync<Hotel[]>();
 *   useEffect(() => { run(() => api.get('/hotels').then(r => r.data)); }, []);
 */

import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  run: (fn: () => Promise<T>) => Promise<void>;
  setData: (data: T) => void;
  reset: () => void;
}

export function useAsync<T>(): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const run = useCallback(async (fn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setState({ data: null, loading: false, error: message });
    }
  }, []);

  const setData = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, run, setData, reset };
}
