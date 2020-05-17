const dbConnection = require('../config/mongoConnection');
const mongoCollections = require('../config/mongoCollections');
const axios = require('axios')
const data = require('../data')
const user = data.users;
const abrev = {
    "AL": "Alabama", "AK": "Alaska", "AS": "American Samoa", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado",
    "CT": "Connecticut", "DE": "Delaware", "DC": "District Of Columbia", "FM": "Federated States Of Micronesia", "FL": "Florida", "GA": "Georgia",
    "GU": "Guam", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MH": "Marshall Islands", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska",
    "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina",
    "ND": "North Dakota", "MP": "Northern Mariana Islands", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PW": "Palau",
    "PA": "Pennsylvania", "PR": "Puerto Rico", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee",
    "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VI": "Virgin Islands", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
};

async function main() {
    // SET UP FIREBASE ADMIN SDK FOR SEEDING USERS
    const admin = require('firebase-admin');
    const dotenv = require('dotenv');
    dotenv.config();
    const serviceAccount = process.env.FIREBASE_CONFIG
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
        databaseURL: "https://cs554final-covidapp.firebaseio.com"
    });

    const db = await dbConnection();

    const state = mongoCollections.covidStStats;
    const nation = mongoCollections.covidNaStats;
    const population = mongoCollections.covidPopStats;
    const county = mongoCollections.covidCoStats;
    const users = mongoCollections.users;
    db.createCollection("chats");


    async function clearUsers() {
        try {
            collection = await users();
            let conf = collection.deleteMany({type: undefined});

        } catch (err) {
            return err;

        }
    }

    async function fetchData(url, level) {
        try {
            let collection;

            if (level === 'state') {
                collection = await state();
            } else if (level == 'nation') {
                collection = await nation();
            } else if (level === ' county') {
                collection = await county();
            } else if (level === 'pop') {
                collection = await population();
            } else {
                throw 'invalid level';
            };

            let conf = collection.deleteMany({});
            console.log(`Getting data from ${url} to ${collection}`);

            const data = await axios.get(url);
            let justAdded;

            if (url === 'https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest') {
                let dataArr = [];
                data.data.data.map((state) => {
                    let statePop = {};
                    statePop[state.State] = state.Population;
                    dataArr.push(statePop);
                });

                justAdded = await collection.insertMany(dataArr);

            } else if (url === 'https://covidtracking.com/api/v1/states/current.json') {
                data.data.forEach((info) => {
                    info.state = abrev[info.state];
                });
                justAdded = await collection.insertMany(data.data);

            } else {
                justAdded = await collection.insertMany(data.data);

            };

            if (justAdded.insertedCount === 0) throw new Error("Unable to add county data set");
            const newDataAdded = await justAdded.insertedId;
            return `Aquired ${level} Data`;

        } catch (err) {
            console.log(err);
        };
    }

    async function fetchCountyLevel() {
        try {
            const countyCollection = await county();
            let conf = countyCollection.deleteMany({});

            let today = new Date().toLocaleString().split(/\D/).slice(0, 3);
            let mm = today[0].padStart(2, '0');
            let dd = (today[1] - 2).toString().padStart(2, '0');
            let yyyy = today[2];
            if (dd === '00') {
                mm = (Number(mm) - 1).toString().padStart(2, '0');
                if (mm === '09' || mm === '04' || mm === '06' || mm == '11') {
                    dd = '29';
                } else if (mm == '02') {
                    dd = '28';
                } else {
                    dd = '30';
                }
            }
            let yesterday = mm + '-' + dd + '-' + yyyy;

            return await axios.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + yesterday + '.csv')
                .then(async (countyData) => {
                    let co = countyData;
                    let fields = co.data.split('\n')[0].split(',');
                    let dataArr = [];
                    let arrDat = co.data.split('\n').splice(1);

                    arrDat.map((line) => {
                        let item = {};
                        let entry = line.split(',');

                        fields.forEach((field, i) => {
                            if (i === 0 || i === 1 || i === 2 || i === 3 || i === 4) {
                                item[field] = entry[i];
                            } else if (i === 11 && entry[i]) {
                                item[field] = entry[i].substring(1) + ',' + entry[i + 1];
                            } else {
                                item[field] = Number(entry[i]);
                            };
                        });

                        dataArr.push(item);
                    });

                    const justAdded = await countyCollection.insertMany(dataArr);
                    if (justAdded.insertedCount === 0) throw new Error("Unable to add county data set");

                    const newDataAdded = await justAdded.insertedId;
                });

        } catch (err) {
            return err

        };
    }

    async function seedAdmin() {
        try {
            let adminUser = await admin.auth().createUser({
                email: 'testfacilityseed@gmail.com',
                password: 'password1',
            })
                .then(async (userRecord) => {
                    if (userRecord === []) {
                        return 'Seeded Useres Exist'
                    }
                    console.log('Successfully created new firebase user:', userRecord.uid);
                    await user.addNewUser({
                        role: "admin",
                        type: 'seed',
                        uid: userRecord.uid,
                        email: 'testfacilityseed@gmail.com',
                        phone: "201-344-2222",
                        facilityName: "TestFacilitySeed",
                        phone: "201-234-5678",
                        url: "https://www.testfacilityseed.com",
                        address: {
                            street: "100 Washington St",
                            unit: "Suite 3C",
                            city: "Hoboken",
                            state: "NJ",
                            zip: "07030"
                        },
                        hours: {
                            Monday: {
                                Start: "08:00",
                                End: "17:00",
                                Closed: "on"
                            },
                            Tuesday: {
                                Start: "08:00",
                                End: "17:00",
                                Closed: "on"
                            },
                            Wednesday: {
                                Start: "08:00",
                                End: "17:00",
                                Closed: "on"
                            },
                            Thursday: {
                                Start: "08:00",
                                End: "20:00",
                                Closed: "on"
                            },
                            Friday: {
                                Start: "08:00",
                                End: "20:00",
                                Closed: "on"
                            },
                            Saturday: {
                                Start: "08:00",
                                End: "20:00",
                                Closed: "Closed"
                            },
                            Sunday: {
                                Start: "08:00",
                                End: "20:00",
                                Closed: "Closed"
                            }
                        },
                        app_slots: {
                            Monday: [],
                            Tuesday: [],
                            Wednesday: [],
                            Thursday: [],
                            Friday: [],
                            Saturday: [],
                            Sunday: []
                        },
                        employees: [],
                        geoJSON: {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    40.7375821,
                                    -74.031105
                                ]
                            }
                        }
                    })

                    let adminUid = (userRecord.uid).toString()
                    return adminUid
                    
                })
            return adminUser

        } catch (err) {
            return 'Seeded Useres Exist'
        }
    }

    async function seedEmployee(adminUser) {
        try {
            await admin.auth().createUser({
                email: 'employeeseed1@gmail.com',
                password: 'password1',
            })
                .then(async (userRecord) => {
                    if (userRecord === []) {
                        return 'Seeded Useres Exist'
                    }
                    console.log('Successfully created new firebase user:', userRecord.uid);
                    await user.addNewUser({
                        role: "employee",
                        type: 'seed',
                        uid: userRecord.uid,
                        email: 'employeeseed1@gmail.com',
                        firstName: 'Employee1First',
                        lastName: 'Employee1Last',
                        phone: "201-220-1220",
                        facility: adminUser,
                        appointments: [],
                        messages: []
                    }).then(async (res) => {
                        await user.addEmployeeToFacility(adminUser, res[1])
                    })
                })

        } catch (err) {
            return 'Seeded Useres Exist'
        }
    }

    async function seedPatient() {
        try {
            await admin.auth().createUser({
                email: "patientseed@gmail.com",
                password: 'password1',
            })
                .then(async (userRecord) => {
                    if (userRecord === []) {
                        return 'Seeded Useres Exist'
                    }
                    console.log('Successfully created new firebase user:', userRecord.uid);
                    await user.addNewUser({
                        role: "patient",
                        type: 'seed',
                        uid: userRecord.uid,
                        firstName: "Patient1First",
                        lastName: "Patient1Last",
                        email: "patientseed@gmail.com",
                        gender: "male",
                        dob: "1995-03-27",
                        ssn: "$2b$16$AdPa6IjpOoX3CW/M8xuKHu8kMvqYKMn9YwQlpGyLNIA.R8f11miRu",
                        address: {
                            street: "1 Harrison Ave",
                            unit: null,
                            city: "Harrison",
                            state: "NJ",
                            zip: "07029"
                        },
                        conditions: [
                            "kidney"
                        ],
                        insurance: {
                            id: "R111222123",
                            provider: "Blue Cross Blue Shield"
                        },
                        appointments: [],
                        messages: []
                    })
                })

        } catch (err) {
            return 'Seeded Useres Exist'
        }


    }

    await fetchData('https://covidtracking.com/api/v1/states/current.json', 'state');
    await fetchData('https://covidtracking.com/api/v1/us/current.json', 'nation');
    await fetchData('https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest', 'pop');
    await fetchCountyLevel()

    await clearUsers()
    await seedPatient()
    await seedAdmin().then(async (adminUser) => {
        console.log(adminUser)
        await seedEmployee(adminUser)
    })
    
    

    return true
}

const run = async () => {
    await main();
    console.log("MONGODB SEEDED");
    process.exit();
}

run();