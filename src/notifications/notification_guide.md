# 웹 알림 시스템 완벽 이해 가이드

## 1. 고수준 아키텍처

### 왜 알림 기능을 여러 파일로 분리했나?

단일 책임 원칙(Single Responsibility Principle)을 따릅니다.

```
notifications.json (데이터)
        ↓
useNotifications() (데이터 로드)
        ↓
        ├─→ useNotificationToast() (Toast 표시)
        │
        └─→ useNotificationRead() (읽음 상태 추적)
        │
        └─→ NotificationInbox.tsx (UI)
```

각 파일의 책임:

| 파일                      | 책임                 | 상태 관리           | localStorage             |
| ------------------------- | -------------------- | ------------------- | ------------------------ |
| `types.ts`                | TypeScript 타입 정의 | 없음                | 없음                     |
| `notifications.json`      | 원본 데이터          | 없음                | 없음                     |
| `useNotifications.ts`     | JSON에서 데이터 로드 | 없음                | 없음                     |
| `useNotificationToast.ts` | Toast 자동 표시      | 없음                | displayedNotificationIds |
| `useNotificationRead.ts`  | 읽음/미읽음 추적     | **있음** (useState) | lastReadNotificationId   |
| `NotificationInbox.tsx`   | 알림 리스트 UI       | **있음** (useState) | 없음                     |
| `App.tsx`                 | 최상위 진입점        | 없음                | hasShownWelcomeToast     |

### 파일 간 통신 방식

```
App.tsx
  ├─ useNotificationToast() 호출
  │   ├─ useNotifications() 호출 → 데이터 받음
  │   └─ toast() 함수 호출
  │
  ├─ BrowserRouter + ToastContainer (react-toastify)
  │
  └─ Layout 렌더링
      └─ NotificationInbox.tsx
          ├─ useNotifications() 호출
          └─ useNotificationRead() 호출
```

---

## 2. 완전한 실행 흐름

### 2.1 앱 시작 (첫 방문)

```
사용자가 브라우저에서 앱 URL 입력
        ↓
index.html 로드 → main.tsx → App 컴포넌트 마운트
        ↓
[STEP 1] App() 함수 실행 (렌더링 함수)
        ↓
  - 라인 13: useNotificationToast() 호출
        ↓
    [STEP 1-1] useNotificationToast() 내부
            ↓
    - 라인 33: useNotifications() 호출
            ↓
      useNotifications.ts 실행:
      - notifications.json import
      - 배열 반환: [notice-001, notice-002, ...]
    ↓
    - 라인 35: useEffect() 등록 (아직 실행 안 함)
    ↓
    useNotificationToast() 반환 (undefined)
        ↓
  - 라인 15-21: useEffect() 등록 (아직 실행 안 함)
        ↓
  - 라인 23-46: JSX 반환
        ↓
[STEP 2] 첫 렌더링 완료
        ↓
    React는 JSX를 Virtual DOM으로 변환
    실제 DOM에 반영
        ↓
[STEP 3] 렌더링 후 Effects 실행 (useEffect 콜백)
        ↓
    [EFFECT 1] useNotificationToast의 useEffect (라인 35-48)
            ↓
            - 라인 36: readDisplayedIds() 호출
                    ↓
                    localStorage.getItem("displayedNotificationIds")
                    → null (첫 방문, localStorage 비어있음)
                    → JSON.parse 스킵
                    → [] 반환
            ↓
            - 라인 37: newNotifications 계산
                    ↓
                    notifications.filter(n => ![].includes(n.id))
                    → 모든 5개 알림 필터됨
                    → newNotifications = [notice-001, notice-002, ...]
            ↓
            - 라인 39: newNotifications.length > 0 체크
                    ↓
                    참 (5개 알림 있음)
            ↓
            - 라인 40-43: forEach loop
                    ↓
                    각 알림마다:
                    - getToastType(notification) 호출
                    - toast[toastType](notification.title) 호출
                    ↓
                    react-toastify가 Toast UI 렌더링
                    화면 우측 상단에 팝업 표시
            ↓
            - 라인 45-46: displayedIds 업데이트
                    ↓
                    updatedIds = [
                      ...[],
                      ...["notice-001", "notice-002", "notice-003",
                          "maintenance-001", "update-001"]
                    ]
                    = ["notice-001", "notice-002", ...]
            ↓
            - 라인 46: saveDisplayedIds(updatedIds) 호출
                    ↓
                    localStorage.setItem(
                      "displayedNotificationIds",
                      '["notice-001","notice-002",...]'
                    )
    ↓
    [EFFECT 2] App의 useEffect (라인 15-21)
            ↓
            - 라인 16: localStorage.getItem("hasShownWelcomeToast")
                    → null (첫 방문)
            ↓
            - 라인 18: toast.info("환영합니다!")
                    → "환영합니다!" Toast 표시
            ↓
            - 라인 19: localStorage.setItem("hasShownWelcomeToast", "true")

[완료] 앱 완전히 준비됨
```

**이 시점에서 화면에 보이는 것:**

- Toast 5개 (각 알림마다) + 1개 (환영)
- NotificationInbox 버튼 (🔔 배지에 5 표시)

### 2.2 useNotificationRead 추적

NotificationInbox 컴포넌트가 렌더링될 때:

```
NotificationInbox 렌더링 // 여기부터 시작! 2026-07-24
        ↓
- 라인 8: useNotifications() 호출
        ↓
  notifications = [notice-001, notice-002, ...]
        ↓
- 라인 9: useNotificationRead(notifications) 호출
        ↓
  [useNotificationRead 내부]

  - 라인 24: useState 초기화
          ↓
          readStoredLastReadId() 호출
          → localStorage.getItem("lastReadNotificationId")
          → null (처음이므로)
          → lastReadId = null
  ↓
  - 라인 26: lastRead 계산
          ↓
          lastReadId가 null이므로
          → lastRead = undefined
  ↓
  - 라인 27-32: unreadCount 계산
          ↓
          lastReadId === null이므로
          → unreadCount = notifications.length = 5
  ↓
  - 라인 35-44: markAllAsRead 함수 정의
          ↓
          useCallback으로 감싸짐
          → 의존성: [notifications]
  ↓
  - 라인 46: 반환
          ↓
          { unreadCount: 5, markAllAsRead: Function }
```

---

## 3. 데이터 흐름 추적

### 알림이 화면에 나타나기까지의 여정

```
Step 1: 파일 시스템에서
  notifications.json
  {
    "id": "notice-001",
    "type": "notice",
    "title": "청년안심주택 공공임대 신규 공고",
    "message": "...",
    "createdAt": "2026-07-21T10:00:00+09:00",
    "priority": "important"
  }

Step 2: 모듈 로드 시
  useNotifications.ts의 import 실행
  ↓
  const notifications = notificationsData as unknown as Notification[]
  ↓
  메모리의 배열 객체:
  notifications[0] = {
    id: "notice-001",
    type: "notice",
    ...
  }

Step 3: useNotificationToast() hook 실행
  const notifications = useNotifications()
  ↓
  notifications 변수가 배열 참조 받음
  메모리 주소: 0x12345... (예)

Step 4: useEffect 의존성 배열 체크
  useEffect(() => { ... }, [notifications])
  ↓
  [notifications]에 의존성 등록
  → 이 배열의 참조가 변경되면 useEffect 재실행

Step 5: 렌더링 후 Effect 실행
  const displayedIds = readDisplayedIds()
  ↓
  localStorage 상태:
  {
    "displayedNotificationIds": null  (또는 이전 값)
  }
  ↓
  readDisplayedIds() 반환: []

Step 6: 새 알림 필터링
  notifications.filter(n => ![].includes(n.id))
  ↓
  각 notification 객체를 순회
  ↓
  notice-001은 [].includes("notice-001")? → false
  → !false → true
  → 포함됨
  ↓
  newNotifications = [notice-001, notice-002, ...]

Step 7: 각 알림에 대해 Toast 생성
  newNotifications.forEach(notification => {
    const toastType = getToastType(notification)
    toast[toastType](notification.title)
  })
  ↓
  notice-001:
  - getToastType() 호출
    - notification.priority = "important" → true
    - notification.type = "notice" → "warning"? No
    - → "success" 반환
  ↓
  toast.success("청년안심주택 공공임대 신규 공고")
  ↓
  react-toastify 라이브러리:
  - 새로운 Toast DOM 요소 생성
  - position: "top-right" 위치에 배치
  - autoClose: 6000ms 후 자동 제거

Step 8: localStorage에 기록
  updatedIds = [...[], "notice-001", "notice-002", ...]
  saveDisplayedIds(updatedIds)
  ↓
  localStorage 상태:
  {
    "displayedNotificationIds":
      '["notice-001","notice-002","notice-003","maintenance-001","update-001"]'
  }

Step 9: 다시 렌더링되면
  (notifications 배열이 같은 참조를 유지한다면)
  ↓
  useEffect 의존성 체크:
  - 이전 notifications === 현재 notifications?
  - 같은 메모리 주소 → true
  → Effect 실행 안 함

Step 10: 새로고침하면
  1. localStorage는 유지됨
     "displayedNotificationIds":
       '["notice-001","notice-002",...]'

  2. App 다시 로드

  3. useNotificationToast 재실행

  4. readDisplayedIds()
     → JSON.parse('["notice-001",...]')
     → ["notice-001", "notice-002", ...]

  5. newNotifications 필터링
     notifications.filter(n =>
       !["notice-001", ...].includes(n.id)
     )
     → 모든 알림이 이미 displayedIds에 있음
     → newNotifications = []

  6. Toast 표시 안 됨!
```

---

## 4. localStorage 상세 설명

### 4.1 정확히 무엇이 저장되는가?

```javascript
// useNotificationToast.ts에서 저장하는 것
localStorage.setItem(
  "displayedNotificationIds",
  JSON.stringify(["notice-001", "notice-002", "notice-003", "maintenance-001", "update-001"])
)

// 실제 localStorage 내용 (개발자 도구에서 보는 모습)
Key: displayedNotificationIds
Value: ["notice-001","notice-002","notice-003","maintenance-001","update-001"]

// useNotificationRead.ts에서 저장하는 것
localStorage.setItem(
  "lastReadNotificationId",
  "notice-001"  // 최신 알림 ID
)

// App.tsx에서 저장하는 것
localStorage.setItem(
  "hasShownWelcomeToast",
  "true"
)

// 전체 localStorage 상태
{
  "displayedNotificationIds": "[\"notice-001\",\"notice-002\",\"notice-003\",\"maintenance-001\",\"update-001\"]",
  "lastReadNotificationId": "notice-001",
  "hasShownWelcomeToast": "true"
}
```

### 4.2 왜 중복 Toast를 방지하는가?

```
첫 방문 (앱 시작)
  ├─ localStorage 비어있음
  ├─ readDisplayedIds() → []
  ├─ newNotifications = [모든 5개]
  ├─ Toast 5개 표시
  └─ localStorage에 저장: ["notice-001", ...]

새로고침
  ├─ localStorage에서 읽음: ["notice-001", ...]
  ├─ readDisplayedIds() → ["notice-001", ...]
  ├─ newNotifications = [] (모두 이미 표시됨)
  ├─ Toast 표시 안 됨
  └─ localStorage는 그대로: ["notice-001", ...]

다시 새로고침
  ├─ 같은 과정 반복
  ├─ Toast 표시 안 됨
  └─ 영구히 표시 안 됨 (localStorage 값이 변하지 않으므로)
```

**핵심: localStorage의 배열에 한 번 추가된 ID는 절대 제거되지 않음**

### 4.3 브라우저 새로고침에서 무엇이 생존하는가?

```javascript
// 새로고침 전
const myState = 10  // 메모리의 변수
localStorage.setItem("key", "value")

// 새로고침 (F5)
// ↓
// JavaScript 메모리 전부 초기화
myState  // ❌ 존재하지 않음 (메모리 낭비)

localStorage.getItem("key")  // ✅ "value" 반환 (디스크에 저장됨)

// 결론
- 변수/state: 사라짐
- localStorage: 유지됨
- 서버 데이터: 유지됨
```

### 4.4 새 알림이 추가되면?

notifications.json에 새 알림 추가 시나리오:

```json
// Before (이전)
[
  { "id": "notice-001", ... },
  { "id": "notice-002", ... },
  { "id": "notice-003", ... },
  { "id": "maintenance-001", ... },
  { "id": "update-001", ... }
]

// After (새 알림 추가)
[
  { "id": "notice-004", ... },  // ← 새 알림!
  { "id": "notice-001", ... },
  { "id": "notice-002", ... },
  { "id": "notice-003", ... },
  { "id": "maintenance-001", ... },
  { "id": "update-001", ... }
]
```

실행 흐름:

```
사용자가 이미 앱을 열고 있음
  ├─ localStorage: ["notice-001", "notice-002", ...]
  ├─ 개발자가 notifications.json 변경
  ├─ 파일 시스템에 저장됨

사용자가 새로고침 누름 (또는 자동 리로드)
  ├─ 새 notifications.json 로드됨
  │   notifications = [notice-004, notice-001, ...]
  │
  ├─ useNotificationToast의 useEffect 실행
  │   ├─ readDisplayedIds() → ["notice-001", "notice-002", ...]
  │   ├─ 새 notifications와 비교
  │   ├─ "notice-004" 는 displayedIds에 없음!
  │   ├─ newNotifications = [notice-004]
  │   └─ Toast 1개만 표시
  │
  └─ localStorage 업데이트
      └─ ["notice-001", "notice-002", ..., "notice-004"]
```

**특징: 필터링이 정확해서 정말 새로운 알림만 표시됨**

---

## 5. React 개념 깊이 있는 설명

### 5.1 왜 hooks를 사용하는가?

#### 문제: Hooks 없이 React를 짜면?

```javascript
// ❌ 나쁜 방식 (Class Component, 복잡함)
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { notifications: [] };
  }

  componentDidMount() {
    const notifications = useNotifications(); // ❌ 이건 hook!
    this.setState({ notifications });
  }

  componentDidUpdate(prevProps) {
    // 복잡한 로직...
  }

  render() {
    return <div>{this.state.notifications.length}</div>;
  }
}
```

#### 좋은 방식: Hooks 사용

```javascript
// ✅ 좋은 방식 (Functional Component + Hooks)
function App() {
  const notifications = useNotifications(); // hook
  const { unreadCount } = useNotificationRead(notifications); // hook

  useEffect(() => {
    // 부수 효과 처리
  }, [notifications]);

  return <div>{unreadCount}</div>;
}
```

**왜 Hooks가 좋은가?**

| 측면        | Class Component      | Hooks                |
| ----------- | -------------------- | -------------------- |
| 코드 길이   | 길다                 | 짧다                 |
| 로직 재사용 | 어렵다               | 쉽다 (hook으로 추출) |
| this 바인딩 | 필요                 | 필요 없음            |
| 가독성      | 낮다                 | 높다                 |
| 상태 관리   | this.state           | useState             |
| 부수 효과   | componentDidMount 등 | useEffect            |

### 5.2 왜 useState가 필요한가?

```javascript
// ❌ useState 없이 짜면? (틀림!)
function NotificationInbox() {
  let isOpen = false; // 그냥 변수

  const togglePanel = () => {
    isOpen = !isOpen;
    console.log("isOpen:", isOpen);
  };

  return (
    <button onClick={togglePanel}>
      {isOpen ? "열림" : "닫힘"} // 항상 "닫힘"이라고 표시됨!
    </button>
  );
}

// 왜 안 되는가?
// 1. togglePanel() 호출해서 isOpen = true로 바뀜
// 2. 하지만 컴포넌트가 다시 렌더링 안 됨
// 3. 다시 렌더링 되려면 React에게 "상태가 바뀌었다"고 알려야 함
// 4. 일반 변수는 React가 모름
// 5. 버튼 텍스트는 항상 같게 표시됨
```

```javascript
// ✅ useState 사용 (맞음!)
function NotificationInbox() {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen); // React에게 알려줌!
  };

  return (
    <button onClick={togglePanel}>
      {isOpen ? "열림" : "닫힘"} // 올바르게 토글됨
    </button>
  );
}

// 왜 되는가?
// 1. setIsOpen(true) 호출
// 2. React가 이것을 감지
// 3. 컴포넌트 함수를 다시 실행 (리렌더링)
// 4. useState 다시 호출하면 새로운 값 반환
// 5. JSX도 새로운 상태로 다시 렌더링됨
```

**useState의 동작:**

```javascript
const [state, setState] = useState(initialValue);

// 첫 번째 호출
// state = initialValue
// setState = (newValue) => {
//   state = newValue
//   리렌더링 트리거()
// }

// setState 호출 후
// 1. React가 상태 업데이트 큐에 추가
// 2. 현재 코드 계속 실행 (아직 state는 기존 값)
// 3. 함수 반환
// 4. React가 컴포넌트 함수 다시 실행
// 5. useState(initialValue) 다시 호출하면 새로운 값 반환!
```

### 5.3 왜 useEffect가 필요한가?

```javascript
// ❌ useEffect 없이 짜면? (틀림!)
function App() {
  const notifications = useNotifications();

  // 이 코드는 매 렌더링마다 실행됨!
  toast.info("새로운 Toast!"); // 무한 Toast 표시...

  return <div>App</div>;
}

// 문제:
// 1. 렌더링 → toast.info() 호출
// 2. 렌더링 → toast.info() 호출
// 3. ... (무한 반복)
```

```javascript
// ✅ useEffect 사용 (맞음!)
function useNotificationToast() {
  const notifications = useNotifications();

  useEffect(() => {
    // 이 코드는 렌더링 후에만 실행됨!
    // 정확히는 의존성 배열이 변할 때만

    // 처리 로직...
    toast.info("새로운 Toast!");
  }, [notifications]); // notifications 변할 때만

  return <div>App</div>;
}
```

**useEffect의 타이밍:**

```
함수 실행 시작
  ↓
JSX 처리 (렌더링 함수)
  ↓
  const notifications = useNotifications()
  const [state, setState] = useState(...)
  ← 여기서는 useEffect 실행 안 됨!
  ↓
JSX 반환
  ↓
실제 DOM 업데이트
  ↓
이제 useEffect 실행!
  ↓
  localStorage 읽기
  Toast 표시
  외부 API 호출
  등등...
  ↓
다음 렌더링까지 대기
```

**useEffect 의존성 배열:**

```javascript
// 케이스 1: 의존성 배열 없음
useEffect(() => {
  console.log("매 렌더링 후마다 실행됨");
});
// 무한 루프 위험!

// 케이스 2: 빈 배열
useEffect(() => {
  console.log("마운트 시에만 실행됨");
}, []);
// 앱 시작 시 한 번만 실행

// 케이스 3: 의존성 있음
useEffect(() => {
  console.log("count 또는 name이 변할 때마다 실행됨");
}, [count, name]);
// count = 5 → 6으로 변경 → 실행됨
// name = "Kim" → "Kim" (같은 값) → 실행 안 됨

// 케이스 4: 배열 의존성 주의
useEffect(() => {
  console.log("notifications 배열이 변할 때 실행됨");
}, [notifications]);
// notifications === 이전 notifications?
// 메모리 주소 같음 → 실행 안 됨
// 메모리 주소 다름 → 실행됨 (내용이 같아도)
```

### 5.4 왜 useCallback이 사용되는가?

```javascript
// useNotificationRead.ts의 markAllAsRead

const markAllAsRead = useCallback(() => {
  const latest = getLatestNotification(notifications)
  if (!latest) return
  try {
    localStorage.setItem(LAST_READ_KEY, latest.id)
  } catch {
    // ...
  }
  setLastReadId(latest.id)
}, [notifications])  // ← 의존성!

// 왜 useCallback이 필요한가?
// 1. 함수도 객체 (메모리 주소가 있음)
// 2. useCallback 없이 정의하면 매 렌더링마다 새로운 함수 생성
// 3. 새로운 함수 → 메모리 주소 다름 → 자식 컴포넌트 재렌더링
// 4. useCallback으로 감싸면 의존성이 같으면 같은 함수 반환
// 5. 자식이나 부모가 이 함수를 의존성으로 사용할 때 최적화됨

// 예시
// 렌더링 1
markAllAsRead_v1 = () => { ... }  // 주소: 0x123

// 렌더링 2 (notifications 같음)
// useCallback 없이
markAllAsRead_v2 = () => { ... }  // 주소: 0x456 (다름!)

// useCallback 있으면
markAllAsRead_v2 = markAllAsRead_v1  // 주소: 0x123 (같음!)

// NotificationInbox에서
useEffect(() => {
  // markAllAsRead를 의존성으로 사용하면
  // useCallback이 없으면 매번 다른 주소 → 계속 재실행
  // useCallback이 있으면 같은 주소 → 한 번만 실행
}, [markAllAsRead])
```

### 5.5 무엇이 리렌더링을 유발하는가?

```javascript
리렌더링 유발 원인:

1. setState 호출
   setIsOpen(true) → 리렌더링 발생

2. Props 변경
   <Child count={5} /> → <Child count={6} /> → Child 리렌더링

3. 부모 리렌더링
   부모가 리렌더링 → 자식도 자동 리렌더링

4. Context 값 변경
   useContext의 값이 변경 → 사용하는 모든 컴포넌트 리렌더링

리렌더링 일어나지 않는 것:

1. localStorage 변경
   localStorage.setItem("key", "value")
   → React가 모르므로 리렌더링 안 됨

2. 파일 시스템 변경
   notifications.json 파일 수정
   → React가 모르므로 리렌더링 안 됨
   (단, 모듈 import는 번들 시점에 이미 이루어짐)

3. 변수 변경 (useState 없음)
   let count = 5; count = 6;
   → 리렌더링 안 됨
```

### 5.6 새로고침에서 무엇이 생존하는가?

```javascript
const globalVar = "I'm global"; // ❌ 사라짐
let componentVar = "I'm in component"; // ❌ 사라짐

function App() {
  const [state, setState] = useState("initial"); // ❌ 사라짐

  useEffect(() => {
    localStorage.setItem("key", "value"); // ✅ 유지됨
    sessionStorage.setItem("key", "value"); // ✅ 유지됨 (세션 내에서)
    // 새로고침 후에도 읽을 수 있음
  }, []);
}

// 새로고침 (F5)
// ↓
// JavaScript 전체 메모리 초기화
// globalVar, componentVar, state 모두 사라짐
// ↓
// 앱 다시 시작
// ↓
// localStorage는 그대로 있음!
localStorage.getItem("key"); // "value" 반환됨
```

---

## 6. 타임라인 (상세)

```
[0ms] 사용자가 브라우저 주소창에 URL 입력, Enter
       HTTP 요청: GET /index.html

[50ms] index.html 로드 완료
       HTML 파서: <script src="main.tsx"></script> 발견

[100ms] main.tsx 파일 요청 (Vite 번들)

[150ms] main.tsx 번들 다운로드 완료
       JavaScript 엔진: 코드 파싱 시작

[200ms] import 문 실행
       ├─ import App from './App.tsx'
       ├─ import useNotificationToast from './notifications/useNotificationToast.ts'
       ├─ import { useNotifications } from './notifications/useNotifications.ts'
       │   ├─ import notificationsData from "./data/notifications.json"
       │   │   ↓
       │   │   JSON 파일 파싱
       │   │   notifications = [
       │   │     { id: "notice-001", ... },
       │   │     { id: "notice-002", ... },
       │   │     ...
       │   │   ]
       │   │
       │   └─ useNotifications() 함수 정의
       │
       ├─ import { useNotificationRead } from './notifications/useNotificationRead.ts'
       │   └─ useNotificationRead() 함수 정의
       │
       └─ import ToastContainer from 'react-toastify'
           └─ react-toastify 라이브러리 로드

[250ms] 모든 import 완료
       React 엔진: App 컴포넌트 렌더링 준비

[300ms] ★ [RENDERING PHASE 시작]

       React.createRoot(document.getElementById('root')).render(<App />)

[310ms] App() 함수 호출 (렌더링 함수)

       라인 12: function App() {
       라인 13:   useNotificationToast()  // ← 호출
                  │
                  ├─ 라인 33: const notifications = useNotifications()
                  │            │
                  │            useNotifications 함수 실행
                  │            │
                  │            라인 8: return notifications (배열)
                  │            │
                  │            메모리 주소: 0x12345
                  │            notifications = [notice-001, notice-002, ...]
                  │
                  ├─ 라인 35: useEffect 등록 (아직 실행 안 함)
                  │            ├─ 콜백 함수 저장
                  │            └─ 의존성 배열: [notifications] 저장
                  │
                  └─ undefined 반환 (useNotificationToast는 값 반환 안 함)

       라인 15: useEffect 등록 (app level)
                ├─ 콜백 함수 저장
                └─ 의존성 배열: [] 저장 (마운트 시만)

       라인 23-46: JSX 처리
                  <BrowserRouter>
                    <Routes>
                      <Route element={<Layout />}>
                        ...
                      </Route>
                    </Routes>
                    <ToastContainer ... />
                  </BrowserRouter>

       JSX → React Element 객체로 변환
       └─ Virtual DOM 생성

[330ms] Reconciliation (조정)
       Virtual DOM vs 실제 DOM 비교
       └─ 차이 계산

[340ms] DOM 업데이트
       실제 DOM에 반영
       └─ 브라우저가 화면 그리기 준비

[350ms] 브라우저 페인팅
       CSS 계산, 레이아웃, 페인팅

[360ms] ★ [COMMIT PHASE 시작]
              (렌더링 후 Effects 실행)

       useEffect 콜백들 실행 (등록 순서대로)

[361ms] useNotificationToast의 useEffect 콜백

       라인 36: const displayedIds = readDisplayedIds()
                │
                readDisplayedIds() 함수 호출
                │
                라인 10: localStorage.getItem("displayedNotificationIds")
                        │
                        브라우저 localStorage 조회
                        │
                        반환값: null (첫 방문이므로 없음)
                │
                라인 11: stored ? JSON.parse(stored) : []
                        │
                        null이므로 [] 반환
                │
                displayedIds = []

       라인 37: const newNotifications = notifications
                    .filter(n => !displayedIds.includes(n.id))
                │
                notifications = [notice-001, notice-002, notice-003, maintenance-001, update-001]
                displayedIds = []
                │
                각 notification 순회:
                ├─ notice-001: ![].includes("notice-001") = !false = true ✅
                ├─ notice-002: ![].includes("notice-002") = !false = true ✅
                ├─ notice-003: ![].includes("notice-003") = !false = true ✅
                ├─ maintenance-001: ![].includes("maintenance-001") = !false = true ✅
                └─ update-001: ![].includes("update-001") = !false = true ✅
                │
                newNotifications = [notice-001, notice-002, notice-003, maintenance-001, update-001]

       라인 39: if (newNotifications.length > 0)
                │
                5 > 0? true ✅
                │
                블록 진입

       라인 40: newNotifications.forEach(notification => {
                │
                각 알림 순회:
                │
                ├─ [iteration 1] notification = notice-001
                │  라인 41: const toastType = getToastType(notification)
                │           │
                │           getToastType 함수 호출:
                │           - notification.priority = "important" ✅
                │           - notification.type = "notice" → "maintenance"? 아니오
                │           - return "success" ✅
                │           │
                │           toastType = "success"
                │
                │  라인 42: toast[toastType](notification.title)
                │           │
                │           toast["success"]("청년안심주택 공공임대 신규 공고")
                │           │
                │           react-toastify 내부:
                │           - Toast 요소 생성
                │           - position: "top-right" 위치 계산
                │           - autoClose: 6000ms 타이머 설정
                │           - DOM에 추가
                │           - 브라우저에서 렌더링
                │           - 화면에 보임 🟢
                │
                ├─ [iteration 2] notification = notice-002
                │  toastType = "info" (priority: "normal")
                │  toast.info("청년매입임대 신규 공고 - 7월")
                │  화면에 Toast 표시 🟢
                │
                ├─ [iteration 3] notification = notice-003
                │  toastType = "info"
                │  toast.info("최대 보증금 필터 기능 추가")
                │  화면에 Toast 표시 🟢
                │
                ├─ [iteration 4] notification = maintenance-001
                │  toastType = "warning" (priority: "important" && type: "maintenance")
                │  toast.warning("정기 서버 점검 안내")
                │  화면에 Toast 표시 🟡
                │
                └─ [iteration 5] notification = update-001
                   toastType = "info"
                   toast.info("중첩 라우팅 구조 개선")
                   화면에 Toast 표시 🟢

       라인 45: const updatedIds = [
                  ...displayedIds,
                  ...newNotifications.map(n => n.id)
                ]
                │
                updatedIds = [
                  ...[],
                  ...["notice-001", "notice-002", "notice-003", "maintenance-001", "update-001"]
                ]
                = ["notice-001", "notice-002", "notice-003", "maintenance-001", "update-001"]

       라인 46: saveDisplayedIds(updatedIds)
                │
                saveDisplayedIds 함수 호출:
                │
                라인 19: localStorage.setItem(
                          "displayedNotificationIds",
                          JSON.stringify([...])
                        )
                │
                브라우저 localStorage에 저장:
                {
                  "displayedNotificationIds":
                    "[\"notice-001\",\"notice-002\",\"notice-003\",\"maintenance-001\",\"update-001\"]"
                }

[362ms] App의 useEffect 콜백 (라인 15-21)

       라인 16: const hasShownWelcome = localStorage.getItem("hasShownWelcomeToast")
                │
                localStorage.getItem("hasShownWelcomeToast")
                │
                반환값: null (첫 방문)

       라인 17: if (!hasShownWelcome)
                │
                !null = true ✅
                │
                블록 진입

       라인 18: toast.info("환영합니다!")
                │
                react-toastify:
                - Toast 6번째 생성
                - 화면에 표시 🟢

       라인 19: localStorage.setItem("hasShownWelcomeToast", "true")
                │
                localStorage 업데이트:
                {
                  "displayedNotificationIds": "[\"notice-001\",...]",
                  "hasShownWelcomeToast": "true"
                }

[363ms] Layout 컴포넌트 렌더링

       <Layout />
       │
       ├─ <GNB /> 렌더링
       │
       └─ <NotificationInbox /> 렌더링
          │
          라인 8: const notifications = useNotifications()
                  │
                  notifications = [notice-001, notice-002, ...]
          │
          라인 9: const { unreadCount, markAllAsRead } = useNotificationRead(notifications)
                  │
                  useNotificationRead 함수 호출:
                  │
                  라인 24: const [lastReadId, setLastReadId] = useState(readStoredLastReadId)
                           │
                           readStoredLastReadId() 호출
                           │
                           localStorage.getItem("lastReadNotificationId")
                           │
                           반환값: null (첫 방문)
                           │
                           lastReadId = null
                  │
                  라인 26: const lastRead = lastReadId ? ... : undefined
                           │
                           lastRead = undefined
                  │
                  라인 27-32: unreadCount 계산
                              │
                              lastReadId === null? true ✅
                              │
                              unreadCount = notifications.length = 5
                  │
                  라인 35-44: markAllAsRead 함수 정의
                              │
                              useCallback으로 감싸짐
                              │
                              markAllAsRead = function() { ... }
                  │
                  라인 46: return { unreadCount: 5, markAllAsRead }
                  │
                  { unreadCount: 5, markAllAsRead }
          │
          라인 7: const [isOpen, setIsOpen] = useState(false)
                  │
                  isOpen = false
          │
          라인 67-93: JSX 렌더링
                      │
                      <button>
                        🔔
                        <span>5</span>  ← unreadCount 표시
                      </button>

                      {isOpen && <div>...</div>}  ← 아직 false라서 표시 안 됨

[365ms] 모든 렌더링 완료

       화면 최종 상태:
       ├─ 상단: GNB (네비게이션)
       ├─ 오른쪽 상단: 🔔 버튼 (배지에 5 표시)
       ├─ 우측 상단: Toast 6개 (5개 알림 + 1개 환영)
       │  ├─ 🟢 청년안심주택 공공임대 신규 공고 (success)
       │  ├─ 🟢 청년매입임대 신규 공고 - 7월 (info)
       │  ├─ 🟢 최대 보증금 필터 기능 추가 (info)
       │  ├─ 🟡 정기 서버 점검 안내 (warning)
       │  ├─ 🟢 중첩 라우팅 구조 개선 (info)
       │  └─ 🟢 환영합니다! (info)
       │
       ├─ Main content: MaeipPage 렌더링 (기본값)
       │
       └─ localStorage:
          {
            "displayedNotificationIds": "[\"notice-001\",...]",
            "hasShownWelcomeToast": "true"
          }

[365-6000ms] Toast 자동 닫기 대기
             (autoClose: 6000ms 설정되어 있음)

[6365ms] 첫 번째 Toast 자동 닫힘
         react-toastify가 DOM에서 요소 제거

[6425ms] 두 번째 Toast 자동 닫힘

... (6초 간격으로 나머지 Toast 닫힘)

[6000ms 이후] 사용자가 새로고침 누름 (F5)

       현재 상태 저장:
       ├─ 메모리의 모든 state 제거됨
       ├─ localStorage는 유지됨
       └─ notifications.json도 유지됨

       다시 처음부터 시작 (0ms부터)

       하지만 이번에는:
       ├─ displayedIds = ["notice-001", "notice-002", ...]
       ├─ newNotifications = [] (이미 모두 표시됨)
       ├─ Toast 표시 안 됨 ✅
       └─ hasShownWelcome = "true"
           └─ 환영 Toast도 표시 안 됨 ✅
```

---

## 7. 데이터 흐름 다이어그램

### 전체 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                      notifications.json                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [                                                        │   │
│  │   { id: "notice-001", title: "...", priority: "important" │   │
│  │   { id: "notice-002", title: "...", priority: "normal"   │   │
│  │   ...                                                    │   │
│  │ ]                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ JSON 파싱
                             │
                             ▼
            ┌────────────────────────────────┐
            │  useNotifications()            │
            │  const notifications = [...]   │
            │  return notifications         │
            └────────┬───────────────────────┘
                     │
      ┌──────────────┴──────────────┐
      │                             │
      │ 공유됨                       │ 공유됨
      │                             │
      ▼                             ▼
┌─────────────────────┐   ┌──────────────────────┐
│ useNotificationToast│   │ NotificationInbox    │
│                     │   │                      │
│ const [state, ...] ⟵─ dependencies          │
│                     │   │ useNotificationRead()
└─────────┬───────────┘   └─────────┬──────────┘
          │                         │
          │ 읽음/쓰기               │ 읽음
          │                         │
          ▼                         ▼
    ┌──────────────────────────────────┐
    │     Browser localStorage         │
    ├──────────────────────────────────┤
    │ displayedNotificationIds:        │
    │   ["notice-001", "notice-002"...] │
    │                                  │
    │ lastReadNotificationId:          │
    │   "notice-001"                   │
    │                                  │
    │ hasShownWelcomeToast:            │
    │   "true"                         │
    └────────────────────────┬─────────┘
                             │
        ┌────────────────────┴────────────────┐
        │                                     │
        ▼                                     ▼
  ┌──────────────┐                   ┌─────────────────┐
  │ 새 alarms    │                   │ 읽음 상태 추적  │
  │ 감지         │                   │ unreadCount     │
  │              │                   │ markAllAsRead   │
  └──────┬───────┘                   └────────┬────────┘
         │                                   │
         │ toast() 호출                       │ 업데이트
         │                                   │
         ▼                                   ▼
  ┌──────────────────┐          ┌─────────────────────┐
  │ react-toastify  │          │  React State        │
  │                 │          │  (useState)         │
  │ Toast 생성      │          │                     │
  │ 6초 후 자동 삭제│          │  unreadCount: 5     │
  └──────┬──────────┘          └─────────┬───────────┘
         │                               │
         │ DOM 요소 추가                  │ 상태 변경
         │                               │
         ▼                               ▼
    ┌──────────────┐          ┌─────────────────────┐
    │  Real DOM    │          │ 리렌더링 트리거      │
    │              │          │                     │
    │ <div>Toast   │          │ 🔔 배지 업데이트   │
    │  Popup</div> │          │ unreadCount 표시    │
    └──────────────┘          └─────────────────────┘
         │
         ▼
    ┌──────────────────┐
    │  Browser Paint   │
    │  화면에 렌더링    │
    └──────────────────┘
```

### 상세 Toast 생성 흐름

```
notifications 배열 (메모리 0x12345)
        ↓
filter(n => !displayedIds.includes(n.id))
        ↓
newNotifications = [notice-001, notice-002, notice-003, ...]
        ↓
forEach 루프
        ↓
        ├─ 반복 1: notice-001
        │  ├─ getToastType(notice-001)
        │  │  ├─ priority = "important"
        │  │  ├─ type = "notice"
        │  │  └─ return "success"
        │  ├─ toast.success("청년안심주택...")
        │  └─ react-toastify 내부:
        │     ├─ 새 Toast 객체 생성
        │     ├─ DOM 요소: <div class="toast success">
        │     ├─ position: "top-right" 계산
        │     ├─ setTimeout(autoClose, 6000)
        │     └─ 실제 DOM에 추가
        │
        ├─ 반복 2: notice-002
        │  └─ toast.info("청년매입임대...") → Toast 생성
        │
        └─ ... (3, 4, 5)
        │
        └─ 끝

updatedIds 생성
        ↓
["notice-001", "notice-002", "notice-003", "maintenance-001", "update-001"]
        ↓
saveDisplayedIds(updatedIds)
        ↓
localStorage.setItem("displayedNotificationIds", JSON.stringify(...))
        ↓
브라우저 디스크에 저장 (휘발성 메모리 아님)
```

---

## 8. 파일 의존성 다이어그램

```
┌────────────────────────────────────────────────────────────┐
│                          index.html                        │
│                    (진입점, <div id="root">)              │
└────────────────────┬───────────────────────────────────────┘
                     │ import main.tsx
                     ▼
┌────────────────────────────────────────────────────────────┐
│                        main.tsx                            │
│           (import App, React 시작)                        │
└────────────────────┬───────────────────────────────────────┘
                     │ import App.tsx
                     ▼
┌────────────────────────────────────────────────────────────┐
│                        App.tsx                             │
│                   (최상위 컴포넌트)                        │
│                                                            │
│  import {                                                  │
│    - Layout                                                │
│    - useNotificationToast  ◄─────────┐                    │
│    - ToastContainer                  │                    │
│    - BrowserRouter, Routes           │                    │
│  }                                   │                    │
└─────────┬──────────────────┬─────────┼────────────────────┘
          │                  │         │
          │ import           │ import  │ import
          ▼                  ▼         └─────────────────┐
   ┌──────────────┐  ┌────────────────────────────┐    │
   │ Layout.tsx   │  │ react-toastify (외부)      │    │
   │              │  │ - ToastContainer           │    │
   │ ├─ GNB       │  │ - toast 함수들             │    │
   │ ├─ Outlet    │  └────────────────────────────┘    │
   │ └─ Notification                                    │
   │    Inbox     │                                     │
   └─────┬────────┘                                     │
         │ import                                       │
         ▼                                              │
   ┌─────────────────────────────────────┐             │
   │   NotificationInbox.tsx             │             │
   │                                     │             │
   │ import {                            │             │
   │   - useNotifications            ◄───┼─────┐       │
   │   - useNotificationRead         ◄───┼─────┤       │
   │ }                               ◄───┼─────┤       │
   └─────────────────────────────────────┘             │
                                         │             │
                   ┌─────────────────────┼─────────────┘
                   │                     │
                   │ import              │ import
                   ▼                     ▼
         ┌─────────────────────────────────────────────┐
         │  notifications/ (폴더)                      │
         │                                             │
         ├─ types.ts                                   │
         │  ├─ NotificationType = "notice" | "maintenance" | "update"
         │  ├─ NotificationPriority = "normal" | "important"
         │  └─ Notification interface                  │
         │     ├─ id: string ◄─────────┐               │
         │     ├─ type: NotificationType               │
         │     ├─ title: string                        │
         │     ├─ message: string                      │
         │     ├─ createdAt: string                    │
         │     ├─ link?: string                        │
         │     └─ priority: NotificationPriority       │
         │                          ▲                  │
         │                          │                  │
         ├─ useNotifications.ts     │ import           │
         │  ├─ import notifications.json ◄──┐         │
         │  ├─ import types.ts ◄────────────┼────┐    │
         │  └─ export useNotifications()   │    │    │
         │                                │    │    │
         ├─ useNotificationRead.ts        │    │    │
         │  ├─ import types.ts ◄──────────┼────┼────┐
         │  ├─ useState, useCallback      │    │    │
         │  └─ export useNotificationRead()  │    │
         │                                   │    │
         ├─ useNotificationToast.ts ◄────────┘    │
         │  ├─ import useNotifications() ◄────────┼────┐
         │  ├─ import types.ts ◄──────────────────┼────┤
         │  ├─ import toast from react-toastify  │    │
         │  ├─ useEffect                          │    │
         │  └─ export useNotificationToast()     │    │
         │                                       │    │
         ├─ data/                                │    │
         │  └─ notifications.json ◄──────────────┘    │
         │     [                                      │
         │       {                                    │
         │         "id": "notice-001",                │
         │         "type": "notice",                  │
         │         "title": "...",                    │
         │         "message": "...",                  │
         │         "createdAt": "...",                │
         │         "priority": "important"            │
         │       },                                   │
         │       ...                                  │
         │     ]                                      │
         │                                            │
         └─────────────────────────────────────────────┘

사용 관계:

App.tsx
  ├─ useNotificationToast() 호출 (마운트 시 한 번)
  │  └─ useNotifications() 내부 호출
  │     └─ notifications.json 로드
  │
  ├─ Layout 렌더링
  │  └─ NotificationInbox 렌더링
  │     ├─ useNotifications() 호출
  │     │  └─ notifications.json 로드 (캐시됨)
  │     │
  │     └─ useNotificationRead(notifications) 호출
  │        └─ types.Notification 타입 사용
  │
  └─ ToastContainer 렌더링
     └─ useNotificationToast가 생성한 Toast 표시
```

---

## 9. 각 중요 라인 상세 설명

### 9.1 notifications.json

```json
[
  {
    "id": "notice-001",
    // "id"가 왜 있는가?
    // - localStorage에서 "이미 표시했나?"를 판단하는 유일 키
    // - 나중에 배열에서 검색할 때 사용
    // - 같은 ID가 다시 나타나도 중복 방지

    "type": "notice",
    // "type"이 왜 있는가?
    // - UI에서 배지로 표시할 때 사용 ("공고", "점검", "업데이트")
    // - Toast 스타일 결정 (getToastType에서 사용)
    // - 나중에 필터링할 때 사용 가능

    "title": "청년안심주택 공공임대 신규 공고",
    // "title"이 왜 있는가?
    // - Toast에 표시할 주제
    // - NotificationInbox의 리스트에서 제목으로 표시
    // - 사용자가 뭐가 왔는지 빠르게 알 수 있음

    "message": "서울시 청년안심주택...",
    // "message"가 왜 있는가?
    // - Toast에 표시할 상세 내용
    // - NotificationInbox에서 설명으로 표시
    // - 사용자가 상세 정보 확인

    "createdAt": "2026-07-21T10:00:00+09:00",
    // "createdAt"이 왜 있는가?
    // - 최신 알림 판단 (markAllAsRead에서 사용)
    // - NotificationInbox에서 시간 표시
    // - ISO 8601 포맷으로 정렬 가능

    "link": "/housing/ansim/public",
    // "link"가 왜 있는가?
    // - NotificationInbox에서 클릭 시 이동할 경로
    // - link가 없으면 그냥 텍스트로 표시만 됨

    "priority": "important"
    // "priority"가 왜 있는가?
    // - Toast 스타일 결정 (success vs info)
    // - NotificationInbox에서 시각적 강조
    // - 긴급도 표시 가능
  }
]
```

### 9.2 useNotifications.ts

```typescript
import notificationsData from "./data/notifications.json";
// 왜 JSON을 직접 import하는가?
// - 번들 시점에 이미 파싱됨 (런타임 fetch 불필요)
// - 번들에 포함되므로 매우 빠름
// - 서버 왕복 없음 (오프라인에서도 가능)
// - 단점: 앱 재배포해야 내용 갱신

import type { Notification } from "./types";
// 왜 "type"을 사용하는가?
// - 단순 타입 정의이므로 런타임 오버헤드 없음
// - 번들에 포함되지 않음 (타입은 컴파일 후 제거됨)

const notifications = notificationsData as unknown as Notification[];
// 왜 as unknown as를 사용하는가?
// - JSON.parse의 반환 타입: unknown
// - TypeScript는 JSON 내용을 모르므로 강제 형변환 필요
// - "I promise this is Notification[]"라고 컴파일러에게 말하는 것
// - 실제로 타입이 맞지 않으면 런타임 에러 가능

export function useNotifications(): Notification[] {
  return notifications;
  // 왜 export하는가?
  // - 다른 훅/컴포넌트가 사용할 수 있게
  // - 알림 데이터가 필요한 모든 곳에서 호출 가능
}
```

### 9.3 useNotificationToast.ts

```typescript
import { useEffect } from "react";
import { toast } from "react-toastify";
// 왜 toast를 import하는가?
// - react-toastify 라이브러리가 제공하는 함수
// - toast.info(), toast.success(), toast.warning() 등
// - 조건 없이 (effect 밖에서) 호출하면 무한 loop

const DISPLAYED_NOTIFICATIONS_KEY = "displayedNotificationIds";
// 왜 상수로 정의하는가?
// - localStorage 키를 여러 곳에서 사용 가능
// - 오타 방지 (문자열 직접 입력하면 오타 가능)
// - 나중에 키 이름 변경 시 한 곳만 수정하면 됨
// - 의도를 명확하게 함

function readDisplayedIds(): string[] {
  try {
    const stored = localStorage.getItem(DISPLAYED_NOTIFICATIONS_KEY);
    // 왜 try-catch인가?
    // - 시크릿 모드에서 localStorage 접근 불가
    // - 시크릿 모드에서 예외 발생 → 앱 크래시
    // - catch로 감싸면 안전하게 처리 가능

    return stored ? JSON.parse(stored) : [];
    // 왜 JSON.parse가 필요한가?
    // - localStorage는 모든 값을 문자열로 저장
    // - "[\"a\",\"b\"]" (문자열) → ["a", "b"] (배열)로 변환
    // - stored가 null이면 배열 비어있다고 가정
  } catch {
    return [];
    // 왜 에러 시 []를 반환하는가?
    // - 파싱 에러 발생 가능 (손상된 JSON)
    // - 새로운 사용자처럼 취급
    // - "표시된 것 없다"고 간주 → 모든 Toast 표시됨
  }
}

function saveDisplayedIds(ids: string[]): void {
  try {
    localStorage.setItem(
      DISPLAYED_NOTIFICATIONS_KEY,
      JSON.stringify(ids), // ["a", "b"] → "[\"a\",\"b\"]" (문자열)
    );
  } catch {
    // 실패해도 무시
    // 왜 무시하는가?
    // - 시크릿 모드에서는 어차피 저장 불가
    // - 메모리상 상태는 유지됨 (현재 세션)
    // - 새로고침하면 처음부터 시작 (중복 가능성)
    // - 하지만 시크릿 모드 사용자는 이미 예상 범위
  }
}

function getToastType(
  notification: Notification,
): "info" | "warning" | "error" | "success" {
  if (notification.priority === "important") {
    // "중요" 알림이면 색상 강조
    return notification.type === "maintenance" ? "warning" : "success";
    // 왜 maintenance는 warning인가?
    // - 점검 = 서비스 불가 = 경고 필요 🟡
    // - 공고 = 좋은 소식 = 성공 표시 🟢
  }
  return "info";
  // 왜 기본값이 info인가?
  // - 일반적인 알림 = 파란색 (정보) 🔵
}

export function useNotificationToast() {
  // 왜 매개변수가 없는가?
  // - useNotifications를 내부에서 호출
  // - 외부에서 데이터를 받지 않아도 됨
  // - 훅의 책임만 집중 (데이터 로드 + Toast 표시)

  const notifications = useNotifications();
  // 왜 여기서 호출하는가?
  // - 매번 notifications 배열 (같은 참조)를 받음
  // - 배열이 변경되면 useEffect가 반응 가능
  // - notifications.json이 변경되면 (재로드 시) 새 배열 참조

  useEffect(() => {
    // 왜 useEffect 안에서만 처리하는가?
    // - 렌더링이 아닌 "부수 효과" (side effect)
    // - localStorage 읽기, Toast 표시 = 부수 효과
    // - 렌더링 중에 하면 무한 loop 가능
    // - Effect는 렌더링 후에 실행되므로 안전

    const displayedIds = readDisplayedIds();
    // 1단계: 이미 표시한 것들 확인

    const newNotifications = notifications.filter(
      (n) => !displayedIds.includes(n.id),
    );
    // 2단계: 새로운 것 필터링
    // 왜 .includes()를 사용하는가?
    // - 배열에 특정 값이 있는지 확인
    // - for 루프보다 간결
    // - 성능: O(n) (선형, 배열 크기만큼)

    if (newNotifications.length > 0) {
      // 3단계: 새 것이 있으면

      newNotifications.forEach((notification) => {
        const toastType = getToastType(notification);
        // 왜 각 알림마다 타입을 판단하는가?
        // - 알림마다 우선순위와 타입이 다름
        // - 같은 스타일로 표시하면 중요도 못 알 수 있음

        toast[toastType](notification.title);
        // 왜 title만 사용하는가?
        // - Toast는 공간 제한 있음
        // - message는 너무 길 수 있음
        // - 사용자는 알림 인박스에서 자세히 볼 수 있음
      });

      const updatedIds = [
        ...displayedIds,
        ...newNotifications.map((n) => n.id),
      ];
      // 4단계: 기록 업데이트
      // 왜 [...]를 사용하는가? (spread operator)
      // - 배열 복사 (기존 배열 손상 방지)
      // - displayedIds + 새 ID들 결합
      // - newNotifications.map(n => n.id)
      //   → ["notice-001", "notice-002", ...]로 변환

      saveDisplayedIds(updatedIds);
      // 왜 저장하는가?
      // - 다음 새로고침 시 중복 방지
      // - localStorage는 영구 저장소 (세션 끝나도 유지)
    }
  }, [notifications]);
  // 왜 [notifications] 의존성인가?
  // - notifications 배열이 변할 때만 실행
  // - 같은 배열 참조면 실행 안 함 (중복 방지)
  // - notifications.json 변경 → 새 배열 → useEffect 실행

  // 왜 함수가 아무것도 반환하지 않는가?
  // - useNotificationRead와 달리 상태 반환 불필요
  // - Toast 표시만 하고 끝
  // - App 컴포넌트에서 호출하기만 하면 됨
}
```

### 9.4 useNotificationRead.ts

```typescript
import { useCallback, useState } from "react";

const LAST_READ_KEY = "lastReadNotificationId";
// 왜 상수인가? (이전과 동일한 이유)

function readStoredLastReadId(): string | null {
  // 왜 null을 반환할 수 있는가?
  // - 처음 사용자는 아직 아무것도 읽지 않음
  // - null = "기록 없음"
  // - undefined와 다르게 의도 명확

  try {
    return localStorage.getItem(LAST_READ_KEY);
    // getItem 반환값
    // - 존재함: "notice-001" (문자열)
    // - 없음: null
  } catch {
    return null;
  }
}

function getLatestNotification(
  notifications: Notification[],
): Notification | null {
  // 왜 latest를 찾는가?
  // - "모두 읽음" = 최신 알림까지 읽었다는 뜻
  // - 그 이후 알림들만 "미읽음"

  if (notifications.length === 0) return null;
  // 왜 빈 배열 체크인가?
  // - reduce()를 빈 배열에서 호출하면 에러
  // - reduce는 initial value 필요

  return notifications.reduce((latest, n) =>
    new Date(n.createdAt).getTime() > new Date(latest.createdAt).getTime()
      ? n
      : latest,
  );
  // 왜 reduce인가?
  // - 배열을 하나의 값으로 축약
  // - 각 알림의 시간을 비교해서 최신 것만 남김
  // - getTime() = 1970/1/1부터의 밀리초 (숫자로 비교 가능)
}

export function useNotificationRead(notifications: Notification[]) {
  // 왜 notifications을 매개변수로 받는가?
  // - useNotifications()를 내부에서 호출 안 함
  // - 부모에서 받은 데이터 사용 (Dependency Injection)
  // - 유연함 (테스트할 때 다른 데이터 전달 가능)

  const [lastReadId, setLastReadId] = useState<string | null>(
    readStoredLastReadId,
  );
  // 왜 초기값에 함수를 전달하는가?
  // - useState(() => readStoredLastReadId())가 일반적
  // - 함수 전달 = lazy initialization
  // - 마운트 시에만 readStoredLastReadId() 실행
  // - (함수명만 전달하면 컴파일 에러인데, 위 코드는 실제로 실행됨)
  // (주: 실제로는 readStoredLastReadId()를 호출해야 함)

  const lastRead = lastReadId
    ? notifications.find((n) => n.id === lastReadId)
    : undefined;
  // 왜 lastRead를 따로 계산하는가?
  // - lastReadId는 문자열 ID만 있음
  // - lastRead는 전체 Notification 객체
  // - 시간 비교 등에 필요

  const unreadCount =
    lastReadId === null || !lastRead
      ? notifications.length
      : notifications.filter(
          (n) =>
            new Date(n.createdAt).getTime() >
            new Date(lastRead.createdAt).getTime(),
        ).length;
  // 왜 이렇게 복잡한가?
  // - lastReadId === null: 처음 사용자 → 전부 미읽음
  // - !lastRead: 읽은 것이 이미 삭제됨 → 전부 미읽음
  // - 둘 다 아니면: lastRead 이후의 것들만 미읽음

  const markAllAsRead = useCallback(() => {
    // 왜 useCallback인가?
    // - 함수 참조 유지
    // - 자식 컴포넌트의 의존성으로 사용 가능
    // - 무의미한 리렌더링 방지

    const latest = getLatestNotification(notifications);
    if (!latest) return;
    // 왜 latest 체크인가?
    // - 알림이 없으면 뭘 저장할지 모름

    try {
      localStorage.setItem(LAST_READ_KEY, latest.id);
      // 왜 ID만 저장하는가?
      // - 시간이 더 정확하지만 ID로 충분
      // - ID는 유일하고 변하지 않음
      // - 저장 공간 효율
    } catch {
      // localStorage 불가 → 무시
    }
    setLastReadId(latest.id);
    // 왜 setState를 호출하는가?
    // - UI도 업데이트해야 함 (배지 숫자)
    // - localStorage만 업데이트하면 화면 안 바뀜
  }, [notifications]);
  // 왜 [notifications] 의존성인가?
  // - notifications 변경 → 최신 알림도 변경 가능
  // - 새로운 함수 생성 필요

  return { unreadCount, markAllAsRead };
  // 왜 객체로 반환하는가?
  // - 두 개 이상의 값 반환
  // - 구조 분해 가능: const { unreadCount, markAllAsRead } = ...
}
```

### 9.5 App.tsx

```typescript
import { useNotificationToast } from "./notifications/useNotificationToast";

function App() {
  useNotificationToast();
  // 왜 이 위치에서 호출하는가?
  // - App이 최상위 컴포넌트
  // - ToastContainer가 여기 있음
  // - 페이지 이동해도 계속 작동
  // - render phase (렌더링 함수 내)에서 호출 가능
  // (hook은 항상 component body에서만 호출 가능)

  useEffect(() => {
    const hasShownWelcome = localStorage.getItem("hasShownWelcomeToast");
    if (!hasShownWelcome) {
      toast.info("환영합니다!");
      localStorage.setItem("hasShownWelcomeToast", "true");
    }
  }, []);
  // 왜 []인가?
  // - 마운트 시에만 실행
  // - 의존성이 변하지 않으므로 이후 실행 안 됨
  // - 환영 toast는 앱 시작 시 한 번만

  // 왜 두 개의 useEffect/hook이 있는가?
  // - useNotificationToast는 알림마다 Toast
  // - 이 useEffect는 환영 메시지
  // - 책임 분리
  // - 각각 독립적으로 작동

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          ...
        </Route>
      </Routes>
      <ToastContainer ... />
      {/* 왜 ToastContainer가 마지막인가? */}
      {/* - 렌더링 순서와 무관하게 위에 떠야 함 */}
      {/* - React Portal 사용하므로 DOM 어디든 가능 */}
      {/* - 명확성을 위해 아래에 배치 */}
    </BrowserRouter>
  );
}
```

---

## 10. 엣지 케이스

### 10.1 첫 방문

```
상황: 사용자가 처음 앱에 방문

localStorage 상태:
  displayedNotificationIds: (없음)
  lastReadNotificationId: (없음)
  hasShownWelcomeToast: (없음)

실행 흐름:
  ├─ useNotificationToast
  │  ├─ readDisplayedIds() → [] (localStorage 비어있음)
  │  ├─ newNotifications = [모든 5개] (다 새로움)
  │  ├─ Toast 5개 표시 🟢
  │  └─ localStorage: displayedNotificationIds = "[...]"
  │
  ├─ App의 useEffect
  │  ├─ hasShownWelcome = null (없음)
  │  ├─ toast.info("환영합니다!") 🟢
  │  └─ localStorage: hasShownWelcomeToast = "true"
  │
  └─ NotificationInbox
     ├─ unreadCount = 5 (아무것도 읽지 않음)
     └─ 배지: 🔔 5

기대 동작: ✅ 완벽하게 작동
```

### 10.2 브라우저 새로고침

```
상황: 첫 방문 후 사용자가 새로고침

localStorage 상태:
  displayedNotificationIds: "[\"notice-001\", \"notice-002\", ...]"
  lastReadNotificationId: (아직 없음, 아직 클릭 안 함)
  hasShownWelcomeToast: "true"

JavaScript 메모리: 전부 초기화됨 (변수, state, 함수 모두)

실행 흐름:
  ├─ useNotificationToast
  │  ├─ readDisplayedIds() →
  │  │   JSON.parse("[\"notice-001\", ...]") =
  │  │   ["notice-001", "notice-002", ...]
  │  ├─ newNotifications = [] (모두 이미 표시됨)
  │  ├─ Toast 표시 안 됨 🟢 (올바른 동작)
  │  └─ localStorage 변경 없음
  │
  ├─ App의 useEffect
  │  ├─ hasShownWelcome = "true" (이미 존재)
  │  ├─ !hasShownWelcome = false
  │  ├─ if 블록 실행 안 됨
  │  ├─ 환영 toast 표시 안 됨 🟢 (올바른 동작)
  │  └─ localStorage 변경 없음
  │
  └─ NotificationInbox
     ├─ unreadCount = 5 (아직 클릭 안 함)
     └─ 배지: 🔔 5

기대 동작: ✅ 중복 toast 없음, 상태 유지됨
```

### 10.3 새 알림 추가

```
상황: notifications.json에 새 알림 "notice-006" 추가

[기존 상태]
notifications = [notice-001, notice-002, notice-003, maintenance-001, update-001]
localStorage.displayedNotificationIds = "[\"notice-001\", ...]"

[새 상태]
notifications = [notice-006, notice-001, notice-002, ...]
                 ↑ 새로 추가됨

사용자가 새로고침

실행 흐름:
  ├─ notifications.json 리로드
  │  └─ notifications = [notice-006, notice-001, ...]
  │
  ├─ useNotificationToast
  │  ├─ readDisplayedIds() → ["notice-001", "notice-002", ...]
  │  ├─ notifications.filter(n => !displayedIds.includes(n.id))
  │  │  ├─ notice-006: !["notice-001", ...].includes("notice-006") = true ✅
  │  │  ├─ notice-001: !["notice-001", ...].includes("notice-001") = false
  │  │  └─ ... (나머지 모두 false)
  │  ├─ newNotifications = [notice-006]
  │  ├─ Toast 1개만 표시 🟢
  │  └─ localStorage: displayedNotificationIds = "[..., \"notice-006\"]"
  │
  └─ NotificationInbox
     ├─ unreadCount = 6 (새 알림 1개 추가)
     └─ 배지: 🔔 6

기대 동작: ✅ 새 알림만 정확히 감지, 표시
```

### 10.4 알림 수정

```
상황: notice-001의 title을 수정

Before: "청년안심주택 공공임대 신규 공고"
After:  "청년안심주택 공공임대 신규 공고 [수정됨]"

localStorage.displayedNotificationIds = "[\"notice-001\", ...]"

실행 흐름:
  ├─ notifications.json 리로드 (같은 ID, 다른 내용)
  ├─ useNotificationToast
  │  ├─ readDisplayedIds() → ["notice-001", ...]
  │  ├─ notice-001: !["notice-001", ...].includes("notice-001") = false
  │  ├─ newNotifications = [] (ID는 같으므로)
  │  ├─ Toast 표시 안 됨 🟢 (ID 기준이므로 수정 감지 안 함)
  │  └─ 이것은 정상 동작
  │
  └─ NotificationInbox
     └─ title 수정 반영됨 (JSON 다시 로드)

기대 동작: ✅ Toast는 재표시 안 됨, UI는 최신 내용 표시
          (ID 기반이므로 텍스트 수정은 toast로 재표시 안 함)

만약 수정 감지 원하면:
  → 새 ID 부여 (notice-001-v2 같은)
  → 또는 updatedAt 추가해서 타입 스크립트 수정
```

### 10.5 알림 삭제

```
상황: notice-001을 notifications.json에서 삭제

Before: [notice-001, notice-002, ...]
After:  [notice-002, notice-003, ...]

localStorage.displayedNotificationIds = "[\"notice-001\", ...]"

실행 흐름:
  ├─ notifications.json 리로드
  ├─ useNotificationToast
  │  ├─ readDisplayedIds() → ["notice-001", "notice-002", ...]
  │  ├─ notifications = [notice-002, notice-003, ...]
  │  ├─ newNotifications = [] (삭제된 것은 notifications에 없음)
  │  ├─ Toast 표시 안 됨 🟢
  │  └─ displayedNotificationIds는 그대로
  │     ("notice-001"이 남아있음, 하지만 무해)
  │
  └─ NotificationInbox
     ├─ notifications = [notice-002, notice-003, ...] (notice-001 제거)
     ├─ unreadCount = 4 (하나 줄어듦)
     └─ 배지: 🔔 4

기대 동작: ✅ 삭제된 알림은 화면에서 제거됨
          localStorage의 "notice-001" 기록은 남아있으나 무해
          (나중에 같은 ID로 다시 추가되면 표시 안 됨)
```

### 10.6 localStorage 초기화

```
상황: 사용자가 개발자 도구에서 localStorage 전부 삭제
     또는 브라우저 캐시/쿠키 삭제

[전 상태]
localStorage: {
  displayedNotificationIds: "[\"notice-001\", ...]",
  lastReadNotificationId: "notice-001",
  hasShownWelcomeToast: "true"
}

[후 상태]
localStorage: {} (비어있음)

앱 작동:

  ├─ useNotificationToast
  │  ├─ readDisplayedIds() → [] (localStorage 비어있음)
  │  ├─ newNotifications = [모든 5개]
  │  ├─ Toast 5개 다시 표시 🟢 (첫 방문처럼)
  │  └─ localStorage: displayedNotificationIds = "[...]" (재저장)
  │
  ├─ App의 useEffect
  │  ├─ hasShownWelcome = null
  │  ├─ toast.info("환영합니다!") 🟢 (첫 방문처럼)
  │  └─ localStorage: hasShownWelcomeToast = "true" (재저장)
  │
  └─ NotificationInbox
     ├─ lastReadId = null
     ├─ unreadCount = 5 (전부 미읽음)
     └─ 배지: 🔔 5

기대 동작: ✅ 완벽하게 초기화, 첫 방문처럼 작동
```

### 10.7 같은 ID 중복

```
상황: notifications.json에 같은 ID가 여러 개

[잘못된 JSON]
[
  { "id": "notice-001", "title": "공고 1" },
  { "id": "notice-002", "title": "공고 2" },
  { "id": "notice-001", "title": "공고 1 복제" }  ← 같은 ID!
]

실행 흐름:
  ├─ 첫 로드 시
  │  ├─ notifications = [notice-001(1), notice-002, notice-001(복제)]
  │  ├─ readDisplayedIds() → []
  │  ├─ newNotifications = [notice-001(1), notice-002, notice-001(복제)]
  │  ├─ forEach 루프:
  │  │  ├─ toast 1
  │  │  ├─ toast 2
  │  │  └─ toast 3 (ID가 같아도 계속 표시됨!)
  │  │
  │  └─ displayedIds = ["notice-001", "notice-002", "notice-001"]
  │     (배열에 중복 가능)
  │
  └─ 새로고침 후
     ├─ displayedIds.includes("notice-001") → true
     ├─ 둘 다 필터되므로 toast 표시 안 됨

기대 동작: ⚠️ 설계상 문제, JSON 데이터 유효성 검증 필요
          (ID는 유일해야 함)

해결책:
  - Set을 사용: new Set(displayedIds)
  - 또는 JSON 스키마 검증 (ID 유일성 보장)
```

### 10.8 Invalid JSON in localStorage

```
상황: localStorage에 손상된 JSON이 있음

localStorage.displayedNotificationIds = "not valid json"

실행 흐름:
  ├─ readDisplayedIds()
  │  ├─ stored = "not valid json"
  │  ├─ JSON.parse("not valid json")
  │  │  └─ 예외 발생: SyntaxError
  │  │
  │  └─ catch 블록 실행
  │     └─ return [] 🟢
  │
  ├─ 이후 정상 처리
  │  ├─ newNotifications = [모든 5개]
  │  └─ Toast 5개 표시

기대 동작: ✅ 에러 처리로 앱 크래시 방지
          처음 방문처럼 작동
```

---

## 11. 디자인 결정사항

### 11.1 왜 이 아키텍처가 좋은가?

#### 이점 1: 책임 분리 (Separation of Concerns)

```
❌ 나쁜 설계
App.tsx에 모든 로직
  ├─ JSON 로드
  ├─ localStorage 읽기
  ├─ Toast 표시
  ├─ 읽음 상태 추적
  └─ UI 렌더링

  → 1000줄짜리 파일
  → 각 부분이 서로 간섭
  → 수정하기 어려움

✅ 좋은 설계 (현재)
useNotifications.ts
  └─ JSON 로드만

useNotificationToast.ts
  └─ Toast 표시만

useNotificationRead.ts
  └─ 읽음 상태만

NotificationInbox.tsx
  └─ UI 렌더링만

App.tsx
  └─ 조율만

→ 각 파일이 작고 명확
→ 수정이 쉬움
→ 테스트 가능
```

#### 이점 2: 코드 재사용

```
useNotifications() 사용처
  ├─ useNotificationToast.ts (Toast용)
  ├─ NotificationInbox.tsx (UI용)
  └─ 나중에 추가할 컴포넌트들

→ 같은 hook을 여러 곳에서 사용
→ 데이터 로드 로직 중복 없음
→ JSON 변경 시 한 곳만 수정
```

#### 이점 3: 의존성 명확

```
파일 A가 필요한 것:
  import useNotifications from ...
  import { toast } from 'react-toastify'

→ 명시적
→ 없으면 컴파일 에러 → 빠른 피드백
→ 순환 의존성 방지 가능
```

#### 이점 4: 성능

```
메모리:
  - useNotifications의 배열은 재사용됨
  - 매번 새로운 배열 생성 안 함
  - Object reference 유지

렌더링:
  - useNotificationToast는 값 반환 안 함
  - App이 불필요한 리렌더링 안 됨
  - useNotificationRead는 state 반환
  - NotificationInbox만 리렌더링 (필요할 때)
```

### 11.2 대체 설계와 장단점

#### 대안 1: 전역 상태 관리 (Redux, Zustand)

```javascript
// Redux로 하면?
const store = createStore({
  notifications: useNotifications(),
  displayedIds: useSelector(state => state.displayedIds),
  setDisplayedIds: useDispatch(setDisplayedIds)
})

장점:
  ✅ 어디서나 state 접근 가능
  ✅ 시간 여행 디버깅
  ✅ DevTools 통합

단점:
  ❌ 보일러플레이트 많음 (reducer, actions)
  ❌ 번들 크기 증가
  ❌ 이 프로젝트는 상태가 단순 (overkill)
  ❌ localStorage로 충분한데 메모리 중복

결론: 현재 설계가 더 적합 (과도한 아키텍처 피함)
```

#### 대안 2: localStorage를 Server에서 관리

```javascript
// API 호출로 하면?
useEffect(() => {
  fetch('/api/displayed-notifications')
    .then(res => res.json())
    .then(displayedIds => {
      // 로직...
    })
}, [])

장점:
  ✅ 여러 기기 간 동기화 (클라우드)
  ✅ 영구 저장 가능

단점:
  ❌ 네트워크 지연
  ❌ 서버 비용
  ❌ 오프라인 불가
  ❌ 사용자 인증 필요

결론: 현재 localStorage로 충분
     나중에 필요하면 마이그레이션 가능
```

#### 대안 3: 소켓으로 실시간 알림

```javascript
// WebSocket으로 하면?
const socket = io('...')
socket.on('new-notification', (notification) => {
  if (!displayedIds.includes(notification.id)) {
    toast.success(notification.message)
  }
})

장점:
  ✅ 실시간 (파일 변경 즉시 감지)
  ✅ 다중 클라이언트 동기화

단점:
  ❌ 서버 필요
  ❌ 복잡도 증가
  ❌ JSON 파일로는 불가능 (static)

결론: 현재는 정적 JSON이므로 불필요
     나중에 API/DB로 전환 시 고려
```

### 11.3 왜 localStorage인가?

```javascript
선택지:
1. 메모리 변수
   ❌ 새로고침하면 사라짐
   → 항상 전부 toast 표시됨 (나쁨)

2. localStorage
   ✅ 영구 저장
   ✅ 오프라인 가능
   ✅ 구현 간단
   → 현재 선택 (좋음)

3. IndexedDB
   ✅ 용량 큼 (MB 단위)
   ✅ 객체 저장 가능
   ❌ 복잡
   ❌ 배열 ID 몇 개만 저장하므로 overkill

4. 서버
   ✅ 클라우드
   ❌ 네트워크 필요
   ❌ 서버 비용

결론: localStorage가 최적
     간단하면서도 충분한 기능
```

### 11.4 왜 ID 기반인가?

```javascript
선택지:
1. ID 기반 (현재)
   ├─ displayedIds = ["notice-001", "notice-002", ...]
   ├─ localStorage 크기: 작음
   ├─ 속도: 빠름 (includes는 O(n))
   └─ 알림 텍스트 수정 감지 안 함 (의도적)

2. 해시 기반
   ├─ displayedHashes = [hash1, hash2, ...]
   ├─ 텍스트 변경 감지 가능
   ├─ localStorage 크기: 조금 더 큼
   └─ 복잡도 증가

3. 타임스탬프 기반
   ├─ lastDisplayTime = 1689916800000
   ├─ displayTime 이후의 모든 알림 표시
   ├─ 단순함
   ├─ 하지만: 파일 수정 안 해도 새로고침하면 표시됨
   └─ 부정확

결론: ID 기반이 최적
     명확하고, 중복 방지되고, 간단함
```

---

이 문서가 도움이 되기를 바랍니다!
웹 알림 시스템의 모든 측면을 다루었습니다.

```

```
