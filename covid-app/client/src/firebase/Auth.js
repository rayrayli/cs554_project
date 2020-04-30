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
                    console.log("USER FOUND: ", user)
                    setCurrentUser({ 'user': user.user, 'dbUser': user.dbUser })
                    setLoadingUser(false)

                }, () => {
                    console.log(("NO USER FOUND"))
                    setCurrentUser(null);
                    setLoadingUser(false);

                });
            }

            listener();
        }, []
    );

    if (loadingUser) {
        return <div>Loading User....</div>;
    }

    return <AuthContext.Provider value={{ currentUser }}> {children} </AuthContext.Provider>
};

