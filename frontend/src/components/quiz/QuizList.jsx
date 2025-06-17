import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    const [searchParams, setSearchParams] = useSearchParams();

    // Filter values from URL
    const searchQueryRaw = searchParams.get('query') || '';
    const searchQuery = searchQueryRaw.trim().toLowerCase();
    const onlyFavorites = user ? searchParams.get('onlyFavorites') === 'true' : false;
    const onlyUnplayed = user ? searchParams.get('onlyUnplayed') === 'true' : false;
    const onlyRated = searchParams.get('onlyRated') === 'true';
    const minQuestions = Number(searchParams.get('minQuestions')) || 0;
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dailyQuizFilter = searchParams.get('dailyQuizFilter') || 'all';

    // Data states
    const [quizzes, setQuizzes] = useState([]);
    const [playedQuizIds, setPlayedQuizIds] = useState(new Set());
    const [categoryLabels, setCategoryLabels] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingTags, setLoadingTags] = useState(true);
    const [error, setError] = useState('');

    // Utility to update URL params
    const setParam = (key, value, defaultValue) => {
        const params = new URLSearchParams(searchParams);
        if (
            value === defaultValue ||
            value === false ||
            (typeof value === 'string' && value === '')
        ) {
            params.delete(key);
        } else {
            params.set(key, value.toString());
        }
        setSearchParams(params, { replace: true });
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchParams({}, { replace: true });
    };

    // Load category labels
    useEffect(() => {
        const fetchCategoryLabels = async () => {
            try {
                const [valsRes, catsRes] = await Promise.all([
                    axios.get('/categories/values'),
                    axios.get('/categories')
                ]);
                const values = valsRes.data;
                const cats = catsRes.data;
                const labels = {};
                cats.forEach((cat, i) => {
                    labels[cat] = values[i] || cat;
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

    // Load played quizzes
    useEffect(() => {
        if (!user) return;
        axios.get('/users/quiz-history')
            .then(res => setPlayedQuizIds(new Set(res.data.map(h => h.quizId))))
            .catch(() => console.error('Quiz history load error'));
    }, [user]);

    // Load quizzes and favorites
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const [quizRes, favRes] = user
                    ? await Promise.all([axios.get('/quizzes'), axios.get('/users/favorites')])
                    : [await axios.get('/quizzes'), { data: [] }];
                const favoriteIds = new Set(favRes.data || []);
                const data = quizRes.data.map(q => ({
                    ...q,
                    isFavorite: favoriteIds.has(q.id),
                    isDaily: !!q.dailyQuiz
                }));
                setQuizzes(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Fehler beim Laden der Quizze');
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [user]);

    // Filter and sort quizzes
    const filteredQuizzes = useMemo(() => {
        if (loadingTags) return [];
        let list = quizzes.filter(q => {
            const matchesSearch =
                q.title.toLowerCase().includes(searchQuery) ||
                q.description?.toLowerCase().includes(searchQuery) ||
                q.categories.some(cat =>
                    (categoryLabels[cat] || cat).toLowerCase().includes(searchQuery)
                );
            return matchesSearch;
        });
        if (onlyFavorites && user) {
            list = list.filter(q => q.isFavorite);
        }
        if (onlyUnplayed && user) {
            list = list.filter(q => !playedQuizIds.has(q.id));
        }
        if (onlyRated) {
            list = list.filter(q => q.ratingCount > 0);
        }
        list = list.filter(q => q.questions.length >= minQuestions);
        if (dailyQuizFilter === 'exclude') {
            list = list.filter(q => !q.categories.includes('DAILY_QUIZ'));
        }
        list.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        return list;
    }, [
        quizzes,
        categoryLabels,
        loadingTags,
        onlyFavorites,
        onlyUnplayed,
        onlyRated,
        minQuestions,
        dailyQuizFilter,
        sortOrder,
        playedQuizIds,
        user,
        searchQuery
    ]);

    // Navigate to random quiz
    const handleRandomQuiz = () => {
        if (!filteredQuizzes.length) return;
        const rnd = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
        navigate(`/quizzes/${rnd.id}`);
    };

    // Toggle favorite
    const toggleFavorite = async quizId => {
        try {
            const res = await axios.post(`/users/quizzes/${quizId}/favorite`);
            setQuizzes(prev =>
                prev.map(q => (q.id === quizId ? { ...q, isFavorite: res.data.favorited } : q))
            );
        } catch {
            console.error('Fehler beim Umschalten des Favoritenstatus');
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
            <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, px: 2, py: 3, mx: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                    {user && (
                        <>
                            <CustomFormControlLabel
                                control={<Checkbox checked={onlyFavorites} onChange={e => setParam('onlyFavorites', e.target.checked, false)} />}
                                label="Nur Favoriten"
                            />
                            <CustomFormControlLabel
                                control={<Checkbox checked={onlyUnplayed} onChange={e => setParam('onlyUnplayed', e.target.checked, false)} />}
                                label="Noch nie gespielt"
                            />
                        </>
                    )}
                    <CustomFormControlLabel
                        control={<Checkbox checked={onlyRated} onChange={e => setParam('onlyRated', e.target.checked, false)} />}
                        label="Nur bewertete"
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Tägliche Quizze</InputLabel>
                        <CustomSelect
                            value={dailyQuizFilter}
                            label="Tägliche Quizze"
                            onChange={e => setParam('dailyQuizFilter', e.target.value, 'all')}
                        >
                            <MenuItem value="all">Alle Quizze</MenuItem>
                            <MenuItem value="exclude">Keine täglichen Quizze</MenuItem>
                        </CustomSelect>
                    </FormControl>
                    <Box sx={{ width: 150 }}>
                        <Typography gutterBottom>≥ Fragen</Typography>
                        <Slider
                            value={minQuestions}
                            onChange={(_, v) => setParam('minQuestions', v, 0)}
                            valueLabelDisplay="auto"
                            min={0}
                            max={20}
                        />
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sortieren</InputLabel>
                        <CustomSelect
                            value={sortOrder}
                            label="Sortieren"
                            onChange={e => setParam('sortOrder', e.target.value, 'desc')}
                        >
                            <MenuItem value="desc">Neueste zuerst</MenuItem>
                            <MenuItem value="asc">Älteste zuerst</MenuItem>
                        </CustomSelect>
                    </FormControl>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button variant="contained" onClick={handleRandomQuiz} disabled={!filteredQuizzes.length}>
                        Zufälliges Quiz
                    </Button>
                    <Button variant="contained" color="error" onClick={resetFilters}>
                        Filter zurücksetzen
                    </Button>
                </Box>
            </Paper>

            <Grid container spacing={3} sx={{ px: 2, pb: 6 }}>
                {filteredQuizzes.map(q => (
                    <Grid item xs={12} sm={6} md={4} key={q.id} sx={{ display: 'flex' }}>
                        <Card sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
                            {user && (
                                <Box sx={{ position: 'absolute', top: 2, right: 2 }}>
                                    <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={() => toggleFavorite(q.id)}
                                    >
                                        {q.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                                    </IconButton>
                                </Box>
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>{q.title}</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {q.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    {q.categories.map(cat => (
                                        <Chip key={cat} label={categoryLabels[cat] || cat} size="small" color="primary" />
                                    ))}
                                </Box>
                                {q.ratingCount > 0 ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Rating value={q.avgRating} precision={0.1} readOnly size="small" />
                                        <Typography variant="body2" sx={{ ml: 1 }}>({q.ratingCount})</Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        Noch keine Bewertungen
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                <Button variant="contained" color="primary" onClick={() => navigate(`/quizzes/${q.id}`)}>
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