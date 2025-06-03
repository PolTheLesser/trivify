import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {AuthProvider} from './contexts/AuthContext';
import {ThemeProvider} from './contexts/ThemeContext';
import './index.css';
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

/** main.jsx
 Einstiegspunkt der React-Anwendung unter Verwendung von React 18 mit `createRoot`.
 Die Datei bindet globale Kontexte für Authentifizierung und Theme sowie Entwicklungs-Tools
 wie `@react-buddy` zur Vorschau und Unterstützung während der Entwicklung ein.

 Funktionalitäten:
 - Rendert die `App`-Komponente im StrictMode zur frühzeitigen Fehlererkennung
 - Verwendet `AuthProvider` zur globalen Verwaltung des Benutzerzustands
 - Nutzt `ThemeProvider` zur Bereitstellung und Synchronisation des Dark-/Light-Modes
 - Integriert `DevSupport` von `@react-buddy` zur Anzeige von Komponenten-Vorschauen und Initialisierungen während der Entwicklung
 - Lädt globale CSS-Styles über `index.css`
 */
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <ThemeProvider>
                <DevSupport ComponentPreviews={ComponentPreviews}
                            useInitialHook={useInitial}
                >
                    <App/>
                </DevSupport>
            </ThemeProvider>
        </AuthProvider>
    </React.StrictMode>
);
