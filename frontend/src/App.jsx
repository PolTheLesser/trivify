import React, {useContext, useMemo} from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import {ThemeProvider as MuiThemeProvider, createTheme} from "@mui/material/styles";
import {ThemeContext} from "./contexts/ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
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
import Datenschutz from "./components/Datenschutz";
import Impressum from "./components/Impressum";
import MyQuizzes from "./components/MyQuizzes";

const App = () => {
    const {darkMode} = useContext(ThemeContext);
    const muiTheme = useMemo(() =>
            createTheme({palette: {mode: darkMode ? "dark" : "light"}}),
        [darkMode]
    );

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline/>
            <Router>
                <Navbar/>
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
                        <Route path="/impressum" element={<Impressum/>}/>
                        <Route path="/datenschutz" element={<Datenschutz/>}/>
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
    );
};


export default App;
