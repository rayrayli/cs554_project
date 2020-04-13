import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Figure, Form, InputGroup, FormControl } from 'react-bootstrap';

const Landing = () => {
    const [statesCurrVals, setStatesCurrVals] = useState(undefined);
    const [nationCurrVals, setNationCurrVals] = useState(undefined);

    let stateData = undefined
    
    useEffect(
        () => {
            async function fetchData() {
                fetch('/data/nation_state')
                .then( (res1) => res1.json())
                .then( (data) => {
                    setStatesCurrVals(data.state)
                    setNationCurrVals(data.nation)
                })
            };

            fetchData();
        }, [ ]
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
        if (statesCurrVals){
            stateData = (statesCurrVals && statesCurrVals.map((stateStat) => {
                return [
                    stateStat.state,
                    stateStat.positive,
                    stateStat.death
                ]
                // return {
                //     state: stateStat.state,
                //     positive: stateStat.positive,
                //     hospitalized: stateStat.hospitalized,
                //     Deaths: stateStat.lastUpdateEt,
                // }
            }));
        };

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


    // https://stackoverflow.com
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (statesCurrVals && nationCurrVals) {
        return (
            <Container className = 'main' fluid >
                <Row className = 'landing-form'>
                    <Form id = 'landingform' method = 'POST' name = 'formSearchLocal'>
                        <InputGroup>
                            <FormControl id = "search" placeholder = 'Search Your Locality' />
                        </InputGroup>
                    </Form>
                </Row>

                <br />

                <Row>
                    <Col id = 'land-left' lg={6} md={12} sm={12}>
                        <Row className = 'stat-header'>
                            US STATS
                        </Row>
                        <br />
                        <Row id = 'stats'>
                            <Col>
                                <Row className = 'stat-header'>
                                    Positive Cases
                            </Row>
                                <Row className = 'stat-cont'>
                                    {numberWithCommas(nationCurrVals.positive)}
                                </Row>
                                <Row className = 'stat-header'>
                                    Tests Administered
                            </Row>
                                <Row className = 'stat-cont'>
                                    {numberWithCommas(nationCurrVals.totalTestResults)}
                                </Row>
                            </Col>

                            <Col>
                                <Row className = 'stat-header'>
                                    Currently Hospitalized
                            </Row>
                                <Row className = 'stat-cont'>
                                    {numberWithCommas(nationCurrVals.hospitalizedCurrently)}
                                </Row>
                                <Row className = 'stat-header'>
                                    Currently in ICU
                            </Row>
                                <Row className = 'stat-cont'>
                                    {numberWithCommas(nationCurrVals.inIcuCurrently)}
                                </Row>
                            </Col>

                            <Col>
                                <Row className = 'stat-header'>
                                    Recovered Patients
                            </Row>
                                <Row className = 'stat-cont'>
                                    {numberWithCommas(nationCurrVals.recovered)}
                                </Row>
                                <Row className = 'stat-header'>
                                    Currently on Ventilator
                            </Row>
                                <Row className='stat-cont'>
                                    {numberWithCommas(nationCurrVals.onVentilatorCurrently)}
                                </Row>
                            </Col>
                        </Row>

                        <Row id='map-hold'>
                            <br />
                            !! Need FUNC to Redraw Map When Window Size Changes !! Make As Own Component?
                            <Row id = 'gMap' />
                        </Row>
                        <Row className = 'legend' >
                                <Figure className = 'leg-item'>
                                    <Row id='zero' />
                                    <Figure.Caption>
                                        1 - 500
                                </Figure.Caption>
                                </Figure>

                                <Figure className = 'leg-item'>
                                    <Row id='one' />
                                    <Figure.Caption>
                                        501 - 5,000
                                </Figure.Caption>
                                </Figure>


                                <Figure className = 'leg-item'>
                                    <Row id='two' />
                                    <Figure.Caption>
                                        5,001 - 9,999
                                </Figure.Caption>
                                </Figure>

                                <Figure className = 'leg-item'>
                                    <Row id='three' />
                                    <Figure.Caption>
                                        10,000 - 15,000
                                </Figure.Caption>
                                </Figure>

                                <Figure className = 'leg-item'>
                                    <Row id='four' />
                                    <Figure.Caption>
                                        15,000 +
                                </Figure.Caption>
                                </Figure>

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
    };
};

export default Landing;