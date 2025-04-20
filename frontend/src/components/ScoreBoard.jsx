import { useEffect, useState } from 'react';
import { fetchTopScores, fetchUserScore } from '../services/scoreService';

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
                        <span className="font-medium">{entry.username}</span>: {entry.score} Punkte
                    </li>
                ))}
            </ol>

            {myScore && (
                <div className="mt-6 bg-blue-50 p-3 rounded border border-blue-200" color="text.secondary" align="center">
                    {myScore.rank !== -1 ? (
                        <>
                            <strong>Dein Score:</strong> {myScore.score} Punkte. Du bist Platz <strong>{myScore.rank}</strong> im Ranking!
                            <br />
                            <p>Mehrfache Quiz-Teilnahmen & Teilnahmen an eigenen Quizzen werden nicht gezählt!</p>
                        </>
                    ) : (
                        <div className="text-sm text-gray-500">
                            Du hast noch keine Punkte gesammelt. Starte ein Quiz!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScoreBoard;
