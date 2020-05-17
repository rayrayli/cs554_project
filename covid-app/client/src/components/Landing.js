import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Figure, Tab, Tabs, Button, Modal, Form, Image } from 'react-bootstrap';
import { doPasswordReset } from '../firebase/FirebaseFunctions';
import { AuthContext } from '../firebase/Auth';
import SearchBar from './SearchBar';
import Calendar from './Calendar';
import axios from 'axios';
import who from '../img/who.png';
import cdc from '../img/cdc.png';

// https://davidwalsh.name/function-debounce
// Limit Map Redraw on Window Resizes
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this;
        let args = arguments;

        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

// Landing Container
const Landing = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <Container className='main' fluid>
            {(!currentUser || currentUser.dbUser.role === 'patient') ? <PatientLanding /> : (currentUser.dbUser.role === 'employee') ? <EmployeeLanding /> : <FacilityLanding />}
        </Container>
    )
};

// Landing Page for Admin Users
const FacilityLanding = () => {
    const { currentUser } = useContext(AuthContext);
    const [hideModal, setHideModal] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [appointments, setAppointments] = useState(undefined)

    let li = null;

    useEffect(
        () => {
            async function fetchEmployees() {
                axios.get(`/users/${currentUser.dbUser.facilityName}/employee`)
                    .then((data) => {
                        setEmployees(data.data);
                    })
            };

            // async function fetchAppts() {
            //     let apptList = await axios.get(`appointment/facility/${currentUser.dbUser.uid}`)
            //     setAppointments(apptList.data)
            // }

            fetchEmployees();
            // fetchAppts()
        }, [hideModal]
    );

    const adminAddUser = () => {
        if (currentUser && currentUser.dbUser.role === 'admin') {
            setHideModal(false);
        };
    };

    const adminDeleteUser = async (uid) => {
        try {
            // Remove User From Firbease via Admin SDK
            await axios({
                method: 'DELETE',
                url: '/admin/deleteEmployee',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                data: {
                    facilityUid: currentUser.dbUser.uid,
                    employeeUid: uid
                }
            }).then((res) => {
                window.location.reload();
            });

        } catch (err) {
            alert(err);
        };
    };
    
    // const formatAppointments = () => {
    //     return appointments && appointments.map( (appt) => {
    //         let startTime = new Date(appt.slot)
    //         let endTime = new Date(startTime.setMinutes(startTime.getMinutes() + 15)); //add 15 min to start

    //         return {
    //             title: `COVID-19 Testing - ${appt.userName} ${appt._id}`,
    //             start: startTime,
    //             end: endTime,
    //             extendedProps: {...appt}
    //         }
    //     })
    // }

    if (employees) {
        li = employees && employees.map((employee) => {
            return (
                <li key={employee.uid}>
                    <div>
                        <p> {employee.firstName} {employee.lastName} ({employee.email}) </p>
                        <Button onClick={() => adminDeleteUser(employee.uid)}> Delete </Button>
                    </div>
                </li>
            );
        });
    };

    return (
        <div>
            <h1> ADMIN LANDING </h1>
            <Row>
                <Col lg={4} md={12} sm={12}>
                    <Row>
                        <h3> Facility Employees</h3>
                        <Button onClick={adminAddUser}> Add Employee </Button>
                    </Row>
                    <Row>
                        <div>
                            {
                                employees ?
                                    <ul>
                                        {li}
                                    </ul>
                                    :
                                    <h6> Currently No Employee Accounts Created. To Create An Employee, Click 'Add Employee' Button Above </h6>
                            }
                        </div>
                    </Row>
                </Col>


                <Col lg={8} md={12} sm={12}>
                    <div>
                        <h3> Facility Appointment Manager </h3>
                        <Calendar
                            // appts={appointments && formatAppointments()}
                        />
                    </div>
                </Col>
            </Row>

            <AdminNewUserModal
                show={!hideModal}
                onHide={() => setHideModal(true)}
            />
        </div>
    );
};

// Landing Page for Facility Employee Users
const EmployeeLanding = () => {
    const { currentUser } = useContext(AuthContext);
    const [hideModal, setHideModal] = useState(true);

    useEffect(
        () => {

        }, [hideModal]
    );

    return (
        <div>
            <h1> EMPLOYEE LANDING </h1>
            <Row>
                <Col lg={4} md={12} sm={12}>
                    <Row>
                        <h3> Todays Appointments</h3>
                    </Row>
                    <Row>
                        <div>
                        </div>
                    </Row>
                </Col>


                <Col lg={8} md={12} sm={12}>
                    <div>
                        <h3> Facility Appointment Manager </h3>
                        <Calendar />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

// Landing Page for Patient Users
const PatientLanding = () => {
    const { currentUser } = useContext(AuthContext);
    const [statesCurrVals, setStatesCurrVals] = useState(undefined);
    const [nationCurrVals, setNationCurrVals] = useState(undefined);
    const [stateSite, setStateSite] = useState(undefined);
    const [mapData, setMapData] = useState(undefined);

    let stateData = undefined;

    useEffect(
        () => {
            // Get Official COVID-19 Stats for US & Each State 
            async function fetchData() {
                axios.get('/data/nation_state')
                    .then((data) => {
                        console.log(data)
                        setStatesCurrVals(data.data.state);
                        setNationCurrVals(data.data.nation);
                    });
            };

            // Get Official COVID-19 Sites for Each State
            async function fetchSites() {
                await axios.get('/data/state_sites')
                    .then((siteList) => {
                        if (currentUser && currentUser.dbUser && currentUser.dbUser.address) {
                            let currState = currentUser.dbUser.address.state;
                            console.log(siteList)
                            siteList.data.forEach((stateObj) => {
                                if (stateObj.state === currState) {
                                    setStateSite(stateObj.covid19Site);
                                };
                            });
                        };
                    });
            };

            fetchData();
            fetchSites();

        }, [currentUser]
    );

    if (statesCurrVals && nationCurrVals) {
        // Load the Visualization API and the piechart package.
        window.google.charts.load('current', {
            'packages': ['geochart'], 'mapsApiKey': process.env.REACT_APP_GOOGLE_API_KEY
        });
        // Set a callback to run when the Google Visualization API is loaded.
        window.google.charts.setOnLoadCallback(drawGeoChart);
        window.onresize = debounce(() => {
            drawGeoChart()
        }, 250);
    };

    function formatMapData() {
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

        setMapData(data);
        return data;
    }

    function drawGeoChart() {
        let data = (!mapData) ? formatMapData() : mapData;

        new window.google.visualization.DataView(data);

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
    // Add Commas to Numbers
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (statesCurrVals && nationCurrVals) {
        return (
            <div>
                <SearchBar />
                <br />
                <Row className="landing-body">
                    <Col id='land-left' lg={6} md={12} sm={12}>
                        <div className='landing-header'>
                            US STATS
                        </div>
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
                            <Row id='gMap' />
                        </Row>
                        <div>
                            <p className='stat-header'>Number of Cases</p>
                        </div>
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
                            <div className="landing-header">Coronavirus Disease (COVID-19)</div>
                            <Tabs defaultActiveKey="Overview" id='covid-info-tab'>
                                <Tab eventKey="Overview" title="Overview">
                                    <div role="tabpanel" className="fade tab-pane active show" aria-labelledby="covid-info-tab-tab-Overview">
                                        <br />
                                        <p className="info-header"> What is Corona Virus?</p>

                                        <p>
                                            Coronaviruses are a large family of viruses which may cause illness in animals or humans.
                                            In humans, several coronaviruses are known to cause respiratory infections ranging from the
                                            common cold to more severe diseases such as Middle East Respiratory Syndrome (MERS) and Severe
                                            Acute Respiratory Syndrome (SARS). The most recently discovered coronavirus causes coronavirus
                                            disease COVID-19.
                                        </p>
                                        <hr />
                                        <p className="info-header"> What is COVID-19?</p>

                                        <p>
                                            COVID-19 is the infectious disease caused by the most recently discovered coronavirus. This new
                                            virus and disease were unknown before the outbreak began in Wuhan, China, in December 2019. COVID-19
                                            is now a pandemic affecting many countries globally.
                                            Most people who fall sick with COVID-19 will experience mild to moderate symptoms and recover without
                                            special treatment.
                                        </p>
                                    </div>
                                </Tab>
                                <Tab eventKey="Symptoms" title="Symptoms">
                                    <div>
                                        <br />
                                        <p className="info-header"> What Are Common Symptoms of COVID-19?</p>
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
                                        <p className="info-header"> How Does COVID-19 Spread?</p>
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

                                        <hr />
                                        <p className="info-header"> How Can I Stay Healthy?</p>
                                        <p>
                                            Practicing hand and respiratory hygiene is important at ALL times and is the best way to protect others and yourself.

                                            When possible maintain at least a 1 metre (3 feet) distance between yourself and others. This is especially important if you are
                                            standing by someone who is coughing or sneezing. Since some infected persons may not yet be exhibiting symptoms or their symptoms
                                            may be mild, maintaining a physical distance with everyone is a good idea if you are in an area where COVID-19 is circulating.
                                        </p>

                                    </div>
                                </Tab>
                                <Tab eventKey="Treatment" title="Treatment">
                                    <div>
                                        <br />
                                        <p className="info-header">Is There A Vaccine or Cure?</p>
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
                            <br />
                        </div>
                    </Col>
                </Row>
                <Row className="footer">
                    <p>For more up-to-date info and news, please visit the World Health Organization or Center for Disease Control websites.</p>
                </Row>
                <Row className="logos">
                    <div className="img-container">
                      
                        <a href='https://www.who.int/news-room/q-a-detail/q-a-coronaviruses#'>
                            <Image alt="WHO Logo" src={who} className="logo"/>
                        </a>
                    </div>
                    <div className="img-container">
                        <a href='https://www.cdc.gov/coronavirus/2019-nCoV/index.html'>
                            <Image alt="CDC logo" src={cdc} className="logo" />
                        </a>
                    </div>
                </Row>
            </div>
        )
    } else {
        return (
            <Container className='main'>
                <Row className='landing-form'>
                    LOADING MAP DATA
                </Row>
            </Container>
        );
    };
};

// Modal for Creating Facility Employee Users (ADMIN ACCESS ONLY)
const AdminNewUserModal = (props) => {
    const { currentUser } = useContext(AuthContext);

    const handleNewUser = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, phone } = e.target.elements;

        try {
            let tempPassword = Math.random().toString(36).substr(2, 8);

            // Add User to Firbease via Admin SDK
            await axios({
                method: 'POST',
                url: '/admin/newEmployee',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                data: {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    phone: phone.value,
                    password: tempPassword,
                    facility: currentUser.dbUser.uid
                }
            }).then(async (res) => {
                doPasswordReset(email.value)
                alert('Employee Created and Password Reset Sent');
            });

            console.log("EMPLOYEE USER ADDED TO FIREBASE AND DB");
            props.onHide();

        } catch (err) {
            alert(err);
        };
    };

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Add New Employee
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleNewUser} >
                    <Col lg={12} md={12}>
                        <Form.Row>
                            <Form.Group as={Col} controlId="firstName">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    className='register-form'
                                    name='firstName'
                                    type='text'
                                    placeholder='First Name'
                                    required
                                />
                            </Form.Group>

                            <Form.Group as={Col} controlId="lastName">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    className='register-form'
                                    name='lastName'
                                    type='text'
                                    placeholder='LastName'
                                    required
                                />
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    className='register-form'
                                    name='email'
                                    type="email"
                                    placeholder="Enter Email"
                                    autoComplete="username"
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="phone">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    className='register-form'
                                    name='phone'
                                    type='tel'
                                    defaultValue={currentUser.dbUser.phone}
                                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                />
                            </Form.Group>
                        </Form.Row>
                        <Button onClick={props.onHide}>Cancel</Button>
                        <Button variant="primary" type="submit" >Submit</Button>
                    </Col>
                </Form>

            </Modal.Body>
        </Modal>
    );
};

export default Landing;
