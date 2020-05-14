/*
################### FIREBASE ADMIN SDK ###################
*/
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();
const serviceAccount = process.env.FIREBASE_CONFIG
admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
    databaseURL: "https://cs554final-covidapp.firebaseio.com"
});


/*
####################### RUN SERVER #######################
*/
const PORT = process.env.PORT || 3001;
const express = require("express");     // Utilize Express Module
const path = require('path');
const app = express();                  // Generate Express Application
const bodyParser = require("body-parser"); // JSON Parsing
const data = require('./data');
const getData = data.statData;
const users = data.users;
const cors = require('cors');
const cron = require("node-cron");
const fs = require("fs");


/*
################ SERVE REACT STATIC FILES ################
*/
app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

/*
######################### ROUTES #########################
*/
// Get National/State Level Data  
app.get("/data/nation_state", async (req, res) => {
    try {
        const state_nationLevel = await getData.getStateNationData();
        res.status(200).json(state_nationLevel);

    } catch (err) {
        console.log(err)
        res.status(400).json({ "error": err.message });
    };
});

// Get Offical COVID-19 Sites For Each State
app.get("/data/state_sites", async (req, res) => {
    try {
        const stateSites = await getData.getStateSites();
        res.status(200).json(stateSites);

    } catch (err) {
        console.log(err)
        res.status(400).json({ "error": err.message });
    };
});

// Get County Level Data  
app.get("/data/county/:name", async (req, res) => {
    try {
        const countyLevel = await getData.getCountyData(req.params.name);
        res.status(200).json(countyLevel);

    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

// Add New User
app.post("/users/", async (req, res) => {
    try {
        const newUser = await users.addNewUser(req.body);
        res.status(201).send({ '_id': newUser });

    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

// Admin Create New Employee
app.post("/admin/newEmployee", (req, res) => {
    try {
        let employeeInfo = req.body;

        admin.auth().createUser({
            email: employeeInfo.email,
            emailVerified: false,
            password: employeeInfo.password,
            displayName: employeeInfo.firstName + ' ' + employeeInfo.lastName
        })
            .then(async (userRecord) => {
                if (userRecord === []) {
                    res.status(400).json({ 'error': 'Unable to create user' });
                }
                console.log('Successfully created new firebase user:', userRecord.uid);
                await users.addNewUser({
                    role: "employee",
                    uid: userRecord.uid,
                    firstName: employeeInfo.firstName,
                    lastName: employeeInfo.lastName,
                    email: employeeInfo.email,
                    phone: employeeInfo.phone,
                    facility: employeeInfo.facility,
                    appointments: [
                        null
                    ],
                    messages: [
                        null
                    ]
                });

                res.status(200).send(userRecord.uid);
            })

    } catch (err) {
        res.status(400).json({ 'error': err });
    };
});

// Admin Delete User with FIREBASE UID
app.delete("/admin/deleteEmployee", (req, res) => {
    try {
        let uid = req.body;

        admin.auth().deleteUser(uid.uid)
            .then(async () => {
                console.log(`Successfully deleted firebase user with uid ${uid.uid}`);
                await users.deleteUser(uid.uid);
            })
            .then(() => {
                console.log(`Successfully deleted mongodb user with uid ${uid.uid}`);
                res.status(200).json(true);
            })
    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

// Get All Users
app.get("/users/", async (req, res) => {
    try {
        const usersFound = await users.getAllUsers();
        res.status(200).send(usersFound);

    } catch (err) {
        res.status(400).json({ 'error': err.message });
    };
});

// Get All Admin Users
app.get("/users/admin/", async (req, res) => {
    try {
        const adminsFound = await users.getAdmins();
        res.status(200).send(adminsFound);

    } catch (err) {
        res.status(400).json({ 'error': err.message });
    };
});

// Get All Employee Users From Facility
app.get("/users/:facility/employee", async (req, res) => {
    try {
        const employeesFound = await users.getEmployees(req.params.facility);
        res.status(200).send(employeesFound);

    } catch (err) {
        res.status(400).json({ 'error': err.message });
    };
});

// Get User By FIREBASE UID
app.get("/users/:uid", async (req, res) => {
    try {
        const userFound = await users.getUserById(req.params.uid);
        res.status(200).send(userFound);

    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

// Update Part of User W/ FIREBASE UID
app.patch("/users/:uid", async (req, res) => {
    try {
        const patched = await users.patchUser(req.params.uid, req.body);
        res.status(200).json(patched);

    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

// Update User W/ MONGO ID
app.post("/users/:id", async (req, res) => {
    try {
        const update = await users.updateUser(req.params.id, req.body);
        res.status(200).json(update);

    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

// Delete User With MONGO ID
app.delete("/users/retract/:id", async (req, res) => {
    try {
        const deleted = await users.retractUser(req.params.id);
        res.status(200).json(deleted);

    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

// Delete User With FIREBASE UID
app.delete("/users/:uid", async (req, res) => {
    try {
        const deleted = await users.deleteUser(req.params.uid);
        res.status(200).json(deleted);

    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

// Send 404 On All Other Routes
app.use("*", (req, res) => {
    res.sendStatus(404);
});

/*
################## GET STATS DAILY @ 5:00AM ##################
*/
cron.schedule("00 5 * * *", async () => {
    await getData.fetchData('https://covidtracking.com/api/v1/states/current.json', 'state');
    await getData.fetchData('https://covidtracking.com/api/v1/us/current.json', 'nation');
    await getData.fetchData('https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest', 'pop');
    await getData.fetchCountyLevel();
});


/*
####################### RUN SERVER #######################
*/
app.listen(PORT, () => {
    console.log("We've now got a server!");
    console.log(`Your routes will be running on http://localhost:${PORT}`);
});

