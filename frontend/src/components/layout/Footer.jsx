import React from 'react';
import {useTheme, alpha} from '@mui/material/styles';

/**
 * Footer-Komponente
 *
 * Diese Komponente rendert einen festen Footer am unteren Rand der Seite mit einer halbtransparenten Hintergrundfarbe,
 * die sich am aktuellen MUI-Theme orientiert. Im Footer befindet sich ein Kontakt-Link, der eine E-Mail an die
 * in der Umgebungsvariable definierte Adresse öffnet, sowie ein Copyright-Hinweis.
 *
 * Funktionalitäten:
 * - Fixierte Positionierung am unteren Seitenrand
 * - Hintergrundfarbe mit Transparenz basierend auf dem aktuellen Theme
 * - Anzeige eines Kontakt-Mailto-Links mit vordefiniertem Betreff
 * - Anzeige eines Copyright-Textes
 */
const Footer = () => {
    const theme = useTheme();
    return (
        <footer
            style={{
                bottom: 0,
                left: 0,
                backgroundColor: alpha(theme.palette.background.default, 0.8), // 80% opacity
                padding: '1em 0',
                width: '100%',
                textAlign: 'center',
                borderTop: '1px solid #e7e7e7',
                zIndex: 1000,
            }}
        >
            <div className="footer-links">
                <a href={`mailto:${process.env.REACT_APP_MAIL}?subject=Kontaktanfrage%20Trivify`} style={{color: 'inherit'}}>
                    Kontakt
                </a>
            </div>
            <div style={{marginTop: '0.5em'}}>
                <p style={{margin: 0}}>© 2025 Trivify. Alle Rechte vorbehalten.</p>
            </div>
        </footer>
    );
};

export default Footer;
