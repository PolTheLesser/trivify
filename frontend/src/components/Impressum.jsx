import React from 'react';

export default function Impressum() {
    return (
        <div className="p-8 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Impressum</h1>

            <p>Angaben gemäß § 5 TMG:</p>
            <div className="mt-2 text-gray-700">
                Trivify Team<br />
                c/o Rheinische Hochschule Köln (RH Köln)<br />
                Schaevenstraße 1B<br />
                50676 Köln<br />
            </div>

            <h2 className="text-xl font-semibold mt-6">Vertreten durch:</h2>
            <p className="text-gray-700">Trivify Team</p>

            <h2 className="text-xl font-semibold mt-6">Kontakt:</h2>
            <p className="text-gray-700">
                E-Mail: <a href="mailto:quiz_rh@gmx.de" className="text-blue-600 underline">quiz_rh@gmx.de</a>
            </p>

            <h2 className="text-xl font-semibold mt-6">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h2>
            <div className="text-gray-700">
                Trivify Team<br />
                c/o Rheinische Hochschule Köln (RH Köln)<br />
                Schaevenstraße 1B<br />
                50676 Köln
            </div>
        </div>
    );
}
