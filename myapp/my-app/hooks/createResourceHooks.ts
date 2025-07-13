// lib/hooks/createResourceHook.ts
import { useEffect, useState } from "react";

export function createResourceHook<T>(fetcher: () => Promise<T>) {
  return function useResource() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
  };
}
