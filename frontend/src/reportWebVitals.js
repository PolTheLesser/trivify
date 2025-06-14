/** reportWebVitals
 Hilfsfunktion zur Messung und Weitergabe von Leistungsmetriken (Web Vitals)
 in einer React-Anwendung. Sie ermöglicht es, Kennzahlen zur Nutzererfahrung
 (z. B. Ladezeit oder Interaktivität) zu erfassen und weiterzuverarbeiten.

 Funktionalitäten:
 - Prüft, ob eine gültige Callback-Funktion (`onPerfEntry`) übergeben wurde
 - Lädt dynamisch das `web-vitals`-Modul zur Performancemessung
 - Führt Messfunktionen wie `getCLS`, `getFID`, `getFCP`, `getLCP`, `getTTFB` aus und übergibt die Ergebnisse an den Callback
 - Ermöglicht die Integration von Performance-Tracking in externe Dienste oder Logging-Mechanismen
 */
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals; 