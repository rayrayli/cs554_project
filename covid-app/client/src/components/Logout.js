import React from 'react';
import { doSignOut } from '../firebase/FirebaseFunctions';
import Button from 'react-bootstrap/Button'

const SignOutButton = () => {
    <Button type = 'button' onClick = {doSignOut} >
        Logout
    </Button>
}

export default SignOutButton;