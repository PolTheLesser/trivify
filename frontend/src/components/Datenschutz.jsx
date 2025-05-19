import React from 'react';

export default function Datenschutz() {
    return (
        <div className="p-8 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center text-primary-700">Datenschutzerklärung</h1>
            <p className="mb-4 text-gray-700">
                Wir freuen uns über Ihr Interesse an Trivify. Der Schutz Ihrer Daten ist uns sehr wichtig. Nachfolgend
                informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer App.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-2 text-primary-600">1. Verantwortliche Stelle</h2>
            <div className="mb-4 text-gray-700">
                Trivify Team<br/>
                c/o Rheinische Hochschule Köln (RH Köln)<br/>
                Schaevenstraße 1B<br/>
                50676 Köln<br/>
                E-Mail: <a href="mailto:quiz_rh@gmx.de" className="text-blue-600 underline">quiz_rh@gmx.de</a>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-2 text-primary-600">2. Welche Daten werden verarbeitet?</h2>
            <ul className="list-disc list-inside mb-4 text-gray-700">
                <li>Registrierungsdaten (Name, E-Mail-Adresse, Passwort)</li>
                <li>Quiz-Aktivitäten (z. B. beantwortete Fragen, Streaks, Punkte)</li>
                <li>Einstellungen (z. B. Erinnerungsfunktion für das tägliche Quiz)</li>
                <li>Kommunikationsdaten (z. B. E-Mail-Benachrichtigungen)</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-2 text-primary-600">3. Zweck der Datenverarbeitung</h2>
            <ul className="list-disc list-inside mb-4 text-gray-700">
                <li>Betrieb und Verbesserung der Quiz-Plattform</li>
                <li>Versand von Erinnerungs- und Streak-E-Mails (sofern aktiviert)</li>
                <li>Auswertung der Nutzung zur Optimierung des Angebots</li>
                <li>Fehleranalyse und Sicherheit</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-2 text-primary-600">4. Weitergabe von Daten</h2>
            <p className="mb-4 text-gray-700">
                Ihre Daten werden nicht an Dritte weitergegeben, außer es besteht eine gesetzliche Verpflichtung oder
                Sie haben ausdrücklich eingewilligt. Die Quizfragen werden teilweise automatisiert durch einen externen
                KI-Service generiert; dabei werden jedoch keine personenbezogenen Daten übermittelt.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-2 text-primary-600">5. Ihre Rechte</h2>
            <ul className="list-disc list-inside mb-4 text-gray-700">
                <li>Auskunft über Ihre gespeicherten Daten</li>
                <li>Berichtigung oder Löschung Ihrer Daten</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Widerspruch gegen die Verarbeitung</li>
                <li>Datenübertragbarkeit</li>
            </ul>
            <p className="mb-4 text-gray-700">
                Für die Ausübung Ihrer Rechte oder bei Fragen zum Datenschutz schreiben Sie uns an <a
                href="mailto:datenschutz@quiz-app.de" className="text-blue-600 underline">datenschutz@quiz-app.de</a>.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-2 text-primary-600">6. Änderungen</h2>
            <p className="mb-4 text-gray-700">
                Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren. Die aktuelle Version
                finden Sie jederzeit in der App.
            </p>

            <p className="mt-8 text-sm text-gray-500 text-center">Stand: 18. April 2025</p>
        </div>
    );
}
