const MongoClient = require("mongodb").MongoClient;

const settings = {
    mongoConfig: {
        serverUrl: process.env.MONGODB_URI || "mongodb+srv://cmontero:strongpassword@cs554-final-frfdm.mongodb.net/test?retryWrites=true" || "mongodb://mongo:27017",
        database: "CS554-Final-Project-CovidApp"
    }
};

const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

module.exports = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(mongoConfig.serverUrl, { useUnifiedTopology: true });
        _db = await _connection.db(mongoConfig.database);
    };

    return _db;
};

