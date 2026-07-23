## Communication

- 짧고 명확하게 설명한다.
- 변경 사항을 먼저 요약한다.
- 필요한 경우에만 긴 설명을 제공한다.
- 코드보다 설명이 길어지지 않도록 한다.

## Workflow

작업 전

1. 요구사항 이해
2. 관련 코드 탐색
3. 수정 계획 작성
4. 구현
5. 테스트
6. 변경 내용 요약

## Facts

- 모르면 추측하지 말고 모른다고 말한다.
- API, 라이브러리, 프레임워크는 확인 가능한 정보만 사용한다.
- 존재하지 않는 파일이나 함수는 가정하지 않는다.
- 불확실하면 먼저 코드베이스를 탐색한다.

# Frontend Design Discipline (Anti-AI Slop)

- AI 특유의 뻔한 디자인(Inter/Roboto 폰트 도배, 보라색/연청색 그라데이션, 불필요한 반투명 유리 효과 카드 디자인)을 절대 사용하지 마세요.
- 서비스 성격에 맞는 대담하고 의도적인 디자인 방향과 고유한 컬러 팔레트를 정의하여 프로덕션 수준의 고품질 UI를 빌드하세요.

## Architecture

- 기존 아키텍처를 유지한다.
- 새로운 패턴을 도입하기 전에 기존 구현을 확인한다.
- 새로운 abstraction은 반복이 충분할 때만 추가한다.
- YAGNI를 우선한다.

## Code Changes

- 필요한 최소 범위만 수정한다.
- 기존 스타일을 존중한다.
- 불필요한 리팩토링은 하지 않는다.
- 변경 이유가 명확하지 않으면 먼저 질문한다.

## Error Handling

- 에러를 숨기지 않는다.
- catch 후 무시하지 않는다.
- 의미 있는 에러 메시지를 남긴다.
- 실패 가능한 경로를 항상 고려한다.

## Testing

- 기능 변경 시 테스트도 함께 수정한다.
- 테스트가 없다면 추가를 제안한다.
- 테스트를 통과하지 않는 코드는 완료로 간주하지 않는다.

## Git

- 사용자가 요청하기 전에는 commit하지 않는다.
- 사용자가 요청하기 전에는 push하지 않는다.
- destructive git 명령은 실행하지 않는다.

## Security

- Secret을 코드에 작성하지 않는다.
- .env를 생성하거나 수정하기 전에 확인한다.
- 사용자 입력은 신뢰하지 않는다.

## Performance

- O(n²) 이상의 알고리즘은 필요성을 설명한다.
- 불필요한 메모리 복사를 피한다.
- 성능 최적화는 측정 가능한 경우에만 수행한다.

## TypeScript

- any 사용 금지
- unknown을 우선 사용
- 타입 단언(as)은 최소화
- strict mode를 기준으로 작성

## UI Modification Rules

- Visual redesign only unless explicitly instructed otherwise.
- Never add, remove, merge, or split components.
- Preserve DOM hierarchy whenever possible.
- Preserve all props, events, and state.
- Do not modify business logic.
- Prefer CSS/Tailwind changes over JSX changes.
- Reuse existing design tokens where possible.
- Every design change must be reversible without affecting functionality.

## Dependency Policy

- 기존 의존성으로 해결 가능한 경우 새 의존성을 추가하지 않는다.
- 새 의존성이 필요한 경우 먼저 이유와 대안을 설명한다.
- package.json 수정 전 반드시 사용자 승인을 받는다.
