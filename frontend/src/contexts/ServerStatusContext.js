import React, { createContext, useContext, useState } from 'react';

const ServerStatusContext = createContext(undefined);

export const ServerStatusProvider = ({ children }) => {
    const [serverDown, setServerDown] = useState(false);

    return (
        <ServerStatusContext.Provider value={{ serverDown, setServerDown }}>
            {children}
        </ServerStatusContext.Provider>
    );
};

export const useServerStatus = () => {
    const context = useContext(ServerStatusContext);
    if (!context) {
        throw new Error("useServerStatus must be used within a ServerStatusProvider");
    }
    return context;
};