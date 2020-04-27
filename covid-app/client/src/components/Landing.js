import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, Figure, Tab, Tabs, Button } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';
import SearchDetails from './SearchDetails';
import SearchBar from './SearchBar';
import axios from 'axios';

const Landing = () => {
    const { currentUser } = useContext(AuthContext);
    console.log('#####', currentUser)

    return <Container className='main' fluid>
        {(!currentUser || currentUser.dbUser.role === 'patient') ? <PatientLanding /> : <FacilityLanding />}
    </Container>

};

const FacilityLanding = () => {
    const { currentUser } = useContext(AuthContext);
    const [employees, setEmployees] = useState([])

    useEffect(
        () => {

        }, []
    )
    const li = null

    return (
        <div>
            <h1> ADMIN LANDING </h1>
            <Row>
                <Col>
                    <Row>
                        <h3> Facility Employees</h3>
                        <Button href='/admin/createUser'> Add Employee </Button>
                    </Row>
                    <Row>
                        <div>
                            <h6> Currently No Employee Accounts Created. To Create An Employee, Click 'Add Employee' Button Above </h6>
                        </div>
                    </Row>
                </Col>


                <Col>
                    <div>
                        <h3> Facility Appointment Manager </h3>

                    </div>
                </Col>
            </Row>
        </div>
    )
}

const PatientLanding = () => {
    const { currentUser } = useContext(AuthContext);
    const [statesCurrVals, setStatesCurrVals] = useState(undefined);
    const [nationCurrVals, setNationCurrVals] = useState(undefined);
    const [stateSite, setStateSite] = useState(undefined)

    let stateData = undefined

    useEffect(
        () => {
            async function fetchData() {
                fetch('/data/nation_state')
                    .then((res1) => res1.json())
                    .then((data) => {
                        setStatesCurrVals(data.state)
                        setNationCurrVals(data.nation)
                    })
            };

            async function fetchSites() {
                await axios.get('https://covidtracking.com/api/states/info')
                    .then((siteList) => {
                        console.log("!!!!!", siteList.data)
                        if (currentUser && currentUser.dbUser && currentUser.dbUser.address) {
                            let currState = currentUser.dbUser.address.state
                            siteList.data.forEach((stateObj) => {
                                if (stateObj.state === currState) {
                                    setStateSite(stateObj.covid19Site)
                                };
                            });
                        };
                    });
            };

            fetchData();
            fetchSites();
        }, []
    );


    if (statesCurrVals && nationCurrVals) {
        // Load the Visualization API and the piechart package.
        window.google.charts.load('current', {
            'packages': ['geochart'], 'mapsApiKey': process.env.REACT_APP_GOOGLE_API_KEY
        });
        // Set a callback to run when the Google Visualization API is loaded.
        window.google.charts.setOnLoadCallback(drawGeoChart);
    }

    function drawGeoChart() {
        if (statesCurrVals) {
            stateData = (statesCurrVals && statesCurrVals.map((stateStat) => {
                return [
                    stateStat.state,
                    stateStat.positive,
                    stateStat.death
                ];
            }));
        };

        let head = ['State', 'Positive Cases', 'Total Deaths'];
        stateData = [head].concat(stateData);
        let data = window.google.visualization.arrayToDataTable(stateData);
        let view = new window.google.visualization.DataView(data);

        var options = {
            region: 'US',
            displayMode: 'regions',
            resolution: 'provinces',
            colorAxis: {
                values: [0, 1, 499, 500, 4999, 5000, 9999, 10000, 14999, 15000],
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
            <div>
                <SearchBar />
                <br />
                <Row>
                    <Col id='land-left' lg={6} md={12} sm={12}>
                        <Row className='stat-header'>
                            US STATS
                        </Row>
                        <br />
                        <Row id='stats'>
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
                            !! Need FUNC to Redraw Map When Window Size Changes !! Make As Own Component?
                            <Row id='gMap' />
                        </Row>
                        <Row className='legend' >
                            <Figure className='leg-item'>
                                <Row id='zero' />
                                <Figure.Caption>
                                    1 - 499
                                </Figure.Caption>
                            </Figure>

                            <Figure className='leg-item'>
                                <Row id='one' />
                                <Figure.Caption>
                                    500 - 4,999
                                </Figure.Caption>
                            </Figure>


                            <Figure className='leg-item'>
                                <Row id='two' />
                                <Figure.Caption>
                                    5,000 - 9,999
                                </Figure.Caption>
                            </Figure>

                            <Figure className='leg-item'>
                                <Row id='three' />
                                <Figure.Caption>
                                    10,000 - 14,999
                                </Figure.Caption>
                            </Figure>

                            <Figure className='leg-item'>
                                <Row id='four' />
                                <Figure.Caption>
                                    15,000 +
                                </Figure.Caption>
                            </Figure>
                        </Row>
                    </Col>
                    <Col id='land-right' lg={6} md={12} sm={12}>
                        <div>
                            <Row>
                                <div> <p> Coronavirus Disease (COVID-19)</p></div>
                                <Tabs defaultActiveKey="Overview" id='covid-info-tab'>
                                    <Tab eventKey="Overview" title="Overview">
                                        <div role="tabpanel" className="fade tab-pane active show" aria-labelledby="covid-info-tab-tab-Overview">
                                            <br />
                                            <p>
                                                Coronaviruses are a large family of viruses which may cause illness in animals or humans.
                                                In humans, several coronaviruses are known to cause respiratory infections ranging from the
                                                common cold to more severe diseases such as Middle East Respiratory Syndrome (MERS) and Severe
                                                Acute Respiratory Syndrome (SARS). The most recently discovered coronavirus causes coronavirus
                                                disease COVID-19.
                                            </p>
                                            <hr />
                                            <p>
                                                COVID-19 is the infectious disease caused by the most recently discovered coronavirus. This new
                                                virus and disease were unknown before the outbreak began in Wuhan, China, in December 2019. COVID-19
                                                is now a pandemic affecting many countries globally.
                                                Most people who fall sick with COVID-19 will experience mild to moderate symptoms and recover without
                                                special treatment.
                                            </p>
                                            <hr />
                                            <h6> How Does COVID-19 Spread?</h6>
                                            <p>
                                                People can catch COVID-19 from others who have the virus. The disease spreads primarily from person to person
                                                through small droplets from the nose or mouth, which are expelled when a person with COVID-19 coughs, sneezes,
                                                or speaks. These droplets are relatively heavy, do not travel far and quickly sink to the ground. People can
                                                catch COVID-19 if they breathe in these droplets from a person infected with the virus. This is why it is important
                                                to stay at least 1 metre (3 feet) away from others. These droplets can land on objects and surfaces around the
                                                person such as tables, doorknobs and handrails. People can become infected by touching these objects or surfaces,
                                                then touching their eyes, nose or mouth. This is why it is important to wash your hands regularly with soap and water
                                                or clean with alcohol-based hand rub.

                                                WHO is assessing ongoing research on the ways that COVID-19 is spread and will continue to share updated findings.
                                            </p>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="Symptoms" title="Symptoms">
                                        <div>
                                            <br />
                                            <p>
                                                The most common symptoms of COVID-19 are fever, dry cough, and tiredness. Some patients may have aches and pains, nasal
                                                congestion, sore throat or diarrhea. These symptoms are usually mild and begin gradually. Some people become infected but
                                                only have very mild symptoms. Most people (about 80%) recover from the disease without needing hospital treatment. Around
                                                1 out of every 5 people who gets COVID-19 becomes seriously ill and develops difficulty breathing. Older people, and those
                                                with underlying medical problems like high blood pressure, heart and lung problems, diabetes, or cancer , are at higher
                                                risk of developing serious illness. However anyone can catch COVID-19 and become seriously ill. Even people with very mild
                                                symptoms of COVID-19 can transmit the virus. People of all ages who experience fever, cough and difficulty breathing should
                                                seek medical attention.
                                            </p>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="Prevention" title="Prevention" >
                                        <div>
                                            <br />
                                            <p>
                                                Practicing hand and respiratory hygiene is important at ALL times and is the best way to protect others and yourself.

                                                When possible maintain at least a 1 metre (3 feet) distance between yourself and others. This is especially important if you are
                                                standing by someone who is coughing or sneezing. Since some infected persons may not yet be exhibiting symptoms or their symptoms
                                                may be mild, maintaining a physical distance with everyone is a good idea if you are in an area where COVID-19 is circulating.
                                            </p>

                                        </div>
                                    </Tab>
                                    <Tab eventKey="Treatment" title="Treatment" >
                                        <div>
                                            <br />
                                            <p>
                                                Not yet. To date, there is no vaccine and no specific antiviral medicines against COVID-19. However, .people, particularly those with
                                                serious illness, may need to be hospitalized so that they can receive life-saving treatment for complications.. Most patients recover
                                                thanks to such care.

                                                Possible vaccines and some specific drug treatments are currently under investigation. They are being tested through clinical trials.
                                                WHO is coordinating efforts to develop vaccines and medicines to prevent and treat COVID-19.

                                                The most effective ways to protect yourself and others against COVID-19 are to:

                                                Clean your hands frequently and thoroughly
                                                Avoid touching your eyes, mouth and nose
                                                Cover your cough with the bend of elbow or tissue. If a tissue is used, discard it immediately and wash your hands.
                                                Maintain a distance of at least 1 metre (3 feet) from others.
                                            </p>
                                        </div>

                                    </Tab>
                                </Tabs>
                            </Row>
                            <br />
                            <Row>
                                <Col>
                                    <Button href='https://www.who.int/news-room/q-a-detail/q-a-coronaviruses#:~:text=protect'>
                                        <span> who.int</span>
                                    </Button>
                                </Col>
                                <Col>
                                    <Button href='https://www.cdc.gov/coronavirus/2019-nCoV/index.html'>
                                        <span> cdc.gov </span>
                                    </Button>
                                </Col>

                                {currentUser && stateSite &&
                                    <Col>
                                        <Button href={stateSite}>
                                            <span> {stateSite && currentUser && currentUser.dbUser && currentUser.dbUser.address.state.toLowerCase()}.gov</span>
                                        </Button>
                                    </Col>
                                }
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    } else {
        return (
            <Container className='main'>
                <Row className='landing-form'>
                    LOADING>>>>
                </Row>
            </Container>
        );
    };
}

export default Landing;