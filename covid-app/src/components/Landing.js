import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Figure, Form, InputGroup, FormControl, Nav } from 'react-bootstrap';
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
                    console.log('!!!!!!!!!!!~!')
                    await axios.get('https://covidtracking.com/api/v1/states/current.json').then(async (stateData) => {
                        let states = stateData.data
                        console.log(states)
                        return await axios.get('https://covidtracking.com/api/v1/us/current.json').then(async (nationData) => {
                            let nation = nationData.data
                            console.log(nation)
                            return await axios.get('https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest').then((popData) => {
                                let pop = popData.data.data
                                let statePop = {};
                                pop.map((state) => {
                                    statePop[state.State] = state.Population;
                                });

                                setStatesCurrVals([states, statePop]);
                                setNationCurrVals(nation[0]);
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
        stateData = (statesCurrVals && statesCurrVals[0].map((stateStat) => {
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

    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    if (statesCurrVals && nationCurrVals) {
        return (
            <Container className='main' fluid >
                <Row className='landing-form'>
                    <Form id='landingform' method='POST' name='formSearchLocal'>
                        <InputGroup>
                            <FormControl id="search" placeholder='Search Your Locality' />
                        </InputGroup>
                    </Form>
                </Row>

                <br />

                <Row>
                    <Col id='land-left' lg={6} md={12} sm={12}>
                        <Row className='stat-header'>
                            US STATS
                    </Row>
                        <br />
                        <Row id='legend'>
                            <Col>
                                <Row className='stat-header'>
                                    Positive Cases
                            </Row>
                                <Row className='stat-cont'>
                                    {numberWithCommas(nationCurrVals.positive)}
                                </Row>
                                <Row className='stat-header'>
                                    Tests Administered
                            </Row>
                                <Row className='stat-cont'>
                                    {numberWithCommas(nationCurrVals.totalTestResults)}
                                </Row>
                            </Col>

                            <Col>
                                <Row className='stat-header'>
                                    Currently Hospitalized
                            </Row>
                                <Row className='stat-cont'>
                                    {numberWithCommas(nationCurrVals.hospitalizedCurrently)}
                                </Row>
                                <Row className='stat-header'>
                                    Currently in ICU
                            </Row>
                                <Row className='stat-cont'>
                                    {numberWithCommas(nationCurrVals.inIcuCurrently)}
                                </Row>
                            </Col>

                            <Col>
                                <Row className='stat-header'>
                                    Recovered Patients
                            </Row>
                                <Row className='stat-cont'>
                                    {numberWithCommas(nationCurrVals.recovered)}
                                </Row>
                                <Row className='stat-header'>
                                    Currently on Ventilator
                            </Row>
                                <Row className='stat-cont'>
                                    {numberWithCommas(nationCurrVals.onVentilatorCurrently)}
                                </Row>
                            </Col>
                        </Row>

                        <Row id='map-hold'>
                            <br />
                            !! Need FUNC to Redraw Map When Window Size Changes !!
                            <Row id = 'gMap' />

                            <Row className='legend' >
                                <Figure id='leg-item'>
                                    <Figure.Image id='zero' alt='' />
                                    <Figure.Caption>
                                        1 - 500
                                </Figure.Caption>
                                </Figure>

                                <Figure id='leg-item'>
                                    <Figure.Image id='one' alt='' />
                                    <Figure.Caption>
                                        501 - 5,000
                                </Figure.Caption>
                                </Figure>


                                <Figure id='leg-item'>
                                    <Figure.Image id='two' alt='' />
                                    <Figure.Caption>
                                        5,001 - 9,999
                                </Figure.Caption>
                                </Figure>

                                <Figure id='leg-item'>
                                    <Figure.Image id='three' alt='' />
                                    <Figure.Caption>
                                        10,000 - 15,000
                                </Figure.Caption>
                                </Figure>

                                <Figure id='leg-item'>
                                    <Figure.Image id='four' alt='' />
                                    <Figure.Caption>
                                        15,000 +
                                </Figure.Caption>
                                </Figure>

                            </Row>
                        </Row>
                    </Col>
                    <Col id='land-right' lg={6} md={12} sm={12}>
                        <Row>
                            <Row>
                                <h1> TABS? Overiew (info), Symptoms, Prevention,Treatment</h1>
                            </Row>
                            <Row>
                                <p>
                                info info info info info info info info info info info info
                                info info info info info info info info info info info info 
                                info info info info info info info info info info info info
                                info info info info info info info info info info info info 
                                info info info info info info info info info info info info
                                </p>
                            </Row>
                            <br />
                            <br />
                            <Row>
                                <h2> Links To CDC, WHO, State Covid Site (IF Logged in)</h2>
                            </Row>
                            
                        </Row>

                    </Col>
                </Row>

            </Container>
        );
    } else {
        return (
            <Container className='main'>
                <Row className='landing-form'>
                    LOADING>>>>
                </Row>
            </Container>
        );

    }
};

export default Landing;