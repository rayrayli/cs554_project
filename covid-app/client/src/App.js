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
import NotFound from './components/NotFound'
import Appointment from './components/Appointment'

import './App.css';

function App() {
  return (

    <AuthProvider>
      <Router>

        <Container className="App">
          <Row>
            <Navigation />
          </Row>


          <Switch>
            <Route exact path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
            <Route exact path='/' component={Landing} />
            <Route exact path='/searchDetails' component={SearchDetails} />
            <Route exact path='/appointment' component={Appointment} />
            <PrivateRoute exact path='/account' component={Account} />
            <PrivateRoute exact path='/user/health-details' component={HealthInfo} />
            <PrivateRoute exact path='/user/facility-details' component={FacilityInfo} />
            <PrivateRoute exact path='/messages' component={Inbox} />
            <Route path='*' component={NotFound} />
          </Switch>

        </Container>

      </Router>
    </AuthProvider>

  );
}

export default App;

