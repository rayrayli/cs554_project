import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Landing from './components/Landing';
import SearchDetails from './components/SearchDetails'
import './App.css';


function App() {
  return (
    <Router> 
       <Container className="App" fluid>
       <header className = 'App-header'>
          <a href = '/'>
            <h1> COVID SITE </h1>
          </a>
        </header>
        <Switch>
          <Route exact path = '/' component = {Landing} /> 
          <Route exact path = '/searchDetails' component = {SearchDetails} /> 
        </Switch>
      </Container>
    </Router>
  );
}

export default App;

// GOOGLE MAPS API KEY: AIzaSyAzvmldZdw7JDk_x7g-fvOLzs_Egd5Ha6o
