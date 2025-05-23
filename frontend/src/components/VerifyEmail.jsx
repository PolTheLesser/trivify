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

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.post(process.env.REACT_APP_API_URL +`/auth/verify-email/${token}`);
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