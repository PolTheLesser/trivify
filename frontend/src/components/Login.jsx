import React, {useState, useEffect} from 'react';
import {useNavigate, Link as RouterLink, useLocation} from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    Box,
    Alert,
} from '@mui/material';
import {useAuth} from '../contexts/AuthContext';
import {PasswordField} from '../CustomElements';

/**
 * Login-Komponente
 *
 * Diese Komponente stellt ein Login-Formular zur Verfügung, mit dem Benutzer sich mit ihrer E-Mail-Adresse und ihrem Passwort anmelden können.
 * Sie zeigt dabei verschiedene Statusmeldungen (Fehler, Warnungen, Erfolg) an, die über die Navigation als State übergeben werden können.
 * Nach erfolgreicher Anmeldung wird der Nutzer weitergeleitet und seine User-ID im Local Storage gespeichert.
 *
 * Funktionalitäten:
 * - Eingabe von E-Mail und Passwort mit Validierung (Pflichtfelder)
 * - Anzeige von Fehler-, Warn- und Erfolgsmeldungen, die aus der Navigation übernommen werden können
 * - Login-Aufruf über den Auth-Kontext (useAuth)
 * - Speicherung der User-ID nach erfolgreichem Login im Local Storage
 * - Navigation zur Willkommensseite nach erfolgreichem Login
 * - Links zu "Passwort vergessen" und "Registrieren"
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            if (location.state?.severity === 'error') {
                setError(location.state.message);
            } else if (location.state?.severity === 'warning') {
                setWarning(location.state.message);
            } else if (location.state?.severity === 'success') {
                setSuccess(location.state.message)
            } else {
                setError(location.state.message)
            }
            // Entferne die Nachricht aus dem State, damit sie nicht erneut angezeigt wird
            navigate(location.pathname, {state: {}});
        }
    }, [location, navigate]);

    // JavaScript (React)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            // Retrieve the response from the login function
            const response = await login(email, password);
            console.log('Login response:', response);
            // Adjust depending on the response structure. For example:
            const userId = response.id;
            localStorage.setItem('userId', userId);
            console.log('Stored userId:', userId);
            navigate('/welcome');
        } catch (error) {
            setError(error.message || 'Fehler bei der Anmeldung');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{mt: 8}}>
                <Paper elevation={3} sx={{p: 4}}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Anmelden
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}
                    {warning && (
                        <Alert severity="warning" sx={{mb: 2}}>
                            {warning}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{mb: 2}}>
                            {success}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            type="email"
                            label="E-Mail-Adresse"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <PasswordField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Passwort"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                display: 'block',  // Block‑Element, damit margin‑Auto wirkt
                                mx: 'auto',        // links/rechts auto
                                width: '200px'     // optional: konkrete Breite, sonst passt er sich an Inhalt an
                            }}
                        >
                            Anmelden
                        </Button>
                        <Box sx={{textAlign: 'center'}}>
                            <Link component={RouterLink} to="/forgot-password" variant="body2">
                                Passwort vergessen?
                            </Link>
                        </Box>
                        <Box sx={{textAlign: 'center', mt: 2}}>
                            <Link component={RouterLink} to="/register" variant="body2">
                                Noch kein Konto? Registrieren
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login; 