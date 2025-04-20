import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questions, setQuestions] = useState([
    {
      question: "",
      questionType: "MULTIPLE_CHOICE",
      answers: ["", "", "", ""],
      correctAnswer: ""
    }
  ]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');

  // Define userId from localStorage or another available source
  const userId = localStorage.getItem('userId');

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
        questionType: "MULTIPLE_CHOICE",
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

  const handleQuestionTypeChange = (index, newType) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      questionType: newType,
      answers: newType === 'TRUE_FALSE' ? ['Wahr', 'Falsch'] : 
              newType === 'TEXT_INPUT' ? [] : 
              ['', '', '', ''],
      correctAnswer: newType === 'TRUE_FALSE' ? 'Wahr' : ''
    };
    setQuestions(newQuestions);
  };

  // JavaScript
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Retrieve userId and check its value before sending the request.
    const userId = localStorage.getItem('userId');
    console.log('Submitting quiz with userId:', userId);

    if (!userId) {
      setError('Benutzer ID nicht gefunden. Bitte erneut anmelden.');
      return;
    }

    try {
      await axios.post(process.env.REACT_APP_API_URL, {
        title,
        description,
        difficulty,
        questions,
      }, {
        params: { userId }
      });
      setSuccess("Quiz erfolgreich erstellt!");
      setTitle("");
      setDescription("");
      setQuestions([{
        question: "",
        questionType: "MULTIPLE_CHOICE",
        answers: ["", "", "", ""],
        correctAnswer: ""
      }]);
      navigate('/quizzes/my-quizzes');
    } catch (err) {
      setError('Fehler beim Erstellen des Quiz');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Neues Quiz erstellen
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
                  <FormControl fullWidth>
                    <InputLabel>Fragetyp</InputLabel>
                    <Select
                        value={q.questionType}
                        label="Fragetyp"
                        onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value)}
                    >
                      <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                      <MenuItem value="TEXT_INPUT">Texteingabe</MenuItem>
                      <MenuItem value="TRUE_FALSE">Wahr/Falsch</MenuItem>
                    </Select>
                  </FormControl>
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

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
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
              Quiz speichern
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateQuiz;