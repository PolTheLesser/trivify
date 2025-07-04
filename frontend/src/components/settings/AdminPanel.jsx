import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
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
    Paper,
    Snackbar,
    TextField,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import axios from '../../api/api';
import {useAuth} from '../../contexts/AuthContext';
import {CustomSelect, CustomSwitch, PasswordField} from "../../CustomElements";

const ROWS_PER_PAGE = 9;

/**
 * AdminUserPanel-Komponente
 *
 * Diese Komponente stellt ein Administrationspanel zur Verwaltung von Benutzern bereit.
 * Administratoren können Benutzer suchen, filtern, erstellen, bearbeiten und löschen.
 *
 * Funktionalitäten:
 * - Laden und Anzeigen einer paginierten Liste von Benutzern mit Filtermöglichkeiten nach Name, Status und Rolle
 * - Erstellen neuer Benutzer mit Angabe von Name, Email, Passwort, Rolle, Status und weiteren Einstellungen
 * - Bearbeiten bestehender Benutzer inklusive Passwortänderung, Rollen- und Statusanpassung sowie weiteren Eigenschaften
 * - Löschen von Benutzern mit Bestätigungsdialog
 * - Anzeige von Ladezuständen, Fehlermeldungen und Erfolgshinweisen via Snackbar
 * - Zugriffsbeschränkung: Nur Benutzer mit Admin-Rolle können das Panel nutzen
 */
const AdminUserPanel = () => {
    const {user} = useAuth();
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
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        userStatus: '',
        dailyQuizReminder: false,
        dailyStreak: 0,
        createdAt: new Date().toISOString(),
    });
    const [createLoading, setCreateLoading] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [toDeleteUser, setToDeleteUser] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});

    const isNotAdmin = user?.role !== 'ROLE_ADMIN';

    useEffect(() => {
        if (user?.role === 'ROLE_ADMIN') {
            axios.get(`/admin/users/roles`)
                .then(res => setUserRoles(res.data))
                .catch(() => setSnackbar({open: true, message: 'Fehler beim Laden der Rollen.', severity: 'error'}));

            axios.get(`/admin/users/states`)
                .then(res => setUserStatuses(res.data))
                .catch(() => setSnackbar({open: true, message: 'Fehler beim Laden der Stati.', severity: 'error'}));
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/admin/users`);
            setUsers(res.data);
            setError('');
        } catch {
            setError('Fehler beim Laden der Benutzer.');
            setSnackbar({open: true, message: 'Fehler beim Laden der Benutzer.', severity: 'error'});
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
        setEditUser({...user, password: ''});
        setEditDialogOpen(true);
    };
    const closeEditDialog = () => {
        setEditUser(null);
        setEditDialogOpen(false);
        setEditLoading(false);
    };
    const handleEditChange = (field, value) => setEditUser(prev => ({...prev, [field]: value}));
    const saveUser = async () => {
        setEditLoading(true);
        try {
            await axios.put(`/admin/users/update/${editUser.id}`, editUser);
            await fetchUsers();
            setSnackbar({open: true, message: 'Benutzer erfolgreich gespeichert.', severity: 'success'});
            closeEditDialog();
        } catch {
            setSnackbar({open: true, message: 'Fehler beim Speichern des Benutzers.', severity: 'error'});
            setEditLoading(false);
        }
    };

    const openDeleteDialog = (user) => {
        setToDeleteUser(user);
        setDeleteDialogOpen(true);
    };
    const closeDeleteDialog = () => {
        setToDeleteUser(null);
        setDeleteDialogOpen(false);
        setDeleteLoading(false);
    };
    const deleteUser = async () => {
        setDeleteLoading(true);
        try {
            await axios.delete(`/admin/users/delete/${toDeleteUser.id}`);
            await fetchUsers();
            setSnackbar({open: true, message: 'Benutzer erfolgreich gelöscht.', severity: 'success'});
            closeDeleteDialog();
        } catch {
            setSnackbar({open: true, message: 'Fehler beim Löschen des Benutzers.', severity: 'error'});
            setDeleteLoading(false);
        }
    };

    const createUser = async () => {
        const {name, email, password, role, userStatus} = newUser;

        if (!name || !email || !password || !role || !userStatus) {
            setSnackbar({open: true, message: 'Bitte alle Pflichtfelder ausfüllen.', severity: 'error'});
            return;
        }

        setCreateLoading(true);
        try {
            await axios.post(`/admin/users/create`, newUser);
            setSnackbar({open: true, message: 'Benutzer erstellt.', severity: 'success'});
            setCreateDialogOpen(false);
            await fetchUsers();
        } catch {
            setSnackbar({open: true, message: 'Fehler beim Erstellen.', severity: 'error'});
        } finally {
            setCreateLoading(false);
        }
    };
    if (isNotAdmin) {
        return (
            <Box sx={{width: '100%', maxWidth: '100vw', overflowX: 'hidden', mt: 3, mb: 6}}>
                <Typography variant="h5" color="error" sx={{mt: 6, textAlign: 'center'}}>
                    Zugriff verweigert. Nur Administratoren dürfen dieses Panel nutzen.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{width: '100%', maxWidth: '100vw', overflowX: 'hidden', mt: 3, mb: 6}}>
            {/* Filterleiste */}
            <Paper
                elevation={2}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mb: 4,
                    px: 2,
                    py: 3,
                    mx: 2,
                    mt: 2
                }}
            >
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    {/* Erste Zeile: Filterfelder */}
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center'}}>
                        <TextField label="Suche" variant="outlined" value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)} size="small"/>
                        <FormControl size="small" sx={{minWidth: 150}}>
                            <InputLabel>Status</InputLabel>
                            <CustomSelect
                                fullWidth
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="ALL">Alle</MenuItem>
                                {userStatuses.map(status => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </CustomSelect>
                        </FormControl>
                        <FormControl size="small" sx={{minWidth: 150}}>
                            <InputLabel>Rolle</InputLabel>
                            <CustomSelect
                                fullWidth
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                label="Rolle"
                            >
                                <MenuItem value="ALL">Alle</MenuItem>
                                {userRoles.map(role => (
                                    <MenuItem key={role} value={role}>{role}</MenuItem>
                                ))}
                            </CustomSelect>
                        </FormControl>
                    </Box>

                    {/* Zweite Zeile: Buttons */}
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
                            Benutzer erstellen
                        </Button>
                        <Button variant="contained" color="error" onClick={() => {
                            setSearchQuery('');
                            setFilterStatus('ALL');
                            setFilterRole('ALL');
                        }}>
                            Filter zurücksetzen
                        </Button>
                    </Box>
                </Box>
            </Paper>


            {/* Benutzerliste */}
            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}><CircularProgress/></Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : filteredUsers.length === 0 ? (
                <Typography variant="body1" sx={{mt: 4}}>Keine Benutzer gefunden.</Typography>
            ) : (
                <>
                    <Grid container spacing={3} sx={{px: 2, pb: 6}}>
                        {paginatedUsers.map(u => (
                            <Grid item xs={12} sm={6} md={4} key={u.id} sx={{display: 'flex'}}>
                                <Card sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    flexGrow: 1,
                                    height: '100%'
                                }}>
                                    <CardContent>
                                        <Typography variant="h6">{u.name}</Typography>
                                        <Typography>{u.email}</Typography>
                                        <Typography>Status: {u.userStatus}</Typography>
                                        <Typography>Rolle: {u.role}</Typography>
                                        <Typography>Erstellt
                                            am: {new Date(u.createdAt).toLocaleDateString()}</Typography>
                                        <Typography>Daily
                                            Reminder: {u.dailyQuizReminder ? 'Ja' : 'Nein'}</Typography>
                                        <Typography>Daily Streak: {u.dailyStreak}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button variant="contained"
                                                onClick={() => openEditDialog(u)} disabled={u.id === 1}>Bearbeiten</Button>
                                        <Button variant="contained" color="error"
                                                onClick={() => openDeleteDialog(u)} disabled={u.id === 1}>Löschen</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    {pageCount > 1 &&
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination count={pageCount} page={page} onChange={(_, val) => setPage(val)}/>
                        </Box>
                    }
                </>
            )}

            {/* Edit-Dialog */}
            <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Benutzer bearbeiten</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Name" fullWidth value={editUser?.name || ''}
                               onChange={(e) => handleEditChange('name', e.target.value)}
                               disabled={editLoading}/>
                    <TextField margin="dense" label="Email" fullWidth value={editUser?.email || ''}
                               onChange={(e) => handleEditChange('email', e.target.value)}
                               disabled={editLoading}/>
                    <PasswordField margin="dense" label="Passwort" fullWidth value={editUser?.password || ''}
                                   onChange={(e) => handleEditChange('password', e.target.value)}
                                   helperText="Nur ausfüllen, wenn Passwort geändert werden soll"
                                   disabled={editLoading}/>
                    <FormControl fullWidth margin="dense">
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography>Tägliche Quiz-Erinnerung</Typography>
                            <CustomSwitch
                                checked={editUser?.dailyQuizReminder || false}
                                onChange={(e) => handleEditChange('dailyQuizReminder', e.target.checked)}
                                disabled={editLoading}
                            />
                        </Box>
                    </FormControl>
                    <TextField margin="dense" label="Daily Streak" fullWidth type="number"
                               value={editUser?.dailyStreak || 0}
                               onChange={(e) => handleEditChange('dailyStreak', parseInt(e.target.value, 10))}
                               disabled={editLoading}/>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <CustomSelect
                            value={editUser?.userStatus || ''}
                            onChange={(e) => handleEditChange('userStatus', e.target.value)}
                            disabled={editLoading}
                        >
                            {userStatuses.map(status => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </CustomSelect>
                    </FormControl>

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Rolle</InputLabel>
                        <CustomSelect
                            value={editUser?.role || ''}
                            onChange={(e) => handleEditChange('role', e.target.value)}
                            disabled={editLoading}
                        >
                            {userRoles.map(role => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </CustomSelect>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button color="error" variant="contained" onClick={closeEditDialog}
                            disabled={editLoading}>Abbrechen</Button>
                    <Button onClick={saveUser} disabled={editLoading} variant="contained">{editLoading ?
                        <CircularProgress size={24}/> : 'Speichern'}</Button>
                </DialogActions>
            </Dialog>

            {/* Create-Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Name" fullWidth value={newUser.name}
                               onChange={(e) => setNewUser({...newUser, name: e.target.value})}/>
                    <TextField margin="dense" label="Email" fullWidth value={newUser.email}
                               onChange={(e) => setNewUser({...newUser, email: e.target.value})}/>
                    <TextField margin="dense" label="Passwort" type="password" fullWidth
                               value={newUser.password}
                               onChange={(e) => setNewUser({...newUser, password: e.target.value})}/>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Rolle</InputLabel>
                        <CustomSelect value={newUser.role}
                                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                            {userRoles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                        </CustomSelect>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <CustomSelect value={newUser.userStatus}
                                      onChange={(e) => setNewUser({...newUser, userStatus: e.target.value})}>
                            {userStatuses.map(status => <MenuItem key={status}
                                                                  value={status}>{status}</MenuItem>)}
                        </CustomSelect>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography>Tägliche Quiz-Erinnerung</Typography>
                            <CustomSwitch
                                checked={newUser.dailyQuizReminder}
                                onChange={(e) => setNewUser({...newUser, dailyQuizReminder: e.target.checked})}
                            />
                        </Box>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}
                            disabled={createLoading}>Abbrechen</Button>
                    <Button onClick={createUser} disabled={createLoading} variant="contained">{createLoading ?
                        <CircularProgress size={24}/> : 'Erstellen'}</Button>
                </DialogActions>
            </Dialog>

            {/* Delete-Dialog */}
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Benutzer löschen</DialogTitle>
                <DialogContent>
                    <DialogContentText>Willst du den Benutzer <strong>{toDeleteUser?.name}</strong> wirklich
                        löschen?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} disabled={deleteLoading}>Abbrechen</Button>
                    <Button onClick={deleteUser} color="error" variant="contained"
                            disabled={deleteLoading}>{deleteLoading ?
                        <CircularProgress size={24}/> : 'Löschen'}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000}
                      onClose={() => setSnackbar(prev => ({...prev, open: false}))}
                      anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
                <Alert severity={snackbar.severity}
                       onClose={() => setSnackbar(prev => ({...prev, open: false}))}
                       sx={{width: '100%'}}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminUserPanel;