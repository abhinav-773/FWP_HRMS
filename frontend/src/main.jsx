import React from 'react'
import ReactDOM from 'react-dom/client'

import { Provider } from 'react-redux'
import { store } from './store'
import App from './App.jsx'
import { SocketProvider } from './contexts/SocketContext'
import ErrorBoundary from './components/layout/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <SocketProvider>
          <ThemeProvider>
            <App />
            <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 5000,
              style: {
                background: 'rgba(31, 41, 55, 0.9)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
              }
            }}
          />
          </ThemeProvider>
        </SocketProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
