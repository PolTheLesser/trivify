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
import {CustomAutocomplete, CustomSelect} from "../../CustomElements";

/**
 * CreateQuiz-Komponente
 *
 * Diese Komponente ermöglicht es dem Benutzer, ein neues Quiz zu erstellen.
 * Der Benutzer kann Titel, Beschreibung, Kategorien (Tags) und beliebig viele Fragen mit verschiedenen Fragetypen hinzufügen.
 * Fragen können Multiple Choice, Wahr/Falsch oder Texteingabe sein. Antworten können hinzugefügt oder entfernt werden,
 * und die korrekte Antwort wird ausgewählt oder eingegeben.
 * Die Komponente validiert das Formular, speichert Zwischenergebnisse im Local Storage und sendet die Daten an einen API-Endpunkt.
 * Nach erfolgreicher Erstellung wird der Nutzer zur Übersicht seiner eigenen Quizzes weitergeleitet.
 *
 * Funktionalitäten:
 * - Laden und Speichern von Formulardaten in Local Storage zur Persistenz
 * - Auswahl und Limitierung von bis zu 3 Kategorien per Autocomplete mit Ladeanzeige
 * - Dynamisches Hinzufügen, Bearbeiten und Entfernen von Fragen und Antworten
 * - Unterstützung verschiedener Fragetypen mit unterschiedlicher Antwortlogik
 * - Validierung der Eingaben vor dem Absenden
 * - Absenden des Quiz an einen Server via POST-Request mit Fehler- und Erfolgsmeldungen
 * - Navigation zur Quiz-Übersicht nach erfolgreichem Speichern
 * - Formular zurücksetzen und lokale Daten löschen
 */
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
            await axios.post('',
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
        navigate('/quizzes/my-quizzes');
    };

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const valuesRes = await axios.get(`/categories/values`);
                const dataRes = await axios.get(`/categories`);
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
                                <Chip key={option} label={option} {...getTagProps({index})} />
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
                                        <CustomSelect
                                            value={q.questionType}
                                            label="Fragetyp"
                                            onChange={e =>
                                                handleQuestionTypeChange(qi, e.target.value)
                                            }
                                        >
                                            <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                                            <MenuItem value="TEXT_INPUT">Texteingabe</MenuItem>
                                            <MenuItem value="TRUE_FALSE">Wahr/Falsch</MenuItem>
                                        </CustomSelect>
                                    </FormControl>
                                    {q.questionType !== 'TRUE_FALSE' && q.answers.map((ans, ai) => (
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
                                    {q.questionType !== 'TRUE_FALSE' && q.questionType !== 'TEXT_INPUT' && (
                                        <Box sx={{display: 'flex', gap: 2, mt: 1}}>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    const newQuestions = [...questions];
                                                    if (q.answers.length < 5) {
                                                        newQuestions[qi].answers.push("");
                                                        setQuestions(newQuestions);
                                                    }
                                                }}
                                                disabled={q.answers.length >= 4}
                                            >
                                                Antwort hinzufügen
                                            </Button>
                                            <Button
                                                size="small"
                                                color="secondary"
                                                onClick={() => {
                                                    const newQuestions = [...questions];
                                                    if (q.answers.length > 2) {
                                                        newQuestions[qi].answers.pop();
                                                        setQuestions(newQuestions);
                                                        // Entferne richtige Antwort, falls gelöscht
                                                        if (!newQuestions[qi].answers.includes(q.correctAnswer)) {
                                                            newQuestions[qi].correctAnswer = "";
                                                        }
                                                    }
                                                }}
                                                disabled={q.answers.length <= 2}
                                            >
                                                Letzte Antwort entfernen
                                            </Button>
                                        </Box>)}
                                    <FormControl fullWidth margin="normal">
                                        {q.questionType !== 'TEXT_INPUT' && (
                                            <InputLabel>Richtige Antwort</InputLabel>)}
                                        {q.questionType === 'TEXT_INPUT' ? (
                                            <TextField
                                                value={q.correctAnswer}
                                                label="Richtige Antwort"
                                                onChange={e => handleQuestionChange(qi, 'correctAnswer', e.target.value)}
                                                margin="normal"
                                                required
                                            />
                                        ) : (
                                            <CustomSelect
                                                value={q.correctAnswer}
                                                label="Richtige Antwort"
                                                onChange={e => handleQuestionChange(qi, 'correctAnswer', e.target.value)}
                                            >
                                                {q.answers.map((ans, ai) => (
                                                    <MenuItem key={ai} value={ans}>
                                                        {ans}
                                                    </MenuItem>
                                                ))}
                                            </CustomSelect>
                                        )}
                                    </FormControl>
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

                    <Box sx={{mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap'}}>
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
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleReset}
                        >
                            Abbrechen
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateQuiz;