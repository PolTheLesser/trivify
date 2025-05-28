import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import {useAuth} from '../contexts/AuthContext';
import {PasswordField, CustomSwitch, CustomFormControlLabel } from "../CustomElements";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: '', email: '', dailyQuizReminder: false });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/users/profile`);
        setProfile(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Fehler beim Laden des Profils');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProfileUpdate = async e => {
    e.preventDefault();
    try {
      await axios.put(`/users/profile`, profile);
      setSuccess('Profil erfolgreich aktualisiert. Bitte melde dich neu an.');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren des Profils');
    }
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      setError('Die neuen Passwörter stimmen nicht überein');
      return;
    }
    try {
      await axios.put(
          `/users/profile/password`,
          null,
          { params: { currentPassword: password.currentPassword, newPassword: password.newPassword } }
      );
      setSuccess('Passwort erfolgreich geändert');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Ändern des Passworts');
    }
  };

  const handleDailyQuizReminderChange = async e => {
    const newValue = e.target.checked;
    try {
      await axios.put(
          `/users/${user.id}/daily-quiz-reminder`,
          null,
          { params: { reminder: newValue } }
      );
      setProfile(p => ({ ...p, dailyQuizReminder: newValue }));
      setSuccess('Erinnerungseinstellung erfolgreich aktualisiert');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren der Erinnerung');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/users/profile`);
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Löschen des Accounts');
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
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>Profil</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleProfileUpdate}>
            <TextField
                fullWidth label="Name"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                margin="normal" required
            />
            <TextField
                fullWidth label="E-Mail" type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                margin="normal" required
            />
            <CustomFormControlLabel
                control={<CustomSwitch checked={profile.dailyQuizReminder} onChange={handleDailyQuizReminderChange} />}
                label="Tägliche Quiz-Erinnerungen"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Profil aktualisieren</Button>
          </form>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" gutterBottom>Passwort ändern</Typography>
          <form onSubmit={handlePasswordChange}>
            <PasswordField
                fullWidth label="Aktuelles Passwort"
                value={password.currentPassword}
                onChange={e => setPassword({ ...password, currentPassword: e.target.value })}
                margin="normal" required
            />
            <PasswordField
                fullWidth label="Neues Passwort"
                value={password.newPassword}
                onChange={e => setPassword({ ...password, newPassword: e.target.value })}
                margin="normal" required
            />
            <PasswordField
                fullWidth label="Passwort bestätigen"
                value={password.confirmPassword}
                onChange={e => setPassword({ ...password, confirmPassword: e.target.value })}
                margin="normal" required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Passwort ändern</Button>
          </form>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" color="error" gutterBottom>Account löschen</Typography>
          <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)}>
            Account löschen
          </Button>

          {/* Bestätigungs-Dialog für Account löschen */}
          <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
              aria-labelledby="delete-account-dialog-title"
          >
            <DialogTitle id="delete-account-dialog-title">Account löschen</DialogTitle>
            <DialogContent>
              <Typography>
                Sind Sie sicher, dass Sie Ihren Account zur Löschung vormerken möchten? 
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleDeleteAccount} color="error" variant="contained">Löschen</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
  );
};

export default Settings;