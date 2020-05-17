import React, { useState, useContext , useEffect, useRef} from 'react';
import { AuthContext } from '../firebase/Auth';
import { doChangePassword, deleteAccount, doUpdateEmail, reauthenticate } from '../firebase/FirebaseFunctions';
import { Container, Nav, Col, Row, Tab, Form, Button, Modal , Table} from 'react-bootstrap';
import moment from 'moment'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import axios from 'axios';
const key = process.env.REACT_APP_GOOGLE_API_KEY
const states = [
    'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
    'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
    'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
    'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
    'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
];


const Account = () => {
    const { currentUser } = useContext(AuthContext);

    return <Container className='main' fluid>
        {(currentUser.dbUser.role === 'admin') ? <AccountFacility /> : (currentUser.dbUser.role === 'patient') ? <AccountPatient /> : <AccountEmployee />}
    </Container>
}

// Account Page for Admin Users
const AccountFacility = () => {
    const { currentUser } = useContext(AuthContext);
    const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    const [updateInfo, setUpdateInfo] = useState(undefined)
    const [reauth, setReauth] = useState(undefined)
    const [hideModal, setHideModal] = useState(true)

    // Make Facility Open and Facility Close Inputs Inactive When Closed is Selected 
    const handleClose = (e) => {
        let day = e.target.name
        console.log(document.getElementById(e.target.id).checked);
        if (e.target.checked) {
            document.getElementById(`${day}Start`).setAttribute('disabled', true);
            document.getElementById(`${day}End`).setAttribute('disabled', true);
            document.getElementById(e.target.id).setAttribute('value', 'Closed')
            document.getElementById(e.target.id).checked = true;
        } else {
            document.getElementById(`${day}Start`).removeAttribute('disabled', true);
            document.getElementById(`${day}End`).removeAttribute('disabled', true);
            document.getElementById(e.target.id).setAttribute('value', 'on');
            document.getElementById(e.target.id).checked = false;
        };
    }

    const patchDbUser = async (info, type) => {
        // TYPE 0 = No Email Update , TYPE 1 = Email Update (Reauth Req)
        try {
            if (!info) {
                info = updateInfo
            }

            if (type === 1) {
                await doUpdateEmail(info.email)
                    .then(async () => {
                        await axios({
                            method: 'PATCH',
                            url: `/users/${currentUser.dbUser.uid}`, 
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            data: info
                        })
                            .then((res) => {
                                alert('Profile Updated')
                            })
                    })
            } else {
                await axios({
                    method: 'PATCH',
                    url: `/users/${currentUser.dbUser.uid}`, 
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    data: info
                })
                    .then((res) => {
                        alert('Profile Updated')
                    })
            }



        } catch (err) {
            alert('Unable To Update Profile')
        }
    }

    const confirmPassword = async (password) => {
        password = (reauth) ? reauth : password
        let res
        try {
            res = await reauthenticate(password)
                .then((res) => {
                    patchDbUser(null, 1)
                })
        } catch (err) {
            alert("Incorrect Password")
        }
    }

    const validateAddress = async (address) => {
        console.log("!!!!!!!!", address)
        const find = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`)
        console.log(find)
        const results = find.data.results[0] 
        let formatted, street_address, city, state, zip
    
        results && results.address_components.forEach( (arrInd, i) => {
            if (arrInd.types[0] === 'street_number') {
                street_address = `${results.address_components[i].long_name} ${results.address_components[i + 1].long_name}`
            }
    
            if (arrInd.types[0] === 'locality') {
                city = `${results.address_components[i].long_name}`
            }
    
            if (arrInd.types[0] === 'administrative_area_level_1') {
                state = `${results.address_components[i].short_name}`
            }
    
            if (arrInd.types[0] === 'postal_code') {
                zip = `${results.address_components[i].long_name}`
            }
        })
    
        formatted = `${street_address}, ${city}, ${state} ${zip}, USA`
        console.log(formatted)
    
        let geoJson = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [
                    find.data.results[0].geometry.location.lat,
                    find.data.results[0].geometry.location.lng
                ]
            }
        }
        return [street_address, city, state, zip, geoJson]
    };

    const handleAdminUpdate = async (e) => {
        e.preventDefault();

        let { email, phone, website, address1, address2, city, state, zip } = e.target.elements;
        let [street_address, conf_city, conf_state, conf_zip, geoJson]  = await validateAddress(`${address1.value}, ${city.value}, ${state.value} ${zip.value}, USA`)
        console.log(geoJson)
        console.log("target elements");
        let info = {
            'email': email.value,
            'phone': phone.value,
            'website': website.value,
            'address': {
                'street': address1.value,
                'unit': address2.value,
                'city': conf_city,
                'state': conf_state,
                'zip': conf_zip,
            },
            'hours':{
                'Monday': {
                    'Start': "08:00",
                    'End': "09:00",
                    'Closed': "on"
                },
                'Tuesday': {
                    'Start': "08:00",
                    'End': "09:00",
                    'Closed': "on"
                },

                'Wednesday': {
                    'Start': "08:00",
                    'End': "09:00",
                    'Closed': "on"
                },

                'Thursday': {
                    'Start': "08:00",
                    'End': "09:00",
                    'Closed': "on"
                },

                'Friday': {
                    'Start': "08:00",
                    'End': "09:00",
                    'Closed': "on"
                },

                'Saturday':{
                    'Start': "08:00",
                    'End': "09:00",
                    'Closed': "on"
                },

                'Sunday':{
                    'Start': "08:00",
                    'End': "09:00",
                    'Closed': "on"
                }
            },
            'geoJSON': geoJson
        }
        setUpdateInfo(info)

        if (email.value !== currentUser.dbUser.email) {
            setHideModal(false)
        } else {
            patchDbUser(info, 0)
        }
    }

    return (
        <div>
            <h1> ADMIN ACCOUNT PAGE</h1>

            <Tab.Container defaultActiveKey="Profile">
                <Row>
                    <Col sm={3}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="Profile">Profile</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="Password">Password</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="DeleteAccount">Delete Account</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col sm={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="Profile">
                                ACCOUNT
                                <Form onSubmit={handleAdminUpdate}>
                                    <Col lg={12} md={12}>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="email">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='email'
                                                    type="email"
                                                    defaultValue={currentUser.dbUser.email}
                                                />
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group as={Col}>
                                                <Form.Label>Phone Number</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='phone'
                                                    type='tel'
                                                    defaultValue={currentUser.dbUser.phone}
                                                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                                />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="website">
                                                <Form.Label>Web Page</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='website'
                                                    type='url'
                                                    defaultValue={currentUser.dbUser.url}
                                                />
                                            </Form.Group>

                                        </Form.Row>

                                        <Form.Group controlId="address1">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control
                                                className='register-form'
                                                name='address1'
                                                type='text'
                                                defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.street)}
                                                placeholder='Address'
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="address2">
                                            <Form.Label>Address 2</Form.Label>
                                            <Form.Control
                                                className='register-form'
                                                name='address2'
                                                type='text'
                                                defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.unit)}
                                                placeholder="Apartment, studio, or floor"
                                            />
                                        </Form.Group>

                                        <Form.Row>
                                            <Form.Group as={Col} controlId="city">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='city'
                                                    type='text'
                                                    defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.city)}
                                                    placeholder='City'
                                                />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="state">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control as="select" name='state' placeholder='Choose' defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.state)} custom >
                                                    <option>Choose...</option>
                                                    {states && states.map((state) => {
                                                        return <option key={state} value={state}> {state} </option>
                                                    })}
                                                </Form.Control>
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="zip">
                                                <Form.Label>Zip</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='zip'
                                                    type='text'
                                                    defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.zip)}
                                                    placeholder='Zip'
                                                />
                                            </Form.Group>
                                        </Form.Row>
                                    </Col>

                                    <Col lg={12} md={12}>
                                        <h2> Hours of Operation </h2>
                                        <p> Need to find a better way to edit </p>
                                        {days && days.map((day) => {
                                            return (
                                                <Form.Row key={day}>
                                                    <Form.Group as={Col}>
                                                        <Form.Label>{day}</Form.Label>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Label>From</Form.Label>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        {currentUser.dbUser.hours[day].Closed !== "Closed" && <Form.Control id={day + 'Start'} name='hours' type='time' defaultValue={(currentUser.dbUser.hours && currentUser.dbUser.hours[day].Start) || '08:00'}/>}
                                                        {currentUser.dbUser.hours[day].Closed === "Closed" && <Form.Control id={day + 'Start'} name='hours' type='time' defaultValue={(currentUser.dbUser.hours && currentUser.dbUser.hours[day].Start) || '08:00'} disabled/>}
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Label>To</Form.Label>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        {currentUser.dbUser.hours[day].Closed !== "Closed" && <Form.Control id={day + 'End'} name='hours' type='time' defaultValue={(currentUser.dbUser.hours && currentUser.dbUser.hours[day].End) || '20:00'} />}
                                                        {currentUser.dbUser.hours[day].Closed === "Closed" && <Form.Control id={day + 'End'} name='hours' type='time' defaultValue={(currentUser.dbUser.hours && currentUser.dbUser.hours[day].End) || '20:00'} disabled />}

                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Label>Closed</Form.Label>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Check id={day + 'Closed'} name={day} type='checkbox' onChange={handleClose} checked={currentUser.dbUser.hours[day].Closed === "Closed"}/>
                                                    </Form.Group>
                                                </Form.Row>
                                            )
                                        })}
                                    </Col>

                                    <Button variant="primary" type="submit">
                                        Submit
                                    </Button>
                                </Form>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Password">
                                PASSWORD
                                {currentUser && currentUser.user.providerData[0].providerId === 'password' &&
                                    <ChangePassword />
                                }
                                {currentUser && currentUser.user.providerData[0].providerId !== 'password' &&
                                    <h1> You Have Logged In Using Social Media Provider. You Cannot Change Your Password</h1>
                                }
                            </Tab.Pane>
                            <Tab.Pane eventKey="DeleteAccount">
                                DELETE ACCOUNT
                                <DeleteAccount />

                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>

                <UpdateEmailModal
                    show={!hideModal}
                    setPassword={setReauth}
                    onHide={() => setHideModal(true)}
                    confirm={confirmPassword}
                />
            </Tab.Container>
        </div>
    )
}

// Account Page for Patient Users 
const AccountPatient = () => {
    const { currentUser } = useContext(AuthContext);
    const [updateInfo, setUpdateInfo] = useState(undefined)
    const [reauth, setReauth] = useState(undefined)
    const [hideModal, setHideModal] = useState(true)


    const patchDbUser = async (info, type) => {
        // TYPE 0 = No Email Update , TYPE 1 = Email Update (Reauth Req)
        try {
            if (!info) {
                info = updateInfo
            }

            if (type === 1) {
                await doUpdateEmail(info.email)
                    .then(async () => {
                        await axios({
                            method: 'PATCH',
                            url: `/users/${currentUser.dbUser.uid}`, 
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            data: info
                        })
                            .then((res) => {
                                alert('Profile Updated')
                            })
                    })
            } else {
                await axios({
                    method: 'PATCH',
                    url: `/users/${currentUser.dbUser.uid}`, 
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    data: info
                })
                    .then((res) => {
                        alert('Profile Updated')
                    })
            }



        } catch (err) {
            alert('Unable To Update Profile')
        }
    }

    const confirmPassword = async (password) => {
        password = (reauth) ? reauth : password
        let res
        try {
            res = await reauthenticate(password)
                .then((res) => {
                    patchDbUser(null, 1)
                })
        } catch (err) {
            alert("Incorrect Password")
        }
    }

    const validateAddress = async (address) => {
        const find = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`)
        const results = find.data.results[0] 
        let formatted, street_address, city, state, zip
    
        results && results.address_components.forEach( (arrInd, i) => {
            if (arrInd.types[0] === 'street_number') {
                street_address = `${results.address_components[i].long_name} ${results.address_components[i + 1].long_name}`
            }
    
            if (arrInd.types[0] === 'locality') {
                city = `${results.address_components[i].long_name}`
            }
    
            if (arrInd.types[0] === 'administrative_area_level_1') {
                state = `${results.address_components[i].short_name}`
            }
    
            if (arrInd.types[0] === 'postal_code') {
                zip = `${results.address_components[i].long_name}`
            }
        })
        
        let geoJson = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [
                    find.data.results[0].geometry.location.lat,
                    find.data.results[0].geometry.location.lng
                ]
            }
        }
        return [street_address, city, state, zip, geoJson]
    };

    const handlePatientDetailsUpdate = async (e) => {
        e.preventDefault();
        let { firstName, lastName, email, dob, gender, address1, address2, city, state, zip } = e.target.elements
        let [street_address, conf_city, conf_state, conf_zip, geoJson] = await validateAddress(`${address1.value}, ${city.value}, ${state.value} ${zip.value}, USA`)

        let info = {
            'firstName': firstName.value,
            'lastName': lastName.value,
            'email': email.value,
            'dob': dob.value.toLocaleString(),
            'gender': gender.value,
            'address': {
                'street': street_address,
                'unit': address2.value,
                'city': conf_city,
                'state': conf_state,
                'zip': conf_zip,
            }
        }
        setUpdateInfo(info)

        if (email.value !== currentUser.dbUser.email) {
            setHideModal(false)
        } else {
            patchDbUser(info, 0)
        }
    }

    const handlePatientHealthUpdate = (e) => {
        e.preventDefault();
        let { conditions, insuranceProvider, insuranceID } = e.target.elements

        let info = {
            'conditions': [...conditions.selectedOptions].map((op) => op.value),
            'insuranceProvider': insuranceProvider.value,
            'insuranceID': insuranceID.value
        }

        setUpdateInfo(info)
        patchDbUser(info, 0);
    }

    return (
        <div>
            <h1> PATIENT ACCOUNT PAGE</h1>
            <Tab.Container defaultActiveKey="Profile">
                <Row>
                    <Col sm={3}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="Profile">Profile</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="Appointments">Appointments</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="Password">Password</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="HealthDetails">Health Details</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="DeleteAccount">Delete Account</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col sm={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="Profile">
                                ACCOUNT
                                <Form onSubmit={handlePatientDetailsUpdate}>
                                    <Col lg={12} md={12}>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="firstName">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='firstName'
                                                    type='text'
                                                    defaultValue={currentUser.dbUser.firstName}
                                                />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="lastName">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='lastName'
                                                    type='text'
                                                    defaultValue={currentUser.dbUser.lastName}
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
                                                    defaultValue={currentUser.dbUser.email}
                                                    autoComplete="username"
                                                />
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="dob">
                                                <Form.Label>Date of Birth</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='dob'
                                                    type='date'
                                                    defaultValue={currentUser.dbUser.dob || "MM/DD/YYYY"}
                                                    placeholder="MM/DD/YYYY"
                                                />
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="gender">
                                                <Form.Label>Gender</Form.Label>
                                                <Form.Control as="select" name='gender' defaultValue={currentUser.dbUser.gender || 'Choose...'} custom >
                                                    <option>Choose...</option>
                                                    <option value='male'>Male</option>
                                                    <option value='female'>Female</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Form.Row>

                                        <hr />
                                        <Form.Group controlId="address1">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control
                                                className='register-form'
                                                name='address1'
                                                type='text'
                                                defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.street) || 'Address'}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="address2">
                                            <Form.Label>Address 2</Form.Label>
                                            <Form.Control
                                                className='register-form'
                                                name='address2'
                                                type='text'
                                                defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.unit) || null}
                                                placeholder="Apartment, studio, or floor"
                                            />
                                        </Form.Group>

                                        <Form.Row>
                                            <Form.Group as={Col} controlId="city">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='city'
                                                    type='text'
                                                    defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.city) || 'City'}
                                                />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="state">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control as="select" name='state' defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.state) || "Choose..."} custom required >
                                                    <option>Choose...</option>
                                                    {states && states.map((state) => {
                                                        return <option key={state} value={state}> {state} </option>
                                                    })}
                                                </Form.Control>
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="zip">
                                                <Form.Label>Zip</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='zip'
                                                    type='text'
                                                    defaultValue={(currentUser.dbUser.address && currentUser.dbUser.address.zip) || 'Zip'}
                                                />
                                            </Form.Group>
                                        </Form.Row>


                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                    </Col>
                                </Form>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Appointments">
                                Manage Your Appointments
                                {currentUser  && <ManageAppointment />}
                                {currentUser && currentUser.user.providerData[0].providerId !== 'password' &&
                                    <h1> You Have Logged In Using Social Media Provider. You Cannot Manage the Appointment</h1>
                                }
                            </Tab.Pane>

                            <Tab.Pane eventKey="Password">
                                PASSWORD
                                {currentUser && currentUser.user.providerData[0].providerId === 'password' &&
                                    <ChangePassword />
                                }
                                {currentUser && currentUser.user.providerData[0].providerId !== 'password' &&
                                    <h1> You Have Logged In Using Social Media Provider. You Cannot Change Your Password</h1>
                                }
                            </Tab.Pane>
                            <Tab.Pane eventKey="HealthDetails">
                                HEALTH DETAILS
                                <Form onSubmit={handlePatientHealthUpdate}>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="insuranceProvider">
                                            <Form.Label>Insurance Provider</Form.Label>
                                            <Form.Control
                                                className='register-form'
                                                name='insuranceProvider'
                                                type='text'
                                                placeholder="Aetna Health HMO"
                                                defaultValue={currentUser.dbUser.insurance.provider}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="insuranceID">
                                            <Form.Label>Insurance Member ID</Form.Label>
                                            <Form.Control
                                                className='register-form'
                                                name='insuranceID'
                                                type='text'
                                                placeholder="R11122233"
                                                defaultValue={currentUser.dbUser.insurance.id}
                                                required />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="conditions">
                                            <Form.Label> Pre-Existing Conditions</Form.Label>
                                            <Form.Control as="select" name='conditions' multiple>
                                                <option value='cancer'>Cancer (currently receiving treatment)</option>
                                                <option value='liver'>Liver Disease</option>
                                                <option value='transplant'>Recent Bone Marrow/Organ Transplantation</option>
                                                <option value='kidney'>Chronic Kidney Disease (currently undergoing dialysis)</option>
                                                <option value='diabetes'>Diabetes (Type I and II)</option>
                                                <option value='asthma'>Asthma or other Chronic Lung Disease</option>
                                                <option value='heart'>High Blood Pressure or other Serious Heart Condition</option>
                                                <option value='hiv'>HIV/AIDS (poorly controlled)</option>
                                                <option value='obese'>Obesity (BMI 40+)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Form.Row>

                                    <Button variant="primary" type="submit">
                                        Submit
                                </Button>
                                </Form>
                            </Tab.Pane>
                            <Tab.Pane eventKey="DeleteAccount">
                                DELETE ACCOUNT
                                <DeleteAccount />

                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>

            <UpdateEmailModal
                show={!hideModal}
                setPassword={setReauth}
                onHide={() => setHideModal(true)}
                confirm={confirmPassword}
            />
        </div >
    )
}

// Account Page for Employee Users
const AccountEmployee = () => {
    const { currentUser } = useContext(AuthContext);
    const [updateInfo, setUpdateInfo] = useState(undefined)
    const [reauth, setReauth] = useState(undefined)
    const [hideModal, setHideModal] = useState(true)


     const patchDbUser = async (info, type) => {
        // TYPE 0 = No Email Update , TYPE 1 = Email Update (Reauth Req)
        try {
            if (!info) {
                info = updateInfo
            }

            console.log(info)

            if (type === 1) {
                await doUpdateEmail(info.email)
                    .then(async () => {
                        await axios({
                            method: 'PATCH',
                            url: `/users/${currentUser.dbUser.uid}`, 
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            data: info
                        })
                            .then((res) => {
                                alert('Profile Updated')
                            })
                    })
            } else {
                await axios({
                    method: 'PATCH',
                    url: `/users/${currentUser.dbUser.uid}`, 
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    data: info
                })
                    .then((res) => {
                        alert('Profile Updated')
                    })
            }

        } catch (err) {
            alert('Unable To Update Profile')
        }
    }

    const confirmPassword = async (password) => {
        password = (reauth) ? reauth : password
        let res
        try {
            res = await reauthenticate(password)
                .then((res) => {
                    patchDbUser(null, 1)
                })
        } catch (err) {
            alert("Incorrect Password")
        }
    }

    const handleEmployeeDetailsUpdate = async (e) => {
        e.preventDefault();
        let { firstName, lastName, email, phone } = e.target.elements
        let info = {
            'firstName': firstName.value,
            'lastName': lastName.value,
            'email': email.value,
            'phone': phone.value,
        }

        setUpdateInfo(info)

        if (email.value !== currentUser.dbUser.email) {
            setHideModal(false)
        } else {
            patchDbUser(info, 0)
        }
    }

    return (
        <div>
            <h1> EMPLOYEE ACCOUNT PAGE</h1>
            <Tab.Container defaultActiveKey="Profile">
                <Row>
                    <Col sm={3}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="Profile">Profile</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="Password">Password</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col sm={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="Profile">
                                ACCOUNT
                                <Form onSubmit={handleEmployeeDetailsUpdate}>
                                    <Col lg={12} md={12}>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="firstName">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='firstName'
                                                    type='text'
                                                    defaultValue={currentUser.dbUser.firstName}
                                                />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="lastName">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='lastName'
                                                    type='text'
                                                    defaultValue={currentUser.dbUser.lastName}
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
                                                    defaultValue={currentUser.dbUser.email}
                                                    autoComplete="username"
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
                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                    </Col>
                                </Form>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Password">
                                PASSWORD
                                {currentUser && currentUser.user.providerData[0].providerId === 'password' &&
                                    <ChangePassword />
                                }
                                {currentUser && currentUser.user.providerData[0].providerId !== 'password' &&
                                    <h1> You Have Logged In Using Social Media Provider. You Must Chnage Your Password Through That Provider</h1>
                                }
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>

            <UpdateEmailModal
                show={!hideModal}
                setPassword={setReauth}
                onHide={() => setHideModal(true)}
                confirm={confirmPassword}
            />
        </div >
    )

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Reauthenticate On Email Change (For All Users)
const UpdateEmailModal = (props) => {

    const handleUpdate = (e) => {
        e.preventDefault()

        let { email_update } = e.target.elements

        props.setPassword(email_update.value)
        props.confirm(email_update.value);
        props.onHide()
    }

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Please Re-Enter Your Password to Update Your Email
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleUpdate}>
                    <Form.Row>
                        <Form.Group as={Col} controlId="email_update">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                className='login-form'
                                name='email_update'
                                type='password'
                                placeholder='Password'
                                required
                            />
                        </Form.Group>
                        <Button type='submit'>Submit</Button>
                    </Form.Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

const ManageAppointment = () =>{
    const { currentUser } = useContext(AuthContext);
    const [appointmentList, setAppointmentList] = useState([])
    const [reloadData, setReloadData] = useState(0);
    // const [rowsPerPage, setRowsPerPage] = useState(5);
    // const [page, setPage] = useState(0);
    // const [rows, setRows] = useState(0);



    const handleReload = () => {
        setReloadData((prevCount) => prevCount + 1);
      };

    const handleAppointmetnList =(data)=>{
        setAppointmentList(data);
    };

    const handleAppointDelete = async (id) => {
        try {
            await axios({
                method: "DELETE",
                url: `/appointment/${id}`, 
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }).then((conf) => {
                console.log('Appointment Deleted');
            });
            handleReload();
        } catch (err) {
            console.log(err)
            return err
        }
    };

    // const handleChangePage = (event, newPage) => {
    //     setPage(newPage);
    //   };
    
    //   const handleChangeRowsPerPage = (event) => {
    //     setRowsPerPage(parseInt(event.target.value, 10));
    //     setPage(0);
    //   };


    useEffect(
        () => {
          if (currentUser) {
            async function fetchAppointment (){
                // console.log(currentUser)
                axios.get(`/appointment/patient/${currentUser.dbUser.uid}`)
                    .then((data) => {
                        // console.log(data)
                        handleAppointmetnList(data.data);
                    })          
                    .catch(err => {
                      console.log(err)
                      return ;
                    })
            };

            fetchAppointment();
        }}, [reloadData]
    );

    function redenderAppointmentInfo (){
        // console.log(appointmentList)

        if ( appointmentList === undefined  || appointmentList.length === 0 ){
            return null;
        }
        return appointmentList.map(appointment => {
                const dateString = moment(appointment.date, 'YYYY-DD-MM').format('MM/DD/YYYY');
                const t1 = moment(appointment.slot).format('hh:mm a');
                const t2 = moment(appointment.slot).add('Minutes', 15).format('hh:mm a');
            return (<tr key={appointment._id}>
                <td>{dateString}</td>
                <td>{t1 + '-' + t2}</td>
                <td>{appointment.facilityName}</td>
                <td>{appointment.facilityPhone}</td>
                <td>{appointment.facilityEmail}</td>
                <td>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="btn-group" style={{marginBottom: "20px" }}>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => handleAppointDelete(appointment._id)}>
                                Delete Appointment</button>
                        </div>
                    </div>
                </td>
            </tr>)
            })
        }

      function  redenderAppointmentInfoF(){
            return  <MuiThemeProvider>              
            <tbody>
            {redenderAppointmentInfo()}
            </tbody>
            </MuiThemeProvider>
        }

    return (
        <div >
                {appointmentList.length === 0 && (
                    <div className="text-center">
                        <h2>No appointment found at the moment</h2>
                    </div>
                )}
        {/* <TableContainer component={Paper}> */}
        <div className="container">
            <div className="row">
           <Table bordered hover> 
            <thead className = "thread-light">
                    <tr>
                    <th>Appointment Day</th>
                    <th>Appointment Time</th>
                    <th>Facility Name</th>
                    <th>Facility Phone</th>
                    <th>Facility Email</th>
                    <th>Actions</th>
                    </tr>
                </thead> 
                {redenderAppointmentInfoF()}
            </Table>
        {/* </TableContainer> */}
        {/* <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={()=> handleChangePage()}
          onChangeRowsPerPage={()=> handleChangeRowsPerPage()}
        /> */}
        </div>              
        </div>
    </div>)
}

// Reusable Change Password Component (For All Users)
const ChangePassword = () => {
    const { currentUser } = useContext(AuthContext);
    const [passwordMatch, setPasswordMatch] = useState(null);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword1: '',
        newPassword2: ''
    });

    const handleChange = (e) => {
        e.preventDefault();
        setPasswordMatch(null)      // Removes Password Mismatch Error Viewed By User
        let form = formData
        form[e.target.name] = e.target.value
        setFormData(form)

        if (formData && (formData.newPassword2 && formData.newPassword1 !== formData.newPassword2)) {
            setPasswordMatch('Passwords Do Not Match')
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        const { currentPassword, newPassword1, newPassword2 } = e.target.elements

        if (newPassword1 !== newPassword2) {
            setPasswordMatch('Passwords Do Not Match')
        }

        try {
            await doChangePassword(currentUser.user.email, currentPassword.value, newPassword1.value)
            alert('Password Updated. You Will Now Be Logged Out')
        } catch (err) {
            alert(err)
        }
    };

    return (
        <div>
            <div id='form-error'>
                {(!!passwordMatch) && <h2> {passwordMatch} </h2>}
            </div>

            <Form onSubmit={handlePasswordChange}>
                <Col lg={12} md={12}>
                    <Form.Group controlId="currentPassword">
                        <Form.Label>CurrentPassword</Form.Label>
                        <Form.Control
                            className='register-form'
                            name='currentPassword'
                            type='password'
                            placeholder='Current Password'
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="newPassword1">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            className='register-form'
                            name='newPassword1'
                            type='password'
                            placeholder='New Password'
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="newPassword2">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                            className='register-form'
                            name='newPassword2'
                            type='password'
                            placeholder='Confirm New Password'
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Col>
            </Form>
        </div>

    )
}

// Reusable Delete Account Button (For All Users)
const DeleteAccount = () => {
    const handleDelete = () => {
        deleteAccount()
    };

    return (
        <div>
            <h6> Warning... </h6>
            <Button onClick={handleDelete}> Delete Account </Button>
        </div>
    );
}

export default Account;