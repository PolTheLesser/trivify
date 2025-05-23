import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
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
import {useAuth} from '../contexts/AuthContext';
import axios from '../api/api';
import {CustomSelect, CustomFormControlLabel} from "../CustomElements";

const QuizList = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Filter-States initialisieren mit URL-Werten, user-only Filter nur wenn user da ist
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [onlyFavorites, setOnlyFavorites] = useState(() => user ? searchParams.get('onlyFavorites') === 'true' : false);
    const [onlyUnplayed, setOnlyUnplayed] = useState(() => user ? searchParams.get('onlyUnplayed') === 'true' : false);
    const [onlyRated, setOnlyRated] = useState(searchParams.get('onlyRated') === 'true');
    const [minQuestions, setMinQuestions] = useState(Number(searchParams.get('minQuestions')) || 0);
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('selectedCategory') || 'all');
    const [dailyQuizFilter, setDailyQuizFilter] = useState(searchParams.get('dailyQuizFilter') || 'all');

    // Daten States
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [playedQuizIds, setPlayedQuizIds] = useState(new Set());
    const [categoryLabels, setCategoryLabels] = useState({});

    // UI States
    const [loading, setLoading] = useState(true);
    const [loadingTags, setLoadingTags] = useState(true);
    const [error, setError] = useState('');

    // Zufallsquiz-Navigation
    const handleRandomQuiz = () => {
        if (!filteredQuizzes.length) return;
        const random = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
        navigate(`/quizzes/${random.id}`);
    };

    // Wenn sich die URL ändert: searchQuery updaten
    useEffect(() => {
        setSearchQuery(searchParams.get('query') || '');
    }, [searchParams]);

    // Wenn User weg ist: user-only Filter zurücksetzen und aus URL entfernen
    useEffect(() => {
        if (!user) {
            setOnlyFavorites(false);
            setOnlyUnplayed(false);

            const params = Object.fromEntries([...searchParams]);
            delete params.onlyFavorites;
            delete params.onlyUnplayed;
            setSearchParams(params, {replace: true});
        }
    }, [user, searchParams, setSearchParams]);

    // URL synchronisieren mit Filter-States, user-only Filter nur wenn User da ist
    useEffect(() => {
        const params = {};

        if (searchQuery) params.query = searchQuery;

        if (user) {
            if (onlyFavorites) params.onlyFavorites = 'true';
            if (onlyUnplayed) params.onlyUnplayed = 'true';
        }

        if (onlyRated) params.onlyRated = 'true';
        if (minQuestions) params.minQuestions = minQuestions.toString();
        if (sortOrder !== 'desc') params.sortOrder = sortOrder;
        if (selectedCategory !== 'all') params.selectedCategory = selectedCategory;
        if (dailyQuizFilter !== 'all') params.dailyQuizFilter = dailyQuizFilter;

        setSearchParams(params, {replace: true});
    }, [
        searchQuery,
        onlyFavorites,
        onlyUnplayed,
        onlyRated,
        minQuestions,
        sortOrder,
        selectedCategory,
        dailyQuizFilter,
        user,
        setSearchParams
    ]);

    // Kategorien laden
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

    // Gespielte Quizze laden (nur wenn User da)
    useEffect(() => {
        if (!user) return;
        axios
            .get(`${process.env.REACT_APP_API_URL}/users/quiz-history`)
            .then(res => setPlayedQuizIds(new Set(res.data.map(h => h.quizId))))
            .catch(() => console.error('Quiz history load error'));
    }, [user]);

    // Quiz-Daten laden (inkl. Favoriten, wenn User da)
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const [quizRes, favRes] = user
                    ? await Promise.all([
                        axios.get(`${process.env.REACT_APP_API_URL}/quizzes`),
                        axios.get(`${process.env.REACT_APP_API_URL}/users/favorites`)
                    ])
                    : [await axios.get(`${process.env.REACT_APP_API_URL}/quizzes`), {data: []}];

                const favoriteIds = new Set(favRes.data || []);
                const data = quizRes.data.map(q => ({
                    ...q,
                    isFavorite: favoriteIds.has(q.id),
                    isDaily: !!q.dailyQuiz
                }));
                setQuizzes(data);
                setFilteredQuizzes(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Fehler beim Laden der Quizze');
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [user]);

    // Filter anwenden, wenn sich Filter/Quizzes/Kategorien/Spielstatus ändern
    useEffect(() => {
        if (loadingTags) return;
        const q = searchQuery.trim().toLowerCase();

        let filtered = quizzes.filter(quiz => {
            const matchesSearch =
                quiz.title.toLowerCase().includes(q) ||
                quiz.description?.toLowerCase().includes(q) ||
                quiz.categories.some(cat =>
                    (categoryLabels[cat] || cat).toLowerCase().includes(q)
                );

            const matchesCategory =
                selectedCategory === 'all' || quiz.categories.includes(selectedCategory);

            return matchesSearch && matchesCategory;
        });

        if (onlyFavorites && user) filtered = filtered.filter(q => q.isFavorite);
        if (onlyUnplayed && user) filtered = filtered.filter(q => !playedQuizIds.has(q.id));
        if (onlyRated) filtered = filtered.filter(q => q.ratingCount > 0);
        filtered = filtered.filter(q => q.questions.length >= minQuestions);

        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        if (dailyQuizFilter === 'exclude') {
            filtered = filtered.filter(q => !q.categories.includes('DAILY_QUIZ'));
        }

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

    // Favoriten umschalten
    const toggleFavorite = async quizId => {
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/users/quizzes/${quizId}/favorite`
            );
            setQuizzes(prev =>
                prev.map(q => (q.id === quizId ? {...q, isFavorite: res.data.favorited} : q))
            );
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || loadingTags) {
        return (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth='sm'>
                <Alert severity='error' sx={{mt: 4}}>{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{width: '100%', maxWidth: '100vw', overflowX: 'hidden'}}>
            {/* Filterleiste */}
            <Paper
                elevation={2}
                sx={{display: 'flex', flexDirection: 'column', gap: 2, mb: 4, px: 2, py: 3, mx: 2, mt: 2}}
            >
                <Box sx={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2}}>
                    {user && (
                        <>
                            <CustomFormControlLabel
                                control={
                                    <Checkbox
                                        checked={onlyFavorites}
                                        onChange={e => setOnlyFavorites(e.target.checked)}
                                    />
                                }
                                label="Nur Favoriten"
                            />
                            <CustomFormControlLabel
                                control={
                                    <Checkbox
                                        checked={onlyUnplayed}
                                        onChange={e => setOnlyUnplayed(e.target.checked)}
                                    />
                                }
                                label="Noch nie gespielt"
                            />
                        </>
                    )}

                    <CustomFormControlLabel
                        control={
                            <Checkbox
                                checked={onlyRated}
                                onChange={e => setOnlyRated(e.target.checked)}
                            />
                        }
                        label="Nur bewertete"
                    />

                    <FormControl size="small" sx={{minWidth: 200}}>
                        <InputLabel>Tägliche Quizze</InputLabel>
                        <CustomSelect
                            value={dailyQuizFilter}
                            label="Tägliche Quizze"
                            onChange={e => setDailyQuizFilter(e.target.value)}
                        >
                            <MenuItem value="exclude">Keine täglichen Quizze</MenuItem>
                            <MenuItem value="all">Alle Quizze</MenuItem>
                        </CustomSelect>
                    </FormControl>

                    <Box sx={{width: 150}}>
                        <Typography gutterBottom>≥ Fragen</Typography>
                        <Slider
                            value={minQuestions}
                            onChange={(e, v) => setMinQuestions(v)}
                            valueLabelDisplay="auto"
                            min={0}
                            max={20}
                        />
                    </Box>

                    <FormControl size="small" sx={{minWidth: 150}}>
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

                    <Button variant="contained" onClick={handleRandomQuiz} disabled={!filteredQuizzes.length}>
                        Zufälliges Quiz
                    </Button>
                </Box>
            </Paper>

            <Grid container spacing={3} sx={{px: 2, pb: 6}}>
                {filteredQuizzes.map(q => (
                    <Grid item xs={12} sm={6} md={4} key={q.id} sx={{display: 'flex'}}>
                        <Card
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: 1,
                                height: '100%'
                            }}
                        >
                            <Box sx={{position: 'absolute', top: 2, right: 2}}>
                                {user && (
                                    <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={() => toggleFavorite(q.id)}
                                    >
                                        {q.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                                    </IconButton>
                                )}
                            </Box>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {q.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {q.description}
                                </Typography>
                                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2}}>
                                    {q.categories?.map(cat => (
                                        <Chip
                                            key={cat}
                                            label={categoryLabels[cat] || cat}
                                            size="small"
                                            color="primary"
                                        />
                                    ))}
                                </Box>
                                {q.ratingCount > 0 ? (
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                        <Rating value={q.avgRating} precision={0.1} readOnly size="small" />
                                        <Typography variant="body2" sx={{ml: 1}}>
                                            ({q.ratingCount})
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        Noch keine Bewertungen
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions sx={{mt: 'auto', justifyContent: 'center', pb: 2}}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate(`/quizzes/${q.id}`)}
                                >
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