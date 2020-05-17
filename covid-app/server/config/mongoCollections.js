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
    covidStStats: getCollectionFn('covidStStats'), // Used for state level stats
    covidNaStats: getCollectionFn('covidNaStats'), // Used for state level stats
    covidPopStats: getCollectionFn('covidPopStats'), // Used for state level stats
    covidCoStats: getCollectionFn('covidCoStats'), // Used for nation/state-level covid stats
    users: getCollectionFn('users'), // Used to store all user data ... User Types: Patient, Facility EMployee User, Admin)
    chats: getCollectionFn('chats'),
    appoinments: getCollectionFn('appointments'),
};