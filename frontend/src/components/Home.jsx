import React from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    Grid,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {useAuth} from '../contexts/AuthContext';
import ScoreBoard from "./ScoreBoard";
import CasinoIcon from '@mui/icons-material/Casino';

const Welcome = () => {
    const {user} = useAuth();
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box sx={{mt: 8, mb: 4}}>
                <Paper elevation={3} sx={{p: 4}}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Willkommen!
                    </Typography>
                    <Typography variant="h6" color="text.secondary" align="center" paragraph>
                        Starten Sie Ihre Quiz-Reise
                    </Typography>
                </Paper>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                        onClick={() => navigate('/quizzes')}
                    >
                        <QuizIcon sx={{fontSize: 60, color: 'primary.main', mb: 2}}/>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Quizsammlung
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Entdecken Sie unsere Sammlung von Quizzen und testen Sie Ihr Wissen
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                        onClick={() => navigate('/daily-quiz')}
                    >
                        <EmojiEventsIcon sx={{fontSize: 60, color: 'secondary.main', mb: 2}}/>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Tägliches Quiz
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Nehmen Sie an unserem täglichen Quiz teil und verbessern Sie Ihre Punktzahl
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    backgroundColor: theme => theme.palette.background.default,
                    padding: '1em 0',
                    width: '100%',
                    textAlign: 'center',
                    borderTop: '1px solid #e7e7e7',
                    zIndex: 1000,
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CasinoIcon />}
                    onClick={() => {
                        if (quizzes.length > 0) {
                            const random = quizzes[Math.floor(Math.random() * quizzes.length)];
                            navigate(`/quizzes/${random.id}`);
                        }
                    }}
                >
                    Zufälliges Quiz starten
                </Button>
            </Box>
        </Container>
    );
};

export default Welcome; 