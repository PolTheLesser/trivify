import React, { useEffect, useState } from 'react';

const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#f44336',
            color: '#fff',
            textAlign: 'center',
            padding: '0.75em',
            zIndex: 2000,
        }}>
            Keine Internetverbindung. Bitte überprüfe deine Verbindung.
        </div>
    );
};

export default OfflineBanner;
