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
    FormControl
} from '@mui/material';
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
    const [onlyUnplayed, setOnlyUnplayed] = useState(false); // ⬅ Filter-Flag

    useEffect(() => {
        if (user) {
            axios.get(process.env.REACT_APP_API_URL + '/users/quiz-history')
                .then(res => {
                    const ids = res.data.map((h) => h.quizId);
                    setPlayedQuizIds(new Set(ids));
                })
                .catch(() => console.error("Quiz-History konnte nicht geladen werden"));
        }
    }, [user]);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    useEffect(() => {
        let filtered = quizzes.filter(q =>
            q.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (onlyFavorites && user) {
            filtered = filtered.filter(q => q.isFavorite);
        }

        if (onlyUnplayed && user) {
            filtered = filtered.filter(q => !playedQuizIds.has(q.id));
        }

        if (onlyRated) {
            filtered = filtered.filter(q => q.ratingCount > 0);
        }

        filtered = filtered.filter(q => q.questions.length >= minQuestions);

        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setFilteredQuizzes(filtered);
    }, [searchQuery, quizzes, onlyFavorites, onlyUnplayed, onlyRated, minQuestions, sortOrder, user]);

    const fetchQuizzes = async () => {
        try {
            if(user){
                const [quizRes, favoritesRes] = await Promise.all([
                    axios.get(process.env.REACT_APP_API_URL + '/quizzes'),
                    axios.get(process.env.REACT_APP_API_URL + '/users/favorites'),
                ]);

                const today = new Date().toISOString().split('T')[0];
                const favoriteIds = new Set(favoritesRes.data);

                const quizzesWithFavorites = quizRes.data
                    .filter(q => !(q.title.startsWith('Tägliches Quiz vom') && q.title.includes(today)))
                    .map(q => ({
                        ...q,
                        isFavorite: favoriteIds.has(q.id)
                    }));


                setQuizzes(quizzesWithFavorites);
                setFilteredQuizzes(quizzesWithFavorites);
            }
            else{
                const [quizRes] = await Promise.all([
                    axios.get(process.env.REACT_APP_API_URL + '/quizzes')]);

                const today = new Date().toISOString().split('T')[0];

                const quizzesWithFavorites = quizRes.data
                    .filter(q => !(q.title.startsWith('Tägliches Quiz vom') && q.title.includes(today)))
                    .map(q => ({
                        ...q,
                    }));


                setQuizzes(quizzesWithFavorites);
                setFilteredQuizzes(quizzesWithFavorites);
            }
        } catch (err) {
            setError(err.response?.data?.message ||'Fehler beim Laden der Quizze');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (quizId) => {
        try {
            await axios.delete(process.env.REACT_APP_API_URL + `/quizzes/${quizId}`);
            const updated = quizzes.filter(q => q.id !== quizId);
            setQuizzes(updated);
            setFilteredQuizzes(updated);
        } catch (err) {
            setError(err.response?.data?.message || 'Fehler beim Löschen des Quiz');
        }
    };

    const toggleFavorite = async (quizId) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/quizzes/${quizId}/favorite`);
            const updated = quizzes.map(q =>
                q.id === quizId ? { ...q, isFavorite: res.data.favorited } : q
            );
            setQuizzes(updated);

            // auch filtered aktualisieren, falls du gerade filter aktiv hast
            const filtered = updated.filter(q =>
                q.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredQuizzes(filtered);
        } catch (error) {
            console.error(error.response?.data?.message || 'Fehler beim Favorisieren:', error);
        }
    };


    const handleRandomQuiz = () => {
        if (filteredQuizzes.length === 0) return;
        const random = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
        navigate(`/quizzes/${random.id}`);
    };

    if (loading) {
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
            <Box
                sx={{
                    display: 'flex', flexDirection: 'column', gap: 2,
                    mb: 4, px: 2, mt: 2
                }}
            >
                <TextField
                    label="Suche"
                    variant="outlined"
                    size="small"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {user && (
                        <>
                            <FormControlLabel
                                control={<Checkbox checked={onlyFavorites} onChange={(e) => setOnlyFavorites(e.target.checked)} />}
                                label="Nur Favoriten"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={onlyUnplayed} onChange={(e) => setOnlyUnplayed(e.target.checked)} />}
                                label="Noch nie gespielt"
                            />
                        </>
                    )}
                    <FormControlLabel
                        control={<Checkbox checked={onlyRated} onChange={(e) => setOnlyRated(e.target.checked)} />}
                        label="Nur bewertete"
                    />

                    <Box sx={{ width: 150 }}>
                        <Typography gutterBottom>≥ Fragen</Typography>
                        <Slider
                            value={minQuestions}
                            onChange={(e, val) => setMinQuestions(val)}
                            valueLabelDisplay="auto"
                            min={0}
                            max={20}
                        />
                    </Box>

                    <FormControl sx={{ minWidth: 150 }} size="small">
                        <InputLabel>Sortieren</InputLabel>
                        <Select
                            value={sortOrder}
                            label="Sortieren"
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <MenuItem value="desc">Neueste zuerst</MenuItem>
                            <MenuItem value="asc">Älteste zuerst</MenuItem>
                        </Select>
                    </FormControl>

                    <Button variant="outlined" onClick={handleRandomQuiz} disabled={filteredQuizzes.length === 0}>
                        Zufälliges Quiz starten
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ px: 2 }}>
                {filteredQuizzes.map((quiz) => (
                    <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                        <Card sx={{ position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                {user && (
                                    <IconButton
                                        color="warning"
                                        onClick={() => toggleFavorite(quiz.id)}
                                        size="small"
                                    >
                                        {quiz.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                                    </IconButton>
                                )}
                            </Box>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {quiz.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {quiz.description}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    <Chip
                                        label={`${quiz.questions.length} Fragen`}
                                        size="small"
                                        color="primary"
                                    />
                                    {quiz.isDaily && (
                                        <Chip
                                            label="Tägliches Quiz"
                                            size="small"
                                            color="secondary"
                                        />
                                    )}
                                </Box>

                                {quiz.ratingCount > 0 ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Rating
                                            value={quiz.avgRating}
                                            precision={0.1}
                                            readOnly
                                            size="small"
                                        />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            ({quiz.ratingCount})
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        {quiz.type !== 'daily' && 'Noch keine Bewertungen'}
                                    </Typography>
                                )}
                            </CardContent>

                            <CardActions>
                                <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => navigate(`/quizzes/${quiz.id}`)}
                                >
                                    Spielen
                                </Button>

                                {user && user.id === quiz.creatorId && (
                                    <>
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={() => navigate(`/quizzes/edit/${quiz.id}`)}
                                        >
                                            Bearbeiten
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(quiz.id)}
                                        >
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
