'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError, type ApiError } from '@/lib/api-client';

export interface ApiResource<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
}

interface ResourceState<T> {
  loading: boolean;
  data: T | null;
  error: ApiError | null;
}

export function useApiResource<T>(key: string, fetcher: () => Promise<T>): ApiResource<T> {
  const [state, setState] = useState<ResourceState<T>>({
    loading: true,
    data: null,
    error: null,
  });
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let active = true;
    fetcherRef
      .current()
      .then((data) => {
        if (active) setState({ loading: false, data, error: null });
      })
      .catch((error: unknown) => {
        if (active) setState({ loading: false, data: null, error: toApiError(error) });
      });
    return () => {
      active = false;
    };
  }, [key, nonce]);

  const reload = useCallback(() => {
    setState((previous) => ({ loading: true, data: previous.data, error: null }));
    setNonce((value) => value + 1);
  }, []);

  return { data: state.data, loading: state.loading, error: state.error, reload };
}
