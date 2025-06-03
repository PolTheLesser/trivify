import React, { useContext, useMemo, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeContext } from "./contexts/ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/layout/Navbar";
import AdminPanel from "./components/settings/AdminPanel";
import Footer from "./components/layout/Footer";
import Home from "./components/Home";
import Welcome from "./components/Welcome";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyEmail from "./components/auth/VerifyEmail";
import QuizList from "./components/quiz/QuizList";
import PlayQuiz from "./components/quiz/PlayQuiz";
import DailyQuiz from "./components/quiz/DailyQuiz";
import CreateQuiz from "./components/quiz/CreateQuiz";
import EditQuiz from "./components/quiz/EditQuiz";
import Settings from "./components/settings/Settings";
import MyQuizzes from "./components/quiz/MyQuizzes";
import { AuthProvider } from './contexts/AuthContext';

/** App
 Hauptkomponente der Anwendung, die das Routing, das globale Theme (Dark/Light Mode)
 sowie die Authentifizierungskontexte kapselt. Sie verbindet die visuelle Struktur
 (Navigation, Seiteninhalte, Footer) mit der interaktiven Benutzerführung.

 Funktionalitäten:
 - Verwendet React Router für die clientseitige Navigation zwischen allen Seiten (Login, Register, Quiz, etc.)
 - Schützt bestimmte Routen durch `PrivateRoute` (z. B. Einstellungen, Adminbereich, Quiz-Erstellung)
 - Reagiert dynamisch auf den Dark-Mode-Zustand via `ThemeContext` und integriert MUI ThemeProvider
 - Initiale Weiterleitung abhängig vom Login-Status (Token in `localStorage`)
 - Globale Bereitstellung des Authentifizierungsstatus durch `AuthProvider`
 - Enthält gemeinsame UI-Bestandteile wie `Navbar` und `Footer` für konsistentes Layout
 */
const AppContent = () => {
    const { darkMode } = useContext(ThemeContext);
    const muiTheme = useMemo(
        () => createTheme({ palette: { mode: darkMode ? "dark" : "light" } }),
        [darkMode]
    );

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Router>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Navbar />
                    <main
                        style={{ flex: 1, paddingBottom: '3rem' }}
                    >
                        <Routes>
                            <Route path="/" element={
                                localStorage.getItem("token") ? <Navigate to="/welcome" replace /> : <Home />
                            } />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/verify-email/:token" element={<VerifyEmail />} />
                            <Route path="/welcome" element={<PrivateRoute><Welcome /></PrivateRoute>} />
                            <Route path="/quizzes" element={<QuizList />} />
                            <Route path="/quizzes/:id" element={<PlayQuiz />} />
                            <Route path="/daily-quiz" element={<DailyQuiz />} />
                            <Route path="/quizzes/my-quizzes" element={<MyQuizzes />} />
                            <Route path="/quizzes/create" element={<PrivateRoute><CreateQuiz /></PrivateRoute>} />
                            <Route path="/quizzes/edit/:id" element={<PrivateRoute><EditQuiz /></PrivateRoute>} />
                            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                            <Route path="/adminpanel" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
                            <Route path="*" element={
                                localStorage.getItem("token")
                                    ? <Navigate to="/welcome" replace />
                                    : <Navigate to="/" replace />
                            } />
                        </Routes>
                    </main>

                    <div style={{ height: "3rem" }}></div>
                    <Footer />
                </div>
            </Router>
        </MuiThemeProvider>
    );
};

const App = () => (
    <AuthProvider>
            <AppContent />
    </AuthProvider>
);

export default App;