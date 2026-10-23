import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/site.css'   // the website's look (fonts are stored on our own site)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
