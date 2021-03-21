import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import store from './store/configStore'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async';


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
