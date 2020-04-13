import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Row, Navbar, Nav } from 'react-bootstrap';
import Landing from './components/Landing';
import SearchDetails from './components/SearchDetails'
import person from './img/person.png'
import './App.css';


function App() {
  return (
    <Router>
      <Container className = "App" fluid>
        <Row>
        <Navbar className = 'App-nav' fixed = 'top'>
          <Navbar.Brand href = '/' > COVID-19 Info Hub </Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
             <Nav.Link href = '/account'> Account </Nav.Link>
             <Nav.Link href = '/account/messages'> Messages </Nav.Link>
             <Nav.Link href = '/logout'> Logout </Nav.Link>
          </Navbar.Collapse>
        </Navbar>
        </Row>
        <Row>
        <Switch>
          <Route exact path='/' component={Landing} />
          <Route exact path='/searchDetails' component={SearchDetails} />
        </Switch>
        </Row>      
      </Container>
    </Router>
  );
}

export default App;

// GOOGLE MAPS API KEY: AIzaSyAzvmldZdw7JDk_x7g-fvOLzs_Egd5Ha6o
