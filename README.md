# SH 청년 매입임대주택 뷰어

SH 청년 매입임대주택 공고 HTML을 보기 쉽게 보여주는 웹앱.

## 기술 스택

- React 19 + TypeScript
- Vite 7 (빌드 도구)
- Tailwind CSS 4 (`@tailwindcss/vite` 플러그인 방식)
- npm

## 실행 방법

```bash
npm install      # 최초 1회
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 로컬 확인
```

## 배포 (Vercel)

Vercel이 Vite 프로젝트를 자동 감지하므로 별도 설정 파일 없이 저장소를
연결하면 됩니다. (Build: `npm run build`, Output: `dist`)

## 폴더 구조

```
sh-youth-housing/
├── index.html          # 엔트리 HTML
├── vite.config.ts      # Vite 설정 (React + Tailwind 플러그인)
├── tsconfig*.json      # TypeScript 설정
├── public/             # 정적 파일
└── src/
    ├── main.tsx        # 앱 진입점
    ├── App.tsx         # 루트 컴포넌트 (플레이스홀더)
    ├── index.css       # Tailwind 진입 CSS
    └── vite-env.d.ts   # Vite 타입 선언
```
