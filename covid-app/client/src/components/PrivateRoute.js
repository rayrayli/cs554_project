import React, { useContext, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';
import axios from 'axios';

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
    // Check If User Logged In
    const { currentUser } = useContext(AuthContext);

    useEffect(
        () => {
            if (currentUser && currentUser.uid) {
                axios.get(`/users/${currentUser.uid}`)
                    .then((data) => {
                        console.log(data.data[0].role)
                    })
            }
        }, [currentUser]
    )

    return (
        <Route
            {...rest}
            render={(routeProps) => (!!currentUser ? <RouteComponent {...routeProps} /> : <Redirect to={'login'} />)}
        />
    );
}

export default PrivateRoute;

