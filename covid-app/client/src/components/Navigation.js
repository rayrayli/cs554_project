import React, { useContext } from 'react';
import { AuthContext } from '../firebase/Auth';
import { Navbar, Nav, Row } from 'react-bootstrap';
import { doSignOut } from '../firebase/FirebaseFunctions';
import '../App.css'

const Navigation = () => {
    const { currentUser } = useContext(AuthContext);

    return <Row> {currentUser ? <NavigationAuth /> : <NavigationNoAuth />} </Row>

};

const NavigationAuth = () => {
    return (
        <Navbar className='App-nav' fixed='top'>
            <Navbar.Brand href='/' > COVID-19 Info Hub </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Nav.Link href='/account'> Account </Nav.Link>
                <Nav.Link href='/messages'> Messages </Nav.Link>
                <Nav.Link onClick={doSignOut}> Logout </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
};

const NavigationNoAuth = () => {
    return (
        <Navbar className='App-nav' fixed='top'>
            <Navbar.Brand href='/' > COVID-19 Info Hub </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Nav.Link href='/register'> COVID-19 Testing </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;