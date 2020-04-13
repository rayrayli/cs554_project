// RUN BACKEND SERVER ON PORT 3001

// CREATE SERVER
const express = require("express");     // Utilize Express Module
const path = require('path');
const app = express();                  // Generate Express Application
const bodyParser = require("body-parser"); // JSON Parsing
const data = require('./data')
const getData = data.statData;

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));

// Get National Data Router 
app.get("/data/nation_state", async (req, res) => {
    try {
        const state_nationLevel = await getData.getStateNationData();
        res.status(200).json(state_nationLevel);

    } catch (err) {
        res.status(400).json( {"error": err.message} );
    };
});



// RUN SERVER
app.listen(3001, () => {        // Listen For Requests on Port 3001
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3001");
});