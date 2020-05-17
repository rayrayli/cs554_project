import React, { useContext, useState } from 'react';
import { Container, Row, Col, Image, Form, Button, FormGroup } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';
import { Redirect, Link } from 'react-router-dom';

// User Login With Email and Password
const Inbox = () => {
    const { currentUser } = useContext(AuthContext)
    const [ showReset, setShowReset ] = useState(false)

    if (currentUser) {
        if (currentUser.dbUser.role === 'admin') {
            return (<Redirect to='/' />);
        } else if (currentUser.dbUser.role === 'patient') {
        } else if (currentUser.dbUser.role === 'employee') {
        }
    }

    const AllChats = currentUser.dbUser.messages.map((chat) =>
        <div>
            <Link to={`/chat/${chat.cid}`}>{chat.other}</Link>
        </div>
    );

    return (
        <Container className='main' fluid>
            <h1>All Chats</h1>            
            {AllChats}
        </Container >
    )
}

export default Inbox;