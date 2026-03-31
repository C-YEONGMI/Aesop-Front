import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import App from './app/App.jsx';
import store from './app/store';
import AuthBootstrap from './app/providers/AuthBootstrap.jsx';
import './globals.scss';
import './index.css';

const root = createRoot(document.getElementById('root'));
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

root.render(
    <StrictMode>
        <Provider store={store}>
            <AuthBootstrap>
                <GoogleOAuthProvider clientId={googleClientId}>
                    <App />
                </GoogleOAuthProvider>
            </AuthBootstrap>
        </Provider>
    </StrictMode>
);
