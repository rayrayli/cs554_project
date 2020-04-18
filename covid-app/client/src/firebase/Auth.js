import React, { useState, useEffect, useContext } from 'react';
import firebaseApp from './Firebase';
import { onAuthUserListen } from '../firebase/FirebaseFunctions';

export const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [authUser, setAuthUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true)

    useEffect(
        () => {
            async function listener() {
                await onAuthUserListen( (user) => {
                    console.log("OK HERE NOW", user)
                    if (user && user.role === ('patient')) {
                        console.log(user)
                        setCurrentUser({'user': user.user, 'role': user.role})
                        setLoadingUser(false)
                    }
    
                }, () => {
                    setCurrentUser(null);
                    setLoadingUser(false);
    
                })
            }

            listener();
        }, []
    );

    if (loadingUser) {
        return <div>Loading....</div>;
    }

    return <AuthContext.Provider value={{ currentUser }}> {children} </AuthContext.Provider>
};

