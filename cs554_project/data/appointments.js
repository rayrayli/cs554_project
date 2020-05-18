const mongoCollections = require('../config/mongoCollections');
const { ObjectId } = require('mongodb');
const appointments = mongoCollections.appoinments;
const users = mongoCollections.users;
const uuidv4 = require('uuid/v4');

let exportedMethods = {

    async clearAppointments() {
        try {
            const apptCollection = await appointments();
            const deleted = await apptCollection.deleteMany({})
            return true
        } catch (err) {
            return err
        }
    },

    async deleteAppointmentByDate(date, slot) {
        try {
            const apptCollection = await appointments();

            const apptWithUser = await apptCollection.findOne(
                { date: date },
                { slot: slot }
            );
            if (!apptWithUser) {
                throw `No appoitment with ${app_id}`;
            }
            let deleteResult = await apptCollection.deleteOne({ date: date }, { slot: slot });

            if (!deleteResult.ok) {
                throw `Mongo was unable to delete the appointment: ${date}${slot} `;
            }
            return true
        } catch (err) {
            return err;
        }
    },

    async deleteAppointmentById(id) {
        try {
            const apptCollection = await appointments();

            const apptWithUser = await apptCollection.findOne(
                { _id: id }
            );
            if (!apptWithUser) {
                throw `No appoitment with ${id}`;
            }
            let deleteResult = await apptCollection.deleteOne({ _id: id });
            if (!deleteResult.ok) {
                throw `Mongo was unable to delete the appointment: ${id}`;
            }
            return true
        } catch (err) {
            return err;
        }
    },

    async deleteAppointmentByUser(uid) {
        try {
            const apptCollection = await appointments();
            console.log('%%%',uid)

            const deleted = await apptCollection.deleteMany({ patientId: uid })
            return deleted
        } catch (err) {
            return err;
        }
    },

    async updateAppointmentByUser(uid, updateEmail) {
        try {
            const apptCollection = await appointments();

            const updated = await apptCollection.updateMany({ patientId: uid }, {$set: {userEmail: updateEmail}})
            return updated

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


    async getAppointmentByEmployee(employee) {
        try {
            const apptCollection = await appointments();
            let apptFound = await apptCollection.find({ assignedToEmployee: employee }).toArray();
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
            const apptCollection = await appointments();

            let doc = await userCollection.findOne({ uid: fcId });

            if (!doc) {
                throw `No appoitment with ${fcId}`;
            }

            let adminsFound = await userCollection.find({ role: 'employee' }, { facility: doc.facilityName }).toArray();

            //todo add to patient appointment list
            if (doc.role === 'admin') {
                let assignTo = null;
                let beforeAppointment = await apptCollection.find({ patientId: updateInfo.patientId }).toArray();

                if ((!Array.isArray(beforeAppointment) || !beforeAppointment.length ||
                    beforeAppointment[0].assignedToEmployee === null)) {
                    if (Array.isArray(adminsFound) && adminsFound.length) {
                        let radomEmp = Math.floor(Math.random() * adminsFound.length);
                        assignTo = adminsFound[radomEmp].uid;
                    }
                }
                else {
                    assignTo = beforeAppointment.assignTo;
                }

                let newAppointment = {
                    _id: uuidv4(),
                    date: updateInfo.date,
                    slot: updateInfo.slot,
                    userName: updateInfo.name,
                    userEmail: updateInfo.email,
                    patientId: updateInfo.patientId,
                    facilityUid: fcId,
                    facilityName: doc.facilityName,
                    facilityPhone: doc.phone,
                    facilityEmail: doc.email,
                    assignedToEmployee: assignTo
                };

                const insertInfo = await apptCollection.insertOne(newAppointment);
                if (insertInfo.insertedCount === 0) throw "Could not add new task";

                const newId = insertInfo.insertedId;
                const a_appt = await apptCollection.findOne({ _id: newId });
                if (a_appt === null) throw "No task with that id";
                return a_appt;
            }
            else {
                return;
            }
        } catch (err) {
            console.log(err)
            return err;
        };
    }

};

module.exports = exportedMethods;
