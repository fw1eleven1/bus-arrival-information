'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getBusRouteByNumber } from '@/lib/api/busanBims';
import type { BusRoute } from '@/types';
import BusList from '@/components/BusList';
import Loading from '@/components/Loading';

const STORAGE_KEY = 'busSearchState';
const NAV_FLAG_KEY = 'busSearchNavFlag';

export default function BusSearchPage() {
	const [query, setQuery] = useState('');
	const [buses, setBuses] = useState<BusRoute[]>([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const isNavigatingToBusDetail = useRef(false);

	// 페이지 로드 시 저장된 검색 결과 복원
	useEffect(() => {
		try {
			// 버스 상세에서 돌아온 경우에만 복원
			const navFlag = sessionStorage.getItem(NAV_FLAG_KEY);
			if (navFlag) {
				sessionStorage.removeItem(NAV_FLAG_KEY);
				const saved = sessionStorage.getItem(STORAGE_KEY);
				if (saved) {
					const { query: savedQuery, buses: savedBuses } = JSON.parse(saved);
					setQuery(savedQuery || '');
					setBuses(savedBuses || []);
					setSearched(savedBuses?.length > 0 || false);
				}
			} else {
				// 다른 경로에서 온 경우 저장된 데이터 삭제
				sessionStorage.removeItem(STORAGE_KEY);
			}
		} catch {
			// sessionStorage 접근 오류 무시
		}
	}, []);

	// 버스 상세 페이지로 이동 시 플래그 설정
	const handleBusClick = useCallback(() => {
		isNavigatingToBusDetail.current = true;
		try {
			sessionStorage.setItem(NAV_FLAG_KEY, 'true');
		} catch {
			// sessionStorage 저장 오류 무시
		}
	}, []);

	const handleSearch = useCallback(async () => {
		if (!query.trim()) return;

		setLoading(true);
		setError(null);
		setSearched(true);

		try {
			const results = await getBusRouteByNumber(query.trim());
			setBuses(results);
			// 검색 결과 저장
			try {
				sessionStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({
						query: query.trim(),
						buses: results,
					}),
				);
			} catch {
				// sessionStorage 저장 오류 무시
			}
		} catch (err) {
			console.error('버스 검색 오류:', err);
			setError('버스 검색 중 오류가 발생했습니다.');
			setBuses([]);
		} finally {
			setLoading(false);
		}
	}, [query]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	return (
		<div className='p-4'>
			{/* 헤더 */}
			<div className='py-4'>
				<h1 className='text-xl font-bold text-gray-900'>버스 검색</h1>
				<p className='text-sm text-gray-500'>버스 번호를 입력하세요</p>
			</div>

			{/* 검색 입력 */}
			<div className='flex gap-2 mb-6'>
				<input
					type='text'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder='예: 51, 1003, 급행1'
					className='flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
				<button
					onClick={handleSearch}
					disabled={loading || !query.trim()}
					className='flex-shrink-0 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'>
					검색
				</button>
			</div>

			{/* 검색 결과 */}
			{loading ? (
				<Loading />
			) : error ? (
				<div className='text-center py-8 text-red-500'>{error}</div>
			) : searched ? (
				<div>
					<p className='text-sm text-gray-500 mb-4'>검색 결과: {buses.length}개</p>
					<BusList buses={buses} onBusClick={handleBusClick} />
				</div>
			) : (
				<div className='text-center py-12 text-gray-400'>
					<svg className='w-16 h-16 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1.5}
							d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
						/>
					</svg>
					<p>버스 번호를 검색해보세요</p>
				</div>
			)}
		</div>
	);
}
