import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    InputAdornment
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * PlayQuiz-Komponente
 *
 * Diese Komponente ermöglicht das Spielen eines Quiz mit mehreren Fragen.
 * Sie lädt das Quiz vom Backend, verwaltet den Fortschritt, speichert Antworten lokal und zeigt am Ende die Ergebnisse an.
 * Der Nutzer kann Fragen mit Multiple-Choice- oder Textantworten beantworten und seine Antworten speichern, navigieren und das Quiz abschließen.
 * Nach Abschluss kann das Ergebnis bewertet und an den Server gesendet werden.
 *
 * Funktionalitäten:
 * - Laden eines Quiz per API anhand der URL-Parameter (Quiz-ID)
 * - Anzeige von Fragen mit Unterstützung für Text- und Multiple-Choice-Antworten
 * - Speicherung des aktuellen Fortschritts und der Antworten im localStorage zur Wiederherstellung
 * - Navigation zwischen Fragen (vorwärts und rückwärts)
 * - Einreichen der Antworten an das Backend zur Bewertung einzelner Fragen
 * - Anzeige des Endergebnisses mit Punktzahl, falschen Antworten und prozentualer Bewertung
 * - Speichern des Ergebnisses für angemeldete Nutzer auf dem Server
 * - Möglichkeit, das Quiz zu bewerten (Sternebewertung) nach Abschluss
 * - Fehlerbehandlung und Ladezustände während der API-Kommunikation
 */
const Navbar = () => {
    // Hooks ganz oben aufrufen, nicht konditional
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode, setDarkMode } = useContext(ThemeContext);
    const { user, logout } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

    const isUserMenuOpen   = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileAnchorEl);

    // initial sync of input from URL (e.g. when coming back via browser)
    useEffect(() => {
        if (location.pathname === '/quizzes') {
            const params = new URLSearchParams(location.search);
            setSearchTerm(params.get('query') || '');
        } else {
            setSearchTerm('');
        }
    }, [location.pathname, location.search]);

    const handleSearchChange = e => {
        setSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = e => {
        if (e.key === 'Enter') {
            const q = searchTerm.trim();
            navigate(`/quizzes${q ? `?query=${encodeURIComponent(q)}` : ''}`);
        }
    };

    const handleToggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleUserMenuOpen   = e => setAnchorEl(e.currentTarget);
    const handleUserMenuClose  = () => setAnchorEl(null);
    const handleMobileMenuOpen = e => setMobileAnchorEl(e.currentTarget);
    const handleMobileMenuClose= () => setMobileAnchorEl(null);

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {/* logo / burger on xs */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
                        <IconButton size="large" onClick={handleMobileMenuOpen} color="inherit">
                            <img src="/icons/logo512.png" alt="Trivify" style={{ height: 64, width: 64 }} />
                        </IconButton>
                    </Box>

                    {/* brand on md+ */}
                    <Typography
                        component={RouterLink}
                        to="/"
                        variant="h6"
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            color: 'inherit',
                            textDecoration: 'none',
                            mr: 2
                        }}
                    >
                        <img src="/icons/logo512.png" alt="Trivify" style={{ height: 40 }} />
                    </Typography>

                    {/* nav buttons on md+ */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mx: 'auto', alignItems: 'center' }}>
                        <Button component={RouterLink} to="/quizzes" color="inherit">Quizze</Button>
                        <Button component={RouterLink} to="/daily-quiz" color="inherit">Tägliches Quiz (KI)</Button>
                        {user && (
                            <Button component={RouterLink} to="/quizzes/my-quizzes" color="inherit">
                                Quizlabor
                            </Button>
                        )}
                        {user?.role === 'ROLE_ADMIN' && (
                            <Button component={RouterLink} to="/adminpanel" color="inherit">Admin-Panel</Button>
                        )}
                    </Box>

                    {/* search field */}
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Quiz spielen..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: darkMode ? 'black' : 'white',
                                    borderRadius: 1
                                }
                            }}
                            sx={{
                                mx: 1,
                                width: { xs: '100%', sm: 200 }
                            }}
                        />
                    </Box>

                    {/* theme toggle */}
                    <IconButton color="inherit" onClick={handleToggleTheme} sx={{ mr: 1, borderRadius: '50%', width: 40, height: 40 }}>
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    {/* user icon */}
                    <IconButton
                        size="medium"
                        aria-controls="user-menu"
                        aria-haspopup="true"
                        onClick={handleUserMenuOpen}
                        color="inherit"
                        sx={{
                            width: 40, height: 40, borderRadius: '50%',
                            backgroundColor: user ? 'purple' : undefined,
                            color: user ? 'white' : undefined
                        }}
                    >
                        {user
                            ? user.name.charAt(0).toUpperCase()
                            : <AccountCircle sx={{ width: 40, height: 40 }} />
                        }
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* mobile menu */}
            <Menu
                anchorEl={mobileAnchorEl}
                open={isMobileMenuOpen}
                onClose={handleMobileMenuClose}
                keepMounted
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                sx={{ display: { xs: 'block', md: 'none' } }}
            >
                {!user && (
                    <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/'); }}>Startseite</MenuItem>
                )}
                <MenuItem onClick={handleMobileMenuClose} component={RouterLink} to="/quizzes">Quizze spielen</MenuItem>
                <MenuItem onClick={handleMobileMenuClose} component={RouterLink} to="/daily-quiz">Tägliches Quiz (KI)</MenuItem>
                {user && (
                    <MenuItem onClick={handleMobileMenuClose} component={RouterLink} to="/quizzes/my-quizzes">
                        Quizlabor
                    </MenuItem>
                )}
                {user?.role === 'ROLE_ADMIN' && (
                    <MenuItem onClick={handleMobileMenuClose} component={RouterLink} to="/adminpanel">Admin-Panel</MenuItem>
                )}
            </Menu>

            {/* user account menu */}
            <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={isUserMenuOpen}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {user ? (
                    <>
                        <MenuItem component={RouterLink} to="/welcome" onClick={handleUserMenuClose}>Profil</MenuItem>
                        <MenuItem component={RouterLink} to="/settings" onClick={handleUserMenuClose}>Einstellungen</MenuItem>
                        <MenuItem onClick={() => { handleUserMenuClose(); logout(); navigate('/'); }}>Abmelden</MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem component={RouterLink} to="/login" onClick={handleUserMenuClose}>Anmelden</MenuItem>
                        <MenuItem component={RouterLink} to="/register" onClick={handleUserMenuClose}>Registrieren</MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
};

export default Navbar;
