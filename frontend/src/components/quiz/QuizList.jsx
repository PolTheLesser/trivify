import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/api';
import { CustomSelect, CustomFormControlLabel } from '../../CustomElements';

/**
 * QuizList-Komponente
 *
 * Diese Komponente zeigt eine Liste von Quizzen an, die durch verschiedene Filteroptionen durchsucht und sortiert werden können.
 * Nutzer können nach Suchbegriffen filtern, Favoriten und noch nicht gespielte Quizze anzeigen, die Mindestanzahl an Fragen festlegen
 * sowie tägliche Quizze ein- oder ausschließen. Die Sortierung nach Erstellungsdatum (neueste/älteste zuerst) ist ebenfalls möglich.
 *
 * Funktionalitäten:
 * - Laden der Quizdaten und Favoriten (wenn Nutzer eingeloggt)
 * - Laden der Kategorie-Labels zur besseren Anzeige
 * - Laden der vom Nutzer bereits gespielten Quizze zur Filterung „noch nie gespielt“
 * - Synchronisierung der Filter mit URL-Parametern
 * - Filter- und Sortierlogik basierend auf Nutzer-Eingaben und Status
 * - Zufällige Quiz-Navigation
 * - Favoritenstatus toggeln (an/aus)
 * - UI mit Filterleiste, Quiz-Karten und Lade-/Fehleranzeigen
 */
const QuizList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // ─── INITIALIZE FILTER STATES ONCE ────────────────────────────────────────
    const initial = new URLSearchParams(location.search);
    const [searchQuery,   setSearchQuery]   = useState(initial.get('query')         || '');
    const [onlyFavorites, setOnlyFavorites] = useState(user ? initial.get('onlyFavorites') === 'true' : false);
    const [onlyUnplayed,  setOnlyUnplayed]  = useState(user ? initial.get('onlyUnplayed')  === 'true' : false);
    const [onlyRated,     setOnlyRated]     = useState(initial.get('onlyRated')      === 'true');
    const [minQuestions,  setMinQuestions]  = useState(Number(initial.get('minQuestions')) || 0);
    const [sortOrder,     setSortOrder]     = useState(initial.get('sortOrder')     || 'desc');
    const [selectedCategory, setSelectedCategory] = useState(initial.get('selectedCategory') || 'all');
    const [dailyQuizFilter,  setDailyQuizFilter]  = useState(initial.get('dailyQuizFilter')  || 'all');

    // ─── DATA STATES ─────────────────────────────────────────────────────────
    const [quizzes,         setQuizzes]         = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [playedQuizIds,   setPlayedQuizIds]   = useState(new Set());
    const [categoryLabels,  setCategoryLabels]  = useState({});

    // ─── UI STATES ───────────────────────────────────────────────────────────
    const [loading,     setLoading]     = useState(true);
    const [loadingTags, setLoadingTags] = useState(true);
    const [error,       setError]       = useState('');

    // ─── FETCH CATEGORY LABELS ───────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const [valsRes, catsRes] = await Promise.all([
                    axios.get('/categories/values'),
                    axios.get('/categories')
                ]);
                const labels = {};
                catsRes.data.forEach((cat, i) => {
                    labels[cat] = valsRes.data[i] || cat;
                });
                setCategoryLabels(labels);
            } catch (e) {
                console.error('Fehler beim Laden der Kategorienamen', e);
            } finally {
                setLoadingTags(false);
            }
        })();
    }, []);

    // ─── FETCH PLAYED QUIZZES ─────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        axios
            .get('/users/quiz-history')
            .then(res => setPlayedQuizIds(new Set(res.data.map(h => h.quizId))))
            .catch(() => console.error('Quiz history load error'));
    }, [user]);

    // ─── FETCH QUIZZES ────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const [quizRes, favRes] = user
                    ? await Promise.all([axios.get('/quizzes'), axios.get('/users/favorites')])
                    : [await axios.get('/quizzes'), { data: [] }];
                const favSet = new Set(favRes.data);
                const data = quizRes.data.map(q => ({
                    ...q,
                    isFavorite: favSet.has(q.id),
                    isDaily:    q.categories.includes('DAILY_QUIZ')
                }));
                setQuizzes(data);
                setFilteredQuizzes(data);
            } catch (e) {
                setError(e.response?.data?.message || 'Fehler beim Laden der Quizze');
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    // ─── CLIENT-SIDE FILTERING ────────────────────────────────────────────────
    useEffect(() => {
        if (loadingTags) return;
        const q = searchQuery.trim().toLowerCase();
        let filtered = quizzes.filter(qz => {
            const matchText =
                qz.title.toLowerCase().includes(q) ||
                qz.description?.toLowerCase().includes(q) ||
                qz.categories.some(cat => (categoryLabels[cat] || cat).toLowerCase().includes(q));
            const matchCat = selectedCategory === 'all' || qz.categories.includes(selectedCategory);
            return matchText && matchCat;
        });
        if (onlyFavorites && user) filtered = filtered.filter(qz => qz.isFavorite);
        if (onlyUnplayed && user)  filtered = filtered.filter(qz => !playedQuizIds.has(qz.id));
        if (onlyRated)              filtered = filtered.filter(qz => qz.ratingCount > 0);
        filtered = filtered.filter(qz => qz.questions.length >= minQuestions);
        if (dailyQuizFilter === 'exclude') {
            filtered = filtered.filter(qz => !qz.categories.includes('DAILY_QUIZ'));
        }
        filtered.sort((a, b) => {
            const da = new Date(a.createdAt), db = new Date(b.createdAt);
            return sortOrder === 'asc' ? da - db : db - da;
        });
        setFilteredQuizzes(filtered);
    }, [
        searchQuery,
        quizzes,
        categoryLabels,
        loadingTags,
        onlyFavorites,
        onlyUnplayed,
        onlyRated,
        selectedCategory,
        minQuestions,
        sortOrder,
        playedQuizIds,
        dailyQuizFilter,
        user
    ]);

    // ─── MANUAL URL UPDATE ───────────────────────────────────────────────────
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchQuery.trim())         params.set('query', searchQuery.trim());
        if (user && onlyFavorites)      params.set('onlyFavorites', 'true');
        if (user && onlyUnplayed)       params.set('onlyUnplayed', 'true');
        if (onlyRated)                  params.set('onlyRated', 'true');
        if (minQuestions > 0)           params.set('minQuestions', String(minQuestions));
        if (sortOrder !== 'desc')       params.set('sortOrder', sortOrder);
        if (selectedCategory !== 'all') params.set('selectedCategory', selectedCategory);
        if (dailyQuizFilter !== 'all')  params.set('dailyQuizFilter', dailyQuizFilter);
        setSearchParams(params, { replace: true });
    };

    const resetFilters = () => {
        setSearchQuery('');
        setOnlyFavorites(false);
        setOnlyUnplayed(false);
        setOnlyRated(false);
        setMinQuestions(0);
        setSortOrder('desc');
        setDailyQuizFilter('all');
        setSelectedCategory('all');
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    const handleRandomQuiz = () => {
        if (!filteredQuizzes.length) return;
        const random = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
        navigate(`/quizzes/${random.id}`);
    };

    const toggleFavorite = async quizId => {
        try {
            const res = await axios.post(`/users/quizzes/${quizId}/favorite`);
            setQuizzes(prev => prev.map(qz => qz.id === quizId
                ? { ...qz, isFavorite: res.data.favorited }
                : qz
            ));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading || loadingTags) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }
    if (error) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
            {/* Filterleiste */}
            <Paper elevation={2}
                   sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, px: 2, py: 3, mx: 2, mt: 2 }}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                    <TextField
                        size="small"
                        label="Suche"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                    />
                    {user && (
                        <>
                            <CustomFormControlLabel
                                control={<Checkbox checked={onlyFavorites}
                                                   onChange={e => setOnlyFavorites(e.target.checked)} />}
                                label="Nur Favoriten"
                            />
                            <CustomFormControlLabel
                                control={<Checkbox checked={onlyUnplayed}
                                                   onChange={e => setOnlyUnplayed(e.target.checked)} />}
                                label="Noch nie gespielt"
                            />
                        </>
                    )}
                    <CustomFormControlLabel
                        control={<Checkbox checked={onlyRated}
                                           onChange={e => setOnlyRated(e.target.checked)} />}
                        label="Nur bewertete"
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Tägliche Quizze</InputLabel>
                        <CustomSelect
                            value={dailyQuizFilter}
                            label="Tägliche Quizze"
                            onChange={e => setDailyQuizFilter(e.target.value)}
                        >
                            <MenuItem value="all">Alle Quizze</MenuItem>
                            <MenuItem value="exclude">Keine täglichen Quizze</MenuItem>
                        </CustomSelect>
                    </FormControl>
                    <Box sx={{ width: 150 }}>
                        <Typography gutterBottom>≥ Fragen</Typography>
                        <Slider
                            value={minQuestions}
                            onChange={(e, v) => setMinQuestions(v)}
                            valueLabelDisplay="auto"
                            min={0} max={20}
                        />
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sortieren</InputLabel>
                        <CustomSelect
                            value={sortOrder}
                            label="Sortieren"
                            onChange={e => setSortOrder(e.target.value)}
                        >
                            <MenuItem value="desc">Neueste zuerst</MenuItem>
                            <MenuItem value="asc">Älteste zuerst</MenuItem>
                        </CustomSelect>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" onClick={applyFilters}>Filter anwenden</Button>
                        <Button variant="outlined" color="error" onClick={resetFilters}>Zurücksetzen</Button>
                    </Box>
                    <Button variant="contained" onClick={handleRandomQuiz} disabled={!filteredQuizzes.length}>
                        Zufälliges Quiz
                    </Button>
                </Box>
            </Paper>

            {/* Quiz-Karten */}
            <Grid container spacing={3} sx={{ px: 2, pb: 6 }}>
                {filteredQuizzes.map(qz => (
                    <Grid item xs={12} sm={6} md={4} key={qz.id} sx={{ display: 'flex' }}>
                        <Card sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            {user && (
                                <IconButton
                                    size="small"
                                    color="warning"
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                    onClick={() => toggleFavorite(qz.id)}
                                >
                                    {qz.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                                </IconButton>
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>{qz.title}</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {qz.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    {qz.categories.map(cat => (
                                        <Chip key={cat} label={categoryLabels[cat] || cat} size="small" color="primary" />
                                    ))}
                                </Box>
                                {qz.ratingCount > 0 ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Rating value={qz.avgRating} precision={0.1} readOnly size="small" />
                                        <Typography variant="body2" sx={{ ml: 1 }}>({qz.ratingCount})</Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        Noch keine Bewertungen
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                <Button variant="contained" color="primary" onClick={() => navigate(`/quizzes/${qz.id}`)}>
                                    Spielen
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default QuizList;