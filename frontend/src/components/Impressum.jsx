import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

export default function Impressum() {
    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Impressum
                </Typography>

                <Typography variant="body1" paragraph>
                    Angaben gemäß § 5 TMG:
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Trivify Team<br />
                    c/o Rheinische Hochschule Köln (RH Köln)<br />
                    Schaevenstraße 1B<br />
                    50676 Köln
                </Typography>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        Vertreten durch:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Trivify Team
                    </Typography>
                </Box>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        Kontakt:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        E-Mail:{' '}
                        <a href={`mailto:${process.env.REACT_APP_MAIL}?subject=Anfrage%20Impressum%20Trivify`} style={{ color: '#1976d2', textDecoration: 'underline' }}>
                            {process.env.REACT_APP_MAIL}
                        </a>
                    </Typography>
                </Box>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Trivify Team<br />
                        c/o Rheinische Hochschule Köln (RH Köln)<br />
                        Schaevenstraße 1B<br />
                        50676 Köln
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}