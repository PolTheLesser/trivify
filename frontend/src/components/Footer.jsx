import React from 'react';
import {useTheme, alpha} from '@mui/material/styles';

const Footer = () => {
    const theme = useTheme();
    return (
        <footer
            style={{
                position: 'fixed',
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
                </a>{' '}
                |{' '}
                <a href="/impressum" style={{color: 'inherit'}}>
                    Impressum
                </a>{' '}
                |{' '}
                <a href="/datenschutz" style={{color: 'inherit'}}>
                    Datenschutz
                </a>
            </div>
            <div style={{marginTop: '0.5em'}}>
                <p style={{margin: 0}}>© 2025 Trivify. Alle Rechte vorbehalten.</p>
            </div>
        </footer>
    );
};

export default Footer;
