import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../../contexts/AuthContext';

/**
 * ForgotPassword-Komponente
 *
 * Diese Komponente ermöglicht es Benutzern, ihr Passwort zurückzusetzen, indem sie ihre E-Mail-Adresse eingeben.
 * Nach Absenden des Formulars wird über den Auth-Kontext eine Passwort-Zurücksetzen-Anfrage ausgelöst.
 * Bei Erfolg wird der Nutzer zurück zur Login-Seite geleitet, mit einer Erfolgsmeldung im Navigations-State.
 * Fehler werden innerhalb der Komponente als Fehlermeldung angezeigt.
 *
 * Funktionalitäten:
 * - Eingabe einer E-Mail-Adresse zum Zurücksetzen des Passworts
 * - Validierung der Eingabe (erforderlich, E-Mail-Format)
 * - Asynchrone Anfrage zum Zurücksetzen des Passworts über Context-Funktion
 * - Anzeige von Erfolg- oder Fehlermeldungen
 * - Navigation zurück zur Login-Seite mit Erfolgshinweis
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await forgotPassword(email);
      navigate('/login', {
        state: {
          message: 'Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet.',
          severity: 'success'
        }
      });
    } catch (error) {
      setError(error.message || 'Fehler beim Zurücksetzen des Passworts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Passwort zurücksetzen
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              Link zum Zurücksetzen senden
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Zurück zur Anmeldung
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 