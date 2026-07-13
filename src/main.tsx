import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import houses from './data/houses.json'
import { validateHtmlToHouseMapping } from './debug/validateHtmlToHouseMapping'


// HTML -> House[] 매핑이 올바른지 앱 시작 시 한 번만 검증한다.
validateHtmlToHouseMapping(houses)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)