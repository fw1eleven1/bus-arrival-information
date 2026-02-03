import type { BusStop, BusRoute, RouteStop, BusArrival } from '@/types';

const API_BASE = 'https://apis.data.go.kr/6260000/BusanBIMS';
const API_KEY = process.env.NEXT_PUBLIC_DATA_GO_KR_API_KEY;

// XML을 JSON으로 파싱하는 유틸리티
async function parseXmlResponse<T>(response: Response): Promise<T[]> {
	const text = await response.text();
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(text, 'text/xml');

	// 에러 체크
	const resultCode = xmlDoc.querySelector('resultCode')?.textContent;
	if (resultCode !== '00') {
		const resultMsg = xmlDoc.querySelector('resultMsg')?.textContent;
		throw new Error(resultMsg || 'API 오류가 발생했습니다.');
	}

	// items 파싱
	const items = xmlDoc.querySelectorAll('item');
	const result: T[] = [];

	items.forEach((item) => {
		const obj: Record<string, string | number> = {};
		item.childNodes.forEach((node) => {
			if (node.nodeType === 1) {
				const key = node.nodeName;
				const value = node.textContent || '';
				// 숫자로 변환 가능한 경우 숫자로 변환
				obj[key] = isNaN(Number(value)) ? value : Number(value);
			}
		});
		result.push(obj as T);
	});

	return result;
}

// 정류소 목록 조회
export async function getBusStopList(params?: { bstopnm?: string; arsno?: string }): Promise<BusStop[]> {
	const searchParams = new URLSearchParams({
		serviceKey: API_KEY || '',
		pageNo: '1',
		numOfRows: '100',
	});

	if (params?.bstopnm) searchParams.append('bstopnm', params.bstopnm);
	if (params?.arsno) searchParams.append('arsno', params.arsno);

	const response = await fetch(`${API_BASE}/busStopList?${searchParams}`);
	return parseXmlResponse<BusStop>(response);
}

// 버스 노선 정보 조회 (버스번호로 검색) - busInfo API 사용
export async function getBusRouteByNumber(lineno: string): Promise<BusRoute[]> {
	const searchParams = new URLSearchParams({
		serviceKey: API_KEY || '',
		lineno, // 버스번호
	});

	const response = await fetch(`${API_BASE}/busInfo?${searchParams}`);
	return parseXmlResponse<BusRoute>(response);
}

// 버스 노선 정보 조회 (노선ID로 검색) - busInfo API 사용
export async function getBusRouteById(lineid: string): Promise<BusRoute[]> {
	const searchParams = new URLSearchParams({
		serviceKey: API_KEY || '',
		lineid,
	});

	const response = await fetch(`${API_BASE}/busInfo?${searchParams}`);
	return parseXmlResponse<BusRoute>(response);
}

// 노선별 정류소 목록 + 버스 위치 조회 - busInfoByRouteId API 사용
export async function getRouteStops(lineid: string): Promise<RouteStop[]> {
	const searchParams = new URLSearchParams({
		serviceKey: API_KEY || '',
		lineid,
	});

	const response = await fetch(`${API_BASE}/busInfoByRouteId?${searchParams}`);
	return parseXmlResponse<RouteStop>(response);
}

// 정류소 도착 정보 조회 (정류소 ID) - stopArrByBstopid API 사용
export async function getArrivalByStopId(bstopid: string): Promise<BusArrival[]> {
	const searchParams = new URLSearchParams({
		serviceKey: API_KEY || '',
		bstopid,
	});

	const response = await fetch(`${API_BASE}/stopArrByBstopid?${searchParams}`);
	return parseXmlResponse<BusArrival>(response);
}

// 정류소 도착 정보 조회 (ARS 번호) - bitArrByArsno API 사용
export async function getArrivalByArsno(arsno: string): Promise<BusArrival[]> {
	const searchParams = new URLSearchParams({
		serviceKey: API_KEY || '',
		arsno,
	});

	const response = await fetch(`${API_BASE}/bitArrByArsno?${searchParams}`);
	return parseXmlResponse<BusArrival>(response);
}
