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
    } else if (role === 'patient' || role === 'employee') {
        return <Row> {<NavigationAuth />} </Row>
    } else {
        return <Row> <NavigationNoAuth /> </Row>
    }
};

// Navigation For Admin Users
const NavigationAdmin = () => {
    const { currentUser } = useContext(AuthContext);

    let displayName = currentUser.dbUser.facilityName

    return (
        <Navbar className='App-nav' fixed='top'>
            <Navbar.Brand href='/' > COVID-19 Admin Console </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    <p> {displayName} | </p>
                </Navbar.Text>
                <Nav.Link href='/account'> Account </Nav.Link>
                <Nav.Link to='/' onClick={doSignOut}> Logout </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}

// Navigation For Patient Users
const NavigationAuth = () => {
    const { currentUser } = useContext(AuthContext);

    let displayName = currentUser.dbUser.firstName + currentUser.dbUser.lastName

    return (
        <Navbar className='App-nav' fixed='top'>
            <Navbar.Brand href='/' > COVID-19 Info Hub </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    <p> {displayName} | </p>
                </Navbar.Text>
                <Nav.Link href='/account'> Account </Nav.Link>
                <Nav.Link href='/messages'> Messages </Nav.Link>
                <Nav.Link onClick={doSignOut}> Logout </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
};

// Navigation for Unauthorized Users
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