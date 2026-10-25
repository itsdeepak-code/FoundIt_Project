import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorInfo } from '../api/client.js';

/**
 * Runs an async loader and tracks loading / error state.
 *   const { data, loading, error, reload } = useFetch(() => itemsApi.get(id), [id]);
 * `error` is { status, message } or null.
 */
export function useFetch(loader, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await loader();
      // Ignore responses from older requests (e.g. user typed quickly in the search box).
      if (id === requestId.current) setData(result);
    } catch (err) {
      if (id === requestId.current) setError(getErrorInfo(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}
