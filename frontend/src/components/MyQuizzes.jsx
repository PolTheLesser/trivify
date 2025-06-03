import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Rating,
    Slider,
    TextField,
    Typography
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {useAuth} from '../contexts/AuthContext';
import axios from '../api/api';
import {CustomFormControlLabel, CustomSelect} from "../CustomElements";

/**
 * MeineQuizze-Komponente
 *
 * Diese Komponente zeigt eine Übersicht der vom Benutzer erstellten oder verwalteten Quizze an.
 * Nutzer können ihre Quizze durchsuchen, filtern (z.B. nach Favoriten, bewerteten Quizzen, Mindestanzahl an Fragen), sortieren und neue Quizze erstellen.
 * Administratoren können zusätzlich alle Quizze sehen und zwischen eigenen und allen Quizzen wechseln.
 *
 * Funktionalitäten:
 * - Laden und Anzeigen der Quiz-Daten inkl. Favoritenstatus und Bewertungen
 * - Filtern der Quizze nach Suchbegriff, Favoriten, Bewertungen, Mindestanzahl der Fragen und Sortierung
 * - Synchronisierung der Filter- und Suchparameter mit der URL
 * - Anzeigen von Kategorienamen als Chips
 * - Favorisieren und Entfavorisieren von Quizzen per Stern-Icon
 * - Navigieren zu Detail-, Bearbeitungs- und Erstellungsseiten von Quizzen
 * - Löschen von Quizzen mit Bestätigungsdialog
 * - Fehler- und Ladezustände handhaben
 */
const MeineQuizze = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialwerte aus URL holen (string, boolean, number)
    const getBoolParam = (key) => searchParams.get(key) === 'true';
    const getNumberParam = (key, fallback = 0) => {
        const val = Number(searchParams.get(key));
        return isNaN(val) ? fallback : val;
    };

    // Query state (aus URL initialisiert)
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [onlyFavorites, setOnlyFavorites] = useState(getBoolParam('onlyFavorites'));
    const [onlyRated, setOnlyRated] = useState(getBoolParam('onlyRated'));
    const [minQuestions, setMinQuestions] = useState(getNumberParam('minQuestions', 0));
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

    // Data states
    const [quizzes, setQuizzes] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [categoryLabels, setCategoryLabels] = useState({});
    const [showAll, setShowAll] = useState(
        user?.role === 'ROLE_ADMIN' && searchParams.get('showAll') === 'true'
    );

    // UI states
    const [loading, setLoading] = useState(true);
    const [loadingTags, setLoadingTags] = useState(true);
    const [error, setError] = useState('');

    // Dialog-State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const isAdmin = user?.role === 'ROLE_ADMIN';
            const endpoint = isAdmin
                ? (showAll ? 'quizzes' : 'admin/quizzes')
                : 'quizzes';
            const [quizRes, favRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/${endpoint}`),
                axios.get(`${process.env.REACT_APP_API_URL}/users/favorites`)
            ]);
            const favoriteIds = new Set(favRes.data || []);

            const ownQuizzes = quizRes.data
                .filter(q => isAdmin || q.creator?.id === user.id)
                .map(q => ({
                    ...q,
                    isFavorite: favoriteIds.has(q.id),
                    isDaily: !!q.dailyQuiz
                }));

            setQuizzes(ownQuizzes);
            setFiltered(ownQuizzes);
        } catch (err) {
            setError(err.response?.data?.message || 'Fehler beim Laden der Quizze');
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async quizId => {
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/users/quizzes/${quizId}/favorite`
            );
            setQuizzes(prev => prev.map(q => q.id === quizId ? {...q, isFavorite: res.data.favorited} : q));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchCategoryLabels = async () => {
            try {
                const [valsRes, catsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/categories/values`),
                    axios.get(`${process.env.REACT_APP_API_URL}/categories`)
                ]);

                const values = valsRes.data;
                const cats = catsRes.data;

                const labels = {};
                cats.forEach((cat, index) => {
                    labels[cat] = values[index] || cat;
                });

                setCategoryLabels(labels);
            } catch (err) {
                console.error('Fehler beim Laden der Kategorienamen', err);
            } finally {
                setLoadingTags(false);
            }
        };

        fetchCategoryLabels();
    }, []);

    // Synchronisiere Filter-States mit URL-Parametern
    useEffect(() => {
        const params = {};

        if (searchQuery) params.query = searchQuery;
        if (onlyFavorites) params.onlyFavorites = 'true';
        if (onlyRated) params.onlyRated = 'true';
        if (minQuestions > 0) params.minQuestions = minQuestions.toString();
        if (sortOrder && sortOrder !== 'desc') params.sortOrder = sortOrder;
        if (showAll && user?.role === 'ROLE_ADMIN') params.showAll = 'true';
        setSearchParams(params, {replace: true});
    }, [searchQuery, onlyFavorites, onlyRated, minQuestions, sortOrder, setSearchParams]);

    useEffect(() => {
        let result = quizzes.filter(q => {
            const query = searchQuery.toLowerCase();
            const inTitle = q.title.toLowerCase().includes(query);
            const inDescription = q.description?.toLowerCase().includes(query);
            const inCategories = (q.categories || []).some(cat =>
                (categoryLabels[cat] || cat).toLowerCase().includes(query)
            );
            return (inTitle || inDescription || inCategories) && q.questions.length >= minQuestions;
        });

        // Sortieren
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Filter nur Favoriten
        if (onlyFavorites) {
            result = result.filter(q => q.isFavorite);
        }

        // Filter nur bewertete
        if (onlyRated) {
            result = result.filter(q => q.ratingCount > 0);
        }

        setFiltered(result);
    }, [searchQuery, minQuestions, sortOrder, quizzes, onlyFavorites, onlyRated, categoryLabels, user]);

    // Öffnet den Bestätigungs-Dialog
    const confirmDelete = (quizId) => {
        setToDeleteId(quizId);
        setDialogOpen(true);
    };

    // Tatsächliches Löschen
    const handleDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/${toDeleteId}`);
            const updated = quizzes.filter(q => q.id !== toDeleteId);
            setQuizzes(updated);
            setDialogOpen(false);
            setToDeleteId(null);
        } catch {
            setError('Quiz konnte nicht gelöscht werden.');
            setDialogOpen(false);
            setToDeleteId(null);
        }
    };

    // Filter zurücksetzen
    const resetFilters = () => {
        setSearchQuery('');
        setOnlyFavorites(false);
        setOnlyRated(false);
        setMinQuestions(0);
        setSortOrder('desc');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error" sx={{mt: 4}}>{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{width: '100%', maxWidth: '100vw', overflowX: 'hidden'}}>
            {/* Filterleiste */}
            <Paper elevation={2}
                   sx={{
                       display: 'flex',
                       flexDirection: 'column',
                       gap: 2,
                       mb: 4,
                       px: 2,
                       py: 3,
                       mx: 2,
                       mt: 2
                   }}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2}}>
                        <TextField
                            label="Suche"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <CustomFormControlLabel
                            control={<Checkbox checked={onlyFavorites}
                                               onChange={e => setOnlyFavorites(e.target.checked)}/>}
                            label="Nur Favoriten"
                        />

                        <CustomFormControlLabel
                            control={<Checkbox checked={onlyRated} onChange={e => setOnlyRated(e.target.checked)}/>}
                            label="Nur bewertete"
                        />

                        <Box sx={{width: 150}}>
                            <Typography gutterBottom>≥ Fragen</Typography>
                            <Slider value={minQuestions} onChange={(e, v) => setMinQuestions(v)}
                                    valueLabelDisplay="auto"
                                    min={0} max={20}/>
                        </Box>

                        <FormControl size="small" sx={{minWidth: 150}}>
                            <InputLabel>Sortieren</InputLabel>
                            <CustomSelect value={sortOrder} label="Sortieren"
                                          onChange={e => setSortOrder(e.target.value)}>
                                <MenuItem value="desc">Neueste zuerst</MenuItem>
                                <MenuItem value="asc">Älteste zuerst</MenuItem>
                            </CustomSelect>
                        </FormControl>
                        {user?.role === 'ROLE_ADMIN' && (
                            <FormControl size="small" sx={{minWidth: 150}}>
                                <InputLabel>Zeige</InputLabel>
                                <CustomSelect
                                    value={showAll ? 'all' : 'mine'}
                                    label="Zeige"
                                    onChange={(e) => setShowAll(e.target.value === 'all')}
                                >
                                    <MenuItem value="mine">Meine Quizze</MenuItem>
                                    <MenuItem value="all">Alle Quizze</MenuItem>
                                </CustomSelect>
                            </FormControl>
                        )}
                    </Box>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Button variant="contained" onClick={() => navigate('/quizzes/create')}>
                            Neues Quiz erstellen
                        </Button>

                        {/* Roter Zurücksetzen-Button rechts */}
                        <Button variant="contained" color="error" onClick={resetFilters}>
                            Filter zurücksetzen
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Quiz-Karten */}
            <Grid container spacing={3} sx={{px: 2, pb: 6}}>
                {filtered.map((quiz) => (
                    <Grid item xs={12} sm={6} md={4} key={quiz.id} sx={{display: 'flex'}}>
                        <Card sx={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            flexGrow: 1,
                            height: '100%',
                        }}>
                            <Box sx={{position: 'absolute', top: 2, right: 2}}>
                                {user && (
                                    <IconButton size='small' color='warning' onClick={() => toggleFavorite(quiz.id)}>
                                        {quiz.isFavorite ? <StarIcon/> : <StarBorderIcon/>}
                                    </IconButton>
                                )}
                            </Box>

                            <CardContent sx={{flexGrow: 1}}>
                                <Typography variant='h6' gutterBottom>{quiz.title}</Typography>
                                <Typography variant='body2' color='text.secondary' paragraph>
                                    {quiz.description}
                                </Typography>

                                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2}}>
                                    {quiz.categories?.map(cat => (
                                        <Chip key={cat} label={categoryLabels[cat] || cat} size="small"
                                              color="primary"/>
                                    ))}
                                </Box>

                                {user?.role === 'ROLE_ADMIN' && quiz.creator && (
                                    <Typography variant='body2' color='text.secondary' mb={1}>
                                        Erstellt von: {quiz.creator.name}
                                    </Typography>
                                )}

                                {quiz.ratingCount > 0 ? (
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                        <Rating value={quiz.avgRating} precision={0.1} readOnly size='small'/>
                                        <Typography variant='body2' sx={{ml: 1}}>({quiz.ratingCount})</Typography>
                                    </Box>
                                ) : (
                                    <Typography variant='body2' color='text.secondary' mb={1}>
                                        Noch keine Bewertungen
                                    </Typography>
                                )}
                            </CardContent>

                            <CardActions sx={{justifyContent: 'space-between', mt: 'auto'}}>
                                <Button variant="contained" color="primary" size="small"
                                        onClick={() => navigate(`/quizzes/${quiz.id}`)}>Spielen</Button>
                                <Button variant="contained" color="primary" size="small"
                                        onClick={() => navigate(`/quizzes/edit/${quiz.id}`)}>Bearbeiten</Button>
                                <Button variant="contained" size="small" color="error"
                                        onClick={() => confirmDelete(quiz.id)}>Löschen</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Bestätigungs-Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            >
                <DialogTitle>Quiz wirklich löschen?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Möchtest du dieses Quiz wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                    <Button color="error" variant="contained" onClick={() => {
                        handleDelete(toDeleteId);
                    }}>Löschen</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MeineQuizze;
