import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  TextField,
  Typography
} from '@mui/material';
import axios from '../api/api';
import {useAuth} from '../contexts/AuthContext';

const PlayQuiz = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [stars, setStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // Markiert, dass das Quiz vorbei ist
  const [finished, setFinished] = useState(false);
  const userId = user?.id;
  const quizId = quiz?.id;
  const maxPossibleScore = quiz?.questions.length;

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL +`/${id}`);
      setQuiz(response.data);
    } catch {
      setError('Quiz konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleTextChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleNext = async () => {
    if (!selectedAnswer) return;

    const question = quiz.questions[currentQuestionIndex];

    try {
      const response = await axios.post(
          process.env.REACT_APP_API_URL + `/${quiz.id}/submit`,
          { questionId: question.id, answer: selectedAnswer }
      );

      if (response.data.correct) {
        setScore(prev => prev + 1);
      } else {
        const correctAnswer =
            response.data.correctAnswer || question.correctAnswer || 'N/V';
        setWrongAnswers(prev => [
          ...prev,
          {
            question: question.question,
            selectedAnswer,
            correctAnswer
          }
        ]);
      }

      // **WICHTIG: Stellt sicher, dass das Quiz auch für die letzte Frage aktualisiert wird**
      if (currentQuestionIndex === quiz.questions.length - 1) {
        setShowResults(true);
        setFinished(true);

        // Warten, bis der Score für die letzte Frage aktualisiert wurde
        setTimeout(() => {
          // Aktualisiere die Ergebnisse und sende das Score
          axios.post(process.env.REACT_APP_API_URL + '/quiz-results', {
            userId,
            quizId,
            score: score + (response.data.correct ? 1 : 0),  // Score korrekt hinzufügen
            maxPossibleScore
          }).then(response => {
            console.log(response.data.message);
          })
              .catch(error => {
                console.error('Fehler beim Aktualisieren des Scores:', error);
              });
        }, 500); // Ein bisschen Verzögerung, um den Wert korrekt zu setzen
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
      }
    } catch {
      setError('Fehler beim Einreichen der Antwort');
    }
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
      await axios.post(process.env.REACT_APP_API_URL +`/quizzes/${quiz.id}/rate`, { rating: stars });
      // Optional: nach dem Raten zurück zur Liste
      navigate('/quizzes', { state: { justRated: true } });
    } catch (err) {
      setError('Fehler beim Absenden der Bewertung');
      setSubmitting(false);
    }
  };

  if (showResults) {
    return (
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Quiz beendet!
            </Typography>
            <Typography variant="h5" gutterBottom>
              Dein Ergebnis: {score} von {quiz.questions.length} {quiz.questions.length === 1 ? 'Punkt' : 'Punkten'}
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
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Bewerte dieses Quiz:</Typography>
                    <Rating
                        name="after-quiz-rating"
                        value={stars}
                        onChange={(_, val) => setStars(val)}
                    />
                    <br />
                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
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
                  <Box sx={{ mt: 4 }}>
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
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            {quiz.title}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />
          <Typography variant="body1" gutterBottom>
            Frage {currentQuestionIndex + 1} von {quiz.questions.length}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {question.question}
          </Typography>

          <FormControl component="fieldset" sx={{ mt: 2 }}>
            {isTextInput ? (
                <TextField
                    fullWidth
                    label="Deine Antwort"
                    value={selectedAnswer}
                    onChange={handleTextChange}
                    autoFocus
                />
            ) : (
                <RadioGroup value={selectedAnswer} onChange={handleAnswerSelect}>
                  {question.answers.map((answer, idx) => (
                      <FormControlLabel
                          key={idx}
                          value={answer}
                          control={<Radio />}
                          label={answer}
                      />
                  ))}
                </RadioGroup>
            )}
          </FormControl>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!selectedAnswer}
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? "Beenden" : "Weiter"}
            </Button>
          </Box>
        </Paper>
      </Container>
  );
};

export default PlayQuiz;
