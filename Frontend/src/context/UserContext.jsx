import React, { createContext, useState } from 'react';

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <UserDataContext.Provider value={{ user, setUser, isLoading, setIsLoading, error, setError }}>
            {children}
        </UserDataContext.Provider>
    );
};

export default UserContext;
