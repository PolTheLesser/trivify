import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
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
import {useAuth} from '../../contexts/AuthContext';
import {CustomFormControlLabel} from '../../CustomElements'

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
    const {id} = useParams();
    const {user} = useAuth();
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const storageKey = `quiz-${id}-answers`;
    const savedIndex = localStorage.getItem(`${storageKey}-currentQuestionIndex`);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
        return savedIndex !== null ? Number(savedIndex) : 0;
    });
    const [answers, setAnswers] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : {};
    });
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [wrongAnswers, setWrongAnswers] = useState([]);
    const [stars, setStars] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const userId = user?.id;
    const quizId = quiz?.id;
    const maxPossibleScore = quiz?.questions.length;
    const isDailyQuiz = quiz?.categories.includes("DAILY_QUIZ") || false;

    const handleAnswerSelect = (e) => {
        updateAnswer(currentQuestionIndex, e.target.value);
    };

    const handleTextChange = (e) => {
        updateAnswer(currentQuestionIndex, e.target.value);
    };

    const recalculateScore = async (answersObject) => {
        let correctCount = 0;
        const updatedWrongAnswers = [];

        for (let i = 0; i < quiz.questions.length; i++) {
            const question = quiz.questions[i];
            const userAnswer = answersObject[i];
            if (!userAnswer) continue;

            try {
                const res = await axios.post(
                    `/${quiz.id}/submit`,
                    {questionId: question.id, answer: userAnswer}
                );

                if (res.data.correct) {
                    correctCount += 1;
                } else {
                    updatedWrongAnswers.push({
                        question: question.question,
                        selectedAnswer: userAnswer,
                        correctAnswer: res.data.correctAnswer || question.correctAnswer || 'N/V'
                    });
                }
            } catch (err) {
                console.error('Fehler bei Re-Scoring:', err);
            }
        }

        setScore(correctCount);
        setWrongAnswers(updatedWrongAnswers);
        return correctCount;
    };

    const handleNext = async () => {
        const selectedAnswer = answers[currentQuestionIndex];
        if (!selectedAnswer) return;

        const updatedAnswers = {...answers};
        const question = quiz.questions[currentQuestionIndex];

        try {
            await axios.post(
                `/${quiz.id}/submit`,
                {questionId: question.id, answer: selectedAnswer}
            );

            // Neu berechnen, auch für korrigierte Antworten
            const newScore = await recalculateScore(updatedAnswers);

            if (currentQuestionIndex === quiz.questions.length - 1) {
                setShowResults(true);

                if (user) {
                    try {
                        await axios.post('/quiz-results', {
                            userId,
                            quizId,
                            score: newScore,
                            maxPossibleScore
                        });
                        console.log('Score gespeichert:', newScore);
                    } catch (error) {
                        console.error('Fehler beim Speichern des Scores:', error);
                    }
                }

                localStorage.removeItem(storageKey);
                localStorage.removeItem(`${storageKey}-currentQuestionIndex`);
            } else {
                updateCurrentQuestionIndex(prev => prev + 1);
            }

        } catch (err) {
            setError('Fehler beim Einreichen der Antwort');
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            updateCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleCancel = () => {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}-currentQuestionIndex`);
        navigate('/quizzes');
    }

    const updateAnswer = (questionIndex, answer) => {
        setAnswers(prev => {
            const updated = {...prev, [questionIndex]: answer};
            localStorage.setItem(storageKey, JSON.stringify(updated));
            return updated;
        });
    };

    const updateCurrentQuestionIndex = (updater) => {
        setCurrentQuestionIndex(prevIndex => {
            const newIndex = typeof updater === 'function' ? updater(prevIndex) : updater;
            localStorage.setItem(`${storageKey}-currentQuestionIndex`, newIndex);
            return newIndex;
        });
    };

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`/${id}`);
                setQuiz(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Quiz konnte nicht geladen werden');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!quiz) {
        return (
            <Container>
                <Alert severity="error">Quiz nicht gefunden</Alert>
            </Container>
        );
    }
    // Rating ans Backend senden
    const submitRating = async () => {
        if (stars < 1) return;
        setSubmitting(true);
        try {
            await axios.post(`/quizzes/${quiz.id}/rate`, {rating: stars});
            // Optional: nach dem Raten zurück zur Liste
            navigate('/quizzes', {state: {justRated: true}});
        } catch (err) {
            setError(err.response?.data?.message || 'Fehler beim Absenden der Bewertung');
            setSubmitting(false);
        }
    };

    if (showResults) {
        return (
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{p: 4, mt: 4}}>
                    <Typography variant="h4" gutterBottom>
                        Quiz beendet!
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                        Dein
                        Ergebnis: {score} von {quiz.questions.length} {quiz.questions.length === 1 ? 'Punkt' : 'Punkten'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Prozent: {((score / quiz.questions.length) * 100).toFixed(1)}%
                    </Typography>
                    {wrongAnswers.length > 0 && (
                        <Box sx={{mt: 3}}>
                            <Typography variant="h6" gutterBottom>
                                Falsche Antworten:
                            </Typography>
                            {wrongAnswers.map((wrongAnswer, index) => (
                                <Box key={index} sx={{mb: 2}}>
                                    <Typography variant="body1">
                                        <strong>Frage:</strong> {wrongAnswer.question}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Deine Antwort:</strong> {wrongAnswer.selectedAnswer}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Korrekte Antwort:</strong> {wrongAnswer.correctAnswer}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                    {user && quiz.creator?.id !== user.id ? (
                        <Box sx={{mt: 4}}>
                            <Typography variant="h6">Bewerte dieses Quiz:</Typography>
                            <Rating
                                name="after-quiz-rating"
                                value={stars}
                                onChange={(_, val) => setStars(val)}
                            />
                            <br/>
                            <Box sx={{mt: 4, display: 'flex', gap: 2}}>
                                <Button
                                    variant="contained"
                                    onClick={submitRating}
                                    disabled={stars < 1 || submitting}
                                >
                                    Absenden
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate("/quizzes")}
                                >
                                    Zurück zur Quiz-Liste
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{mt: 4}}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate("/quizzes")}
                            >
                                Zurück zur Quiz-Liste
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        );
    }

    const question = quiz.questions[currentQuestionIndex];
    // Debug: welche Daten kommen an?
    console.log('Aktuelle Frage:', question);
    console.log('question.type:', question.type);

    // Entscheide, ob wir Text-Input oder Radio-Buttons zeigen
    const isTextInput =
        question.type === 'TEXT_INPUT' ||
        question.type === 'TEXT' ||           // falls dein Backend "TEXT" liefert
        (Array.isArray(question.answers) && question.answers.length === 0);

    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{p: 4, mt: 4}}>
                <Typography variant="h5" gutterBottom>
                    {quiz.title}
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{mb: 3}}/>
                <Typography variant="body1" gutterBottom>
                    Frage {currentQuestionIndex + 1} von {quiz.questions.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    {question.question}
                </Typography>

                <FormControl component="fieldset" sx={{mt: 2}}>
                    {isTextInput ? (
                        <TextField
                            fullWidth
                            label="Deine Antwort"
                            value={answers[currentQuestionIndex] || ''}
                            onChange={handleTextChange}
                            autoFocus
                        />
                    ) : (
                        <RadioGroup value={answers[currentQuestionIndex] || ''} onChange={handleAnswerSelect}>
                            {question.answers.map((answer, idx) => (
                                <CustomFormControlLabel
                                    key={idx}
                                    value={answer}
                                    control={<Radio/>}
                                    label={answer}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </FormControl>

                <Box sx={{mt: 3, display: "flex", justifyContent: "space-between"}}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                    >
                        Zurück
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        disabled={!answers[currentQuestionIndex]}
                    >
                        {currentQuestionIndex === quiz.questions.length - 1 ? "Beenden" : "Weiter"}
                    </Button>
                </Box>
                <Box sx={{mt: 2, display: 'flex', justifyContent: 'center'}}>
                    <Button variant="outlined" color="error" onClick={handleCancel}>
                        Abbrechen
                    </Button>
                </Box>
                {isDailyQuiz && (
                    <>
                        <br/>
                        <Alert severity="warning" sx={{mb: 3}}>
                            Hinweis: Die Fragen werden von einer KI generiert und können Fehler enthalten.
                        </Alert>
                        <br/>
                    </>
                )} </Paper>
        </Container>
    );
};

export default PlayQuiz;
