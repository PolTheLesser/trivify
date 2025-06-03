import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

/**
 * ResetPassword-Komponente
 *
 * Diese Komponente ermöglicht es dem Benutzer, ein neues Passwort zu setzen,
 * nachdem er einen gültigen Token per E-Mail erhalten hat (z. B. durch die "Passwort vergessen"-Funktion).
 *
 * Funktionalitäten:
 * - Überprüfung, ob die beiden eingegebenen Passwörter übereinstimmen
 * - Senden des neuen Passworts zusammen mit dem Token an den Server
 * - Anzeige von Ladezustand, Erfolgs- oder Fehlermeldungen
 * - Weiterleitung zur Login-Seite nach erfolgreicher Passwortänderung
 *
 */
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);

    try {
      await axios.post(process.env.REACT_APP_API_URL +`/users/reset-password/${token}`, {
        newPassword: password
      });
      navigate('/login', {
        state: { message: 'Passwort erfolgreich zurückgesetzt! Sie können sich jetzt anmelden.', severity: 'success' },
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Fehler beim Zurücksetzen des Passworts');
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
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Neues Passwort"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Passwort bestätigen"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              Passwort zurücksetzen
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 