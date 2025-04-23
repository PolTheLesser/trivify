import React from 'react';
import { useTheme } from '@mui/material/styles';

const Footer = () => {
    const theme = useTheme();
    return (
        <footer
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                backgroundColor: theme.palette.background.default,
                padding: '1em 0',
                width: '100%',
                textAlign: 'center',
                borderTop: '1px solid #e7e7e7',
                zIndex: 1000,
            }}
        >

          <div className="footer-links">
              <a href="mailto:quiz_rh@gmx.de?subject=Kontaktanfrage%20Quizapp" color={"inherit"}>Kontakt</a> | <a
              href="/impressum" color="inherit">Impressum</a> | <a href="/datenschutz" color="inherit">Datenschutz</a>
          </div>
            <div style={{ marginTop: '0.5em', textAlign: 'center'}}>
                <p style={{ margin: 0 }}>© 2025 Trivify. Alle Rechte vorbehalten.</p>
            </div>
        </footer>
    );
};

export default Footer;