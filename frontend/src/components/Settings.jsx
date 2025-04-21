import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    dailyQuizReminder: false
  });
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL+'/users/profile');
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Laden des Profils');
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(process.env.REACT_APP_API_URL+'/users/profile', profile);
      setSuccess('Profil erfolgreich aktualisiert, bitte melde dich ab und erneut an, um die Änderungen zu sehen.');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren des Profils');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      setError('Die neuen Passwörter stimmen nicht überein');
      return;
    }
    try {
      await axios.put(process.env.REACT_APP_API_URL + `/users/profile/password`, null, {
        params: {
          currentPassword: password.currentPassword,
          newPassword: password.newPassword
        }
      });
      setSuccess('Passwort erfolgreich geändert');
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Ändern des Passworts');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(process.env.REACT_APP_API_URL+'/users/profile');
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Löschen des Accounts');
    }
  };

  const handleDailyQuizReminderChange = async (event) => {
    const newValue = event.target.checked;
    const userId = user.id;

    try {
      await axios.put(
          process.env.REACT_APP_API_URL+`/users/${userId}/daily-quiz-reminder`,
          null,                           // kein Request-Body
          { params: { reminder: newValue } }  // sendet ?reminder=true
      );
      setProfile(prev => ({
        ...prev,
        dailyQuizReminder: newValue
      }));
      setSuccess('Erinnerungseinstellung erfolgreich aktualisiert');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren der Erinnerungseinstellung');
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "100vw", overflowX: "hidden", px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profil
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleProfileUpdate}>
          <TextField
            fullWidth
            label="Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="E-Mail"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            margin="normal"
            required
            type="email"
          />
          <FormControlLabel
            control={
              <Switch
                checked={profile.dailyQuizReminder}
                onChange={handleDailyQuizReminderChange}
                name="dailyQuizReminder"
              />
            }
            label="Tägliche Quiz-Erinnerungen"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Profil aktualisieren
          </Button>
        </form>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom>
          Passwort ändern
        </Typography>
        <form onSubmit={handlePasswordChange}>
          <TextField
            fullWidth
            label="Aktuelles Passwort"
            type="password"
            value={password.currentPassword}
            onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Neues Passwort"
            type="password"
            value={password.newPassword}
            onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Neues Passwort bestätigen"
            type="password"
            value={password.confirmPassword}
            onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Passwort ändern
          </Button>
        </form>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom color="error">
          Account löschen
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Account löschen
        </Button>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Account löschen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie Ihren Account löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;