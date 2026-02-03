// 버스 정류소 정보 (busStopList API 응답)
export interface BusStop {
	bstopid: string; // 정류소 ID
	bstopnm: string; // 정류소명
	arsno: string; // ARS 번호
	gpsx: number; // 경도
	gpsy: number; // 위도
	stoptype?: string; // 정류소 유형
}

// TAGO 정류소 정보 (getCrdntPrxmtSttnList API 응답)
export interface TagoStop {
	nodeid: string; // 정류소 ID
	nodeno: string; // 정류소 번호
	nodenm: string; // 정류소명
	gpslati: number; // 위도
	gpslong: number; // 경도
	citycode?: string; // 도시코드
}

// 버스 노선 정보 (busInfo API 응답)
export interface BusRoute {
	lineid: string; // 노선 ID
	buslinenum: string; // 버스 번호 (실제 필드명)
	bustype: string; // 버스 유형 (일반버스, 급행버스 등)
	startpoint: string; // 기점
	endpoint: string; // 종점
	headway?: string; // 배차 간격 (분)
	firsttime?: string; // 첫차 시간
	lasttime?: string; // 막차 시간
}

// 노선별 정류소 정보 (busInfoByRouteId API 응답)
export interface RouteStop {
	nodeid: string; // 정류소 ID (bstopid와 동일)
	bstopnm: string; // 정류소명
	arsno?: string; // ARS 번호
	bstopidx?: number; // 정류소 순번
	lat?: number; // 위도
	lin?: number; // 경도
	carno?: string; // 차량 번호 (버스가 있는 경우)
	lowplate?: number | string; // 저상버스 여부 (1 또는 '1')
	lineno?: string; // 노선 번호
}

// 버스 도착 정보 (stopArrByBstopid, bitArrByArsno API 응답)
export interface BusArrival {
	lineid: string; // 노선 ID
	lineno: string; // 버스 번호
	bustype?: string; // 버스 유형
	min1?: number | string; // 앞차 도착 예정 시간 (분)
	station1?: number | string; // 앞차 남은 정류장 수
	lowplate1?: number | string; // 앞차 저상버스 여부
	min2?: number | string; // 뒷차 도착 예정 시간 (분)
	station2?: number | string; // 뒷차 남은 정류장 수
	lowplate2?: number | string; // 뒷차 저상버스 여부
}

// 즐겨찾기 타입
export interface Favorite {
	id: string;
	userId: string;
	type: 'bus' | 'stop';
	targetId: string; // lineid 또는 bstopid
	name: string;
	createdAt: any; // Firestore Timestamp
}

// API 응답 공통 구조
export interface ApiResponse<T> {
	resultCode: string;
	resultMsg: string;
	totalCount?: number;
	items: T[];
}

// 지도 좌표
export interface Coordinates {
	lat: number;
	lng: number;
}

// 지도 영역
export interface MapBounds {
	sw: Coordinates; // 남서쪽
	ne: Coordinates; // 북동쪽
}
