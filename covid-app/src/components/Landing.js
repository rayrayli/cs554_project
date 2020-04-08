import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Figure } from 'react-bootstrap';
import { Chart } from "react-google-charts";
import axios from 'axios';



const Landing = () => {
    const [statesCurrVals, setStatesCurrVals] = useState(undefined);
    const [nationCurrVals, setNationCurrVals] = useState(undefined);

    let stateData = undefined
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
    

    useEffect(
        () => {
            async function fetchData() {
                try {
                    await axios.get('https://covidtracking.com/api/v1/states/current.json').then(async (stateData) => {
                        let states = stateData.data
                        console.log(states)
                        return await axios.get('https://covidtracking.com/api/v1/us/current.json').then(async (nationData) => {
                            let nation = nationData.data
                            return await axios.get('https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest').then( (popData) => {
                                let pop = popData.data.data
                                let statePop = {};
                                pop.map( (state) => {
                                    statePop[state.State] = state.Population;
                                });

                                setStatesCurrVals([states, statePop]);
                                setNationCurrVals(nation);
                            });
                        });
                    });

                } catch (err) {
                    console.log(err);
                }
            };

            fetchData();
        }, []
    );

    if (statesCurrVals && nationCurrVals) {
        // Load the Visualization API and the piechart package.
        window.google.charts.load('current', {
            'packages': ['geochart'], 'mapsApiKey': 'AIzaSyAzvmldZdw7JDk_x7g-fvOLzs_Egd5Ha6o'
        });
        // Set a callback to run when the Google Visualization API is loaded.
        window.google.charts.setOnLoadCallback(drawGeoChart);
    }

    function drawGeoChart() {
        stateData = (statesCurrVals && statesCurrVals[0].map( (stateStat) => {
            let name = abrev[stateStat.state]
            return [
                name,
                stateStat.positive,
                stateStat.death            
            ]
            // return {
            //     state: stateStat.state,
            //     positive: stateStat.positive,
            //     hospitalized: stateStat.hospitalized,
            //     Deaths: stateStat.lastUpdateEt,
            // }
        }))

        let head = ['State', 'Positive Cases', 'Total Deaths',]
        stateData = [head].concat(stateData)
        let data = window.google.visualization.arrayToDataTable(stateData);
        let view = new window.google.visualization.DataView(data);

        var options = {
            region: 'US',
            displayMode: 'regions',
            resolution: 'provinces',
            colorAxis: { 
                values: [0, 1, 500, 501, 5000, 5001, 9999, 10000, 15000, 20000],
                colors: ['#d2d4d3', '#02e66c', '#02e66c', '#06c961', '#06c961', '#02a34d', '#02a34d', '#246b3b', '#246b3b', '#174726'] 
            },
            datalessRegionColor: '#d2d4d3',
            defaultColor: '#d2d4d3',
            legend: 'none'
        };

        var chart = new window.google.visualization.GeoChart(document.getElementById('gMap'));
        chart.draw(data, options);
    };

    return (
        <Container className='main'>
            <br />
            <br />
            <Row id = 'gMap' sm = {12} md = {6} lg = {6}>
                {/* <div id = 'gMap' /> */}
            </Row>
            <Row className = 'legend' sm = {12} md = {12} lg = {12}>
                <Figure id = 'leg-item'>
                    <Figure.Image id = 'zero' />
                    <Figure.Caption>
                        1 - 500
                    </Figure.Caption>
                </Figure>
            
                <Figure id = 'leg-item'>
                    <Figure.Image id = 'one' />
                    <Figure.Caption>
                        501 - 5,000
                    </Figure.Caption>
                </Figure>
            

                <Figure id = 'leg-item'>
                    <Figure.Image id = 'two' />
                    <Figure.Caption>
                        5,001 - 9,999
                    </Figure.Caption>
                </Figure>

                <Figure id = 'leg-item'>
                    <Figure.Image id = 'three' />
                    <Figure.Caption>
                        10,000 - 15,000
                    </Figure.Caption>
                </Figure>

                <Figure id = 'leg-item'>
                    <Figure.Image id = 'four' />
                    <Figure.Caption>
                        15,000 +
                    </Figure.Caption>
                </Figure>

            </Row>        
        </Container>
    )
}















// const Landing = () => {
//     const [ statesCurrVals, setStatesCurrVals ] = useState(undefined);
//     const [ nationCurrVals, setNationCurrVals ] = useState(undefined);



//     let stateData = undefined

//     useEffect( 
//         () => {
//             async function fetchData() {
//                 try {
//                     await axios.get('https://covidtracking.com/api/v1/states/current.json').then( async (stateData) => {
//                         let states = stateData.data
//                         return await axios.get('https://covidtracking.com/api/v1/us/current.json').then( async (nationData) => {
//                             let nation = await nationData.data
//                             console.log(states)
//                             setStatesCurrVals(states);
//                             setNationCurrVals(nation)
//                         });
//                     });

//                 } catch (err) {
//                     console.log(err)
//                 };
//             }
//             fetchData();

//         }, []
//     )

//     if (statesCurrVals) {
        // stateData = (statesCurrVals && statesCurrVals.map( (stateStat) => {
        //     return [
        //         abrev[stateStat.state],
        //         stateStat.positive,
        //         stateStat.death,
        //     ]
        //     // return {
        //     //     state: stateStat.state,
        //     //     positive: stateStat.positive,
        //     //     hospitalized: stateStat.hospitalized,
        //     //     Deaths: stateStat.lastUpdateEt,
        //     // }
        // }))
//         let head = ['State', 'positive', 'deaths']

//         stateData = [head].concat(stateData)

//         console.log('####',stateData)

//     }

//     if (statesCurrVals && nationCurrVals) {
//         return (
//             <Container className = 'main'>
//                 <br />
//                 <br />
//                 <Row>
//                     <Chart
//                         widataTableh = {'100%'}
//                         height = {'auto'}
//                         chartType = "GeoChart"
//                         data = { stateData }
//                         // Note: you will need to get a mapsApiKey for your project.
//                         // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
//                         mapsApiKey = 'AIzaSyAzvmldZdw7JDk_x7g-fvOLzs_Egd5Ha6o'
//                         // options = {{
//                         //     region: 'US',
//                         //     displayMode: 'markers'
//                         // }}
//                         options={{
//                             region: 'US',
//                             displayMode: 'regions',
//                             resolution: 'provinces',
//                             colorAxis: { colors: ['#02a34d', '2a6336', '#0e2b17'] },
//                             datalessRegionColor: '#d2d4d3',
//                             defaultColor: '#d2d4d3'
//                           }}
//                     />
//                 </Row>

//             </Container>
//         )
//     } else {return (
//         <Container className = 'main'>
//             <br />
//             <br />
//             <Row>
//                 LOADING
//             </Row>

//         </Container>
//     )};
// };

export default Landing;