import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './WelcomeCalendar.css';
import {format} from 'date-fns';
import {
    CircularProgress,
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Popover
} from '@mui/material';
import {useTheme, styled} from '@mui/material/styles';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CasinoIcon from '@mui/icons-material/Casino';
import {useAuth} from '../contexts/AuthContext';
import ScoreBoard from './ScoreBoard';
import axios from '../api/api';

// Styled version of react-calendar with theme-based text color and overrides for weekends and neighboring months
const StyledCalendar = styled(Calendar)(({theme}) => ({
    '& .react-calendar__tile': {
        color: theme.palette.text.secondary,
    },
    '& .react-calendar__navigation button': {
        color: theme.palette.text.secondary,
    },
    '& .react-calendar__month-view__weekdays__weekday abbr': {
        color: theme.palette.text.secondary,
    },
    '& .react-calendar__month-view__days__day--weekend': {
        color: theme.palette.error.main,
    },
    '& .react-calendar__month-view__days__day--neighboringMonth': {
        color: theme.palette.text.disabled,
    },
}));

const Welcome = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [heatmapValues, setHeatmapValues] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Popover state
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverInfo, setPopoverInfo] = useState(null);

    useEffect(() => {
        const fetchStreakAndHistory = async () => {
            setLoading(true);
            try {
                const {data: currentStreak} = await axios.get(
                    `${process.env.REACT_APP_API_URL}/users/streak`
                );
                setStreak(currentStreak);

                const {data: history} = await axios.get(
                    `${process.env.REACT_APP_API_URL}/users/quiz-history`
                );

                const map = history.reduce((acc, quiz) => {
                    const day = quiz.playedAt.split('T')[0];
                    if (!acc[day]) acc[day] = {date: day, count: 0, quizzes: []};
                    acc[day].count += 1;
                    acc[day].quizzes.push(quiz);
                    return acc;
                }, {});

                setHeatmapValues(Object.values(map));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStreakAndHistory();
    }, [user.id]);

    const startRandomQuiz = async () => {
        try {
            const quizRes = await axios.get(
                `${process.env.REACT_APP_API_URL}/quizzes`
            );
            const data = quizRes.data;
            if (!data.length) return;
            const random = data[Math.floor(Math.random() * data.length)];
            navigate(`/quizzes/${random.id}`);
        } catch (error) {
            console.error('Error starting random quiz:', error);
        }
    };

    const handleClickDay = (value, event) => {
        const key = format(value, 'yyyy-MM-dd');
        const info = heatmapValues.find(h => h.date === key);
        if (info) {
            setPopoverInfo(info);
            setAnchorEl(event.currentTarget);
        }
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setPopoverInfo(null);
    };

    const popoverOpen = Boolean(anchorEl);

    const tileClassName = ({date, view}) => {
        if (view === 'month') {
            const key = format(date, 'yyyy-MM-dd');
            if (heatmapValues.some(h => h.date === key)) return 'played-day';
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{mt: 8, mb: 4}}>
                <Paper elevation={3} sx={{p: 4, backgroundColor: theme.palette.background.paper}}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Willkommen, {user.name}!
                    </Typography>
                    <Typography variant="h6" color="text.secondary" align="center">
                        Starten Sie Ihre Quiz-Reise
                    </Typography>
                </Paper>
            </Box>

            <Grid container spacing={3} alignItems="stretch">
                {/* History Calendar */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{p: 3, backgroundColor: theme.palette.background.paper}}>
                        {loading ? (
                            <Box sx={{textAlign: 'center', py: 4}}>
                                <CircularProgress/>
                            </Box>
                        ) : (
                            <>
                                <Typography variant="h5" align="center" gutterBottom>
                                    Daily-Streak: <strong>{streak}</strong> {streak === 1 ? 'Tag' : 'Tage'}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
                                    Deine Quiz-Aktivität im aktuellen Monat
                                </Typography>

                                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                    <StyledCalendar
                                        activeStartDate={currentMonth}
                                        onActiveStartDateChange={({activeStartDate}) => setCurrentMonth(activeStartDate)}
                                        onClickDay={handleClickDay}
                                        tileClassName={tileClassName}
                                        next2Label={null}
                                        prev2Label={null}
                                    />
                                </Box>

                                <Popover
                                    open={popoverOpen}
                                    anchorEl={anchorEl}
                                    onClose={handlePopoverClose}
                                    anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                                    transformOrigin={{vertical: 'top', horizontal: 'center'}}
                                >
                                    {popoverInfo && (
                                        <Box
                                            sx={{p: 2, maxWidth: 300, backgroundColor: theme.palette.background.paper}}>
                                            <Typography variant="h6" gutterBottom>
                                                {popoverInfo.date} – {popoverInfo.count} {popoverInfo.count === 1 ? 'Quiz' : 'Quizze'}
                                            </Typography>
                                            {popoverInfo.quizzes.map((quiz, i) => (
                                                <Box key={i} sx={{mb: 1}}>
                                                    <Typography component="span" variant="body2">
                                                        {quiz.quizTitle}
                                                    </Typography>
                                                    <br/>
                                                    <Typography component="span" variant="body2">
                                                        Gespielt
                                                        am: {format(new Date(quiz.playedAt), 'dd.MM.yyyy HH:mm')}
                                                    </Typography>
                                                    <br/>
                                                    <Typography component="span" variant="body2">
                                                        Ergebnis: {quiz.score}/{quiz.maxPossibleScore} {quiz.maxPossibleScore === 1 ? 'Punkt' : 'Punkte'}
                                                    </Typography>
                                                    <br/>
                                                    <br/>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Popover>
                            </>
                        )}
                    </Paper>
                </Grid>

                {/* Highscore */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.paper,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}
                    >
                        <EmojiEventsIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2, alignSelf: 'center' }} />
                        <Typography variant="h5" align="center" gutterBottom>
                            Highscore
                        </Typography>

                        {/* ScoreBoard selbst */}
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', maxWidth: 360 }}>
                                <ScoreBoard userId={user.id} />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Daily Quiz */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        onClick={() => navigate('/daily-quiz')}
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.paper,
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        <EmojiEventsIcon sx={{fontSize: 60, color: 'secondary.main', mb: 2}}/>
                        <Typography variant="h5" align="center" gutterBottom>
                            Tägliches Quiz
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Nehmen Sie am täglichen Quiz teil
                        </Typography>
                    </Paper>
                </Grid>

                {/* Random Quiz */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        onClick={startRandomQuiz}
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.paper,
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        <CasinoIcon sx={{fontSize: 60, color: 'success.main', mb: 2}}/>
                        <Typography variant="h5" align="center" gutterBottom>
                            Zufälliges Quiz
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Teste dein Wissen
                        </Typography>
                    </Paper>
                </Grid>

                {/* Quizsammlung */}
                <Grid item xs={12}>
                    <Paper
                        elevation={3}
                        onClick={() => navigate('/quizzes')}
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.paper,
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        <QuizIcon sx={{fontSize: 60, color: 'primary.main', mb: 2}}/>
                        <Typography variant="h5" align="center" gutterBottom>
                            Quizsammlung
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Alle verfügbaren Quizze entdecken
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Welcome;
