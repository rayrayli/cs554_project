import React, { useState, useContext, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
    // Check If User Logged In
    const { currentUser } = useContext(AuthContext);
    const [userRole, setUserRole] = useState(undefined);

    useEffect(
        () => {
            if (currentUser && currentUser.uid) {
                fetch(`/users/${currentUser.uid}`)
                    .then((res1) => res1.json())
                    .then((data) => {
                        console.log(data[0].role)
                    })
            }

        }, []
    )


    return (
        <Route
            {...rest}
            render={(routeProps) => (!!currentUser ? <RouteComponent {...routeProps} /> : <Redirect to={'login'} />)}
        />
    );
}

export default PrivateRoute;

