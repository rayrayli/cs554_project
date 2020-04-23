import React, { useState, useContext } from 'react';
import { AuthContext } from '../firebase/Auth';
import { Container, Row, Col, Figure, Form, InputGroup, FormControl } from 'react-bootstrap';

const Account = (props) => {
    const { currentUser } = useContext(AuthContext);
    console.log('#####', currentUser)

    return <Container className='main' fluid>
        {(currentUser.dbUser.role === 'admin' || currentUser.dbUser.role === 'facilityUser') ? <AccountFacility /> : <AccountPatient />}
    </Container>
}

const AccountFacility = () => {

    return (
        <div>
            <h1> ADMIN ACCOUNT PAGE</h1>
        </div>
    )
}

const AccountPatient = () => {
    return (
        <div>
            <h1> PATIENT ACCOUNT PAGE</h1>
        </div>
    )
}

const UpdatePassword = () => {
    const { currentUser } = useContext(AuthContext);
    const [passwordMatch, setPasswordMatch] = useState('');
    return null

}

export default Account;