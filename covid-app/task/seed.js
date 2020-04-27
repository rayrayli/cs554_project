const dbConnection = require('../config/mongoConnection');
const mongoCollections = require('../config/mongoCollections');
const axios = require('axios')
const abrev = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
};

async function main() {

    const db = await dbConnection();
    await db.dropDatabase();

    const state = mongoCollections.covidStStats;
    const nation = mongoCollections.covidNaStats;
    const population = mongoCollections.covidPopStats;
    const county = mongoCollections.covidCoStats
  
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function fetchData(url, level) {
        try {
            
            let collection;

            if (level === 'state') {
                collection = await state();
            } else if (level == 'nation') {
                collection = await nation();
            } else if (level === ' county') {
                collection = await county();
            } else if (level === 'pop') {
                collection = await population()
            } else {
                throw 'invalid level'
            };

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

            } else if (url === 'https://covidtracking.com/api/v1/states/current.json') {
                data.data.forEach((info) => {
                    info.state = abrev[info.state]
                });
                justAdded = await collection.insertMany(data.data);

            } else {
                justAdded = await collection.insertMany(data.data);

            };

            if (justAdded.insertedCount === 0) throw new Error("Unable to add county data set");
            const newDataAdded = await justAdded.insertedId;
            return `Aquired ${level} Data`;

        } catch (err) {
            console.log(err);
        };
    }

    async function fetchCountyLevel() {
        try {
            const countyCollection = await county();
            let conf = countyCollection.deleteMany({});

            let today = new Date().toLocaleString().split(/\D/).slice(0, 3)
            let mm = today[0].padStart(2, '0')
            let dd = (today[1] - 1).toString().padStart(2, '0')
            let yyyy = today[2]
            let yesterday = mm + '-' + dd + '-' + yyyy

            return await axios.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + yesterday + '.csv')
                .then(async (countyData) => {
                    let co = countyData
                    let fields = co.data.split('\n')[0].split(',');
                    let dataArr = []
                    let arrDat = co.data.split('\n').splice(1)

                    arrDat.map((line) => {
                        let item = {}
                        let entry = line.split(',');

                        fields.forEach((field, i) => {
                            if (i === 0 || i === 1 || i === 2 || i === 3 || i === 4) {
                                item[field] = entry[i];
                            } else if (i === 11 && entry[i]) {
                                item[field] = entry[i].substring(1) + ',' + entry[i + 1];;
                            } else {
                                item[field] = Number(entry[i]);
                            };
                        });

                        dataArr.push(item);
                    });

                    const justAdded = await countyCollection.insertMany(dataArr);
                    if (justAdded.insertedCount === 0) throw new Error("Unable to add county data set");

                    const newDataAdded = await justAdded.insertedId;
                });

        } catch (err) {
            console.log(err)
        };
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\
    await fetchData('https://covidtracking.com/api/v1/states/current.json', 'state');
    await fetchData('https://covidtracking.com/api/v1/us/current.json', 'nation');
    await fetchData('https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest', 'pop');
    await fetchCountyLevel()

    return true
}

const run = async () => {
    await main()
    process.exit()
}

run();