import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

/**
 * VerifyEmail-Komponente
 *
 * Diese Komponente wird aufgerufen, wenn ein Benutzer den Verifizierungslink
 * aus der E-Mail anklickt. Sie verarbeitet das Verifizierungstoken aus der URL
 * und kommuniziert mit dem Backend, um die E-Mail-Adresse zu bestätigen.
 *
 * Ablauf:
 * - Extrahiert das Token aus den URL-Parametern
 * - Sendet eine POST-Anfrage zur Verifizierung der E-Mail
 * - Zeigt den aktuellen Status der Verifizierung:
 *   - Ladeindikator während der Verifizierung
 *   - Erfolgsmeldung bei erfolgreicher Verifizierung (inkl. Weiterleitung)
 *   - Fehlermeldung, wenn etwas schiefläuft
 *
 * Nach erfolgreicher Verifizierung wird der Benutzer automatisch
 * zur Login-Seite weitergeleitet, inklusive einer Erfolgsmeldung.
 */
const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.post(`/auth/verify-email/${token}`);
        setStatus('success');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'E-Mail erfolgreich verifiziert! Sie können sich jetzt anmelden.', severity: 'success' },
          });
        }, 3000);
      } catch (error) {
        setStatus('error');
        setError(error.response?.data?.message || 'Fehler bei der E-Mail-Verifizierung');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            E-Mail-Verifizierung
          </Typography>
          
          {status === 'verifying' && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>
                Verifiziere Ihre E-Mail-Adresse...
              </Typography>
            </Box>
          )}

          {status === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Ihre E-Mail-Adresse wurde erfolgreich verifiziert! Sie werden in Kürze zur Anmeldeseite weitergeleitet.
            </Alert>
          )}

          {status === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail; 