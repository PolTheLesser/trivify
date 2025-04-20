import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Grid, Paper, Typography } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../contexts/AuthContext';
import CalendarHeatmap from 'react-calendar-heatmap';
import { format, subDays } from 'date-fns';
import 'react-calendar-heatmap/dist/styles.css';
import axios from 'axios';
import ScoreBoard from './ScoreBoard';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { de } from 'date-fns/locale';

const Welcome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [plays, setPlays] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedDayInfo, setSelectedDayInfo] = useState(null);
    const detailRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get(process.env.REACT_APP_API_URL + '/users/streak'),
            axios.get(process.env.REACT_APP_API_URL + '/users/quiz-history'),
        ])
            .then(([streakRes, historyRes]) => {
                const serverStreak =
                    typeof streakRes.data === 'number'
                        ? streakRes.data
                        : streakRes.data.currentStreak;

                setStreak(serverStreak);
                setPlays(historyRes.data);
            })
            .catch(err => {
                console.error('Fehler beim Laden der Daten:', err);
            })
            .finally(() => setLoading(false));
    }, []);

    // Klick außerhalb erkennen
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (detailRef.current && !detailRef.current.contains(event.target)) {
                setSelectedDayInfo(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Gruppieren nach Datum für Kalender
    const groupedPlays = plays.reduce((acc, play) => {
        const date = (play.playedAt || play.date || '').slice(0, 10);
        if (!date) return acc;
        if (!acc[date]) acc[date] = { date, count: 0, quizzes: [] };
        acc[date].count += 1;
        acc[date].quizzes.push({
            title: play.quizTitle || 'Unbekanntes Quiz',
            score: play.score ?? '-',
            id: play.quizId
        });
        return acc;
    }, {});
    const heatmapValues = Object.values(groupedPlays).map(v => ({
        ...v,
        'data-tooltip-id': 'calendar-tooltip',
        'data-tooltip-content': `${v.date}: ${v.count} Quizze\n${v.quizzes.map(q => `${q.title} (${q.score} Pkt.)`).join('\n')}`,
    }));

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Willkommen, {user.name}!
                    </Typography>
                    <Typography variant="h6" color="text.secondary" align="center" paragraph>
                        Starten Sie Ihre Quiz-Reise
                    </Typography>
                </Paper>
            </Box>

            <Box sx={{ mb: 6 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h5" align="center" gutterBottom>
                                Daily‑Streak: <strong>{streak}</strong> {streak === 1 ? 'Tag' : 'Tage'}
                            </Typography>
                            <Typography variant="subtitle1" align="center" gutterBottom>
                                Deine Quiz-Aktivität im letzten Jahr
                            </Typography>
                            <Box sx={{ mt: 3, overflowX: 'auto' }}>
                                <Box sx={{ minWidth: 600, mx: 'auto', px: 1 }}>
                                    <CalendarHeatmap
                                        startDate={subDays(new Date(), 365)}
                                        endDate={new Date()}
                                        values={heatmapValues}
                                        classForValue={value => {
                                            if (!value || !value.count) return 'color-empty';
                                            const level = Math.min(value.count, 4);
                                            return `color-github-${level}`;
                                        }}
                                        onClick={value => {
                                            if (value && value.date) {
                                                setSelectedDayInfo(value);
                                            }
                                        }}
                                        showWeekdayLabels
                                        weekdayLabels={['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']}
                                        monthLabels={[
                                            'Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni',
                                            'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'
                                        ]}
                                    />
                                    <ReactTooltip
                                        id="calendar-tooltip"
                                        multiline
                                        style={{
                                            borderRadius: '4px',
                                            padding: '8px',
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                    {selectedDayInfo && (
                                        <Box
                                            ref={detailRef}
                                            sx={(theme) => ({
                                                mt: 4,
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.background.paper,
                                                color: theme.palette.text.primary,
                                                boxShadow: theme.shadows[3],
                                            })}
                                        >
                                            <Typography variant="h6" gutterBottom>
                                                {selectedDayInfo.date} – {selectedDayInfo.count} {selectedDayInfo.count === 1 ? 'Quiz' : 'Quizze'}
                                            </Typography>
                                            <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                                                {selectedDayInfo.quizzes.map((q, i) => (
                                                    <li key={i}>
                                                        <a href={`/quizzes/${q.id}`} style={{ color: '#90caf9' }}>
                                                            {q.title}
                                                        </a> – {q.score} {q.score === 1 ? 'Punkt' : 'Punkte'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
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

                <Grid item xs={12} md={4}>
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
                            Nehmen Sie an unserem täglichen Quiz teil und verbessern Sie Ihre Punktzahl
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        <EmojiEventsIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                        <Typography variant="h5" component="h2" gutterBottom>
                            Highscore
                        </Typography>
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <ScoreBoard userId={user?.id} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Welcome;
