import React, {useState} from 'react';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {useAuth} from '../../contexts/AuthContext';
import {PasswordField, CustomFormControlLabel, CustomSwitch } from "../../CustomElements";

/**
 * Register-Komponente
 *
 * Diese Komponente stellt ein Registrierungsformular für neue Benutzer bereit.
 * Nutzer können sich mit Name, E-Mail, Passwort und optionalen Quiz-Erinnerungen anmelden.
 *
 * Funktionalitäten:
 * - Formularvalidierung (z.B. Passwortbestätigung)
 * - Fehlerbehandlung und Anzeige von Fehlermeldungen
 * - Integration mit dem AuthContext zur Registrierung über das Backend
 * - Erfolgreiche Registrierung leitet zur Login-Seite weiter und zeigt eine Verifizierungsanleitung
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dailyQuizReminder: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dailyQuizReminder: formData.dailyQuizReminder,
      });
      navigate('/login', { 
        state: { 
          message: 'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails und klicken Sie auf den Verifizierungslink, um Ihr Konto zu aktivieren. Nach der Verifizierung können Sie sich anmelden.',
          severity: 'success'
        }
      });
    } catch (error) {
      if (error.message.includes('name')) {
        setError('Dieser Benutzername ist bereits vergeben');
      } else {
        setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return false;
    }
    return true;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Registrieren
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  type="email"
                  label="E-Mail-Adresse"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordField
                    required
                    fullWidth
                    name="password"
                    label="Passwort"
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Passwort bestätigen"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomFormControlLabel
                  control={
                    <CustomSwitch checked={formData.dailyQuizReminder} onChange={(e) => setFormData({
                      ...formData,
                      dailyQuizReminder: e.target.checked
                    })} />}
                        label="Tägliche Quiz-Erinnerungen aktivieren"
                    />
              </Grid>
            </Grid>
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
              Registrieren
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Bereits ein Konto? Anmelden
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 