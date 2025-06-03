import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Container, Dialog,
    DialogTitle, DialogContent, DialogActions, FormControl, IconButton,
    InputLabel, List, ListItem, ListItemSecondaryAction, MenuItem,
    Paper, TextField, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { CustomAutocomplete, CustomSelect } from "../../CustomElements";

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
    const [showResetDialog, setShowResetDialog] = useState(false);

    useEffect(() => {
        const LOCAL_KEY = `quiz_backup_${id}`;
        localStorage.removeItem(LOCAL_KEY);
    }, [id]);

    const handleResetClick = () => setShowResetDialog(true);
    const handleResetCancel = () => setShowResetDialog(false);

    const loadQuizFromServer = useCallback(async () => {
        try {
            const res = await axios.get(`/toEdit/${id}`);
            const data = res.data;
            const tagsFromEnums = data.categories.map(cat => {
                const idx = allCategories.indexOf(cat);
                return allValues[idx] || cat;
            });

            setTitle(data.title);
            setDescription(data.description);
            setQuestions(data.questions || []);
            setTags(tagsFromEnums);

            const LOCAL_KEY = `quiz_backup_${id}`;
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
    }, [id, allCategories, allValues]);

    const handleResetConfirm = async () => {
        setShowResetDialog(false);
        setLoading(true);
        setError("");
        setSuccess("");
        const LOCAL_KEY = `quiz_backup_${id}`;
        localStorage.removeItem(LOCAL_KEY);
        await loadQuizFromServer();
    };

    const handleCancleConfirm = async () => {
        setShowResetDialog(false);
        setLoading(true);
        setError("");
        setSuccess("");
        const LOCAL_KEY = `quiz_backup_${id}`;
        localStorage.removeItem(LOCAL_KEY);
        navigate("/quizzes/my-quizzes");
    };

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const [valsRes, catsRes] = await Promise.all([
                    axios.get(`/categories/values`),
                    axios.get(`/categories`)
                ]);
                setAllValues(valsRes.data.slice(1));
                setAllCategories(catsRes.data.slice(1));
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
            const LOCAL_KEY = `quiz_backup_${id}`;
            const saved = localStorage.getItem(LOCAL_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (
                        typeof parsed.title === "string" &&
                        typeof parsed.description === "string" &&
                        Array.isArray(parsed.questions) &&
                        Array.isArray(parsed.tags)
                    ) {
                        setTitle(parsed.title);
                        setDescription(parsed.description);
                        setQuestions(parsed.questions);
                        setTags(parsed.tags);
                        setLoading(false);
                        return;
                    } else {
                        console.warn("Ungültige Daten in localStorage – lade neu vom Server");
                    }
                } catch (e) {
                    console.warn("Fehler beim Parsen der localStorage-Daten:", e);
                }
            }
            loadQuizFromServer();
        }
    }, [id, allCategories, allValues, loadQuizFromServer]);

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
            if (newTags.length > 0) setTagError(false);
        }
    };

    const newTagsToEnums = (tagValues) =>
        tagValues.map(t => {
            const idx = allValues.indexOf(t);
            return allCategories[idx];
        }).filter(Boolean);

    const handleSubmit = async e => {
        e.preventDefault();
        if (tags.length === 0) {
            setTagError(true);
            return;
        }
        try {
            const selectedEnums = newTagsToEnums(tags);
            await axios.put(`/${id}`, {
                title,
                description,
                questions,
                categories: selectedEnums
            });
            const LOCAL_KEY = `quiz_backup_${id}`;
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
                newType === "TRUE_FALSE"
                    ? ["Wahr", "Falsch"]
                    : newType === "TEXT_INPUT"
                        ? []
                        : ["", "", "", ""],
            correctAnswer: newType === "TRUE_FALSE" ? "Wahr" : ""
        };
        setQuestions(newQuestions);
    };

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
                        fullWidth label="Titel" value={title}
                        onChange={e => setTitle(e.target.value)} margin="normal" required
                    />
                    <TextField
                        fullWidth label="Beschreibung" value={description}
                        onChange={e => setDescription(e.target.value)} margin="normal"
                        multiline rows={3}
                    />
                    <CustomAutocomplete
                        multiple options={allValues} value={tags} disabled={loadingTags}
                        loading={loadingTags} onChange={handleTagsChange}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip key={option} label={option} {...getTagProps({ index })} />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params}
                                       error={tagError}
                                       helperText={tagError ? 'Bitte wähle mindestens eine Kategorie' : ''}
                                       label="Kategorien *"
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
                                <Box sx={{ width: "100%" }}>
                                    <Typography variant="h6">Frage {qi + 1}</Typography>
                                    <TextField fullWidth label="Frage" value={q.question}
                                               onChange={e => handleQuestionChange(qi, "question", e.target.value)}
                                               margin="normal" required
                                    />
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Fragetyp</InputLabel>
                                        <CustomSelect
                                            value={q.questionType}
                                            label="Fragetyp"
                                            onChange={e => handleQuestionTypeChange(qi, e.target.value)}
                                        >
                                            <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                                            <MenuItem value="TEXT_INPUT">Texteingabe</MenuItem>
                                            <MenuItem value="TRUE_FALSE">Wahr/Falsch</MenuItem>
                                        </CustomSelect>
                                    </FormControl>

                                    {q.questionType !== "TRUE_FALSE" && q.answers.map((ans, ai) => (
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

                                    {q.questionType !== "TRUE_FALSE" && q.questionType !== "TEXT_INPUT" && (
                                        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    if (q.answers.length < 5) {
                                                        const newQuestions = [...questions];
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
                                                    if (q.answers.length > 2) {
                                                        const newQuestions = [...questions];
                                                        newQuestions[qi].answers.pop();
                                                        if (!newQuestions[qi].answers.includes(q.correctAnswer)) {
                                                            newQuestions[qi].correctAnswer = "";
                                                        }
                                                        setQuestions(newQuestions);
                                                    }
                                                }}
                                                disabled={q.answers.length <= 2}
                                            >
                                                Letzte Antwort entfernen
                                            </Button>
                                        </Box>
                                    )}

                                    <FormControl fullWidth margin="normal">
                                        {q.questionType !== "TEXT_INPUT" && <InputLabel>Richtige Antwort</InputLabel>}
                                        {q.questionType === "TEXT_INPUT" ? (
                                            <TextField
                                                value={q.correctAnswer}
                                                label="Richtige Antwort"
                                                onChange={e => handleQuestionChange(qi, "correctAnswer", e.target.value)}
                                                margin="normal"
                                                required
                                            />
                                        ) : (
                                            <CustomSelect
                                                value={q.correctAnswer}
                                                label="Richtige Antwort"
                                                onChange={e => handleQuestionChange(qi, "correctAnswer", e.target.value)}
                                            >
                                                {q.answers.map((ans, ai) => (
                                                    <MenuItem key={ai} value={ans}>{ans}</MenuItem>
                                                ))}
                                            </CustomSelect>
                                        )}
                                    </FormControl>
                                </Box>
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => removeQuestion(qi)} disabled={questions.length === 1}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={addQuestion}>Frage hinzufügen</Button>
                        <Button type="submit" variant="contained" disabled={!isFormValid()}>Speichern</Button>
                        <Button variant="contained" color="error" onClick={handleCancleConfirm}>Abbrechen</Button>
                        <Button variant="contained" color="error" onClick={handleResetClick}>Zurücksetzen</Button>
                    </Box>
                </form>

                <Dialog open={showResetDialog} onClose={handleResetCancel}>
                    <DialogTitle>Zurücksetzen bestätigen</DialogTitle>
                    <DialogContent>
                        <Typography>Möchtest du das Formular wirklich zurücksetzen? Alle ungespeicherten Änderungen gehen verloren.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResetCancel}>Abbrechen</Button>
                        <Button onClick={handleResetConfirm} color="error" variant="contained">Zurücksetzen</Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
};

export default EditQuiz;
