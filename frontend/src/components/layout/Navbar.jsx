import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
 * Navbar Komponente für die Navigation und das Layout der Anwendung.
 * Enthält Links zu Quizzen, täglichem Quiz, Quizlabor und Admin-Panel.
 * Bietet eine Suchfunktion, Theme-Umschaltung und Benutzer-Interaktion.
 * Verwendet Material-UI für das Styling und die Komponenten.
 * @component
 * @returns {JSX.Element} Das Navbar-Element mit Navigation, Suchleiste und Benutzerinteraktion.
 */
const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { darkMode, setDarkMode } = useContext(ThemeContext);
    const { user, logout } = useAuth();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

    const isUserMenuOpen   = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileAnchorEl);

    useEffect(() => {
        if (location.pathname === '/quizzes') {
            setSearchTerm(searchParams.get('query') || '');
        } else {
            setSearchTerm('');
        }
    }, [location.pathname, searchParams]);

    const handleSearchChange = e => setSearchTerm(e.target.value);

    const handleSubmit = e => {
        e.preventDefault();
        const q = searchTerm.trim();
        if (q) setSearchParams({ query: q });
        else  setSearchParams({});
    };

    const handleToggleTheme = () => setDarkMode(!darkMode);
    const handleUserMenuOpen   = e => setAnchorEl(e.currentTarget);
    const handleUserMenuClose  = () => setAnchorEl(null);
    const handleMobileMenuOpen = e => setMobileAnchorEl(e.currentTarget);
    const handleMobileMenuClose= () => setMobileAnchorEl(null);

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {/* Logo / Burger */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
                        <IconButton size="large" onClick={handleMobileMenuOpen} color="inherit">
                            <img src="/icons/logo512.png" alt="Trivify" style={{ height: 64, width: 64 }} />
                        </IconButton>
                    </Box>

                    {/* Brand */}
                    <Typography component={RouterLink} to="/" variant="h6" sx={{ display: { xs: 'none', md: 'flex' }, color: 'inherit', textDecoration: 'none', mr: 2 }}>
                        <img src="/icons/logo512.png" alt="Trivify" style={{ height: 40 }} />
                    </Typography>

                    {/* Nav Buttons */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mx: 'auto', alignItems: 'center' }}>
                        <Button component={RouterLink} to="/quizzes" color="inherit">Quizze</Button>
                        <Button component={RouterLink} to="/daily-quiz" color="inherit">Tägliches Quiz (KI)</Button>
                        {user && <Button component={RouterLink} to="/quizzes/my-quizzes" color="inherit">Quizlabor</Button>}
                        {user?.role === 'ROLE_ADMIN' && <Button component={RouterLink} to="/adminpanel" color="inherit">Admin-Panel</Button>}
                    </Box>

                    {/* Search Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }} noValidate>
                        <TextField
                            name="query"
                            size="small"
                            variant="outlined"
                            placeholder="Quiz spielen..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                sx: { backgroundColor: darkMode ? 'black' : 'white', borderRadius: 1 }
                            }}
                            sx={{ mx: 1, width: { xs: '100%', sm: 200 } }}
                        />
                    </Box>

                    {/* Theme Toggle */}
                    <IconButton color="inherit" onClick={handleToggleTheme} sx={{ mr: 1, borderRadius: '50%', width: 40, height: 40 }}>
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    {/* User Icon */}
                    <IconButton size="medium" aria-controls="user-menu" aria-haspopup="true" onClick={handleUserMenuOpen} color="inherit" sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: user ? 'purple' : undefined, color: user ? 'white' : undefined }}>
                        {user ? user.name.charAt(0).toUpperCase() : <AccountCircle sx={{ width: 40, height: 40 }} />}
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