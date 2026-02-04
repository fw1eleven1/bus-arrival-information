'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { getNearbyStops } from '@/lib/api/tagoApi';
import type { TagoStop } from '@/types';
import NaverMap from '@/components/NaverMap';
import Loading from '@/components/Loading';

const MAP_STATE_KEY = 'mapState';
const MAP_NAV_FLAG = 'mapNavFlag';

// nodeid에서 숫자만 추출 (예: "BSB123456" -> "123456")
const extractStopNumber = (nodeid: string): string => {
	return nodeid.replace(/\D/g, '');
};

interface MapState {
	center: { lat: number; lng: number };
	zoom: number;
	selectedStop: TagoStop | null;
	stops: TagoStop[];
}

export default function MapPage() {
	const router = useRouter();
	const { coordinates, isLoading: locationLoading, error: locationError } = useGeolocation();
	const [stops, setStops] = useState<TagoStop[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedStop, setSelectedStop] = useState<TagoStop | null>(null);
	const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
	const [mapZoom, setMapZoom] = useState<number>(17);
	const [isRestored, setIsRestored] = useState(false);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	// 저장된 상태 복원
	useEffect(() => {
		const navFlag = sessionStorage.getItem(MAP_NAV_FLAG);
		if (navFlag === 'true') {
			const savedState = sessionStorage.getItem(MAP_STATE_KEY);
			if (savedState) {
				try {
					const state: MapState = JSON.parse(savedState);
					setMapCenter(state.center);
					setMapZoom(state.zoom);
					setSelectedStop(state.selectedStop);
					setStops(state.stops);
					setIsRestored(true);
				} catch {
					// 파싱 실패 시 무시
				}
			}
			sessionStorage.removeItem(MAP_NAV_FLAG);
		}
	}, []);

	// 정류장 조회 함수
	const fetchStops = useCallback(async (lat: number, lng: number) => {
		setLoading(true);
		try {
			const nearbyStops = await getNearbyStops(lat, lng);
			setStops(nearbyStops);
		} catch (err) {
			console.error('정류장 조회 오류:', err);
			setStops([]);
		} finally {
			setLoading(false);
		}
	}, []);

	// 초기 정류장 검색 (현재 위치 기반) - 복원된 경우 스킵
	useEffect(() => {
		if (coordinates && !isRestored) {
			setMapCenter({ lat: coordinates.lat, lng: coordinates.lng });
			fetchStops(coordinates.lat, coordinates.lng);
		}
	}, [coordinates, fetchStops, isRestored]);

	// 지도 중심 변경 시 정류장 재조회 (디바운스 적용)
	const handleCenterChange = useCallback(
		(center: { lat: number; lng: number }) => {
			setMapCenter(center);

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(() => {
				fetchStops(center.lat, center.lng);
			}, 500);
		},
		[fetchStops],
	);

	// 줌 레벨 변경 시 상태 업데이트
	const handleZoomChange = useCallback((zoom: number) => {
		setMapZoom(zoom);
	}, []);

	// 컴포넌트 언마운트 시 타이머 정리
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	const handleStopClick = useCallback((stop: TagoStop) => {
		setSelectedStop(stop);
	}, []);

	const handleGoToStop = () => {
		if (selectedStop && mapCenter) {
			// 상태 저장
			const state: MapState = {
				center: mapCenter,
				zoom: mapZoom,
				selectedStop,
				stops,
			};
			sessionStorage.setItem(MAP_STATE_KEY, JSON.stringify(state));
			sessionStorage.setItem(MAP_NAV_FLAG, 'true');

			const stopNumber = extractStopNumber(selectedStop.nodeid);
			router.push(`/stop/${stopNumber}?name=${encodeURIComponent(selectedStop.nodenm)}`);
		}
	};

	if (locationLoading) {
		return (
			<div className='flex flex-col items-center justify-center h-[calc(100dvh-5rem)] -mb-24'>
				<Loading />
				<p className='mt-4 text-gray-500'>현재 위치를 확인하는 중...</p>
			</div>
		);
	}

	if (locationError) {
		return (
			<div className='flex flex-col items-center justify-center h-[calc(100dvh-5rem)] -mb-24 p-4'>
				<svg className='w-16 h-16 text-gray-400 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={1.5}
						d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
					/>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
				</svg>
				<p className='text-gray-600 text-center mb-4'>
					위치 정보를 가져올 수 없습니다.
					<br />
					위치 권한을 확인해주세요.
				</p>
				<button
					onClick={() => window.location.reload()}
					className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
					다시 시도
				</button>
			</div>
		);
	}

	return (
		<div className='relative h-[calc(100dvh-5rem)] overflow-hidden -mb-24'>
			{/* 지도 */}
			<NaverMap
				stops={stops}
				center={mapCenter || (coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : undefined)}
				zoom={mapZoom}
				currentLocation={coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : undefined}
				selectedStopId={selectedStop ? extractStopNumber(selectedStop.nodeid) : undefined}
				onStopClick={handleStopClick}
				onCenterChange={handleCenterChange}
				onZoomChange={handleZoomChange}
			/>

			{/* 로딩 오버레이 */}
			{loading && (
				<div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-20'>
					<p className='text-sm text-gray-600'>정류장 검색 중...</p>
				</div>
			)}

			{/* 정류장 정보 카드 */}
			{selectedStop && (
				<div className='absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-20'>
					<div className='flex items-start justify-between'>
						<div className='flex-1'>
							<h3 className='font-bold text-gray-900'>{selectedStop.nodenm}</h3>
							<p className='text-sm text-gray-500'>정류소 번호: {extractStopNumber(selectedStop.nodeid)}</p>
						</div>
						<button onClick={() => setSelectedStop(null)} className='text-gray-400 hover:text-gray-600'>
							<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
							</svg>
						</button>
					</div>
					<button
						onClick={handleGoToStop}
						className='mt-3 w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors'>
						도착 정보 보기
					</button>
				</div>
			)}
		</div>
	);
}
