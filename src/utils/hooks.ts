import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { enabled = true, refetchInterval, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();

      if (isMounted.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      if (isMounted.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiCall, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();

    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}
