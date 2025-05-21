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
import { CustomSelect, CustomFormControlLabel } from "../CustomElements";

const QuizList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Query state
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');

    // Data states
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [playedQuizIds, setPlayedQuizIds] = useState(new Set());
    const [categoryLabels, setCategoryLabels] = useState({});

    // UI states
    const [loading, setLoading] = useState(true);
    const [loadingTags, setLoadingTags] = useState(true);
    const [error, setError] = useState('');
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const [onlyUnplayed, setOnlyUnplayed] = useState(false);
    const [onlyRated, setOnlyRated] = useState(false);
    const [minQuestions, setMinQuestions] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dailyQuizFilter, setDailyQuizFilter] = useState('all');

    const handleRandomQuiz = () => {
        if (!filteredQuizzes.length) return;
        const random = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
        navigate(`/quizzes/${random.id}`);
    };

    useEffect(() => {
        setSearchQuery(searchParams.get('query') || '');
    }, [searchParams]);

    const handleSearchChange = e => {
        const val = e.target.value;
        setSearchQuery(val);
        if (location.pathname === '/quizzes') {
            if (val) setSearchParams({ query: val });
            else setSearchParams({});
        }
    };

    const handleSearchKeyDown = e => {
        if (e.key === 'Enter') {
            const q = searchQuery.trim();
            navigate(`/quizzes${q ? `?query=${encodeURIComponent(q)}` : ''}`);
        }
    };

    useEffect(() => {
        const fetchCategoryLabels = async () => {
            try {
                const [valsRes, catsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/categories/values`), // ["Sport", "Geschichte", "Wissenschaft"]
                    axios.get(`${process.env.REACT_APP_API_URL}/categories`)          // ["SPORT", "HISTORY", "SCIENCE"]
                ]);

                const values = valsRes.data; // Labels
                const cats = catsRes.data;   // Enum-Namen

                const labels = {};
                cats.forEach((cat, index) => {
                    labels[cat] = values[index] || cat; // fallback auf Enum-Name falls Label fehlt
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

    useEffect(() => {
        if (!user) return;
        axios
            .get(`${process.env.REACT_APP_API_URL}/users/quiz-history`)
            .then(res => setPlayedQuizIds(new Set(res.data.map(h => h.quizId))))
            .catch(() => console.error('Quiz history load error'));
    }, [user]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const [quizRes, favRes] = user
                    ? await Promise.all([
                        axios.get(`${process.env.REACT_APP_API_URL}/quizzes`),
                        axios.get(`${process.env.REACT_APP_API_URL}/users/favorites`)
                    ])
                    : [await axios.get(`${process.env.REACT_APP_API_URL}/quizzes`), { data: [] }];
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
        dailyQuizFilter
    ]);

    const toggleFavorite = async quizId => {
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/users/quizzes/${quizId}/favorite`
            );
            setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, isFavorite: res.data.favorited } : q));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async quizId => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/quizzes/${quizId}`);
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
        } catch (err) {
            setError(err.response?.data?.message || 'Fehler beim Löschen des Quiz');
        }
    };

    if (loading || loadingTags) {
        return (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth='sm'>
                <Alert severity='error' sx={{ mt: 4 }}>{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
            {/* Filterleiste */}
            <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, px: 2, py: 3, mx: 2, mt: 2 }}>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {user && (
                        <>
                            <CustomFormControlLabel
                                control={<Checkbox checked={onlyFavorites} onChange={e => setOnlyFavorites(e.target.checked)} />}
                                label="Nur Favoriten"
                            />
                            <CustomFormControlLabel
                                control={<Checkbox checked={onlyUnplayed} onChange={e => setOnlyUnplayed(e.target.checked)} />}
                                label="Noch nie gespielt"
                            />
                        </>
                    )}

                    <CustomFormControlLabel
                        control={<Checkbox checked={onlyRated} onChange={e => setOnlyRated(e.target.checked)} />}
                        label="Nur bewertete"
                    />

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Tägliche Quizze</InputLabel>
                        <CustomSelect
                            value={dailyQuizFilter}
                            label="Tägliche Quizze"
                            onChange={(e) => setDailyQuizFilter(e.target.value)}
                        >
                            <MenuItem value="exclude">Keine täglichen Quizze</MenuItem>
                            <MenuItem value="all">Alle Quizze</MenuItem>
                        </CustomSelect>
                    </FormControl>

                    <Box sx={{ width: 150 }}>
                        <Typography gutterBottom>≥ Fragen</Typography>
                        <Slider value={minQuestions} onChange={(e, v) => setMinQuestions(v)} valueLabelDisplay="auto" min={0} max={20} />
                    </Box>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sortieren</InputLabel>
                        <CustomSelect value={sortOrder} label="Sortieren" onChange={e => setSortOrder(e.target.value)}>
                            <MenuItem value="desc">Neueste zuerst</MenuItem>
                            <MenuItem value="asc">Älteste zuerst</MenuItem>
                        </CustomSelect>
                    </FormControl>

                    <Button variant="contained" onClick={handleRandomQuiz} disabled={!filteredQuizzes.length}>
                        Zufälliges Quiz
                    </Button>
                </Box>
            </Paper>

            <Grid container spacing={3} sx={{ px: 2 }}>
                {filteredQuizzes.map(q => (
                    <Grid item xs={12} sm={6} md={4} key={q.id}>
                        <Card sx={{ position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 2, right: 2 }}>
                                {user && (
                                    <IconButton size='small' color='warning' onClick={() => toggleFavorite(q.id)}>
                                        {q.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                                    </IconButton>
                                )}
                            </Box>
                            <CardContent>
                                <Typography variant='h6' gutterBottom>{q.title}</Typography>
                                <Typography variant='body2' color='text.secondary' paragraph>
                                    {q.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    {q.categories?.map(cat => (
                                        <Chip key={cat} label={categoryLabels[cat] || cat} size="small" color="primary" />
                                    ))}
                                </Box>
                                {q.ratingCount > 0 ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Rating value={q.avgRating} precision={0.1} readOnly size='small' />
                                        <Typography variant='body2' sx={{ ml: 1 }}>({q.ratingCount})</Typography>
                                    </Box>
                                ) : (
                                    <Typography variant='body2' color='text.secondary' mb={1}>
                                        Noch keine Bewertungen
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions>
                                <Button size='small' color='primary' onClick={() => navigate(`/quizzes/${q.id}`)}>
                                    Spielen
                                </Button>
                                {user && user.id === q.creatorId && (
                                    <>
                                        <Button size='small' color='primary' onClick={() => navigate(`/quizzes/edit/${q.id}`)}>
                                            Bearbeiten
                                        </Button>
                                        <Button size='small' color='error' onClick={() => handleDelete(q.id)}>
                                            Löschen
                                        </Button>
                                    </>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default QuizList;
