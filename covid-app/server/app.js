// RUN BACKEND SERVER ON PORT 3001
const PORT = 3001;
const admin = require('firebase-admin')
// CREATE SERVER
const express = require("express");     // Utilize Express Module
const path = require('path');
const app = express();                  // Generate Express Application
const bodyParser = require("body-parser"); // JSON Parsing
const data = require('./data')
const getData = data.statData;
const users = data.users;
const cors = require('cors');



// Serve the static files from the React app
app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));

// Get National/State Level Data Router 
app.get("/data/nation_state", async (req, res) => {
    try {
        const state_nationLevel = await getData.getStateNationData();
        res.status(200).json(state_nationLevel);

    } catch (err) {
        console.log(err)
        res.status(400).json( {"error": err.message} );
    };
});

// Get County Level Data Router 
app.get("/data/county/:name", async (req, res) => {
    try {
        const countyLevel = await getData.getCountyData(req.params.name);
        res.status(200).json(countyLevel);

    } catch (err) {
        res.status(400).json( {"error": err.message} );
    };
});

// Add New User
app.post("/users/", async (req, res) => {
    try {
        const newUser = await users.addNewUser(req.body)
        res.status(201).send({'_id': newUser})

    } catch (err) {
        res.status(400).json( {"error": err.message} );
    };
});

// Get User By ID
app.get("/users/:uid", async (req, res) => {
    try {
        const userFound = await users.getUserById(req.params.uid);
        res.status(200).send(userFound);

    } catch (err) {
        res.status(400).json( {"error": err.message} );
    };
});

// Update User W/ ID
app.post("/users/:id", async (req, res) => {
    const update = await users.updateUser(req.params.id, req.body);
    res.status(200).json(update);
})

// RUN SERVER
app.listen(PORT, () => {        // Listen For Requests on Port 3001
    console.log("We've now got a server!");
    console.log(`Your routes will be running on http://localhost:${PORT}`);
});