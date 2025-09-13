import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/bootstrap-custom.css';
import './styles/globals.css';
import './index.css';
import App from './App';
import { store } from './redux/store';
import { setupAxiosInterceptors } from './services/apiService'; 

import { Provider } from 'react-redux';
setupAxiosInterceptors(store);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
