import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";

/** index.js
 Einstiegspunkt der React-Anwendung. Diese Datei rendert die Haupt-App-Komponente und
 bindet globale Kontexte wie Authentifizierung und Theme-Management ein.

 Funktionalitäten:
 - Rendert die `App`-Komponente in das HTML-Element mit der ID `root`
 - Umgibt die gesamte App mit dem `AuthProvider` zur Verwaltung des Benutzerzustands
 - Integriert den `ThemeProvider` zur dynamischen Umschaltung zwischen Light- und Dark-Mode
 - Lädt globale CSS-Definitionen über `index.css`
 */
ReactDOM.render(
    <AuthProvider>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </AuthProvider>,
    document.getElementById("root")
);
