import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

async function bootstrap() {
  try {
    const res = await fetch('/config.json')
    const config = await res.json()
    window.__BOOKIO_API_URL__ = config.apiUrl
  } catch {
    window.__BOOKIO_API_URL__ = 'http://localhost:3000/api/v1'
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  )
}

bootstrap()
