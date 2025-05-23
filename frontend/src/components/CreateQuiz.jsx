import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemSecondaryAction,
    MenuItem,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { CustomAutocomplete, CustomSelect } from "../CustomElements";

const CreateQuiz = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState(() => localStorage.getItem('quiz_title') || '');
    const [description, setDescription] = useState(() => localStorage.getItem('quiz_description') || '');
    const [tags, setTags] = useState(() => {
        const stored = localStorage.getItem('quiz_tags');
        return stored ? JSON.parse(stored) : [];
    });
    const [questions, setQuestions] = useState(() => {
        const stored = localStorage.getItem('quiz_questions');
        return stored ? JSON.parse(stored) : [{
            question: "",
            questionType: "MULTIPLE_CHOICE",
            answers: ["", ""],
            correctAnswer: ""
        }];
    });
    const [categories, setCategories] = useState(() => {
        const stored = localStorage.getItem('quiz_categories');
        return stored ? JSON.parse(stored) : [];
    });

    const [allValues, setAllValues] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loadingTags, setLoadingTags] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tagError, setTagError] = useState(false);

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
                answers: ["", ""],
                correctAnswer: ""
            }
        ]);
    };

    const handleTagsChange = (event, newTags) => {
        if (newTags.length <= 3) {
            setTags(newTags);
            const selectedCats = newTags.map(tag => {
                const idx = allValues.indexOf(tag);
                return allCategories[idx];
            }).filter(Boolean);
            setCategories(selectedCats);
            if (newTags.length > 0) setTagError(false);
        }
    };

    const removeQuestion = index => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const isFormValid = () => {
        if (!title.trim()) return false;
        return questions.every(q => {
            if (!q.question.trim() || !q.correctAnswer.trim()) return false;
            if (q.questionType === 'TEXT_INPUT') return true;
            if (!q.answers || q.answers.length < 2 || q.answers.some(a => !a.trim())) return false;
            return q.answers.includes(q.correctAnswer);
        });
    };

    const newTagsToEnums = (tagValues) =>
        tagValues.map(t => {
            const idx = allValues.indexOf(t);
            return allCategories[idx];
        }).filter(Boolean);

    const handleSubmit = async e => {
        e.preventDefault();
        const selectedEnums = newTagsToEnums(tags);
        if (selectedEnums.length === 0) {
            setTagError(true);
            return;
        }
        setTagError(false);
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('Benutzer ID nicht gefunden. Bitte erneut anmelden.');
            return;
        }

        try {
            await axios.post(
                process.env.REACT_APP_API_URL,
                {title, description, categories: selectedEnums, questions},
                {params: {userId}}
            );
            setSuccess("Quiz erfolgreich erstellt!");
            setTitle("");
            setDescription("");
            setQuestions([{
                question: "",
                questionType: "MULTIPLE_CHOICE",
                answers: ["", "", "", ""],
                correctAnswer: ""
            }]);
            setTags([]);
            setCategories([]);

            // clear localStorage
            localStorage.removeItem('quiz_title');
            localStorage.removeItem('quiz_description');
            localStorage.removeItem('quiz_tags');
            localStorage.removeItem('quiz_questions');
            localStorage.removeItem('quiz_categories');

            navigate('/quizzes/my-quizzes');
        } catch (err) {
            setError(err.response?.data?.message || 'Fehler beim Erstellen des Quiz');
        }
    };

    const handleReset = () => {
        setTitle('');
        setDescription('');
        setTags([]);
        setCategories([]);
        setQuestions([{
            question: "",
            questionType: "MULTIPLE_CHOICE",
            answers: ["", ""],
            correctAnswer: ""
        }]);
        localStorage.removeItem('quiz_title');
        localStorage.removeItem('quiz_description');
        localStorage.removeItem('quiz_tags');
        localStorage.removeItem('quiz_questions');
        localStorage.removeItem('quiz_categories');
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

    useEffect(() => localStorage.setItem('quiz_title', title), [title]);
    useEffect(() => localStorage.setItem('quiz_description', description), [description]);
    useEffect(() => localStorage.setItem('quiz_tags', JSON.stringify(tags)), [tags]);
    useEffect(() => localStorage.setItem('quiz_categories', JSON.stringify(categories)), [categories]);
    useEffect(() => localStorage.setItem('quiz_questions', JSON.stringify(questions)), [questions]);

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

                    <CustomAutocomplete
                        multiple
                        options={allValues}
                        value={tags}
                        onChange={handleTagsChange}
                        disabled={loadingTags}
                        loading={loadingTags}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip key={option} label={option} {...getTagProps({ index })} />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Kategorien"
                                placeholder="Kategorien wählen"
                                error={tagError}
                                helperText={tagError ? 'Bitte wähle mindestens eine Kategorie' : ''}
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
                        sx={{ mt: 2, mb: 3 }}
                        limitTags={3}
                    />

                    {/* Fragen-Rendering bleibt gleich */}

                    <List>
                        {questions.map((q, qi) => (
                            <ListItem key={qi} divider>
                                {/* ... Fragen-Rendering unverändert ... */}
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addQuestion}
                        >
                            Frage hinzufügen
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleReset}
                        >
                            Abbrechen
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