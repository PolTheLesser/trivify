import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
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

    // tag state
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    
    const handleAddTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t) && tags.length < 3) {
            setTags(prev => [...prev, t]);
        }
        setTagInput('');
    };

    const handleDeleteTag = (tagToDelete: string) => {
        setTags(prev => prev.filter(t => t !== tagToDelete));
    };

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

    const handleQuestionTypeChange = (index, newType) => {
        const newQuestions = [...questions];
        newQuestions[index] = {
            ...newQuestions[index],
            questionType: newType,
            answers:
                newType === 'TRUE_FALSE'
                    ? ['Wahr', 'Falsch']
                    : newType === 'TEXT_INPUT'
                        ? []
                        : ['', '', '', ''],
            correctAnswer: newType === 'TRUE_FALSE' ? 'Wahr' : ''
        };
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
        if (!title.trim()) return false;
        return questions.every(q => {
            if (!q.question.trim() || !q.correctAnswer.trim()) return false;
            if (q.questionType === 'TEXT_INPUT') return true;
            if (!q.answers || q.answers.some(a => !a.trim())) return false;
            return q.answers.includes(q.correctAnswer);
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('Benutzer ID nicht gefunden. Bitte erneut anmelden.');
            return;
        }

        try {
            await axios.post(
                process.env.REACT_APP_API_URL,
                { title, description, difficulty, questions },
                { params: { userId } }
            );
            setSuccess("Quiz erfolgreich erstellt!");
            setTitle("");
            setDescription("");
            setDifficulty("MEDIUM");
            setQuestions([
                {
                    question: "",
                    questionType: "MULTIPLE_CHOICE",
                    answers: ["", "", "", ""],
                    correctAnswer: ""
                }
            ]);
            // note: tags are kept client-side for now
            setTags([]);
            navigate('/quizzes/my-quizzes');
        } catch (err) {
            setError(err.response?.data?.message || 'Fehler beim Erstellen des Quiz');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Neues Quiz erstellen
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

                    {/* Tags input */}
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Tags
                            </Typography>
                            <Paper
                                component="form"
                                onSubmit={e => { e.preventDefault(); handleAddTag(); }}
                                sx={{
                                    p: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    border: '1px solid',
                                    borderColor: 'grey.400',
                                    borderRadius: 1,
                                }}
                            >
                                <TextField
                                    variant="outlined"
                                    label="Tag"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    sx={{ flexGrow: 1 }}
                                />
                                <IconButton size="small" onClick={handleAddTag}>
                                    <AddIcon />
                                </IconButton>
                            </Paper>

                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {tags.map(tag => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                    clickable
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>

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
                                        onChange={e =>
                                            handleQuestionChange(qi, 'question', e.target.value)
                                        }
                                        margin="normal"
                                        required
                                    />

                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Fragetyp</InputLabel>
                                        <Select
                                            value={q.questionType}
                                            label="Fragetyp"
                                            onChange={e =>
                                                handleQuestionTypeChange(qi, e.target.value)
                                            }
                                        >
                                            <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                                            <MenuItem value="TEXT_INPUT">Texteingabe</MenuItem>
                                            <MenuItem value="TRUE_FALSE">Wahr/Falsch</MenuItem>
                                        </Select>
                                    </FormControl>

                                    {q.answers.map((ans, ai) => (
                                        <TextField
                                            key={ai}
                                            fullWidth
                                            label={`Antwort ${ai + 1}`}
                                            value={ans}
                                            onChange={e =>
                                                handleAnswerChange(qi, ai, e.target.value)
                                            }
                                            margin="normal"
                                            required
                                        />
                                    ))}

                                    <TextField
                                        fullWidth
                                        label="Richtige Antwort"
                                        value={q.correctAnswer}
                                        onChange={e =>
                                            handleQuestionChange(qi, 'correctAnswer', e.target.value)
                                        }
                                        margin="normal"
                                        required
                                    />
                                </Box>

                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => removeQuestion(qi)}
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