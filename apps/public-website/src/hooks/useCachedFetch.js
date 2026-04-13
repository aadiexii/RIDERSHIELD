import { useState, useEffect } from 'react';

const cache = new Map();

export function useCachedFetch(url, options = {}, ttl = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheKey = `${url}-${JSON.stringify(options)}`;

  useEffect(() => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    fetch(url, options)
      .then(res => res.json())
      .then(data => {
        cache.set(cacheKey, { data, timestamp: Date.now() });
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url, cacheKey, ttl]);

  return { data, loading, error };
}
