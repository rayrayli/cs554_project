const mongoCollections = require('../config/mongoCollections');
const axios = require('axios')
const state = mongoCollections.covidStStats;
const nation = mongoCollections.covidNaStats;
const population = mongoCollections.covidPopStats;
const county = mongoCollections.covidCoStats

// USE
// getData('https://covidtracking.com/api/v1/states/current.json', state());
// getData('https://covidtracking.com/api/v1/us/current.json', nation());
// getData('https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest', population()) 
// getCountyLevel()

let exportedMethods = {
    async getData(url, mongoCol) {
        try {
            const collection = await mongoCol;
            let conf = collection.deleteMany( {} );
            console.log('###',conf)
            console.log(`Getting data from ${url} to ${collection}`)
    
            const data = await axios.get(url)
            let justAdded;
    
            if (url === 'https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest') { 
                let dataArr = []
                data.data.data.map((state) => {
                    let statePop = {};
                    statePop[state.State] = state.Population;
                    dataArr.push(statePop)
                });
                
                justAdded = await collection.insertMany(dataArr);
    
            } else {
               justAdded = await collection.insertMany(data.data);
            };
    
            if (justAdded.insertedCount === 0) throw new Error("Unable to add county data set");
            
            const newDataAdded = await justAdded.insertedId;
            console.log(justAdded.insertedCount);
    
            return true;
            
    
        } catch (err) {
            console.log(err);
        };
    },
    
    async getCountyLevel() {
        try {
            const countyCollection = await county();
            let conf = countyCollection.deleteMany( {} );
            console.log('!!!',conf)
    
            let today = new Date().toLocaleString().split(/\D/).slice(0, 3)
            let mm = today[0].padStart(2,'0')
            let dd = (today[1] - 1).toString().padStart(2,'0')
            let yyyy = today[2]
            let yesterday = mm + '-' + dd + '-' + yyyy
    
            return await axios.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + yesterday + '.csv')
                .then( async (countyData) => {
                    let co = countyData
                    let fields = co.data.split('\n')[0].split(',');
                    let dataArr = []
                    let arrDat = co.data.split('\n').splice(1)
    
                    arrDat.map( (line) => {
                        let item = {}
                        let entry = line.split(',');
    
                        fields.forEach( (field, i) => {
                            if (i === 0 || i === 1 || i === 2 || i === 3 || i === 4) {
                                item[field] = entry[i];
                            } else if (i === 11 && entry[i]) {
                                item[field] = entry[i].substring(1) + ',' + entry[i+1];;
                            } else {
                                item[field] = Number(entry[i]);
                            };
                        });
    
                        dataArr.push(item);
                    });
    
                    const justAdded = await countyCollection.insertMany(dataArr);
                    if (justAdded.insertedCount === 0) throw new Error("Unable to add county data set");
                
                    const newDataAdded = await justAdded.insertedId;
                    return
                });
    
        } catch(err) {
            console.log(err)
        };
    }
};

module.exports = exportedMethods;

