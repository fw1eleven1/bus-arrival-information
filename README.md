<div align="center">

# 부산 버스 도착 정보

부산 시내버스 실시간 도착 정보를 제공하는 PWA 애플리케이션

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## 주요 기능

### 버스 검색
- 버스 번호로 노선 검색
- 노선별 전체 정류장 목록 조회
- 실시간 버스 위치 표시 (정류장 목록에서 버스 아이콘으로 표시)

### 지도 기반 정류장 검색
- 현재 위치 기반 주변 정류장 표시 (반경 500m)
- 지도 이동 시 자동으로 정류장 재검색 (디바운스 적용)
- 현재 위치 마커 (파란 원 + 펄스 애니메이션)
- 정류장 마커 선택 시 크기/색상 변경
- 뒤로가기 시 지도 상태 유지 (위치, 줌, 선택 마커)

### 실시간 도착 정보
- 정류장별 버스 도착 예정 시간
- 30초 자동 갱신
- 저상버스 여부 표시
- 앞차/뒷차 정보 제공

### 즐겨찾기
- 버스 노선 즐겨찾기
- 정류장 즐겨찾기
- Firebase 연동으로 기기 간 동기화

### PWA 지원
- 홈 화면에 앱 추가 (iOS Safari, Android Chrome)
- Service Worker를 통한 오프라인 캐싱
- 네이티브 앱과 유사한 사용자 경험
- iOS Safari 위치 정보 호환성 (GPS 실패 시 네트워크 기반 fallback)

---

## 기술 스택

| 분류 | 기술 |
|:---:|:---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Auth & DB** | Firebase (Authentication, Firestore) |
| **Map** | Naver Maps API |
| **PWA** | next-pwa (Workbox) |

---

## 외부 API

| API | 용도 | 제공처 |
|:---|:---|:---|
| **부산버스정보시스템 (BIMS)** | 버스 노선, 정류장, 도착 정보 | 공공데이터포털 |
| **TAGO** | 좌표 기반 근접 정류장 조회 | 국토교통부 |

---

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
# 공공데이터포털 API 키
NEXT_PUBLIC_DATA_GO_KR_API_KEY=your_api_key

# 네이버 지도 API
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

### 4. 프로덕션 빌드

```bash
npm run build    # PWA Service Worker 생성
npm run start    # 프로덕션 서버 실행
```

---

## 프로젝트 구조

```
bus-arrival-information/
├── app/
│   ├── page.tsx                 # 홈 (검색 방식 선택)
│   ├── layout.tsx               # 루트 레이아웃
│   ├── search/bus/page.tsx      # 버스 번호 검색
│   ├── bus/[lineId]/page.tsx    # 버스 노선 상세
│   ├── map/page.tsx             # 지도 기반 검색
│   ├── stop/[stopId]/page.tsx   # 정류장 도착 정보
│   ├── favorites/page.tsx       # 즐겨찾기 목록
│   ├── icon.tsx                 # PWA 아이콘 (512x512)
│   └── apple-icon.tsx           # iOS 아이콘 (180x180)
│
├── components/
│   ├── NaverMap.tsx             # 네이버 지도 컴포넌트
│   ├── BusList.tsx              # 버스 목록
│   ├── ArrivalInfo.tsx          # 도착 정보 카드
│   ├── BottomNav.tsx            # 하단 네비게이션
│   └── Loading.tsx              # 로딩 스피너
│
├── lib/
│   ├── api/
│   │   ├── busanBims.ts         # BIMS API 클라이언트
│   │   └── tagoApi.ts           # TAGO API 클라이언트
│   ├── hooks/
│   │   ├── useGeolocation.ts    # 위치 정보 훅
│   │   ├── useAutoRefresh.ts    # 자동 갱신 훅
│   │   └── useFavorites.ts      # 즐겨찾기 훅
│   └── firebase.ts              # Firebase 설정
│
├── types/
│   ├── index.ts                 # API 응답 타입
│   └── next-pwa.d.ts            # next-pwa 타입 선언
│
└── public/
    └── manifest.json            # PWA 매니페스트
```

---

## 페이지 미리보기

| 홈 | 버스 검색 | 지도 |
|:---:|:---:|:---:|
| 검색 방식 선택 | 버스 번호로 검색 | 주변 정류장 표시 |

| 노선 상세 | 도착 정보 | 즐겨찾기 |
|:---:|:---:|:---:|
| 정류장 목록 + 버스 위치 | 실시간 도착 시간 | 저장된 노선/정류장 |

---

## PWA 설치 방법

### iOS (Safari)
1. Safari에서 사이트 접속
2. 하단 공유 버튼 탭
3. "홈 화면에 추가" 선택

### Android (Chrome)
1. Chrome에서 사이트 접속
2. 메뉴(⋮) → "앱 설치" 또는 "홈 화면에 추가"

---

## 배포

### Vercel (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. GitHub 저장소 연결
2. 환경 변수 설정
3. 배포 완료

> **Note**: PWA 기능을 위해 HTTPS가 필수입니다.

---

## 라이선스

MIT License

---

<div align="center">

Made with ❤️ for Busan

</div>
