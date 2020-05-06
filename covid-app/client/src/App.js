import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import { AuthProvider } from './firebase/Auth';

import Landing from './components/Landing';
import Account from './components/Account';
import Login from './components/Login';
import Register from './components/Register';
import SearchDetails from './components/SearchDetails';
import PrivateRoute from './components/PrivateRoute';
import HealthInfo from './components/HealthInfo';
import FacilityInfo from './components/FacilityInfo';
import Navigation from './components/Navigation';
import Inbox from './components/Inbox';


import './App.css';

function App() {
  return (

    <AuthProvider>
      <Router>

        <Container className="App">
          <Row>
            <Navigation />
          </Row>

          <Row>
            {/* ROUTES FOR ALL USERS */}
            <Route path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
            <Route exact path='/' component={Landing} />
            <Route path='/searchDetails' component={SearchDetails} />
            <Switch>
              <PrivateRoute path='/account' component={Account} />
              <PrivateRoute path='/user/health-details' component={HealthInfo} />
              <PrivateRoute path='/user/facility-details' component={FacilityInfo} />
              <PrivateRoute path='/messages' component={Inbox} />
            </Switch>
          </Row>
        </Container>

      </Router>
    </AuthProvider>

  );
}

export default App;

