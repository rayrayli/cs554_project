import React, { useState, useEffect } from 'react';
import { onAuthUserListen } from '../firebase/FirebaseFunctions';

export const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [loadingUser, setLoadingUser] = useState(true)

    useEffect(
        () => {
            async function listener() {
                await onAuthUserListen((user) => {
                    console.log("OK HERE NOW", user)
                    setCurrentUser({ 'user': user.user, 'dbUser': user.dbUser })
                    setLoadingUser(false)

                }, () => {
                    setCurrentUser(null);
                    setLoadingUser(false);

                });
            }

            listener();
        }, []
    );

    if (loadingUser) {
        return <div>Loading....</div>;
    }

    return <AuthContext.Provider value={{ currentUser }}> {children} </AuthContext.Provider>
};

