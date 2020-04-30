import React, { useContext } from 'react';
import { AuthContext } from '../firebase/Auth';
import { Navbar, Nav, Row } from 'react-bootstrap';
import { doSignOut } from '../firebase/FirebaseFunctions';
import '../App.css'

const Navigation = () => {
    const { currentUser } = useContext(AuthContext);
    const role = currentUser && currentUser.dbUser.role

    if (role === 'admin') {
        return <Row> {<NavigationAdmin />} </Row>
    } else if (role === 'patient' || role === 'facilityUser') {
        return <Row> {<NavigationAuth />} </Row>
    } else {
        return <Row> <NavigationNoAuth /> </Row>
    }
};

// RENDERED FOR USERS WITH ADMIN ACCOUNT TYPE
const NavigationAdmin = () => {
    const { currentUser } = useContext(AuthContext);
    let displayName
    if (currentUser.dbUser.firstName) {
        displayName = `${currentUser.dbUser.firstName}  ${currentUser.dbUser.lastName}`
    } else {
        displayName = currentUser.dbUser.facilityName
    }

    return (
        <Navbar className='App-nav' fixed='top'>
            <Navbar.Brand href='/' > COVID-19 Admin Console </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    <a href="#login"> {displayName} | </a>
                </Navbar.Text>
                <Nav.Link href='/account'> Account </Nav.Link>
                <Nav.Link to='/' onClick={doSignOut}> Logout </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}

// RENDERED FOR USERS WITH PATIENT AND FACILITYUSER ACCOUNT TYPES
const NavigationAuth = () => {
    const { currentUser } = useContext(AuthContext);
    let displayName
    if (currentUser.dbUser.firstName) {
        displayName = currentUser.dbUser.firstName + currentUser.dbUser.lastName
    } else {
        displayName = currentUser.dbUser.facilityName
    }

    return (
        <Navbar className='App-nav' fixed='top'>
            <Navbar.Brand href='/' > COVID-19 Info Hub </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    <a href="#login"> {displayName} | </a>
                </Navbar.Text>
                <Nav.Link href='/account'> Account </Nav.Link>
                <Nav.Link href='/messages'> Messages </Nav.Link>
                <Nav.Link onClick={doSignOut}> Logout </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
};

// RENDERED FOR USERS WHO ARE NOT LOGGED INTO AN ACCOUNT
const NavigationNoAuth = () => {
    return (
        <Navbar className='App-nav' fixed='top'>
            <Navbar.Brand href='/' > COVID-19 Info Hub </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Nav.Link href='/register'>  Login / Register </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;