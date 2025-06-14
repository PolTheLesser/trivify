import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CasinoIcon from '@mui/icons-material/Casino';
import axios from '../api/api';

/**
 * Welcome-Komponente
 *
 * Diese Komponente dient als Willkommensseite für angemeldete Benutzer und bietet eine Übersicht über verschiedene Quizoptionen.
 * Sie lädt keine Benutzerdaten aktiv, sondern nutzt den Auth-Kontext, um den angemeldeten Nutzer zu identifizieren.
 * Über interaktive Kacheln kann der Benutzer ein tägliches Quiz starten, ein zufälliges Quiz auswählen oder die komplette Quizsammlung durchsuchen.
 *
 * Funktionalitäten:
 * - Anzeige einer Begrüßungsnachricht und kurzer Einführung
 * - Navigation zu „Tägliches Quiz“ per Klick auf entsprechende Kachel
 * - Auswahl und Start eines zufälligen Quiz, das per API geladen wird
 * - Navigation zur Quizsammlung
 * - Benutzerfreundliche Gestaltung mit Hover-Effekten und Icons
 */
const Welcome = () => {
    const navigate = useNavigate();

    const startRandomQuiz = async () => {
        try {
            const quizRes = await axios.get(`/quizzes`);
            const data = quizRes.data.map(q => ({
                ...q,
                isDaily: !!q.dailyQuiz,
                date: q.date,
            }));
            if (data.length === 0) return;
            const random = data[Math.floor(Math.random() * data.length)];
            navigate(`/quizzes/${random.id}`);
        } catch (error) {
            console.error('Error starting random quiz:', error);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Willkommen!
                    </Typography>
                    <Typography variant="h6" color="text.secondary" align="center" paragraph>
                        Starten Sie Ihre Quiz-Reise. Wenn Sie sich registrieren, können Sie Ihr Erlebnis noch erweitern.
                    </Typography>
                </Paper>
            </Box>

            <Grid container spacing={3}>
                {/* Quiz Collection */}
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
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate('/daily-quiz')}
                    >
                        <EmojiEventsIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                        <Typography variant="h5" component="h2" gutterBottom>
                            Tägliches Quiz
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Nehmen Sie an unserem täglichen Quiz teil
                        </Typography>
                    </Paper>
                </Grid>

                {/* Daily Quiz */}
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
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={startRandomQuiz}
                    >
                        <CasinoIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" component="h2" gutterBottom>
                            Zufälliges Quiz
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Starten Sie ein zufälliges Quiz und testen Sie Ihr Wissen
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={12}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate('/quizzes')}
                    >
                        <QuizIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" component="h2" gutterBottom>
                            Quizsammlung
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Entdecken Sie unsere Sammlung von Quizzen und testen Sie Ihr Wissen
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Welcome;