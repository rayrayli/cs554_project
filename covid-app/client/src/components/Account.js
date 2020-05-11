import React, { useState, useContext } from 'react';
import { AuthContext } from '../firebase/Auth';
import { doChangePassword, deleteAccount, doUpdateEmail, reauthenticate } from '../firebase/FirebaseFunctions';
import { Container, Nav, Col, Row, Tab, Form, Button, Modal } from 'react-bootstrap';
const states = [
    'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
    'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
    'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
    'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
    'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const Account = (props) => {
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

        if (e.target.checked) {
            document.getElementById(`${day}Start`).setAttribute('disabled', true);
            document.getElementById(`${day}End`).setAttribute('disabled', true);
            document.getElementById(e.target.id).setAttribute('value', 'Closed')
        } else {
            document.getElementById(`${day}Start`).removeAttribute('disabled', true);
            document.getElementById(`${day}End`).removeAttribute('disabled', true);
            document.getElementById(e.target.id).setAttribute('value', 'null')
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
                        await fetch(`/users/${currentUser.dbUser.uid}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify(info)
                        })
                            .then((res) => {
                                alert('Profile Updated')
                            })
                    })
            } else {
                await fetch(`/users/${currentUser.dbUser.uid}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(info)
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

    const handleAdminUpdate = (e) => {
        e.preventDefault();

        let { email, phone, website, address1, address2, city, state, zip } = e.target.elements;
        let info = {
            'email': email.value,
            'phone': phone.value,
            'website': website.value,
            'address': {
                'street': address1.value,
                'unit': address2.value,
                'city': city.value,
                'state': state.value,
                'zip': zip.value,
            }
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
                                        {/* {days && days.map((day) => {
                                            return (
                                                <Form.Row key={day}>
                                                    <Form.Group as={Col}>
                                                        <Form.Label>{day}</Form.Label>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Label>From</Form.Label>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Control id={day + 'Start'} name='hours' type='time' defaultValue={(currentUser.dbUser.hours && currentUser.dbUser.hours[day].start) || '08:00'}/>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Label>To</Form.Label>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Control id={day + 'End'} name='hours' type='time' defaultValue={(currentUser.dbUser.hours && currentUser.dbUser.hours[day].end) || '20:00'} />
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Label>Closed</Form.Label>
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Check id={day + 'Closed'} name={day} type='checkbox' onChange={handleClose} />
                                                    </Form.Group>
                                                </Form.Row>
                                            )
                                        })} */}
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
                        await fetch(`/users/${currentUser.dbUser.uid}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify(info)
                        })
                            .then((res) => {
                                alert('Profile Updated')
                            })
                    })
            } else {
                await fetch(`/users/${currentUser.dbUser.uid}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(info)
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

    const handlePatientDetailsUpdate = async (e) => {
        e.preventDefault();
        let { firstName, lastName, email, dob, gender, address1, address2, city, state, zip } = e.target.elements
        let info = {
            'firstName': firstName.value,
            'lastName': lastName.value,
            'email': email.value,
            'dob': dob.value.toLocaleString(),
            'gender': gender.value,
            'address': {
                'street': address1.value,
                'unit': address2.value,
                'city': city.value,
                'state': state.value,
                'zip': zip.value,
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
                        await fetch(`/users/${currentUser.dbUser.uid}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify(info)
                        })
                            .then((res) => {
                                alert('Profile Updated')
                            })
                    })
            } else {
                await fetch(`/users/${currentUser.dbUser.uid}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(info)
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

        if (formData && (formData.newPassword1 !== formData.newPassword2 && formData.newPassword2)) {
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
        deleteAccount();
    };

    return (
        <div>
            <h6> Warning... </h6>
            <Button onClick={handleDelete}> Delete Account </Button>
        </div>
    );
}

export default Account;