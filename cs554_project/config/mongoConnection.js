const MongoClient = require("mongodb").MongoClient;
require('dotenv').config()

const settings = {
    mongoConfig: {
        local: "mongodb://localhost:27017",
        prodURI: process.env.MONGODB_URI || MONGODB_URI,
        database: "CS554-Final-Project-CovidApp"
    }
};

const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

module.exports = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(mongoConfig.serverUrl || mongoConfig.prodURI, { useUnifiedTopology: true });
        _db = await _connection.db(mongoConfig.database);
    };

    return _db;
};

