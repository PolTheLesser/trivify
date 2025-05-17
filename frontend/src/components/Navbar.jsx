import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
    const { darkMode, setDarkMode } = useContext(ThemeContext);
    const [searchTerm, setSearchTerm] = useState('');

    // Desktop user menu
    const [anchorEl, setAnchorEl] = useState(null);
    const isUserMenuOpen = Boolean(anchorEl);
    const handleUserMenuOpen = e => setAnchorEl(e.currentTarget);
    const handleUserMenuClose = () => setAnchorEl(null);

    // Mobile nav menu
    const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
    const isMobileMenuOpen = Boolean(mobileAnchorEl);
    const handleMobileMenuOpen = e => setMobileAnchorEl(e.currentTarget);
    const handleMobileMenuClose = () => setMobileAnchorEl(null);

    const handleToggle = () => {
        setDarkMode(!darkMode);
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {/* Logo as burger icon on xs–sm */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
                        <IconButton
                            size="large"
                            aria-label="open navigation menu"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <img
                                src="/logo192.png"
                                alt="Trivify"
                                style={{ height: 32, width: 32 }}
                            />
                        </IconButton>
                    </Box>

                    {/* Brand (visible md+) */}
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

                    {/* Link buttons from md up */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            gap: 2,
                            mx: 'auto',
                            alignItems: 'center',
                        }}
                    >
                        <Button component={RouterLink} to="/quizzes" color="inherit">
                            Quizze
                        </Button>
                        <Button component={RouterLink} to="/daily-quiz" color="inherit">
                            Tägliches Quiz (KI)
                        </Button>
                        {user && (
                            <Button
                                component={RouterLink}
                                to="/quizzes/my-quizzes"
                                color="inherit"
                            >
                                Meine Quizze
                            </Button>
                        )}
                    </Box>

                    {/* Spacer + Search always visible */}
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Quiz suchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchTerm.trim()) {
                                    navigate(
                                        `/quizzes?query=${encodeURIComponent(
                                            searchTerm.trim()
                                        )}`
                                    );
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: darkMode ? 'black' : 'white',
                                    borderRadius: 1,
                                },
                            }}
                            sx={{
                                mx: 1,
                                width: { xs: '100%', sm: 200 },
                            }}
                        />
                    </Box>

                    {/* Dark-Mode Toggle */}
                    <IconButton
                        color="inherit"
                        onClick={handleToggle}
                        sx={{ mr: 1, borderRadius: '50%', width: 40, height: 40 }}
                    >
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    {/* User Icon / Auth */}
                    {user ? (
                        <IconButton
                            size="medium"
                            aria-label="account of current user"
                            aria-controls="user-menu"
                            aria-haspopup="true"
                            onClick={handleUserMenuOpen}
                            color="inherit"
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: 'purple',
                                color: 'white',
                            }}
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

            {/* Mobile Navigation Menu */}
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
                    <MenuItem
                        onClick={() => {
                            handleMobileMenuClose();
                            navigate('/');
                        }}
                    >
                        Startseite
                    </MenuItem>
                )}
                <MenuItem
                    onClick={handleMobileMenuClose}
                    component={RouterLink}
                    to="/quizzes"
                >
                    Quizze
                </MenuItem>
                <MenuItem
                    onClick={handleMobileMenuClose}
                    component={RouterLink}
                    to="/daily-quiz"
                >
                    Tägliches Quiz (KI)
                </MenuItem>
                {user && (
                    <MenuItem
                        onClick={handleMobileMenuClose}
                        component={RouterLink}
                        to="/quizzes/my-quizzes"
                    >
                        Meine Quizze
                    </MenuItem>
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
                        <MenuItem
                            component={RouterLink}
                            to="/welcome"
                            onClick={handleUserMenuClose}
                        >
                            Profil
                        </MenuItem>
                        <MenuItem
                            component={RouterLink}
                            to="/settings"
                            onClick={handleUserMenuClose}
                        >
                            Einstellungen
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleUserMenuClose();
                                logout();
                            }}
                        >
                            Abmelden
                        </MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem
                            component={RouterLink}
                            to="/login"
                            onClick={handleUserMenuClose}
                        >
                            Anmelden
                        </MenuItem>
                        <MenuItem
                            component={RouterLink}
                            to="/register"
                            onClick={handleUserMenuClose}
                        >
                            Registrieren
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
};

export default Navbar;
