'use client';

import { useEffect, useRef, useState } from 'react';
import type { TagoStop } from '@/types';

interface NaverMapProps {
	stops: TagoStop[];
	center?: { lat: number; lng: number };
	zoom?: number;
	currentLocation?: { lat: number; lng: number };
	selectedStopId?: string;
	onStopClick?: (stop: TagoStop) => void;
	onCenterChange?: (center: { lat: number; lng: number }) => void;
	onZoomChange?: (zoom: number) => void;
}

// 현재 위치 마커 아이콘 (파란 원 + 테두리 + 펄스 효과)
const getCurrentLocationIcon = () => {
	return {
		content: `
			<div style="position: relative;">
				<div style="
					width: 24px;
					height: 24px;
					background: rgba(59, 130, 246, 0.2);
					border-radius: 50%;
					position: absolute;
					top: -4px;
					left: -4px;
					animation: pulse 2s infinite;
				"></div>
				<div style="
					width: 16px;
					height: 16px;
					background: #3B82F6;
					border: 3px solid white;
					border-radius: 50%;
					box-shadow: 0 2px 4px rgba(0,0,0,0.3);
				"></div>
			</div>
			<style>
				@keyframes pulse {
					0% { transform: scale(1); opacity: 1; }
					100% { transform: scale(2); opacity: 0; }
				}
			</style>
		`,
		anchor: new naver.maps.Point(8, 8),
	};
};

// nodeid에서 숫자만 추출 (예: "BSB123456" -> "123456")
const extractStopNumber = (nodeid: string): string => {
	return nodeid.replace(/\D/g, '');
};

// 마커 아이콘 생성 함수
const getMarkerIcon = (isSelected: boolean) => {
	const size = isSelected ? 36 : 24;
	const viewBox = isSelected ? '0 0 36 46' : '0 0 24 31';
	const pathD = isSelected
		? 'M18 0C8.059 0 0 8.059 0 18c0 13.5 18 28 18 28s18-14.5 18-28c0-9.941-8.059-18-18-18z'
		: 'M12 0C5.373 0 0 5.373 0 12c0 9 12 19 12 19s12-10 12-19c0-6.627-5.373-12-12-12z';
	const circleR = isSelected ? 7 : 5;
	const circleCx = isSelected ? 18 : 12;
	const circleCy = isSelected ? 18 : 12;
	const anchorX = size / 2;
	const anchorY = isSelected ? 46 : 31;

	return {
		content: `
			<svg width="${size}" height="${anchorY}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="${pathD}" fill="${isSelected ? '#EF4444' : '#3B82F6'}"/>
				<circle cx="${circleCx}" cy="${circleCy}" r="${circleR}" fill="white"/>
			</svg>
		`,
		anchor: new naver.maps.Point(anchorX, anchorY),
	};
};

declare global {
	interface Window {
		naver: any;
	}
}

declare const naver: any;

export default function NaverMap({
	stops,
	center,
	zoom,
	currentLocation,
	selectedStopId,
	onStopClick,
	onCenterChange,
	onZoomChange,
}: NaverMapProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);
	const markersRef = useRef<Map<string, any>>(new Map());
	const currentLocationMarkerRef = useRef<any>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const initialCenterRef = useRef(center);
	const initialZoomRef = useRef(zoom);
	const onCenterChangeRef = useRef(onCenterChange);
	const onZoomChangeRef = useRef(onZoomChange);
	const onStopClickRef = useRef(onStopClick);

	// 콜백 refs 업데이트
	useEffect(() => {
		onCenterChangeRef.current = onCenterChange;
	}, [onCenterChange]);

	useEffect(() => {
		onZoomChangeRef.current = onZoomChange;
	}, [onZoomChange]);

	useEffect(() => {
		onStopClickRef.current = onStopClick;
	}, [onStopClick]);

	// 네이버 지도 스크립트 로드
	useEffect(() => {
		const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

		if (!clientId) {
			console.error('네이버 지도 클라이언트 ID가 설정되지 않았습니다.');
			return;
		}

		if (window.naver && window.naver.maps) {
			setIsLoaded(true);
			return;
		}

		const script = document.createElement('script');
		script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
		script.async = true;
		script.onload = () => {
			setIsLoaded(true);
		};
		document.head.appendChild(script);

		return () => {
			if (document.head.contains(script)) {
				document.head.removeChild(script);
			}
		};
	}, []);

	// 지도 초기화 (한 번만 실행)
	useEffect(() => {
		if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

		const defaultCenter = initialCenterRef.current || { lat: 35.1796, lng: 129.0756 };
		const defaultZoom = initialZoomRef.current || 17;

		const mapOptions = {
			center: new naver.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
			zoom: defaultZoom,
			minZoom: 10,
			maxZoom: 19,
		};

		const map = new naver.maps.Map(mapRef.current, mapOptions);
		mapInstanceRef.current = map;

		// 지도 이동 시 콜백 (중심 좌표 전달)
		naver.maps.Event.addListener(map, 'idle', () => {
			if (onCenterChangeRef.current) {
				const mapCenter = map.getCenter();
				onCenterChangeRef.current({
					lat: mapCenter.lat(),
					lng: mapCenter.lng(),
				});
			}
		});

		// 줌 변경 시 콜백
		naver.maps.Event.addListener(map, 'zoom_changed', () => {
			if (onZoomChangeRef.current) {
				onZoomChangeRef.current(map.getZoom());
			}
		});

		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.destroy();
				mapInstanceRef.current = null;
			}
		};
	}, [isLoaded]);

	// 초기 center가 나중에 설정될 경우 지도 이동
	useEffect(() => {
		if (!mapInstanceRef.current || !center) return;

		// 초기 center가 아직 설정되지 않았을 때만 이동
		if (!initialCenterRef.current) {
			initialCenterRef.current = center;
			mapInstanceRef.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
		}
	}, [center]);

	// 마커 업데이트
	useEffect(() => {
		if (!mapInstanceRef.current || !isLoaded) return;

		// 기존 마커 제거
		markersRef.current.forEach((marker) => marker.setMap(null));
		markersRef.current.clear();

		// 새 마커 추가
		stops.forEach((stop) => {
			if (!stop.gpslati || !stop.gpslong) return;

			const stopNumber = extractStopNumber(stop.nodeid);
			const isSelected = stopNumber === selectedStopId;
			const marker = new naver.maps.Marker({
				position: new naver.maps.LatLng(Number(stop.gpslati), Number(stop.gpslong)),
				map: mapInstanceRef.current!,
				title: stop.nodenm,
				icon: getMarkerIcon(isSelected),
				zIndex: isSelected ? 100 : 1,
			});

			naver.maps.Event.addListener(marker, 'click', () => {
				if (onStopClickRef.current) {
					onStopClickRef.current(stop);
				}
			});

			markersRef.current.set(stopNumber, marker);
		});
	}, [stops, isLoaded, selectedStopId]);

	// 현재 위치 마커 업데이트
	useEffect(() => {
		if (!mapInstanceRef.current || !isLoaded || !currentLocation) return;

		// 기존 현재 위치 마커 제거
		if (currentLocationMarkerRef.current) {
			currentLocationMarkerRef.current.setMap(null);
		}

		// 새 현재 위치 마커 추가
		currentLocationMarkerRef.current = new naver.maps.Marker({
			position: new naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
			map: mapInstanceRef.current,
			icon: getCurrentLocationIcon(),
			zIndex: 50,
		});
	}, [currentLocation, isLoaded]);

	// 현재 위치로 이동
	const moveToCurrentLocation = () => {
		if (!mapInstanceRef.current) return;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				mapInstanceRef.current?.setCenter(new naver.maps.LatLng(latitude, longitude));
			},
			(error) => {
				console.error('위치 정보를 가져올 수 없습니다:', error);
				alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
			},
		);
	};

	if (!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID) {
		return (
			<div className='w-full h-full flex items-center justify-center bg-gray-100'>
				<p className='text-gray-500'>네이버 지도 API 키가 설정되지 않았습니다.</p>
			</div>
		);
	}

	return (
		<div className='relative w-full h-full'>
			<div ref={mapRef} className='w-full h-full' />

			{/* 현재 위치 버튼 */}
			<button
				onClick={moveToCurrentLocation}
				className='absolute bottom-20 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10 mb-safe'
				title='현재 위치로 이동'>
				<svg className='w-6 h-6 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
					/>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
				</svg>
			</button>

			{/* 로딩 표시 */}
			{!isLoaded && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
				</div>
			)}
		</div>
	);
}
