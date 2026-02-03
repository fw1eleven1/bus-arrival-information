import type { TagoStop } from '@/types';

const API_BASE = 'https://apis.data.go.kr/1613000/BusSttnInfoInqireService';
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

// 좌표 기반 근접 정류소 목록 조회 (반경 500m)
// citycode가 21(부산)인 정류소만 반환
export async function getNearbyStops(lat: number, lng: number): Promise<TagoStop[]> {
	const searchParams = new URLSearchParams({
		serviceKey: API_KEY || '',
		gpsLati: String(lat),
		gpsLong: String(lng),
		numOfRows: '50',
		pageNo: '1',
		_type: 'xml',
	});

	const response = await fetch(`${API_BASE}/getCrdntPrxmtSttnList?${searchParams}`);
	const stops = await parseXmlResponse<TagoStop>(response);

	// citycode가 21(부산)인 정류소만 반환
	return stops.filter((stop) => {
		const citycode = Number(stop.citycode);
		return citycode === 21;
	});
}
