const dbConnection = require("./mongoConnection");

// Allow one reference to each collection per app
const getCollectionFn = collection => {
    let _col = undefined;

    return async() => {
        if (!_col) {
            const db = await dbConnection();
            _col = await db.collection(collection);
        }
        return _col;
    };
};

module.exports = {
    covidStats: getCollectionFn('covidStats'), // Used for nation/state-level covid stats
    users: getCollectionFn('users'), // Used to store all user data ... User Types: Patient, FacilityUser, Admin)
    facilities: getCollectionFn('facilities'), // Used to store all testing facilities and respective info (hours, appoinment data, patient data, employees, etc)
};