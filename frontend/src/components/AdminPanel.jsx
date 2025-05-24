import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    Snackbar,
    TextField,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import axios from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const ROWS_PER_PAGE = 9;

const AdminUserPanel = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [userRoles, setUserRoles] = useState([]);
    const [userStatuses, setUserStatuses] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterRole, setFilterRole] = useState('ALL');
    const [page, setPage] = useState(1);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '', userStatus: '', dailyQuizReminder: false });
    const [createLoading, setCreateLoading] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [toDeleteUser, setToDeleteUser] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const isNotAdmin = user?.role !== 'ROLE_ADMIN';

    useEffect(() => {
        if (user?.role === 'ROLE_ADMIN') {
            axios.get(`${process.env.REACT_APP_API_URL}/users/roles`)
                .then(res => setUserRoles(res.data))
                .catch(() => setSnackbar({ open: true, message: 'Fehler beim Laden der Rollen.', severity: 'error' }));

            axios.get(`${process.env.REACT_APP_API_URL}/users/states`)
                .then(res => setUserStatuses(res.data))
                .catch(() => setSnackbar({ open: true, message: 'Fehler beim Laden der Stati.', severity: 'error' }));
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users`);
            setUsers(res.data);
            setError('');
        } catch {
            setError('Fehler beim Laden der Benutzer.');
            setSnackbar({ open: true, message: 'Fehler beim Laden der Benutzer.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            let filtered = [...users];
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
            }
            if (filterStatus !== 'ALL') filtered = filtered.filter(u => u.userStatus === filterStatus);
            if (filterRole !== 'ALL') filtered = filtered.filter(u => u.role === filterRole);
            setFilteredUsers(filtered);
            setPage(1);
        }
    }, [searchQuery, filterStatus, filterRole, users, user]);

    const paginatedUsers = filteredUsers.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
    const pageCount = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);

    const openEditDialog = (user) => {
        setEditUser({ ...user, password: '' });
        setEditDialogOpen(true);
    };
    const closeEditDialog = () => {
        setEditUser(null);
        setEditDialogOpen(false);
        setEditLoading(false);
    };
    const handleEditChange = (field, value) => setEditUser(prev => ({ ...prev, [field]: value }));
    const saveUser = async () => {
        setEditLoading(true);
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/admin/users/update/${editUser.id}`, editUser);
            await fetchUsers();
            setSnackbar({ open: true, message: 'Benutzer erfolgreich gespeichert.', severity: 'success' });
            closeEditDialog();
        } catch {
            setSnackbar({ open: true, message: 'Fehler beim Speichern des Benutzers.', severity: 'error' });
            setEditLoading(false);
        }
    };

    const openDeleteDialog = (user) => { setToDeleteUser(user); setDeleteDialogOpen(true); };
    const closeDeleteDialog = () => { setToDeleteUser(null); setDeleteDialogOpen(false); setDeleteLoading(false); };
    const deleteUser = async () => {
        setDeleteLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/admin/users/delete/${toDeleteUser.id}`);
            await fetchUsers();
            setSnackbar({ open: true, message: 'Benutzer erfolgreich gelöscht.', severity: 'success' });
            closeDeleteDialog();
        } catch {
            setSnackbar({ open: true, message: 'Fehler beim Löschen des Benutzers.', severity: 'error' });
            setDeleteLoading(false);
        }
    };

    const createUser = async () => {
        setCreateLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/admin/users/create`, newUser);
            setSnackbar({ open: true, message: 'Benutzer erstellt.', severity: 'success' });
            setCreateDialogOpen(false);
            await fetchUsers();
        } catch {
            setSnackbar({ open: true, message: 'Fehler beim Erstellen.', severity: 'error' });
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
            {isNotAdmin ? (
                <Typography variant="h5" color="error" sx={{ mt: 6, textAlign: 'center' }}>
                    Zugriff verweigert. Nur Administratoren dürfen dieses Panel nutzen.
                </Typography>
            ) : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Suche" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small" />
                            <FormControl size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                                    <MenuItem value="ALL">Alle</MenuItem>
                                    {userStatuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl size="small">
                                <InputLabel>Rolle</InputLabel>
                                <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} label="Rolle">
                                    <MenuItem value="ALL">Alle</MenuItem>
                                    {userRoles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <Button color="error" onClick={() => { setSearchQuery(''); setFilterStatus('ALL'); setFilterRole('ALL'); }}>Filter zurücksetzen</Button>
                        </Box>
                        <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>Benutzer erstellen</Button>
                    </Box>

                    {/* Benutzerliste */}
                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : filteredUsers.length === 0 ? (
                        <Typography variant="body1" sx={{ mt: 4 }}>Keine Benutzer gefunden.</Typography>
                    ) : (
                        <>
                            <Grid container spacing={3}>
                                {paginatedUsers.map(u => (
                                    <Grid item xs={12} sm={6} md={4} key={u.id}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6">{u.name}</Typography>
                                                <Typography>{u.email}</Typography>
                                                <Typography>Status: {u.userStatus}</Typography>
                                                <Typography>Rolle: {u.role}</Typography>
                                                <Typography>Daily Reminder: {u.dailyQuizReminder ? 'Ja' : 'Nein'}</Typography>
                                                <Typography>Daily Streak: {u.dailyStreak}</Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button onClick={() => openEditDialog(u)}>Bearbeiten</Button>
                                                <Button color="error" onClick={() => openDeleteDialog(u)}>Löschen</Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            {pageCount > 1 && <Box display="flex" justifyContent="center" mt={4}><Pagination count={pageCount} page={page} onChange={(_, val) => setPage(val)} /></Box>}
                        </>
                    )}

                    {/* Edit-Dialog */}
                    <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>Benutzer bearbeiten</DialogTitle>
                        <DialogContent>
                            <TextField margin="dense" label="Name" fullWidth value={editUser?.name || ''} onChange={(e) => handleEditChange('name', e.target.value)} disabled={editLoading} />
                            <TextField margin="dense" label="Email" fullWidth value={editUser?.email || ''} onChange={(e) => handleEditChange('email', e.target.value)} disabled={editLoading} />
                            <TextField margin="dense" label="Passwort" fullWidth type="password" value={editUser?.password || ''} onChange={(e) => handleEditChange('password', e.target.value)} helperText="Nur ausfüllen, wenn Passwort geändert werden soll" disabled={editLoading} />
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Tägliche Erinnerung</InputLabel>
                                <Select value={editUser?.dailyQuizReminder ? 'YES' : 'NO'} onChange={(e) => handleEditChange('dailyQuizReminder', e.target.value === 'YES')} disabled={editLoading}>
                                    <MenuItem value="YES">Ja</MenuItem>
                                    <MenuItem value="NO">Nein</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField margin="dense" label="Daily Streak" fullWidth type="number" value={editUser?.dailyStreak || 0} onChange={(e) => handleEditChange('dailyStreak', parseInt(e.target.value, 10))} disabled={editLoading} />
                            <TextField margin="dense" label="Status" fullWidth value={editUser?.userStatus || ''} disabled />
                            <TextField margin="dense" label="Rolle" fullWidth value={editUser?.role || ''} disabled />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeEditDialog} disabled={editLoading}>Abbrechen</Button>
                            <Button onClick={saveUser} disabled={editLoading} variant="contained">{editLoading ? <CircularProgress size={24} /> : 'Speichern'}</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Create-Dialog */}
                    <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
                        <DialogContent>
                            <TextField margin="dense" label="Name" fullWidth value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                            <TextField margin="dense" label="Email" fullWidth value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                            <TextField margin="dense" label="Passwort" type="password" fullWidth value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Rolle</InputLabel>
                                <Select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                    {userRoles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Status</InputLabel>
                                <Select value={newUser.userStatus} onChange={(e) => setNewUser({ ...newUser, userStatus: e.target.value })}>
                                    {userStatuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Tägliche Erinnerung</InputLabel>
                                <Select value={newUser.dailyQuizReminder ? 'YES' : 'NO'} onChange={(e) => setNewUser({ ...newUser, dailyQuizReminder: e.target.value === 'YES' })}>
                                    <MenuItem value="YES">Ja</MenuItem>
                                    <MenuItem value="NO">Nein</MenuItem>
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setCreateDialogOpen(false)} disabled={createLoading}>Abbrechen</Button>
                            <Button onClick={createUser} disabled={createLoading} variant="contained">{createLoading ? <CircularProgress size={24} /> : 'Erstellen'}</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Delete-Dialog */}
                    <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                        <DialogTitle>Benutzer löschen</DialogTitle>
                        <DialogContent>
                            <DialogContentText>Willst du den Benutzer <strong>{toDeleteUser?.name}</strong> wirklich löschen?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDeleteDialog} disabled={deleteLoading}>Abbrechen</Button>
                            <Button onClick={deleteUser} color="error" variant="contained" disabled={deleteLoading}>{deleteLoading ? <CircularProgress size={24} /> : 'Löschen'}</Button>
                        </DialogActions>
                    </Dialog>

                    <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} sx={{ width: '100%' }}>{snackbar.message}</Alert>
                    </Snackbar>
                </>
            )}
        </Container>
    );
};

export default AdminUserPanel;