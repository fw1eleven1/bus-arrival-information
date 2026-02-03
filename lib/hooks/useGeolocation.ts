'use client';

import { useState, useEffect } from 'react';
import type { Coordinates } from '@/types';

interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: '이 브라우저는 위치 정보를 지원하지 않습니다.',
        isLoading: false,
      });
      return;
    }

    const success = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
        isLoading: false,
      });
    };

    const handleError = (err: GeolocationPositionError) => {
      let errorMessage = '위치 정보를 가져올 수 없습니다.';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = '위치 정보 접근이 거부되었습니다.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = '위치 정보를 사용할 수 없습니다.';
          break;
        case err.TIMEOUT:
          errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
          break;
      }

      setState({
        coordinates: null,
        error: errorMessage,
        isLoading: false,
      });
    };

    // iOS Safari 호환성을 위한 fallback 전략
    // 1차: 고정밀도(GPS) 시도, 실패 시 2차: 저정밀도(네트워크) 시도
    const tryHighAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        success,
        (err) => {
          // 고정밀도 실패 시 저정밀도로 재시도 (TIMEOUT 또는 POSITION_UNAVAILABLE)
          if (err.code !== err.PERMISSION_DENIED) {
            tryLowAccuracy();
          } else {
            handleError(err);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    };

    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        success,
        handleError,
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000, // 5분 캐시 허용
        }
      );
    };

    tryHighAccuracy();
  }, []);

  return state;
}
