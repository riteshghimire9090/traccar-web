import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { messagesActions } from '../../store';

const useGeocodeSearch = (query) => {
  const dispatch = useDispatch();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return () => {};
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=geojson&addressdetails=1`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        setResults(data.features || []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          dispatch(messagesActions.push(e.message));
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query, dispatch]);

  return { results, loading };
};

export default useGeocodeSearch;
