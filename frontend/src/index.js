import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {AuthProvider} from "./contexts/AuthContext";
import {ThemeProvider} from "./contexts/ThemeContext";
import "./index.css";
import {register} from './serviceWorkerRegistration';
import OfflineBanner from './components/layout/OfflineBanner';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <>
        <OfflineBanner/>
        <React.StrictMode>
            <AuthProvider>
                <ThemeProvider>
                    <App/>
                </ThemeProvider>
            </AuthProvider>
        </React.StrictMode>
    </>
);

register();
