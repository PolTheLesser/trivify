import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  Alert,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL+`/toEdit/${id}`);
      setTitle(response.data.title);
      setDescription(response.data.description);
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (err) {
      setError("Quiz konnte nicht geladen werden");
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (questionIndex, answerIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers[answerIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        answers: ["", "", "", ""],
        correctAnswer: ""
      }
    ]);
  };

  const isFormValid = () => {
    if (!title.trim()) return false;

    return questions.every(q => {
      if (!q.question.trim() || !q.correctAnswer.trim()) return false;

      if (q.questionType === 'TEXT_INPUT') {
        return true; // Bei Texteingabe keine Antwortliste nötig
      }

      if (!q.answers || q.answers.some(a => !a.trim())) return false;

      return q.answers.includes(q.correctAnswer);
    });
  };


  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(process.env.REACT_APP_API_URL+`/${id}`, {
        title,
        description,
        questions
      });
      setSuccess("Quiz erfolgreich aktualisiert");
      setTimeout(() => {
        navigate("/quizzes");
      }, 2000);
    } catch (err) {
      setError("Fehler beim Aktualisieren des Quiz");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Quiz bearbeiten
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />

          <List>
            {questions.map((q, questionIndex) => (
              <ListItem key={questionIndex} divider>
                <Box sx={{ width: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Frage {questionIndex + 1}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Frage"
                    value={q.question}
                    onChange={(e) =>
                      handleQuestionChange(questionIndex, "question", e.target.value)
                    }
                    margin="normal"
                    required
                  />
                  {q.answers.map((answer, answerIndex) => (
                    <TextField
                      key={answerIndex}
                      fullWidth
                      label={`Antwort ${answerIndex + 1}`}
                      value={answer}
                      onChange={(e) =>
                        handleAnswerChange(questionIndex, answerIndex, e.target.value)
                      }
                      margin="normal"
                      required
                    />
                  ))}
                  <TextField
                    fullWidth
                    label="Richtige Antwort"
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleQuestionChange(questionIndex, "correctAnswer", e.target.value)
                    }
                    margin="normal"
                    required
                  />
                </Box>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeQuestion(questionIndex)}
                    disabled={questions.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addQuestion}
            >
              Frage hinzufügen
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isFormValid()}
            >
              Speichern
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditQuiz; 