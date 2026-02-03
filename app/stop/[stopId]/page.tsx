'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { getArrivalByStopId, getBusStopList } from '@/lib/api/busanBims';
import type { BusArrival } from '@/types';
import ArrivalInfo from '@/components/ArrivalInfo';
import Loading from '@/components/Loading';
import { useState, useEffect, useCallback } from 'react';

export default function StopDetailPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const stopId = params.stopId as string;
	const stopName = searchParams.get('name') || '정류장';

	const { isFavorite, addFavorite, removeFavorite, getFavoriteId } = useFavorites();

	// 실제 사용할 bstopid (TAGO nodeno 또는 검색으로 찾은 bstopid)
	const [resolvedStopId, setResolvedStopId] = useState<string | null>(null);
	const [resolving, setResolving] = useState(true);

	// 정류장 ID 해석 (TAGO nodeno로 시도 후 실패하면 이름으로 검색)
	useEffect(() => {
		async function resolveStopId() {
			setResolving(true);
			try {
				// 먼저 nodeno로 직접 시도
				const arrivals = await getArrivalByStopId(stopId);
				if (arrivals && arrivals.length > 0) {
					setResolvedStopId(stopId);
					setResolving(false);
					return;
				}

				// 결과가 없으면 정류장명으로 검색
				const stops = await getBusStopList({ bstopnm: stopName });
				if (stops && stops.length > 0) {
					// 이름이 정확히 일치하는 정류장 찾기
					const exactMatch = stops.find((s) => s.bstopnm === stopName);
					const matchedStop = exactMatch || stops[0];
					setResolvedStopId(matchedStop.bstopid);
				} else {
					// 검색도 실패하면 원래 ID 사용
					setResolvedStopId(stopId);
				}
			} catch {
				// 오류 발생 시 정류장명으로 재검색 시도
				try {
					const stops = await getBusStopList({ bstopnm: stopName });
					if (stops && stops.length > 0) {
						const exactMatch = stops.find((s) => s.bstopnm === stopName);
						const matchedStop = exactMatch || stops[0];
						setResolvedStopId(matchedStop.bstopid);
					} else {
						setResolvedStopId(stopId);
					}
				} catch {
					setResolvedStopId(stopId);
				}
			} finally {
				setResolving(false);
			}
		}

		resolveStopId();
	}, [stopId, stopName]);

	// 도착 정보 조회 함수
	const fetchArrivals = useCallback(async () => {
		if (!resolvedStopId) return [];
		return getArrivalByStopId(resolvedStopId);
	}, [resolvedStopId]);

	const {
		data: arrivals,
		isLoading: loading,
		error,
		lastUpdated,
	} = useAutoRefresh<BusArrival[]>(fetchArrivals, {
		interval: 30000,
		enabled: !!resolvedStopId,
	});

	const isBookmarked = isFavorite('stop', stopId);

	const handleToggleFavorite = async () => {
		try {
			if (isBookmarked) {
				const favId = getFavoriteId('stop', stopId);
				if (favId) await removeFavorite(favId);
			} else {
				await addFavorite('stop', stopId, stopName);
			}
		} catch {
			alert('즐겨찾기 처리 중 오류가 발생했습니다.');
		}
	};

	if (resolving || (loading && !arrivals)) {
		return <Loading />;
	}

	if (error) {
		return (
			<div className='p-4'>
				<div className='text-center py-8 text-red-500'>
					<p>도착 정보를 불러올 수 없습니다.</p>
					<button onClick={() => router.back()} className='text-blue-500 underline mt-2 inline-block'>
						이전 페이지로 돌아가기
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='p-4'>
			{/* 헤더 */}
			<div className='py-4'>
				<button onClick={() => router.back()} className='text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block'>
					← 이전 페이지로
				</button>

				<div className='flex items-center justify-between mt-2'>
					<div>
						<h1 className='text-xl font-bold text-gray-900'>{stopName}</h1>
						<p className='text-sm text-gray-500'>정류소 번호: {resolvedStopId || stopId}</p>
					</div>
					<button onClick={handleToggleFavorite} className='p-2'>
						<svg
							className={`w-7 h-7 ${isBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
							fill={isBookmarked ? 'currentColor' : 'none'}
							stroke='currentColor'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* 업데이트 정보 */}
			<div className='bg-green-50 rounded-lg p-4 mb-4'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm text-green-600 font-medium'>버스 도착 예정 정보</p>
						<p className='text-2xl font-bold text-green-700'>{arrivals?.length || 0}개 노선</p>
					</div>
					{lastUpdated && (
						<div className='text-right'>
							<p className='text-xs text-gray-400'>마지막 업데이트</p>
							<p className='text-sm text-gray-500'>
								{lastUpdated.toLocaleTimeString('ko-KR', {
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit',
								})}
							</p>
						</div>
					)}
				</div>
				<p className='text-xs text-green-500 mt-2'>30초마다 자동 갱신됩니다</p>
			</div>

			{/* 도착 정보 리스트 */}
			{arrivals && arrivals.length > 0 ? (
				<div className='space-y-3'>
					{arrivals.map((arrival, index) => (
						<ArrivalInfo key={`${arrival.lineid}-${index}`} arrival={arrival} />
					))}
				</div>
			) : (
				<div className='text-center py-12 text-gray-400'>
					<svg className='w-16 h-16 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1.5}
							d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
					<p>현재 도착 예정인 버스가 없습니다</p>
				</div>
			)}
		</div>
	);
}
