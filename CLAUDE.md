# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드 (--webpack 플래그로 PWA 지원)
npm run lint     # ESLint 실행
```

## Architecture

부산 버스 도착 정보 PWA 애플리케이션. Next.js 16 App Router 기반.

### 외부 서비스 연동

- **부산버스정보시스템 API** (`lib/api/busanBims.ts`): 공공데이터포털 OpenAPI (XML 응답)
  - `busStopList`: 정류소 목록 조회
  - `busInfo`: 노선 정보 조회 (lineno 또는 lineid 파라미터)
  - `busInfoByRouteId`: 노선별 정류소 + 실시간 버스 위치 (carno 필드로 버스 존재 여부 확인)
  - `stopArrByBstopid` / `bitArrByArsno`: 정류소 도착 정보
- **TAGO API** (`lib/api/tagoApi.ts`): 국토교통부 버스정류소정보 OpenAPI (XML 응답)
  - `getCrdntPrxmtSttnList`: 좌표 기반 근접 정류소 조회 (반경 500m)
  - citycode 21(부산) 필터링 적용
  - nodeid에서 숫자만 추출하여 BIMS API와 연동 (`extractStopNumber()`)
- **Firebase**: 인증 및 Firestore (즐겨찾기 저장)
- **네이버 지도 API** (`components/NaverMap.tsx`): 지도 기반 정류장 검색
  - 동적 스크립트 로드, refs로 콜백 관리 (재렌더링 방지)
  - 핀 마커 (선택 시 크기 확대 + 빨간색), 현재 위치 마커 (파란 원 + 펄스 애니메이션)

### 주요 패턴

- **자동 갱신**: `useAutoRefresh` 훅으로 30초 간격 데이터 갱신. fetchFn은 ref로 관리하여 무한 루프 방지.
- **즐겨찾기**: `useFavorites` 훅으로 Firebase Firestore CRUD
- **상태 보존 (NAV_FLAG 패턴)**: sessionStorage로 뒤로가기 시 상태 복원
  - 버스 검색: 검색어 + 결과 목록
  - 지도: center, zoom, selectedStop, stops 전체 저장
- **iOS Safari 위치 정보**: `useGeolocation` 훅에서 고정밀도(GPS) 실패 시 저정밀도(네트워크) fallback
- **모바일 레이아웃**: flex 컨테이너에서 `min-w-0` + `flex-shrink-0` 조합으로 overflow 방지

### PWA 설정

- **next-pwa**: Service Worker 자동 생성 (빌드 시 public/sw.js 생성)
- **아이콘**: `app/icon.tsx`, `app/apple-icon.tsx`로 동적 생성 (버스 아이콘, 파란 배경)
- **manifest**: `public/manifest.json` - standalone 모드, 테마 색상 #3B82F6
- **빌드**: Next.js 16에서 webpack 모드 필요 (`--webpack` 플래그)
- **gitignore**: `sw.js`, `workbox-*.js` 파일은 빌드 시 생성되므로 제외

### 페이지 구조

- `/`: 홈 (검색 방식 선택)
- `/search/bus`: 버스번호 검색
- `/bus/[lineId]`: 버스 노선 상세 (정류장 목록 + 실시간 버스 위치)
- `/map`: 지도 기반 정류장 검색
- `/stop/[stopId]`: 정류장 도착 정보
- `/favorites`: 즐겨찾기 목록

### 타입 정의

`types/index.ts`에 API 응답 타입 정의. 공공데이터 API 응답 필드명과 일치해야 함:
- `BusRoute.buslinenum` (버스번호), `BusRoute.lineid` (노선ID)
- `RouteStop.carno` (버스 존재 여부), `RouteStop.nodeid` (정류소ID)
- `BusArrival.min1/min2` (도착시간), `station1/station2` (남은 정류장)
- `TagoStop.nodeid` (정류소ID, "BSB123456" 형식), `TagoStop.nodeno` (정류소번호), `TagoStop.citycode` (도시코드)

## Environment Variables

`.env.local.example` 참조. 필수:
- `NEXT_PUBLIC_DATA_GO_KR_API_KEY`: 공공데이터포털 API 키
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`: 네이버 지도 클라이언트 ID
- Firebase 설정 (6개 변수)
