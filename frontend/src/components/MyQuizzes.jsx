import React, { useEffect, useState } from 'react';
import {
    Container, Grid, Card, CardContent, CardActions,
    Typography, Button, Box, CircularProgress,
    Alert, TextField, Slider, MenuItem, Select,
    InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/api';

const MeineQuizze = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [minQuestions, setMinQuestions] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [quizRes] = await Promise.all([
                axios.get(process.env.REACT_APP_API_URL +'/quizzes'),
            ]);

            const ownQuizzes = quizRes.data
                .filter(q => q.creator?.id === user.id)
                .map(q => ({
                    ...q,
                }));

            setQuizzes(ownQuizzes);
            setFiltered(ownQuizzes);
        } catch (err) {
            setError('Fehler beim Laden der Quizze');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = quizzes.filter(q =>
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            q.questions.length >= minQuestions
        );

        result.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setFiltered(result);
    }, [searchQuery, minQuestions, sortOrder, quizzes]);


    const handleDelete = async (quizId) => {
        try {
            await axios.delete(`/${quizId}`);
            const updated = quizzes.filter(q => q.id !== quizId);
            setQuizzes(updated);
        } catch {
            setError('Quiz konnte nicht gelöscht werden.');
        }
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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    label="Suche"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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

                <FormControl sx={{ minWidth: 160 }} size="small">
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

                <Button variant="contained" onClick={() => navigate('/quizzes/create')}>
                    Neues Quiz erstellen
                </Button>
            </Box>

            <Grid container spacing={3}>
                {filtered.map((quiz) => (
                    <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                        <Card>

                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {quiz.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {quiz.description}
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <Button size="small" onClick={() => navigate(`/quizzes/${quiz.id}`)}>Spielen</Button>
                                <Button size="small" onClick={() => navigate(`/quizzes/edit/${quiz.id}`)}>Bearbeiten</Button>
                                <Button size="small" color="error" onClick={() => handleDelete(quiz.id)}>Löschen</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default MeineQuizze;
