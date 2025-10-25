import { useEffect, useState } from 'react';
import api from '../lib/api';

export function useFetch(url, options = {}, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api({
          url,
          method: options.method || 'get',
          params: options.params,
          data: options.data,
          signal: controller.signal,
        });
        if (isMounted) {
          setData(response.data.data);
        }
      } catch (err) {
        if (isMounted && err.name !== 'CanceledError') {
          setError(err.response?.data?.message || err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, setData };
}

