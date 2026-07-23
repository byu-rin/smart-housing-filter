# 청약 주택 필터링 웹 서비스 (Housing Filter)

> 청년과 신혼부부를 위한 **공공임대주택 정보 필터링 서비스**

**배포:** [housing-filter.vercel.app](https://housing-filter.vercel.app/)

## 프로젝트 소개

공공임대주택 공고는 신청 대상, 지역, 임대 조건 등이 여러 표에 나뉘어 있어 원하는 조건의 주택을 찾기 어렵습니다.

주택 탐색기는 공공임대 공고 데이터를 구조화하고, 사용자가 조건을 입력해 원하는 주택을 검색할 수 있도록 만든 서비스입니다.

주요 목표:

- 공고 데이터를 서비스용 데이터 구조로 변환
- 지역, 신청 대상, 임대 조건 기반 검색 제공
- 복잡한 임대 조건을 필터 가능한 형태로 관리

<br><br>

## 주요 기능

### 주택 검색

- 지역별 검색
- 신청 대상별 검색 (청년, 대학생 및 취업준비생)
- 순위별 검색 (1순위, 2~3순위)
- 성별 조건 검색
- 최대 보증금 / 월 임대료 조건 검색
- 여러 조건 조합 검색

### 데이터 정규화

- HTML 형태의 공공임대 공고 데이터를 JSON 구조로 변환
- 공급 유형별 데이터를 동일한 House 모델로 관리
- 신청 대상과 순위별 임대 조건 분리 관리

### 주택 상세 정보

검색 결과에서 다음 정보를 제공합니다.

- 주택명
- 주소
- 공급 유형
- 신청 조건
- 보증금 및 월 임대료
- 면적 및 타입 정보

### 사용자 경험

- 필터 변경 시 결과 즉시 반영
- 카드 기반 검색 결과 제공
- 방문 상태 기반 알림 관리

<br><br>

## 기술 스택

| 기술           | 용도              |
| -------------- | ----------------- |
| React          | UI 개발           |
| TypeScript     | 타입 관리         |
| Vite           | 개발 환경 및 빌드 |
| Tailwind CSS   | 스타일링          |
| React Router   | 페이지 라우팅     |
| React Toastify | 알림              |

### Deployment

| 기술   | 용도              |
| ------ | ----------------- |
| Vercel | 배포 및 자동 빌드 |

<br><br>

## 데이터 처리 흐름

```
공공임대 공고 HTML
        ↓
    데이터 파싱
        ↓
    데이터 정규화
        ↓
    House 데이터 모델 변환
        ↓
    데이터 검증
        ↓
    필터 조건 적용
        ↓
    검색 결과 제공
```

<br><br>

## 데이터 모델 설계

공공임대 공고는 신청 대상과 순위에 따라 임대 조건이 달라집니다.

예:

- 청년 1순위
- 청년 2~3순위
- 대학생 1순위
- 대학생 2~3순위

각 조건을 명확하게 관리하기 위해 보증금과 월 임대료 필드를 분리했습니다.

```ts
{
  apartmentName: "성지빌라",
  district: "강동구",

  depositYouth1: 20700000,
  rentYouth1: 213300,

  depositStudent1: 1000000,
  rentStudent1: 254300
}
```

<br><br>

## 필터 구조

필터 조건은 `FilterCriteria` 객체로 관리합니다.

```ts
interface FilterCriteria {
  district?: string;
  gender?: Gender;
  target?: "youth" | "student";
  priority?: "1" | "23";
  maxRent?: number;
  maxDeposit?: number;
}
```

`filterHouses()` 함수에서 데이터 필터링을 담당합니다.

구조 특징:

- UI와 필터 로직 분리
- 여러 조건 조합 지원
- 순수 함수 기반 구현
- 새로운 필터 조건 추가 가능

<br><br>

## 프로젝트 구조

```
src/
├── layout/
│   ├── Layout.tsx
│   ├── GNB.tsx
│   └── NotificationInbox.tsx
│
├── categories/
│   ├── maeip/
│   │   ├── MaeipPage.tsx
│   │   ├── components/
│   │   │   ├── FilterPanel.tsx
│   │   │   └── ResultList.tsx
│   │   ├── data/
│   │   │   └── houses.json
│   │   └── lib/
│   │       └── filterHouses.ts
│   │
│   └── ansim/
│       ├── ansim-public/
│       └── ansim-private/
│
├── notifications/
│   ├── useNotifications.ts
│   └── data/
│       └── notifications.json
│
├── App.tsx
└── main.tsx
```

<br><br>

## 개발 과정

### 공공데이터 정규화

문제:

- 공고마다 HTML 테이블 구조가 다름
- 신청 조건과 임대 조건 표현 방식이 다름

해결:

- 공통 House 데이터 모델 설계
- 원본 데이터를 서비스에서 사용할 수 있는 형태로 변환
- 데이터 검증 로직 추가

<br><br>

### 임대 조건 데이터 모델링

문제:

- 신청 대상과 순위 조합에 따라 임대 조건이 변경됨

해결:

- 대상 × 순위별 임대 조건 필드 분리
- 필터링 로직에서 조건 접근 단순화
- 타입 기반 데이터 관리

<br><br>

### API 확장 구조

현재:

- JSON 기반 Mock Data 사용

설계:

- 데이터 모델과 필터 로직 분리
- API 데이터로 교체 가능하도록 구조화

<br><br><br>

## 실행 방법

### 1. 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 열기

### 3. 프로덕션 빌드

```bash
npm run build
```

결과: `dist/` 폴더에 최적화된 파일 생성

### 4. 빌드 결과 로컬 확인

```bash
npm run preview
```

<br><br>

## 배포

Vercel을 통해 배포하고 있습니다.

Git push 시 자동 빌드 및 배포됩니다.

Build Command:

```bash
npm run build
```

Output Directory:

```bash
dist
```

<br><br>

## 라이선스

MIT

**Developed by [byu-rin](https://github.com/byu-rin)**
