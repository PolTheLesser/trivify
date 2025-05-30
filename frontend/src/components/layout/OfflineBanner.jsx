// components/layout/OfflineBanner.js
import React from 'react';

const OfflineBanner = () => {
    return (
        <>
            {/* Interaction blocker over content only */}
            <div
                style={{
                    position: 'fixed',
                    top: '64px', // adjust if navbar is different
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
                    backgroundColor: '#f57c00', // amber/orange tone
                    color: 'white',
                    textAlign: 'center',
                    padding: '1em',
                    zIndex: 999,
                    fontWeight: 'bold',
                }}
            >
                📡 Keine Internetverbindung. Bitte überprüfe deine Verbindung.
            </div>
        </>
    );
};

export default OfflineBanner;
