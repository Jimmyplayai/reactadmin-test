import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import AdminApp from './admin'
import App from './frontend/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 前台路由 */}
        <Route path="/" element={<App />} />

        {/* 后台路由 - /admin 开头的所有路径 */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* 404 重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)