import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'
import { registerServiceWorker } from './registerServiceWorker'

createRoot(document.getElementById('root')).render(<App />)

// Register service worker for PWA (minimal, safe to fail on unsupported browsers)
registerServiceWorker()
