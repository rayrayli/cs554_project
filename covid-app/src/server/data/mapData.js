const mongoCollections = require("../config/mongoCollections");
const axios = require('axios')
const tasks = mongoCollections.tasks;
const uuid = require("node-uuid");

let exportedMethods = {
    async getStateNationLevel() {
        try {
            await axios.get('https://covidtracking.com/api/v1/states/current.json').then(async (stateData) => {
                let states = stateData.data
                // console.log(states)
                return await axios.get('https://covidtracking.com/api/v1/us/current.json').then(async (nationData) => {
                    let nation = nationData.data
                    // console.log(nation)
                    return await axios.get('https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest').then( async (popData) => {
                        let pop = popData.data.data
                        let statePop = {};
                        pop.map((state) => {
                            statePop[state.State] = state.Population;
                        });

                        const covidData = {stateStats: stateData, statePopData: popData, nationStats: nationData};

                        const justAdded = await taskCollection.insertOne(covidData);
                        if (justAdded.insertedCount === 0) throw new Error("Unable to add task");

                        const newDataAdded = await justAdded.insertedId;
                    });
                });
            });
        } catch (err) {
            console.log(err);
        };
    },

    async getCountyLevel() {
        try {
            let today = new Date().toLocaleString().split(/\D/).slice(0, 3)
            let mm = today[0].padStart(2,'0')
            let dd = (today[1] - 1).toString().padStart(2,'0')
            let yyyy = today[2]
            let yest = mm + '-' + dd + '-' + yyyy

            return await axios.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + yest + '.csv').then( async (countyData) => {
                let co = countyData
                console.log(co)
                // format this data to json
            })
        } catch(err) {
            console.log(err)
        };
    }
};

module.exports = exportedMethods;