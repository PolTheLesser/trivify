import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
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
import axios from '../api/api';
import {useAuth} from '../contexts/AuthContext';
import {CustomFormControlLabel} from '../CustomElements'

const DailyQuiz = () => {
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const storageKey = `quiz-${today}-answers`;
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
    const [completed, setCompleted] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState([]);
    const {user} = useAuth();

    useEffect(() => {
        const fetchDailyQuiz = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_API_URL + '/daily');
                const data = response.data;

                console.log('Geladene Quiz-Daten:', data);
                if (data && data.questions && data.questions[0]) {
                    console.log('Erste Frage:', data.questions[0]);
                    console.log('Antworten der ersten Frage:', data.questions[0].answers);
                }

                setQuiz(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Fehler beim Laden des täglichen Quiz');
                setLoading(false);
            }
        };

        fetchDailyQuiz();
    }, []);

    const handleAnswerSelect = (e) => {
        updateAnswer(currentQuestionIndex, e.target.value);
    };

    const handleSubmit = async () => {
        const selectedAnswer = answers[currentQuestionIndex];
        if (!selectedAnswer) return;
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const quizid = quiz.id;

        try {
            const response = await axios.post(
                process.env.REACT_APP_API_URL + '/' + quizid + '/submit',
                {questionId: currentQuestion.id, answer: selectedAnswer}
            );

            const isCorrect = response.data.correct;

            if (isCorrect) {
                setScore(prev => prev + 1);
            } else {
                const correctAnswer = response.data.correctAnswer || currentQuestion.correctAnswer || 'N/V';
                setWrongAnswers(prev => [
                    ...prev,
                    {
                        question: currentQuestion.question,
                        selectedAnswer,
                        correctAnswer
                    }
                ]);
            }

            if (currentQuestionIndex < quiz.questions.length - 1) {
                updateCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                const finalScore = score + (isCorrect ? 1 : 0); // letzter Punkt wird direkt dazugerechnet

                setCompleted(true);

                const userId = user?.id;
                const quizId = quiz?.id;
                const maxPossibleScore = quiz?.questions?.length;
                if (user) {
                    await axios.post(process.env.REACT_APP_API_URL + '/users/daily-quiz/completed');
                    await axios.post(process.env.REACT_APP_API_URL + '/quiz-results', {
                        userId,
                        quizId,
                        score: finalScore,
                        maxPossibleScore
                    });
                }
                console.log('Tägliches Quiz abgeschlossen & Score gespeichert');
                localStorage.removeItem(storageKey);
                localStorage.removeItem(`${storageKey}-currentQuestionIndex`);
            }
        } catch (err) {
            console.error(err.response?.data?.message || 'Fehler beim Einreichen der Antwort oder Speichern des Scores:', err);
            setError(err.response?.data?.message || 'Fehler beim Einreichen der Antwort');
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            updateCurrentQuestionIndex(currentQuestionIndex - 1);
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

    const updateCurrentQuestionIndex = (newIndex) => {
        setCurrentQuestionIndex(newIndex);
        localStorage.setItem(`${storageKey}-currentQuestionIndex`, newIndex);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{width: "100%", maxWidth: "100vw", overflowX: "hidden", px: 2}}>
                <Alert severity="error" sx={{mt: 4}}>{error}</Alert>
            </Box>
        );
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <Box sx={{width: "100%", maxWidth: "100vw", overflowX: "hidden", px: 2}}>
                <Alert severity="info" sx={{mt: 4}}>
                    Kein tägliches Quiz verfügbar. Bitte später wiederkommen!
                </Alert>
            </Box>
        );
    }

    let currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <Box sx={{width: "100%", maxWidth: "100vw", overflowX: "hidden", px: 2}}>
            <Paper elevation={3} sx={{p: 4, mt: 4}}>
                <Typography variant="h4" gutterBottom>
                    Tägliches Quiz
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{mb: 3}}/>

                {!completed ? (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Frage {currentQuestionIndex + 1} von {quiz.questions.length}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {currentQuestion.question}
                        </Typography>
                        <FormControl component="fieldset">
                            <RadioGroup value={answers[currentQuestionIndex] || ''} onChange={handleAnswerSelect}>
                                {currentQuestion.answers &&
                                    currentQuestion.answers.map((option, index) => (
                                        <CustomFormControlLabel
                                            key={index}
                                            value={option}
                                            control={<Radio/>}
                                            label={option}
                                        />
                                    ))}
                            </RadioGroup>
                        </FormControl>
                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'space-between'}}>
                            <Button variant="outlined" color="secondary" onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}>
                                Zurück
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={!answers[currentQuestionIndex]}
                            >
                                {currentQuestionIndex === quiz.questions.length - 1 ? 'Fertig' : 'Weiter'}
                            </Button>
                        </Box>
                        <br/>
                        <Alert severity="warning" sx={{mb: 3}}>
                            Hinweis: Die Fragen werden von einer KI generiert und können Fehler enthalten.
                        </Alert>
                        <br/>
                        <Box sx={{mt: 2, display: 'flex', justifyContent: 'center'}}>
                            <Button variant="outlined" color="error" onClick={handleCancel}>
                                Abbrechen
                            </Button>
                        </Box>
                    </>
                ) : (
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
                        <br/>
                        <Alert severity="warning" sx={{mb: 3}}>
                            Hinweis: Die Fragen werden von einer KI generiert und können Fehler enthalten.
                        </Alert>
                        <br/>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default DailyQuiz;