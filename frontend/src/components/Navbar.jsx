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
import { useAuth } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { darkMode, setDarkMode } = useContext(ThemeContext);
    const isAdmin = user?.role === 'ROLE_ADMIN';

    // User-Menu-Logik …
    const [anchorEl, setAnchorEl] = useState(null);
    const isUserMenuOpen = Boolean(anchorEl);
    const handleUserMenuOpen = e => setAnchorEl(e.currentTarget);
    const handleUserMenuClose = () => setAnchorEl(null);

    // Mobile-Menu …
    const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
    const isMobileMenuOpen = Boolean(mobileAnchorEl);
    const handleMobileMenuOpen = e => setMobileAnchorEl(e.currentTarget);
    const handleMobileMenuClose = () => setMobileAnchorEl(null);


    // lokaler State für das Eingabefeld
    const [searchTerm, setSearchTerm] = useState('');

    // URL-Query → local State
    useEffect(() => {
        setSearchTerm(searchParams.get('query') || '');
    }, [searchParams]);

    // bei Eingabe: State updaten; auf /quizzes auch direkt den URL-Param
    const handleSearchChange = e => {
        const val = e.target.value;
        setSearchTerm(val);
        if (location.pathname === '/quizzes') {
            if (val) setSearchParams({ query: val });
            else setSearchParams({});
        }
    };

    // bei Enter: immer (auch außerhalb /quizzes) zur QuizList mit Query navigieren
    const handleSearchKeyDown = e => {
        if (e.key === 'Enter') {
            const q = searchTerm.trim();
            navigate(`/quizzes${q ? `?query=${encodeURIComponent(q)}` : ''}`);
        }
    };

    const handleToggle = () => {
        setDarkMode(!darkMode);
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {/* Logo / Burger on xs */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
                        <IconButton size="large" onClick={handleMobileMenuOpen} color="inherit">
                            <img src="/logo192.png" alt="Trivify" style={{ height: 64, width: 64 }} />
                        </IconButton>
                    </Box>

                    {/* Brand on md+ */}
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
                        <img src="/logo192.png" alt="Trivify" style={{ height: 40 }} />
                    </Typography>

                    {/* Nav-Buttons md+ */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mx: 'auto', alignItems: 'center' }}>
                        <Button component={RouterLink} to="/quizzes" color="inherit">Quizze</Button>
                        <Button component={RouterLink} to="/daily-quiz" color="inherit">Tägliches Quiz (KI)</Button>
                        {user && (
                            <Button component={RouterLink} to="/quizzes/my-quizzes" color="inherit">
                                Quizlabor
                            </Button>
                        )}
                        {isAdmin && (
                            <Button component={RouterLink} to="/adminpanel" color="inherit">Admin-Panel</Button>
                        )}
                    </Box>

                    {/* Suchfeld */}
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

                    {/* Dark Mode Toggle */}
                    <IconButton color="inherit" onClick={handleToggle} sx={{ mr: 1, borderRadius: '50%', width: 40, height: 40 }}>
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    {/* User Icon */}
                    {user ? (
                        <IconButton
                            size="medium"
                            aria-label="account of current user"
                            aria-controls="user-menu"
                            aria-haspopup="true"
                            onClick={handleUserMenuOpen}
                            color="inherit"
                            sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'purple', color: 'white' }}
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </IconButton>
                    ) : (
                        <IconButton
                            size="medium"
                            aria-label="account of current user"
                            aria-controls="user-menu"
                            aria-haspopup="true"
                            onClick={handleUserMenuOpen}
                            color="inherit"
                            sx={{ width: 40, height: 40, borderRadius: '50%' }}
                        >
                            <AccountCircle sx={{ width: 40, height: 40 }} />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            {/* Mobile Menu */}
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
                {isAdmin && (
                    <Button component={RouterLink} to="/adminpanel" color="inherit">Admin-Panel</Button>
                )}
            </Menu>

            {/* User Account Menu */}
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
