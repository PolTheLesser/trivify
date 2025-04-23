import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    Chip,
    TextField,
    Rating,
    FormControlLabel,
    Checkbox,
    Slider,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    InputAdornment,
    Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import IconButton from '@mui/material/IconButton';

const QuizList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const [onlyRated, setOnlyRated] = useState(false);
    const [minQuestions, setMinQuestions] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');
    const [playedQuizIds, setPlayedQuizIds] = useState(new Set());
    const [onlyUnplayed, setOnlyUnplayed] = useState(false);
    const [dailyFilter, setDailyFilter] = useState('all');
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (user) {
            axios.get(`${process.env.REACT_APP_API_URL}/users/quiz-history`)
                .then(res => setPlayedQuizIds(new Set(res.data.map(h => h.quizId))))
                .catch(() => console.error("Quiz-History konnte nicht geladen werden"));
        }
    }, [user]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const [quizRes, favRes] = user
                    ? await Promise.all([
                        axios.get(`${process.env.REACT_APP_API_URL}/quizzes`),
                        axios.get(`${process.env.REACT_APP_API_URL}/users/favorites`)
                    ])
                    : [ await axios.get(`${process.env.REACT_APP_API_URL}/quizzes`), { data: [] } ];

                const favoriteIds = new Set(favRes.data || []);
                const data = quizRes.data.map(q => ({
                    ...q,
                    isFavorite: favoriteIds.has(q.id),
                    isDaily: !!q.dailyQuiz,
                    date: q.date
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
        let filtered = quizzes
            .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));

        if (onlyFavorites && user) filtered = filtered.filter(q => q.isFavorite);
        if (onlyUnplayed && user)  filtered = filtered.filter(q => !playedQuizIds.has(q.id));
        if (onlyRated)              filtered = filtered.filter(q => q.ratingCount > 0);

        if (dailyFilter === 'daily')    filtered = filtered.filter(q => q.isDaily);
        else if (dailyFilter === 'nonDaily') filtered = filtered.filter(q => !q.isDaily);

        filtered = filtered.filter(q => q.questions.length >= minQuestions);

        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setFilteredQuizzes(filtered);
    }, [searchQuery, onlyFavorites, onlyUnplayed, onlyRated, dailyFilter, minQuestions, sortOrder, quizzes, playedQuizIds, today]);

    const toggleFavorite = async (quizId) => {
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/users/quizzes/${quizId}/favorite`
            );
            setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, isFavorite: res.data.favorited } : q));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (quizId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/quizzes/${quizId}`);
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
        } catch (err) {
            setError(err.response?.data?.message || 'Fehler beim Löschen des Quiz');
        }
    };

    const handleRandomQuiz = () => {
        if (!filteredQuizzes.length) return;
        const random = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
        navigate(`/quizzes/${random.id}`);
    };

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress/></Box>;
    if (error)   return <Container maxWidth="sm"><Alert severity="error" sx={{ mt:4 }}>{error}</Alert></Container>;

    return (
        <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
            <Paper elevation={2} sx={{ display:'flex', flexDirection:'column', gap:2, mb:4, px:2, py:3, mx:2, mt:2 }}>
                <TextField
                    label="Quiz suchen"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />

                <Box sx={{ display:'flex', flexWrap:'wrap', gap:2 }}>
                    {user && <>
                        <FormControlLabel control={<Checkbox checked={onlyFavorites} onChange={e => setOnlyFavorites(e.target.checked)}/>} label="Nur Favoriten" />
                        <FormControlLabel control={<Checkbox checked={onlyUnplayed} onChange={e => setOnlyUnplayed(e.target.checked)}/>} label="Noch nie gespielt" />
                    </>}

                    <FormControlLabel control={<Checkbox checked={onlyRated} onChange={e => setOnlyRated(e.target.checked)}/>} label="Nur bewertete" />

                    <FormControl size="small" sx={{ minWidth:160 }}>
                        <InputLabel>Quiz‑Typ</InputLabel>
                        <Select value={dailyFilter} label="Quiz‑Typ" onChange={e => setDailyFilter(e.target.value)}>
                            <MenuItem value="all">Alle Quizze</MenuItem>
                            <MenuItem value="daily">Nur tägliche Quizze</MenuItem>
                            <MenuItem value="nonDaily">Keine täglichen Quizze</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ width:150 }}>
                        <Typography gutterBottom>≥ Fragen</Typography>
                        <Slider value={minQuestions} onChange={(e,v) => setMinQuestions(v)} valueLabelDisplay="auto" min={0} max={20}/>
                    </Box>

                    <FormControl size="small" sx={{ minWidth:150 }}>
                        <InputLabel>Sortieren</InputLabel>
                        <Select value={sortOrder} label="Sortieren" onChange={e => setSortOrder(e.target.value)}>
                            <MenuItem value="desc">Neueste zuerst</MenuItem>
                            <MenuItem value="asc">Älteste zuerst</MenuItem>
                        </Select>
                    </FormControl>

                    <Button variant="contained" onClick={handleRandomQuiz} disabled={!filteredQuizzes.length}>
                        Zufälliges Quiz
                    </Button>
                </Box>
            </Paper>

            <Grid container spacing={3} sx={{ px:2 }}>
                {filteredQuizzes.map(q => (
                    <Grid item xs={12} sm={6} md={4} key={q.id}>
                        <Card sx={{ position:'relative' }}>
                            <Box sx={{ position:'absolute', top:2, right:2 }}>
                                {user && <IconButton size="small" color="warning" onClick={() => toggleFavorite(q.id)}>
                                    {q.isFavorite ? <StarIcon/> : <StarBorderIcon/>}
                                </IconButton>}
                            </Box>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{q.title}</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>{q.description}</Typography>
                                <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:2 }}>
                                    <Chip label={`${q.questions.length} Fragen`} size="small" color="primary"/>
                                    {q.isDaily && <Chip label="Tägliches Quiz" size="small" color="secondary"/>}
                                </Box>
                                {q.ratingCount > 0 ? (
                                    <Box sx={{ display:'flex', alignItems:'center', mb:1 }}>
                                        <Rating value={q.avgRating} precision={0.1} readOnly size="small"/>
                                        <Typography variant="body2" sx={{ ml:1 }}>({q.ratingCount})</Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        Noch keine Bewertungen
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" onClick={() => navigate(`/quizzes/${q.id}`)}>Spielen</Button>
                                {user && user.id === q.creatorId && <>
                                    <Button size="small" color="primary" onClick={() => navigate(`/quizzes/edit/${q.id}`)}>Bearbeiten</Button>
                                    <Button size="small" color="error" onClick={() => handleDelete(q.id)}>Löschen</Button>
                                </>}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default QuizList;
