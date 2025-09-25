import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'react-toastify/dist/ReactToastify.css'
// Soc Trang Design System - Import order is important
import './styles/bootstrap-custom.css'  // Design system variables and Bootstrap overrides
import './styles/index.css'             // Base typography and global styles
import './styles/components.css'        // Component-specific styles
import './styles/utilities.css'         // Utility classes
import './styles/header-footer.css'     // Legacy header/footer styles


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)