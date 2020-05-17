import React, { useContext } from 'react';
import { AuthContext } from '../firebase/Auth';
import { Navbar, Nav, Row } from 'react-bootstrap';
import { doSignOut } from '../firebase/FirebaseFunctions';
import '../App.css'
import { useLocation } from 'react-router-dom';

const Navigation = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div>
            {(!currentUser ? <NavigationNoAuth /> : (currentUser.dbUser.role === 'admin') ? <NavigationAdmin /> : (currentUser.dbUser.role === 'employee') ? <NavigationEmployee /> : <NavigationAuth />) }
        </div>
    )
};

// Navigation For Admin Users
const NavigationAdmin = () => {
    const { currentUser } = useContext(AuthContext);

    let displayName = currentUser.dbUser.facilityName

    return (
        <Navbar className='App-nav'>
            <Navbar.Brand href='/' > COVID-19 Admin Console </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    {displayName} | 
                </Navbar.Text>
                <Nav.Link href='/account'> Account </Nav.Link>
                <Nav.Link to='/' onClick={doSignOut}> Logout </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}

// Navigation for Employee Users
const NavigationEmployee = () => {
    const { currentUser } = useContext(AuthContext);

    let displayName = currentUser.dbUser.firstName + ' ' + currentUser.dbUser.lastName

    return (
        <Navbar className='App-nav'>
            <Navbar.Brand href='/' > COVID-19 Facility Console </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    {displayName} | 
                </Navbar.Text>
                <Nav.Link href='/account'> Account </Nav.Link>
                <Nav.Link href='/inbox'> Inbox </Nav.Link>
                <Nav.Link to='/' onClick={doSignOut}> Logout </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}

// Navigation For Patient Users
const NavigationAuth = () => {
    const { currentUser } = useContext(AuthContext);

    let displayName = currentUser.dbUser.firstName + ' ' + currentUser.dbUser.lastName
    let chatLink = currentUser.dbUser.messages[0] ? `/chat/${currentUser.dbUser.messages[0].cid}` : '/'
    return (
        <Navbar className='App-nav'>
            <Navbar.Brand href='/' > COVID-19 Info Hub </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    {displayName} | 
                </Navbar.Text>
                <Nav.Link href='/account'> Account </Nav.Link>
                {/* add check to see if appointment exists later */}
                <Nav.Link href={chatLink}> Chat </Nav.Link>
                <Nav.Link  to='/' onClick={doSignOut}> Logout </Nav.Link>
            </Navbar.Collapse>
        </Navbar>
    );
};

// Navigation for Unauthorized Users
const NavigationNoAuth = () => {
    let location = useLocation();
    return (
        <Navbar className='App-nav'>
            <Navbar.Brand href='/' > COVID-19 Info Hub </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
            {location.pathname !== "/register" && location.pathname !== "/login" && <Nav.Link href='/register' className="login">  Login / Register</Nav.Link>}
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;