// 앱 진입점: React 루트를 마운트하고, 시작 시 houses.json 구조를 한 번 검증한다.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import houses from './data/houses.json'
import { validateHtmlToHouseMapping } from './debug/validateHtmlToHouseMapping'
import { filterHouses } from './lib/filterHouses' // 개발자도구 임시 테스트 코드. 추후 삭제


// HTML -> House[] 매핑이 올바른지 앱 시작 시 한 번만 검증한다.
validateHtmlToHouseMapping(houses)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 개발자도구 임시 테스트 코드. 추후 삭제
(window as any).houses = houses;
(window as any).filterHouses = filterHouses;