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
const app = express();
const bodyParser = require("body-parser"); // JSON Parsing
const data = require('./data');
const getData = data.statData;
const chatData = data.chatData;
const users = data.users;
const appointments = data.appointments;
const cors = require('cors');
const cron = require("node-cron");
const fs = require("fs");
// const http = require('http').createServer(app);
// const io = require('socket.io')(http);
const eq = require("./emailqueue");
eq.create_queue();


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

// get appointment info
app.get("/appointment/:date", async (req, res) => {
    try {
        const appt = await appointments.getAppointmentByDate(req.params.date);
        res.status(200).json(appt);
    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

app.delete("/appointment/user/:uid", async (req, res) => {
    try {
        console.log('%%%', req.params.uid)
        const deleted = await appointments.deleteAppointmentByUser(req.params.uid)
        console.log("$$$", deleted)
        res.status(200).json(true);
    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
})

app.delete('/appointment/clear', async (req, res) => {
    try {
        const deleted = await appointments.clearAppointments();
        res.status(200).json(deleted);

    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
})

app.delete("/appointment/:date/:slot", async (req, res) => {
    try {
        const deleted = await appointments.deleteAppointmentByDate(req.params.date,req.params.slot);
        res.status(200).json(deleted);
    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

app.delete("/appointment/:id", async (req, res) => {
    try {
        const deleted = await appointments.deleteAppointmentById(req.params.id);
        res.status(200).json(deleted);
    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});

app.post('/appointment/user/:uid', async (req, res) => {
    try {
        let {newEmail} = req.body
        const updated = await appointments.updateAppointmentByUser(req.params.uid, newEmail)
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
})

app.get("/appointment", async (req, res) => {
    try {
        const appt = await appointments.getAllAppointments();
        res.status(200).json(appt);
    } catch (err) {
        console.log(err)
        res.status(400).json({ "error": err.message });
    };
});

app.get("/appointment/facility/:facilityid", async (req, res) => {
    try {
        const appt = await appointments.getAppointmentByFacilityId(req.params.facilityid);
        res.status(200).json(appt);
    } catch (err) {
        console.log(err)
        res.status(400).json({ "error": err.message });
    };
});

app.get("/appointment/employee/:employeeid", async (req, res) => {
    try {
        const appt = await appointments.getAppointmentByEmployee(req.params.employeeid);
        res.status(200).json(appt);
    } catch (err) {
        console.log(err)
        res.status(400).json({ "error": err.message });
    };
});

app.get("/appointment/patient/:patientId", async (req, res) => {
    try {
        const appt = await appointments.getAppointmentByPatientId(req.params.patientId);
        res.status(200).json(appt);
    } catch (err) {
        console.log(err)
        res.status(400).json({ "error": err.message });
    };
});

app.post("/appointment/:facilityid", async (req, res) => {
    try {
        const newAppt = await appointments.addNewAppointmentToFacility(req.params.facilityid, req.body);
        
        // create new chat
        console.log("creating chat");
        console.log(newAppt.patientId);
        console.log(newAppt.assignedToEmployee);
        const newChatId = await chatData.createChat(newAppt.patientId, newAppt.assignedToEmployee);
        console.log("updating users with chat");
        users.addToMessage(newAppt.assignedToEmployee, newAppt.patientId, newChatId);

        // email to patient and employee about chat
        console.log("sending email");
        eq.send_email(
            [
                await users.getEmail(newAppt.patientId),
                await users.getEmail(newAppt.assignedToEmployee)
            ], 
            "New Chat Started!",
            `Hi!\nYou've been matched for covid-care.\nStart chatting here! localhost:3000/chat/${newChatId}`
        );

        res.status(200).send({ '_id': newAppt });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    };
});


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
                    appointments: [],
                    messages: []
                }).then(async (res) => {
                    await users.addEmployeeToFacility(employeeInfo.facility, res[1])
                })

                res.status(200).send(userRecord.uid);
            })

    } catch (err) {
        res.status(400).json({ 'error': err });
    };
});

// Admin Delete User with FIREBASE UID
app.delete("/admin/deleteEmployee", (req, res) => {
    try {
        let deleteInfo = req.body;

        admin.auth().deleteUser(deleteInfo.employeeUid)
            .then(async () => {
                console.log(`Successfully deleted firebase user with uid ${deleteInfo.employeeUid}`);
                await users.deleteUser(deleteInfo.employeeUid);
            })
            .then(async () => {
                await users.removeEmployeeFromFacility(deleteInfo.facilityUid, deleteInfo.employeeUid)
            })
            .then(() => {
                console.log(`Successfully deleted mongodb user with uid ${deleteInfo.employeeUid}`);
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
        let userFound = await users.getUserById(req.params.uid);

        if (userFound === []) {
            userFound = await users.getUserById(req.params.uid);
        }
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
let server = app.listen(PORT, async () => {
    console.log("We've now got a server!");
    console.log(`Your routes will be running on http://localhost:${PORT}`);
});

let io = require('socket.io').listen(server);

/*
    Socket stuff
*/
io.on('connection', async function(socket) {
    let chat_id = "";
    let user = ""
  
    socket.on('join_chat', async function(req) {
      chat_id = req.id;
      user = req.user;
      socket.join(chat_id);
      
      let history = await chatData.getHistory(chat_id);
      for (line in history) {
        socket.emit("announce", {message: history[line]});
      }
      io.in(chat_id).emit("announce", {message: `${req.user} joined @ ${new Date().toString()}`});
      console.log(`${req.user} joined @ ${new Date().toString()}`);
    });
  
    socket.on('send_msg', async function(req) {
      let line = `${req.user}: ${req.msg}`;
      try {
        await chatData.addToHistory(chat_id, line);
      } catch (e) {
        console.log(e);
      }
      io.in(chat_id).emit("announce", {message: line});
    });

    socket.on('disconnect', async function() {
      console.log(`${user} left @ ${new Date().toString()}`);
      io.in(chat_id).emit("announce", {message: `${user} has disconnected @ ${new Date().toString()}`});
    });
});