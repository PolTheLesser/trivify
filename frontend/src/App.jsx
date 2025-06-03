import React, {useContext, useMemo} from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import {ThemeProvider as MuiThemeProvider, createTheme} from "@mui/material/styles";
import {ThemeContext} from "./contexts/ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";
import QuizList from "./components/QuizList";
import PlayQuiz from "./components/PlayQuiz";
import DailyQuiz from "./components/DailyQuiz";
import CreateQuiz from "./components/CreateQuiz";
import EditQuiz from "./components/EditQuiz";
import Settings from "./components/Settings";
import MyQuizzes from "./components/MyQuizzes";
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
const App = () => {
    const { darkMode } = useContext(ThemeContext);
    const muiTheme = useMemo(() => createTheme({ palette: { mode: darkMode ? "dark" : "light" } }), [darkMode]);

    return (
        <AuthProvider>
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                <Router>
                    <Navbar />
                <main style={{flex: 1, paddingBottom: '3rem'}}>
                    <Routes>
                        <Route path="/"
                               element={localStorage.getItem("token") ? <Navigate to="/welcome" replace/> : <Home/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/forgot-password" element={<ForgotPassword/>}/>
                        <Route path="/reset-password/:token" element={<ResetPassword/>}/>
                        <Route path="/verify-email/:token" element={<VerifyEmail/>}/>
                        <Route path="/welcome" element={<PrivateRoute><Welcome/></PrivateRoute>}/>
                        <Route path="/quizzes" element={<QuizList/>}/>
                        <Route path="/quizzes/:id" element={<PlayQuiz/>}/>
                        <Route path="/daily-quiz" element={<DailyQuiz/>}/>
                        <Route path="/quizzes/my-quizzes" element={<MyQuizzes/>}/>
                        <Route path="/quizzes/create" element={<PrivateRoute><CreateQuiz/></PrivateRoute>}/>
                        <Route path="/quizzes/edit/:id" element={<PrivateRoute><EditQuiz/></PrivateRoute>}/>
                        <Route path="/settings" element={<PrivateRoute><Settings/></PrivateRoute>}/>
                        <Route path="/adminpanel" element={<PrivateRoute><AdminPanel/></PrivateRoute>}/>
                        {/* Catch-all: if you have a token, go to /welcome; otherwise go to / */}
                        <Route
                            path="*"
                            element={
                                localStorage.getItem("token")
                                    ? <Navigate to="/welcome" replace/>
                                    : <Navigate to="/" replace/>
                            }
                        />
                    </Routes>
                </main>
                <div style={{height: "3rem"}}></div>
                <Footer/>
                </Router>
            </MuiThemeProvider>
        </AuthProvider>
    );
};
export default App;