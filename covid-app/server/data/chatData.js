const mongoCollections = require('../config/mongoCollections');
const { ObjectId } = require('mongodb');

const chats = mongoCollections.chats;

let exportedMethods = {
    async getChat(id) {
        const chatCollection = await chats();
        try {
            let chatFound = await chatCollection.findOne({ _id: ObjectId(id) });
            return chatFound;
        } catch(e) {
            console.log(e);
        }
    },

    async getChatByParticipants(patient, employee) {
        const chatCollection = await chats();
        try {
            let chatFound = await chatCollection.findOne({ patient: patient, employee: employee });
            return chatFound;
        } catch(e) {
            console.log(e);
        }
    },

    async createChat(patient, employee) {
        try {
            let chatFound = await this.getChatByParticipants(patient, employee);
            if (chatFound) {
                return "Chat already exists";
            }
            const chatCollection = await chats();
            let newChat = await chatCollection.insertOne({patient: patient, employee: employee, log: []});
            return newChat.insertedId;
        } catch (err) {
            return err;

        }
    },

    async addToHistory(id, message) {
        try {
            let chatFound = await this.getChat(id);
            if (chatFound) {
                chatFound.log.push(message);
                const chatCollection = await chats();
                let newChat = await chatCollection.updateOne({ _id: ObjectId(id) }, {$set: {log: chatFound.log}});
                return;
            }
        } catch (err) {
            return err;
        }
    },

    async getHistory(id) {
        const chatCollection = await chats();
        try {
            let chatFound = await this.getChat(id);
            console.log(chatFound.log);
            return chatFound.log;
        } catch(e) {
            console.log(e);
        }
    },
};

module.exports = exportedMethods;