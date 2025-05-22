import React from 'react';
import { Container, Typography, Paper, Box, Link, List, ListItem, ListItemText } from '@mui/material';

export default function Datenschutz() {
    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Datenschutzerklärung
                </Typography>

                <Typography variant="body1" paragraph color="text.secondary">
                    Wir freuen uns über Ihr Interesse an Trivify. Der Schutz Ihrer Daten ist uns sehr wichtig.
                    Nachfolgend informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer App.
                </Typography>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        1. Verantwortliche Stelle
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Trivify Team<br />
                        c/o Rheinische Hochschule Köln (RH Köln)<br />
                        Schaevenstraße 1B<br />
                        50676 Köln<br />
                        E-Mail:{' '}
                        <Link href={`mailto:${mail}`} underline="hover" color="primary">
                            {mail}
                        </Link>
                    </Typography>
                </Box>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        2. Welche Daten werden verarbeitet?
                    </Typography>
                    <List dense>
                        {[  'Nach Registrierung werden folgende Daten verarbeitet: ',
                            'Registrierungsdaten (Name, E-Mail-Adresse, Passwort)',
                            'Quiz-Aktivitäten (z. B. beantwortete Fragen, Streaks, Punkte)',
                            'Einstellungen (z. B. Erinnerungsfunktion für das tägliche Quiz)',
                            'Kommunikationsdaten (z. B. E-Mail-Benachrichtigungen)'
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        3. Zweck der Datenverarbeitung
                    </Typography>
                    <List dense>
                        {[
                            'Betrieb und Verbesserung der Quiz-Plattform',
                            'Versand von Erinnerungs- und Streak-E-Mails (sofern aktiviert)',
                            'Auswertung der Nutzung zur Optimierung des Angebots',
                            'Fehleranalyse und Sicherheit'
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        4. Weitergabe von Daten
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Ihre Daten werden nicht an Dritte weitergegeben, außer es besteht eine gesetzliche Verpflichtung oder
                        Sie haben ausdrücklich eingewilligt. Die Quizfragen werden teilweise automatisiert durch einen externen
                        KI-Service generiert; dabei werden jedoch keine personenbezogenen Daten übermittelt.
                    </Typography>
                </Box>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        5. Ihre Rechte
                    </Typography>
                    <List dense>
                        {[
                            'Auskunft über Ihre gespeicherten Daten',
                            'Berichtigung oder Löschung Ihrer Daten',
                            'Einschränkung der Verarbeitung',
                            'Widerspruch gegen die Verarbeitung',
                            'Datenübertragbarkeit'
                        ].map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Für die Ausübung Ihrer Rechte oder bei Fragen zum Datenschutz schreiben Sie uns an{' '}
                        <Link href={`mailto:${mail}`} underline="hover" color="primary">
                            {mail}
                        </Link>.
                    </Typography>
                </Box>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        6. Änderungen
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren. Die aktuelle Version
                        finden Sie jederzeit in der App.
                    </Typography>
                </Box>

                <Typography variant="caption" display="block" align="center" sx={{ mt: 6, color: 'text.disabled' }}>
                    Stand: 18. April 2025
                </Typography>
            </Paper>
        </Container>
    );
}
