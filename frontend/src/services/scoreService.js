import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

/** ScoreService-API
 * Ein Service-Modul für die Kommunikation mit der Backend-API zur Abfrage von Quiz-Ergebnissen.
 * Bietet Funktionen zum Abrufen der besten Gesamtpunktzahlen sowie der individuellen Punktzahl eines Benutzers.
 *
 * Funktionalitäten:
 * - `fetchTopScores()`: Ruft die Liste der besten Quiz-Ergebnisse vom Server ab
 * - `fetchUserScore(userId)`: Holt die Punktzahl eines spezifischen Nutzers anhand der `userId`
 * - Verwendet `axios` für HTTP-Anfragen
 * - Nutzt die Umgebungsvariable `REACT_APP_API_URL` zur Konfiguration der API-Basis-URL
 */
export async function fetchTopScores() {
    const response = await axios.get(`${API_URL}/quiz-results/scores/top`);
    return response.data;
}

export async function fetchUserScore(userId) {
    const response = await axios.get(`${API_URL}/quiz-results/scores/user/${userId}`);
    return response.data;
}
