// components/layout/ServerDownBanner.js
import React from 'react';

const ServerDownBanner = () => {
    return (
        <>
            {/* Overlay to block interaction on main content */}
            <div
                style={{
                    position: 'fixed',
                    top: '64px', // assumes Navbar height, adjust if needed
                    left: 0,
                    width: '100vw',
                    height: 'calc(100vh - 64px - 3rem)', // exclude navbar and footer
                    zIndex: 998,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'auto',
                }}
            />

            {/* Top banner */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    textAlign: 'center',
                    padding: '1em',
                    zIndex: 999,
                    fontWeight: 'bold',
                }}
            >
                🥲 Verbindung zum Server fehlgeschlagen. Bitte später erneut versuchen.
            </div>
        </>
    );
};

export default ServerDownBanner;