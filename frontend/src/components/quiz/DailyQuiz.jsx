import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    LinearProgress,
    Paper,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';
import axios from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { CustomFormControlLabel } from '../../CustomElements';

/**
 * DailyQuiz-Komponente
 *
 * Diese Komponente lädt ein tägliches Quiz vom Server und ermöglicht dem Benutzer,
 * die Fragen nacheinander zu beantworten. Die Antworten werden lokal im
 * localStorage zwischengespeichert, sodass der Fortschritt erhalten bleibt.
 * Nach Beendigung des Quiz wird das Ergebnis angezeigt und bei angemeldeten
 * Benutzern auf dem Server gespeichert.
 *
 * Funktionalitäten:
 * - Laden des täglichen Quiz vom Backend
 * - Fortschrittsanzeige mit LinearProgress
 * - Anzeige einer Frage mit mehreren Antwortoptionen (Multiple Choice)
 * - Speicherung der Antworten und des aktuellen Fragenindex im localStorage
 * - Überprüfung der Antworten durch Backend-API (Submit)
 * - Berechnung und Anzeige der Gesamtpunktzahl nach Abschluss
 * - Anzeige falscher Antworten mit Korrekturen
 * - Navigation zwischen Fragen (Weiter, Zurück)
 * - Möglichkeit zum Abbrechen und Zurückkehren zur Quiz-Übersicht
 * - Fehlerbehandlung und Ladeindikatoren
 * - Hinweis, dass die Fragen KI-generiert sind und Fehler enthalten können
 */
const DailyQuiz = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `quiz-${today}-answers`;
    const savedIndex = localStorage.getItem(`${storageKey}-currentQuestionIndex`);

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : {};
    });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
        savedIndex !== null ? Number(savedIndex) : 0
    );
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState([]);

    useEffect(() => {
        const fetchDailyQuiz = async () => {
            try {
                const response = await axios.get('/daily');
                setQuiz(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Fehler beim Laden des täglichen Quiz');
            } finally {
                setLoading(false);
            }
        };
        fetchDailyQuiz();
    }, []);

    const updateAnswer = (idx, val) => {
        setAnswers(prev => {
            const next = { ...prev, [idx]: val };
            localStorage.setItem(storageKey, JSON.stringify(next));
            return next;
        });
    };

    const updateCurrentQuestionIndex = newIdx => {
        setCurrentQuestionIndex(newIdx);
        localStorage.setItem(`${storageKey}-currentQuestionIndex`, newIdx);
    };

    const handleNext = () => {
        updateCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    const handleFinish = async () => {
        try {
            const res = await axios.post(`/${quiz.id}/submit-all`, {
                answers
            });
            setScore(res.data.score);
            setWrongAnswers(res.data.wrongAnswers);
            setShowResults(true);

            if (user) {
                await axios.get('/daily/completion-status', { userId: user.id });
                await axios.post('/quiz-results', {
                    userId: user.id,
                    quizId: quiz.id,
                    score: res.data.score,
                    maxPossibleScore: res.data.maxScore
                });
            }

            localStorage.removeItem(storageKey);
            localStorage.removeItem(`${storageKey}-currentQuestionIndex`);
        } catch {
            setError('Fehler beim Absenden des Quiz');
        }
    };

    const handleCancel = () => {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}-currentQuestionIndex`);
        navigate('/quizzes');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ px: 2 }}>
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!quiz || quiz.questions.length === 0) {
        return (
            <Box sx={{ px: 2 }}>
                <Alert severity="info" sx={{ mt: 4 }}>
                    Kein tägliches Quiz verfügbar. Bitte später wiederkommen!
                </Alert>
            </Box>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === quiz.questions.length - 1;
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <Box sx={{ px: 2, maxWidth: '100vw', overflowX: 'hidden' }}>
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Tägliches Quiz
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />

                {showResults ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Quiz beendet!
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            Dein Ergebnis: {score} von {quiz.questions.length} Punkten
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Prozent: {((score / quiz.questions.length) * 100).toFixed(1)}%
                        </Typography>
                        {wrongAnswers.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Falsche Antworten:
                                </Typography>
                                {wrongAnswers.map((wrong, idx) => (
                                    <Box key={idx} sx={{ mb: 2 }}>
                                        <Typography variant="body1">
                                            <strong>Frage:</strong> {wrong.question}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Deine Antwort:</strong> {wrong.userAnswer}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Korrekte Antwort:</strong> {wrong.correctAnswer}
                                        </Typography
                                        >
                                    </Box>
                                ))}
                            </Box>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button variant="contained" onClick={() => navigate('/quizzes')}>
                                Zurück zur Quiz-Liste
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Frage {currentQuestionIndex + 1} von {quiz.questions.length}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {currentQuestion.question}
                        </Typography>

                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                            <RadioGroup
                                value={answers[currentQuestionIndex] || ''}
                                onChange={e => updateAnswer(currentQuestionIndex, e.target.value)}
                            >
                                {currentQuestion.answers.map((answer, idx) => (
                                    <CustomFormControlLabel
                                        key={idx}
                                        value={answer}
                                        control={<Radio />}
                                        label={answer}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => updateCurrentQuestionIndex(currentQuestionIndex - 1)}
                                disabled={currentQuestionIndex === 0}
                            >
                                Zurück
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={isLast ? handleFinish : handleNext}
                                disabled={!answers[currentQuestionIndex]}
                            >
                                {isLast ? 'Fertig' : 'Weiter'}
                            </Button>
                        </Box>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button variant="outlined" color="error" onClick={handleCancel}>
                                Abbrechen
                            </Button>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                Hinweis: Die Fragen werden von einer KI generiert und können Fehler enthalten.
                            </Alert>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default DailyQuiz;