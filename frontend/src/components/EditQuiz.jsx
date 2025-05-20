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
  CircularProgress,
  Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Autocomplete from '@mui/material/Autocomplete';
import axios from "axios";

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [allValues, setAllValues] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [tagError, setTagError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Kategorien und Werte laden
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const [valsRes, catsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/categories/values`),
          axios.get(`${process.env.REACT_APP_API_URL}/categories`)
        ]);
        const values = valsRes.data.slice(1); // Nur sichtbare Werte
        const cats = catsRes.data.slice(1);
        setAllValues(values);
        setAllCategories(cats);
      } catch (err) {
        console.error(err);
        setError("Kategorien konnten nicht geladen werden");
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  // Quizdaten laden
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/toEdit/${id}`);
        const data = res.data;
        setTitle(data.title);
        setDescription(data.description);
        setQuestions(data.questions || []);
        const tagsFromEnums = data.categories.map((cat) => {
          const idx = allCategories.indexOf(cat);
          return allValues[idx] || cat;
        });
        setTags(tagsFromEnums);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Quiz konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    // Warten bis Kategorien geladen sind
    if (!loadingTags) fetchQuiz();
  }, [id, allCategories, allValues, loadingTags]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (qIdx, aIdx, value) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].answers[aIdx] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: "",
        questionType: "MULTIPLE_CHOICE",
        answers: ["", "", "", ""],
        correctAnswer: ""
      }
    ]);
  };

  const removeQuestion = index => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    if (!title.trim() || tags.length === 0) return false;
    return questions.every(q => {
      if (!q.question.trim() || !q.correctAnswer.trim()) return false;
      if (q.questionType === "TEXT_INPUT") return true;
      if (!q.answers || q.answers.some(a => !a.trim())) return false;
      return q.answers.includes(q.correctAnswer);
    });
  };

  const handleTagsChange = (_, newTags) => {
    setTags(newTags);
    if (newTags.length > 0) {
      setTagError(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (tags.length === 0) {
      setTagError(true);
      return;
    }
    try {
      const selectedEnums = newTagsToEnums(tags);
      await axios.put(`${process.env.REACT_APP_API_URL}/${id}`, {
        title,
        description,
        questions,
        categories: selectedEnums
      });
      setSuccess("Quiz erfolgreich aktualisiert");
      setTimeout(() => navigate("/quizzes/my-quizzes"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Fehler beim Aktualisieren des Quiz");
    }
  };

  const newTagsToEnums = (tagValues) =>
      tagValues.map(t => {
        const idx = allValues.indexOf(t);
        return allCategories[idx];
      }).filter(Boolean);

  if (loading || loadingTags) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
    );
  }

  return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Quiz bearbeiten
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
                fullWidth
                label="Titel"
                value={title}
                onChange={e => setTitle(e.target.value)}
                margin="normal"
                required
            />

            <TextField
                fullWidth
                label="Beschreibung"
                value={description}
                onChange={e => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={3}
            />

            <Autocomplete
                multiple
                options={allValues}
                value={tags}
                disabled={loadingTags}
                loading={loadingTags}
                onChange={handleTagsChange}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip key={option} label={option} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        error={tagError}
                        helperText={tagError ? 'Bitte wähle mindestens eine Kategorie' : ''}
                        label="Kategorien"
                        placeholder="Kategorien wählen"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                              <>
                                {loadingTags ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                          )
                        }}
                    />
                )}
                limitTags={3}
                sx={{ mb: 3 }}
            />

            <List>
              {questions.map((q, qi) => (
                  <ListItem key={qi} divider>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="h6" gutterBottom>
                        Frage {qi + 1}
                      </Typography>
                      <TextField
                          fullWidth
                          label="Frage"
                          value={q.question}
                          onChange={e => handleQuestionChange(qi, 'question', e.target.value)}
                          margin="normal"
                          required
                      />
                      {q.answers.map((ans, ai) => (
                          <TextField
                              key={ai}
                              fullWidth
                              label={`Antwort ${ai + 1}`}
                              value={ans}
                              onChange={e => handleAnswerChange(qi, ai, e.target.value)}
                              margin="normal"
                              required
                          />
                      ))}
                      <TextField
                          fullWidth
                          label="Richtige Antwort"
                          value={q.correctAnswer}
                          onChange={e => handleQuestionChange(qi, 'correctAnswer', e.target.value)}
                          margin="normal"
                          required
                      />
                    </Box>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeQuestion(qi)} disabled={questions.length === 1}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addQuestion}>
                Frage hinzufügen
              </Button>
              <Button type="submit" variant="contained" disabled={!isFormValid()}>
                Speichern
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
  );
};

export default EditQuiz;
