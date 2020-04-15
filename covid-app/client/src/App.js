import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Row, Navbar, Nav } from 'react-bootstrap';
import Landing from './components/Landing';
import Account from './components/Account';
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import SearchDetails from './components/SearchDetails';
import PrivateRoute from './components/PrivateRoute';
import './App.css';
import { AuthProvider } from './firebase/Auth';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Container className="App" fluid>

          <Row>
            <Navbar className='App-nav' fixed='top'>
              <Navbar.Brand href='/' > COVID-19 Info Hub </Navbar.Brand>
              <Navbar.Collapse className="justify-content-end">
                <Nav.Link href='/account'> Account </Nav.Link>
                <Nav.Link href='/account/messages'> Messages </Nav.Link>
                <Nav.Link href='/logout'> Logout </Nav.Link>
              </Navbar.Collapse>
            </Navbar>
          </Row>

          <Row>
            <Switch>
              <Route exact path='/' component={Landing} />
              <Route path='/searchDetails' component={SearchDetails} />
              <PrivateRoute path='/account' component={Account} />
              <Route path='/login' component={Login} />
              <Route path='/logout' component={Logout} />
              <Route path='/register' component={Register} />
            </Switch>
          </Row>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;

