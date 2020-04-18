import React, { useState, useContext } from 'react';
import { AuthContext } from '../firebase/Auth';

// if USER.role === Admin

// if USER.role === FacilityUser

// if USER.roole === Patient


const Account = (props) => {
    const {currentUser} = useContext(AuthContext);
    console.log('#####',currentUser)

    if (currentUser.role === 'patient') {
        return (
            <div>
                <h1> PATIENT ACCOUNT PAGE</h1>
            </div>
        )
    } else {
        return (
            <div>
                <h1> ACCOUNT PAGE</h1>
            </div>
        )
    }

    
}

const UpdatePassword = () => {
    const { currentUser } = useContext(AuthContext);
    const [passwordMatch, setPasswordMatch] = useState('');
    return null

}

export default Account;