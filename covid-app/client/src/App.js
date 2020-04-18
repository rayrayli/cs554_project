import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import Landing from './components/Landing';
import Account from './components/Account';
import Login from './components/Login';
import Register from './components/Register';
import SearchDetails from './components/SearchDetails';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation'
import './App.css';
import { AuthProvider } from './firebase/Auth';

function App() {
  return (

    <AuthProvider>
      <Router>

        <Container className="App" fluid>

          <Row>
            <Navigation />
          </Row>

          <Row>
            <Switch>
              {/* ROUTES FOR ALL USERS */}
              <Route path='/login' component={Login} />
              <Route path='/register' component={Register} />
              <Route exact path='/' component={Landing} />
              <Route path='/searchDetails' component={SearchDetails} />
              {/* ROUTES FOR PATIENT USERS */}
              {/* ROUTES FOR FACILITY USERS */}
              {/* ROUTES FOR ADMIN USERS */}
              <PrivateRoute path='/account' component={Account} />
              <PrivateRoute path='/messages' component={Account} />

            </Switch>
          </Row>
        </Container>

      </Router>
    </AuthProvider>

  );
}

export default App;

