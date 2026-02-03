'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // 갱신 간격 (밀리초), 기본 30초
  enabled?: boolean; // 자동 갱신 활성화 여부
}

export function useAutoRefresh<T>(
  fetchFn: () => Promise<T>,
  options: UseAutoRefreshOptions = {}
) {
  const { interval = 30000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchFnRef = useRef(fetchFn);

  // fetchFn이 변경될 때마다 ref 업데이트
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 및 자동 갱신 설정
  useEffect(() => {
    if (!enabled) return;

    refresh();

    intervalRef.current = setInterval(refresh, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh, interval, enabled]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}
