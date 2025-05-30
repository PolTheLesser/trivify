import React from 'react';

const ServerDownBanner = () => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#d32f2f',
        color: 'white',
        textAlign: 'center',
        padding: '0.75em',
        zIndex: 3000,
    }}>
        Verbindung zum Server fehlgeschlagen. Bitte später erneut versuchen.
    </div>
);

export default ServerDownBanner;
