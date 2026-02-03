'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { getRouteStops, getBusRouteById } from '@/lib/api/busanBims';
import BusRouteView from '@/components/BusRouteView';
import Loading from '@/components/Loading';
import { useEffect, useState } from 'react';

export default function BusDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lineId = params.lineId as string;

  const [routeInfo, setRouteInfo] = useState<any>(null);
  const { isFavorite, addFavorite, removeFavorite, getFavoriteId } = useFavorites();

  const {
    data: stops,
    isLoading: loading,
    error,
    lastUpdated,
  } = useAutoRefresh<any[]>(() => getRouteStops(lineId), {
    interval: 30000,
    enabled: !!lineId,
  });

  const isBookmarked = isFavorite('bus', lineId);

  const handleToggleFavorite = async () => {
    try {
      if (isBookmarked) {
        const favId = getFavoriteId('bus', lineId);
        if (favId) await removeFavorite(favId);
      } else {
        await addFavorite('bus', lineId, routeInfo?.buslinenum || lineId);
      }
    } catch {
      alert('즐겨찾기 처리 중 오류가 발생했습니다.');
    }
  };

  // 노선 기본 정보 조회
  useEffect(() => {
    async function fetchRouteInfo() {
      try {
        const routes = await getBusRouteById(lineId);
        if (routes.length > 0) {
          setRouteInfo(routes[0]);
        }
      } catch (err) {
        console.error('노선 정보 조회 오류:', err);
      }
    }

    if (lineId) {
      fetchRouteInfo();
    }
  }, [lineId]);

  const getBusTypeColor = (bustype: string) => {
    if (bustype?.includes('급행')) return 'bg-red-500';
    if (bustype?.includes('좌석')) return 'bg-blue-500';
    if (bustype?.includes('마을')) return 'bg-yellow-500';
    return 'bg-green-500'; // 일반
  };

  if (loading && !stops) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-red-500">
          <p>노선 정보를 불러올 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="text-blue-500 underline mt-2 inline-block"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // carno가 있는 정류장 = 버스가 있는 정류장
  const busesOnRoute = stops?.filter((stop: any) => !!stop.carno) || [];

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="py-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← 이전 페이지로
        </button>

        {routeInfo && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`${getBusTypeColor(routeInfo.bustype)} text-white px-4 py-2 rounded-full text-xl font-bold`}
                >
                  {routeInfo.buslinenum}
                </div>
                <span className="text-sm text-gray-500">
                  {routeInfo.bustype}
                </span>
              </div>
              <button
                onClick={handleToggleFavorite}
                className="p-2"
              >
                <svg
                  className={`w-7 h-7 ${isBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-600">
              {routeInfo.startpoint} → {routeInfo.endpoint}
            </p>
            {routeInfo.headway && (
              <p className="text-sm text-gray-400 mt-1">
                배차간격: {routeInfo.headway}분
              </p>
            )}
          </div>
        )}
      </div>

      {/* 운행 중인 버스 정보 */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">
              현재 운행 중인 버스
            </p>
            <p className="text-2xl font-bold text-blue-700">
              {busesOnRoute.length}대
            </p>
          </div>
          {lastUpdated && (
            <div className="text-right">
              <p className="text-xs text-gray-400">마지막 업데이트</p>
              <p className="text-sm text-gray-500">
                {lastUpdated.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-blue-500 mt-2">30초마다 자동 갱신됩니다</p>
      </div>

      {/* 노선도 */}
      {stops && stops.length > 0 && (
        <BusRouteView stops={stops} routeName={routeInfo?.buslinenum || lineId} />
      )}

      {/* 정류장이 없는 경우 */}
      {stops && stops.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          노선 정보가 없습니다.
        </div>
      )}
    </div>
  );
}
