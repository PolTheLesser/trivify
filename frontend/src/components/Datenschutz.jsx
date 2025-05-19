import React from 'react';

export default function Datenschutz() {
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Datenschutzerklärung</h1>
            <p>
                Wir freuen uns über Ihr Interesse an unserer Quiz-App. Der Schutz Ihrer Privatsphäre ist uns sehr wichtig.
            </p>
            <h2 className="text-xl font-semibold mt-6">1. Verantwortliche Stelle</h2>
            <p>
                Verantwortlich im Sinne der Datenschutzgesetze ist:<br />
                Quiz-App GmbH<br />
                Musterstraße 1<br />
                12345 Musterstadt<br />
                E-Mail: datenschutz@quiz-app.de
            </p>
            <h2 className="text-xl font-semibold mt-6">2. Erfassung und Verarbeitung personenbezogener Daten</h2>
            <p>
                Wir erheben personenbezogene Daten, wenn Sie sich registrieren, einloggen oder unsere App nutzen. Dazu gehören Name, E-Mail-Adresse und ggf. Ihre Quiz-Aktivitäten.
            </p>
            <h2 className="text-xl font-semibold mt-6">3. Zwecke der Datenverwendung</h2>
            <ul className="list-disc list-inside">
                <li>Bereitstellung und Betrieb der Quiz-Plattform</li>
                <li>Versand von Bestätigungs- und Erinnerungs-E-Mails (z.B. tägliches Quiz)</li>
                <li>Analyse zur Verbesserung unseres Angebots</li>
            </ul>
            <h2 className="text-xl font-semibold mt-6">4. Weitergabe von Daten</h2>
            <p>
                Eine Weitergabe Ihrer Daten an Dritte erfolgt nur, wenn dies gesetzlich vorgeschrieben ist oder Sie eingewilligt haben.
            </p>
            <h2 className="text-xl font-semibold mt-6">5. Ihre Rechte</h2>
            <p>
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Wenden Sie sich hierzu an quiz_rh@gmx.de
            </p>
            <h2 className="text-xl font-semibold mt-6">6. Änderungen dieser Datenschutzerklärung</h2>
            <p>
                Wir behalten uns vor, diese Erklärung anzupassen. Die jeweils aktuelle Version finden Sie jederzeit auf unserer Webseite.
            </p>
            <p className="mt-6">Stand: 18. April 2025</p>
        </div>
    );
}
