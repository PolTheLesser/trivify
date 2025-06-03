import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

/** ThemeProvider (mit ThemeContext)
 * Ein globaler Theme-Context-Provider zur Verwaltung des Dark-Mode-Zustands in der Anwendung.
 * Er berücksichtigt sowohl lokale Benutzereinstellungen als auch systemweite Präferenzen und
 * speichert den Zustand im `localStorage` zur Persistenz zwischen Sitzungen.
 *
 * Funktionalitäten:
 * - Initiale Theme-Erkennung über `localStorage` oder systemweite Farbmodus-Einstellung
 * - Reagiert dynamisch auf Änderungen der systemweiten Dark-Mode-Präferenz (z. B. durch Betriebssystem oder Browser)
 * - Aktualisiert die `classList` von `<body>` automatisch mit/ohne `dark`-Klasse
 * - Speichert den gewählten Modus im `localStorage`
 * - Stellt `darkMode`-Status und Setter-Funktion `setDarkMode` über `ThemeContext` zur Verfügung
 */
export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const stored = localStorage.getItem('darkMode');
        if (stored !== null) return stored === 'true';
        // system preference fallback
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (localStorage.getItem('darkMode') === null) {
                setDarkMode(e.matches);
            }
        };
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);


    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}
