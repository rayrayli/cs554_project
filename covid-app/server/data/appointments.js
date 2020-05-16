const mongoCollections = require('../config/mongoCollections');
const { ObjectId } = require('mongodb');
const appointments = mongoCollections.appoinments;
const users = mongoCollections.users;
const uuidv4 = require('uuid/v4');

let exportedMethods = {

    async deleteAppointmentByDate(date, slot) {
        try {
            const apptCollection = await appointments();

            const apptWithUser = await apptCollection.findOne(
                {date:date},
                {slot:slot}
            );        
            if(!apptWithUser){
                throw `No appoitment with ${app_id}`;
            }
            let deleteResult = await apptCollection.deleteOne({date: date}, {slot: slot });

            if (!deleteResult.ok) {
                throw `Mongo was unable to delete the appointment: ${uid}`;
            }
            return true
        } catch (err) {
            return err;
        }
    },

    async getAllAppointments() {
        try {
            const apptCollection = await appointments();
            let userFound = await apptCollection.find({}).toArray();
            return userFound;
        } catch (err) {
            return err;
        };
    },

    async getAppointmentByFacilityId(facilityUid) {
        try {
            const apptCollection = await appointments();
            let apptFound = await apptCollection.find({ facilityUid: facilityUid }).toArray();
            return apptFound;
        } catch (err) {
            return err;

        }
    },
    async getAppointmentByPatientId(patientId) {
        try {
            const apptCollection = await appointments();
            let apptFound = await apptCollection.find({ patientId: patientId }).toArray();
            return apptFound;
        } catch (err) {
            return err;
        }
    },

    async getAppointmentByPatientUserMail(email) {
        try {
            const apptCollection = await appointments();
            let apptFound = await apptCollection.find({ userEmail: email }).toArray();
            return apptFound;
        } catch (err) {
            return err;
        }
    },


    async getAppointmentByEmployee(eployee) {
        try {
            const apptCollection = await appointments();
            let apptFound = await apptCollection.find({ assignedToEmployee: eployee }).toArray();
            return apptFound;
        } catch (err) {
            return err;
        }
    },

    async getAppointmentByDate(date) {
        try {
            const apptCollection = await appointments();
            let apptFound = await apptCollection.find({ date: date }).toArray();
            return apptFound;
        } catch (err) {
            return err;
        }
    },

    
    async addNewAppointmentToFacility(fcId, updateInfo) {
        try {
            const userCollection = await users();
            let doc = await userCollection.findOne({ uid: fcId});
            if(!doc){
                throw `No appoitment with ${fcId}`;
            }
            //todo add to patient appointment list
            if (doc.role === 'admin') {
                let employees = doc.employees;
                let assignTo = null;

                if (employees === []){
                    assignTo = null
                }else{
                    assignTo = employees[Math.floor(Math.random() * employees.length)]
                }

                const apptCollection = await appointments();

                let newAppointment = {
                    _id: uuidv4(),
                    date: updateInfo.date,
                    slot: updateInfo.slot,
                    userName: updateInfo.name,
                    userEmail: updateInfo.email,
                    patientId: updateInfo.patientId,
                    facilityUid: fcId,
                    faclilityName: doc.facilityName,
                    assignedToEmployee: assignTo
                };

                const insertInfo = await apptCollection.insertOne(newAppointment);
                if (insertInfo.insertedCount === 0) throw "Could not add new task";
            
                const newId = insertInfo.insertedId;
                const a_appt = await apptCollection.findOne({ _id: newId });
                if (a_appt === null) throw "No task with that id";
                return a_appt;
            } 
            else{
                return;
            }
        } catch (err) {
            return err;
        };
    }

};

module.exports = exportedMethods;
