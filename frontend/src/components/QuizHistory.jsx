import React, {useState, useEffect} from 'react';
import {Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import {
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
    Container,
    Box
} from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {Link} from 'react-router-dom';

const localizer = momentLocalizer(moment);
const isMobile = window.innerWidth < 600;
const QuizHistory = () => {
    const [view, setView] = useState('list');
    const [quizHistory, setQuizHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizHistory();
    }, []);

    const fetchQuizHistory = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_API_URL + '/quiz-history');
            setQuizHistory(response.data);
        } catch (error) {
            console.error('Error fetching quiz history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{my: 4}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Quiz Historie
                </Typography>

                <Box sx={{mb: 2}}>
                    <Button
                        variant={view === 'list' ? 'contained' : 'outlined'}
                        onClick={() => setView('list')}
                        sx={{mr: 1}}
                    >
                        Liste
                    </Button>
                    <Button
                        variant={view === 'calendar' ? 'contained' : 'outlined'}
                        onClick={() => setView('calendar')}
                    >
                        Kalender
                    </Button>
                </Box>

                <Paper
                    elevation={3}
                    sx={{
                        bgcolor: theme => theme.palette.background.paper,
                        color: theme => theme.palette.text.primary,
                        '& .rbc-event': {
                            backgroundColor: theme => theme.palette.primary.light,
                            color: '#fff',
                            border: 0,
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontSize: '0.85rem'
                        },
                        '& .rbc-toolbar': {
                            flexWrap: 'wrap',
                            gap: 1
                        },
                        '& .rbc-month-view, .rbc-time-view': {
                            fontSize: '0.85rem'
                        }
                    }}
                >
                {view === 'calendar' ? (
                        <Box sx={{p: 2,
                            minHeight: { xs: 400, sm: 500, md: 600 },
                            maxWidth: '100%',
                            overflowX: 'hidden'}}>
                            {isMobile?(<Calendar
                                localizer={localizer}
                                events={quizHistory.map(quiz => ({
                                    title: quiz.title,
                                    start: new Date(quiz.playedAt),
                                    end: new Date(quiz.playedAt),
                                    allDay: true,
                                    resource: quiz
                                }))}
                                style={{height: '100%'}}
                                views={['month', 'week', 'day', 'agenda']}
                                defaultView="month"
                                popup
                                onSelectEvent={(event) => console.log(event.resource)}
                            />):(<Calendar
                                localizer={quizHistory.map(quiz => ({
                                    title: quiz.title,
                                    start: new Date(quiz.playedAt),
                                    end: new Date(quiz.playedAt),
                                    allDay: true,
                                    resource: quiz}))}
                                events={events}
                                views={['month', 'agenda']}
                                defaultView={isMobile ? 'agenda' : 'month'}
                                style={{ height: 600 }}
                                popup
                                onSelectEvent={(event) => console.log(event.resource)}
                            />)}
                        </Box>
                    ) : (
                        <List>
                            {quizHistory.map((quiz) => (
                                <ListItem key={quiz.id} divider>
                                    <ListItemText
                                        primary={
                                            <Link to={`/quizzes/${quiz.quizId}`}
                                                  style={{textDecoration: 'none', color: '#1976d2', fontWeight: 500}}>
                                                {quiz.title}
                                            </Link>
                                        }
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2">
                                                    Gespielt am: {moment(quiz.playedAt).format('DD.MM.YYYY HH:mm')}
                                                </Typography>
                                                <br/>
                                                <Typography component="span" variant="body2">
                                                    Ergebnis: {quiz.score}/{quiz.maxPossibleScore} {quiz.maxPossibleScore === 1 ? 'Punkt' : 'Punkten'}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default QuizHistory; 