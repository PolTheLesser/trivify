import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import {CustomAutocomplete, CustomSelect} from "../CustomElements";

/**
 * EditQuiz-Komponente
 *
 * Diese Komponente ermöglicht das Bearbeiten eines bestehenden Quiz mit Titel, Beschreibung,
 * Kategorien (Tags) und Fragen inklusive verschiedener Fragetypen (Multiple Choice, Wahr/Falsch, Texteingabe).
 * Daten werden beim Laden aus dem Backend abgefragt und auch im lokalen Speicher zwischengespeichert,
 * um ungespeicherte Änderungen bei Reloads nicht zu verlieren. Es gibt Validierungen für das Formular
 * und die Möglichkeit, Fragen hinzuzufügen, zu entfernen oder zurückzusetzen.
 *
 * Funktionalitäten:
 * - Laden eines Quiz und seiner Metadaten (Titel, Beschreibung, Fragen, Kategorien) vom Server
 * - Zwischenspeicherung der Daten im localStorage zum Schutz vor Datenverlust
 * - Editieren von Fragen mit verschiedenen Fragetypen und Antworten
 * - Hinzufügen und Entfernen von Fragen und Antworten
 * - Auswahl und Validierung von Kategorien (max. 3)
 * - Formularvalidierung vor Absenden
 * - Speichern der Änderungen via PUT-Request an die API
 * - Rücksetzen des Formulars auf Serverzustand mit Bestätigungsdialog
 * - Fehler- und Erfolgsmeldungen anzeigen
 * - Navigation nach erfolgreichem Speichern oder Abbrechen
 */
const EditQuiz = () => {
    const {id} = useParams();
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
    const [showResetDialog, setShowResetDialog] = useState(false);

    const LOCAL_KEY = `quiz_backup_${id}`;
    const handleResetClick = () => {
        setShowResetDialog(true);
    };

    const handleResetCancel = () => {
        setShowResetDialog(false);
    };

    const handleResetConfirm = async () => {
        setShowResetDialog(false);
        setLoading(true);
        setError("");
        setSuccess("");
        localStorage.removeItem(LOCAL_KEY);
        await loadQuizFromServer();
    };

    const handleCancleConfirm = async () => {
        setShowResetDialog(false);
        setLoading(true);
        setError("");
        setSuccess("");
        localStorage.removeItem(LOCAL_KEY);
        navigate("/quizzes/my-quizzes");
    };

    const loadQuizFromServer = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/toEdit/${id}`);
            const data = res.data;
            const tagsFromEnums = data.categories.map((cat) => {
                const idx = allCategories.indexOf(cat);
                return allValues[idx] || cat;
            });

            setTitle(data.title);
            setDescription(data.description);
            setQuestions(data.questions || []);
            setTags(tagsFromEnums);

            // Save to localStorage
            localStorage.setItem(LOCAL_KEY, JSON.stringify({
                title: data.title,
                description: data.description,
                questions: data.questions || [],
                tags: tagsFromEnums
            }));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Quiz konnte nicht geladen werden");
        } finally {
            setLoading(false);
        }
    };

    // Kategorien und Werte laden
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const [valsRes, catsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/categories/values`),
                    axios.get(`${process.env.REACT_APP_API_URL}/categories`)
                ]);
                const values = valsRes.data.slice(1);
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

    useEffect(() => {
        if (allCategories.length > 0 && allValues.length > 0) {
            const saved = localStorage.getItem(LOCAL_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setTitle(parsed.title);
                setDescription(parsed.description);
                setTags(parsed.tags);
                setQuestions(parsed.questions);
                setLoading(false);
            } else {
                loadQuizFromServer();
            }
        }
    }, [id, allCategories, allValues]);

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

    const removeQuestion = index => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const isFormValid = () => {
        if (!title.trim() || tags.length === 0) return false;
        return questions.every(q => {
            if (!q.question.trim() || !q.correctAnswer.trim()) return false;
            if (q.questionType === "TEXT_INPUT") return true;
            if (!q.answers || q.answers.length < 2 || q.answers.some(a => !a.trim())) return false;
            return q.answers.includes(q.correctAnswer);
        });
    };

    const handleTagsChange = (_, newTags) => {
        if (newTags.length <= 3) {
            setTags(newTags);
            if (newTags.length > 0) {
                setTagError(false);
            }
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
            localStorage.removeItem(LOCAL_KEY);
            setSuccess("Quiz erfolgreich aktualisiert");
            setTimeout(() => navigate("/quizzes/my-quizzes"), 1500);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Fehler beim Aktualisieren des Quiz");
        }
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

    const handleReset = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        localStorage.removeItem(LOCAL_KEY);
        await loadQuizFromServer();
    };

    const newTagsToEnums = (tagValues) =>
        tagValues.map(t => {
            const idx = allValues.indexOf(t);
            return allCategories[idx];
        }).filter(Boolean);

    if (loading || loadingTags) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{mt: 4}}>
            <Paper elevation={3} sx={{p: 4}}>
                <Typography variant="h4" align="center" gutterBottom>
                    Quiz bearbeiten
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
                        disabled={loadingTags}
                        loading={loadingTags}
                        onChange={handleTagsChange}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip key={option} label={option} {...getTagProps({index})} />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                error={tagError}
                                helperText={tagError ? 'Bitte wähle mindestens eine Kategorie' : ''}
                                label="Kategorien *"
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
                        limitTags={3}
                        sx={{mb: 3}}
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
                                        onChange={e => handleQuestionChange(qi, 'question', e.target.value)}
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
                                    <IconButton edge="end" onClick={() => removeQuestion(qi)}
                                                disabled={questions.length === 1}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={addQuestion}>
                            Frage hinzufügen
                        </Button>
                        <Button type="submit" variant="contained" disabled={!isFormValid()}>
                            Speichern
                        </Button>
                        <Button variant="contained" color="error" onClick={handleCancleConfirm}>
                            Abbrechen
                        </Button>
                        <Button variant="contained" color="error" onClick={handleResetClick}>
                            Zurücksetzen
                        </Button>
                    </Box>
                </form>
                <Dialog open={showResetDialog} onClose={handleResetCancel}>
                    <DialogTitle>Zurücksetzen bestätigen</DialogTitle>
                    <DialogContent>
                        <Typography>Möchtest du das Formular wirklich zurücksetzen? Alle ungespeicherten Änderungen gehen verloren.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResetCancel} color="primary">
                            Abbrechen
                        </Button>
                        <Button onClick={handleResetConfirm} color="error" variant="contained">
                            Zurücksetzen
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
};

export default EditQuiz;
