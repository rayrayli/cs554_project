const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');


let exportedMethods = {
    async addNewUser(userInfo) {
        const userCollection = await users();
        let newUser = await userCollection.insertOne(userInfo)
        return newUser.insertedId;
    },

    async getUserById(uid) {
        const userCollection = await users();
        let userFound = await userCollection.find({ uid: uid }).toArray();
        return userFound[0]

    },

    async updateUser(_id, updateInfo) {
        const userCollection = await users();
        let doc = await userCollection.find({ _id: ObjectId(_id) }).toArray();
        doc = doc[0]
        doc['uid'] = updateInfo.uid

        let updated = await userCollection.replaceOne({ _id: ObjectId(_id) }, doc);
        return updated
    }

};

module.exports = exportedMethods;