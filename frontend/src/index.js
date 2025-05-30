import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {AuthProvider} from "./contexts/AuthContext";
import {ThemeProvider} from "./contexts/ThemeContext";
import "./index.css";
import {register} from './serviceWorkerRegistration';
import ServerDownBanner from "./components/layout/ServerDownBanner";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <>
        <ServerDownBanner/>
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
