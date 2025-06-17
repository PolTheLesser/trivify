// src/components/quiz/PlayQuiz.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    LinearProgress,
    Paper,
    Radio,
    RadioGroup,
    Rating,
    TextField,
    Typography
} from '@mui/material';
import axios from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { CustomFormControlLabel } from '../../CustomElements';

/**
 * PlayQuiz-Komponente
 *
 * Diese Komponente ermöglicht das Spielen eines Quiz mit mehreren Fragen.
 * Sie lädt das Quiz vom Backend, verwaltet den Fortschritt, speichert Antworten lokal und zeigt am Ende die Ergebnisse an.
 * Der Nutzer kann Fragen mit Multiple-Choice- oder Textantworten beantworten und seine Antworten speichern, navigieren und das Quiz abschließen.
 * Nach Abschluss kann das Ergebnis bewertet und an den Server gesendet werden.
 *
 * Funktionalitäten:
 * - Laden eines Quiz per API anhand der URL-Parameter (Quiz-ID)
 * - Anzeige von Fragen mit Unterstützung für Text- und Multiple-Choice-Antworten
 * - Speicherung des aktuellen Fortschritts und der Antworten im localStorage zur Wiederherstellung
 * - Navigation zwischen Fragen (vorwärts und rückwärts)
 * - Einreichen der Antworten an das Backend zur Bewertung einzelner Fragen
 * - Anzeige des Endergebnisses mit Punktzahl, falschen Antworten und prozentualer Bewertung
 * - Speichern des Ergebnisses für angemeldete Nutzer auf dem Server
 * - Möglichkeit, das Quiz zu bewerten (Sternebewertung) nach Abschluss
 * - Fehlerbehandlung und Ladezustände während der API-Kommunikation
 */
const PlayQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const storageKey = `quiz-${id}-answers`;
    const savedIdx = localStorage.getItem(`${storageKey}-currentQuestionIndex`);

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : {};
    });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
        savedIdx !== null ? Number(savedIdx) : 0
    );
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState([]);
    const [stars, setStars] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`/${id}`);
                setQuiz(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Quiz konnte nicht geladen werden');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const updateAnswer = (questionId, answer) => {
        setAnswers(prev => {
            const next = { ...prev, [questionId]: answer };
            localStorage.setItem(storageKey, JSON.stringify(next));
            return next;
        });
    };

    const updateCurrentQuestionIndex = idx => {
        setCurrentQuestionIndex(idx);
        localStorage.setItem(`${storageKey}-currentQuestionIndex`, idx);
    };

    const handleNext = () => updateCurrentQuestionIndex(currentQuestionIndex + 1);

    const handleFinish = async () => {
        try {
            const res = await axios.post(`/${quiz.id}/submit-all`, { answers });
            setScore(res.data.score);
            setWrongAnswers(res.data.wrongAnswers);
            setShowResults(true);

            if (user) {
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

    const submitRating = async () => {
        if (stars < 1) return;
        setSubmitting(true);
        try {
            await axios.post(`/quizzes/${quiz.id}/rate`, { rating: stars });
            navigate('/quizzes', { state: { justRated: true } });
        } catch {
            setError('Fehler beim Absenden der Bewertung');
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
        </Box>
    );
    if (error) return (
        <Container>
            <Alert severity="error">{error}</Alert>
        </Container>
    );
    if (!quiz) return (
        <Container>
            <Alert severity="error">Quiz nicht gefunden</Alert>
        </Container>
    );

    const question = quiz.questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === quiz.questions.length - 1;
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const isTextInput =
        question.type === 'TEXT_INPUT' ||
        question.type === 'TEXT' ||
        (Array.isArray(question.answers) && question.answers.length === 0);
    const isDailyQuiz = quiz.categories.includes('DAILY_QUIZ');

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                {showResults ? (
                    <>
                        <Typography variant="h4" gutterBottom>Quiz beendet!</Typography>
                        <Typography variant="h5" gutterBottom>
                            Dein Ergebnis: {score} von {quiz.questions.length} {quiz.questions.length === 1 ? 'Punkt' : 'Punkten'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Prozent: {((score / quiz.questions.length) * 100).toFixed(1)}%
                        </Typography>
                        {wrongAnswers.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>Falsche Antworten:</Typography>
                                {wrongAnswers.map((wrong, idx) => (
                                    <Box key={idx} sx={{ mb: 2 }}>
                                        <Typography variant="body1"><strong>Frage:</strong> {wrong.question}</Typography>
                                        <Typography variant="body1"><strong>Deine Antwort:</strong> {wrong.userAnswer}</Typography>
                                        <Typography variant="body1"><strong>Korrekte Antwort:</strong> {wrong.correctAnswer}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                        {!isDailyQuiz && user && quiz.creator?.id !== user.id && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6">Bewerte dieses Quiz:</Typography>
                                <Rating value={stars} onChange={(_, v) => setStars(v)} />
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    <Button variant="contained" onClick={submitRating} disabled={stars < 1 || submitting}>
                                        Absenden
                                    </Button>
                                    <Button onClick={() => navigate('/quizzes')}>Zurück</Button>
                                </Box>
                            </Box>
                        )}
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Button onClick={() => navigate('/quizzes')}>Zurück zur Quiz-Liste</Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom>{quiz.title}</Typography>
                        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
                        <Typography>Frage {currentQuestionIndex + 1} von {quiz.questions.length}</Typography>
                        <Typography variant="h6" gutterBottom>{question.question}</Typography>
                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                            {isTextInput ? (
                                <TextField
                                    fullWidth
                                    label="Deine Antwort"
                                    value={answers[question.id] || ''}
                                    onChange={e => updateAnswer(question.id, e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <RadioGroup
                                    value={answers[question.id] || ''}
                                    onChange={e => updateAnswer(question.id, e.target.value)}
                                >
                                    {question.answers.map((ans, i) => (
                                        <CustomFormControlLabel key={i} value={ans} control={<Radio />} label={ans} />
                                    ))}
                                </RadioGroup>
                            )}
                        </FormControl>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="outlined" onClick={() => updateCurrentQuestionIndex(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>
                                Zurück
                            </Button>
                            <Button variant="contained" on Click={isLast ? handleFinish : handleNext} disabled={!answers[question.id]}>
                                {isLast ? 'Beenden' : 'Weiter'}
                            </Button>
                        </Box>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Button variant="outlined" color="error" onClick={handleCancel}>Abbrechen</Button>
                        </Box>
                        {isDailyQuiz && (
                            <Alert severity="warning" sx={{ mt: 3 }}>Hinweis: Die Fragen werden von einer KI generiert und können Fehler enthalten.</Alert>
                        )}
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default PlayQuiz;
