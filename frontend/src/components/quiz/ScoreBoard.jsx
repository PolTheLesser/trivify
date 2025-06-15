import { useEffect, useState } from 'react';
import { fetchTopScores, fetchUserScore } from '../../services/scoreService';

/**
 * ScoreBoard-Komponente
 *
 * Diese Komponente zeigt die Top-Scoreliste sowie den persönlichen Punktestand
 * eines Benutzers (falls `userId` übergeben wurde).
 *
 * Funktionalitäten:
 * - Lädt und zeigt die Top 10 Spieler mit ihren Punktzahlen an
 * - Zeigt dem angemeldeten Nutzer (basierend auf `userId`) seinen eigenen Score und Rang an
 * - Wenn der Nutzer keine Punkte hat, erscheint ein entsprechender Hinweis
 * - Fußzeile informiert darüber, dass wiederholte oder eigene Quiz-Teilnahmen nicht gewertet werden
 */
const ScoreBoard = ({ userId }) => {
    const [topScores, setTopScores] = useState([]);
    const [myScore, setMyScore] = useState(null);

    useEffect(() => {
        fetchTopScores().then(setTopScores);
        if (userId) {
            fetchUserScore(userId).then(setMyScore);
        }
    }, [userId]);

    return (
        <div className="p-4 bg-white rounded shadow-md">
            <ol className="list-decimal list-inside space-y-1">
                {topScores.map((entry, index) => (
                    <li key={index}>
                        <span className="font-medium">{entry.username}</span>: {entry.score} {entry.score === 1 ? 'Punkt' : 'Punkte'}
                    </li>
                ))}
            </ol>
            {/* Eigener Score */}
            <div className="deep-container">
              {myScore && (
                  <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-200 w-full max-w-sm text-center">
                      {myScore.rank !== -1 ? (
                          <>
                              <strong>Dein Score:</strong> {myScore.score}{' '}
                              {myScore.score === 1 ? 'Punkt' : 'Punkte'}.
                              <br />
                              Du bist Platz <strong>{myScore.rank}</strong> im Ranking!
                          </>
                      ) : (
                          <div className="text-sm text-gray-500">
                              Du hast noch keine Punkte gesammelt. Starte ein Quiz!
                          </div>
                      )}
                  </div>
              )}
              <br />
              <p className="text-xs text-gray-500 mt-4 text-center">
                  Mehrfache Quiz-Teilnahmen &amp; Teilnahmen an eigenen Quizzen werden nicht
                  gezählt!
              </p>
            </div>
        </div>
    );
};

export default ScoreBoard;