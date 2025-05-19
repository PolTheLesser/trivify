import React, { useState, useEffect } from 'react';
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
    Typography,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

const CreateQuiz = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [questions, setQuestions] = useState([
        {
            question: "",
            questionType: "MULTIPLE_CHOICE",
            answers: ["", "", "", ""],
            correctAnswer: ""
        }
    ]);
    const [allValues, setAllValues] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loadingTags, setLoadingTags] = useState(true);
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
        newQuestions[index] = {...newQuestions[index], [field]: value};
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
    const handleTagsChange = (event, newTags) => {
        setTags(newTags);
        const selectedCats = newTags.map(tag => {
            const idx = allValues.indexOf(tag);
            return allCategories[idx];
        }).filter(Boolean);
        setCategories(selectedCats);
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
                {title, description, categories, questions},
                {params: {userId}}
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
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const valuesRes = await axios.get(`${process.env.REACT_APP_API_URL}/categories/values`);
                const dataRes = await axios.get(`${process.env.REACT_APP_API_URL}/categories`);
                const values = valuesRes.data.slice(1);
                const cats = dataRes.data.slice(1);
                setAllValues(values);
                setAllCategories(cats);
            } catch (err) {
                console.error('Error fetching categories', err);
                setError('Kategorien konnten nicht geladen werden');
            } finally {
                setLoadingTags(false);
            }
        };
        fetchTags();
    }, []);

    return (
        <Container maxWidth="md" sx={{mt: 4}}>
            <Paper elevation={3} sx={{p: 4}}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Neues Quiz erstellen
                </Typography>

                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                {success && <Alert severity="success" sx={{mb: 2}}>{success}</Alert>}

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
                        onChange={handleTagsChange}
                        disabled={loadingTags}
                        loading={loadingTags}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip key={option} label={option} {...getTagProps({index})} />
                            ))
                        }
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="Kategorien"
                                placeholder="Kategorien wählen"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingTags ? <CircularProgress color="inherit" size={20}/> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                        sx={{mt: 2, mb: 3}}
                        limitTags={3}
                    />

                    <List>
                        {questions.map((q, qi) => (
                            <ListItem key={qi} divider>
                                <Box sx={{width: '100%'}}>
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
                                        <DeleteIcon/>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{mt: 2, display: 'flex', gap: 2}}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon/>}
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