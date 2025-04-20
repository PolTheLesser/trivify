import React from 'react';

export default function Impressum() {
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Impressum</h1>
            <p>Angaben gemäß § 5 TMG:</p>
            <p className="mt-2">
                Quiz-App GmbH<br />
                Musterstraße 1<br />
                12345 Musterstadt<br />
            </p>
            <h2 className="text-xl font-semibold mt-6">Vertreten durch:</h2>
            <p>Max Mustermann (Geschäftsführer)</p>
            <h2 className="text-xl font-semibold mt-6">Kontakt:</h2>
            <p>
                Telefon: +49 123 4567890<br />
                E-Mail: info@quiz-app.de
            </p>
            <h2 className="text-xl font-semibold mt-6">Umsatzsteuer-ID:</h2>
            <p>DE123456789</p>
            <h2 className="text-xl font-semibold mt-6">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h2>
            <p>
                Max Mustermann<br />
                Musterstraße 1<br />
                12345 Musterstadt
            </p>
        </div>
    );
}