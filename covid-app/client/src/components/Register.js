import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Form, Button, FormControl, Nav, Tab, NavLink, Alert } from 'react-bootstrap';
import { doCreateUserWithEmailAndPassword } from '../firebase/FirebaseFunctions';
import { AuthContext } from '../firebase/Auth';
import '../App.css'

const key = process.env.REACT_APP_GOOGLE_API_KEY

const Register = () => {
    const { currentUser } = useContext(AuthContext);
    const [passwordMatch, setPasswordMatch] = useState(undefined);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        facilityName: '',
        email: '',
        password1: '',
        password2: ''
    });

    const handleChange = (e) => {
        e.preventDefault();
        let form = formData
        form[e.target.name] = e.target.value
        setFormData(form)

        if (formData) {
            setPasswordMatch(formData.password1 !== formData.password2 || formData.password1 === '' || formData.email === '')
        }
        console.log(passwordMatch)
    }

    const handlePatientRegister = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, password1, password2 } = e.target.elements;

        if (password1.value !== password2.value) {
            setPasswordMatch("Passwords do not match");
            return false;
        } else {
            setPasswordMatch(null);
        };

        try {
            let displayName = firstName.value + lastName.value;

            await fetch('/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    role: 'patient',
                    uid: null,
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    gender: null,
                    dob: null,
                    ssn: null,
                    address: null,
                    conditions: [null],
                    insurance: {
                        id: null,
                        provider: null,
                    },
                    appointments: [null],
                    messages: [null]
                })

            }).then(async (res) => {
                let { _id } = await res.json();
                console.log(_id);
                await doCreateUserWithEmailAndPassword(email.value, password1.value, displayName, _id);
            })

            console.log("PATIENT USER ADDED TO FIREBASE AND DB")

        } catch (err) {
            alert(err);
        }
    }

    const handleFacilityRegister = async (e) => {
        e.preventDefault();
        const { facilityName, email, password1, password2 } = e.target.elements;

        if (password1.value !== password2.value) {
            setPasswordMatch("Passwords do not match");
            return false;
        } else {
            setPasswordMatch(null);
        };

        await fetch('/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                role: 'admin',
                uid: null,
                facilityName: facilityName.value,
                email: email.value,
                address: {},
                phone: null,
                url: null,
                hours: {
                    Monday: {},
                    Tuesday: {},
                    Wednesday: {},
                    Thursday: {},
                    Friday: {},
                    Saturday: {},
                    Sunday: {}
                },
                app_slots: {
                    Monday: [null],
                    Tuesday: [null],
                    Wednesday: [null],
                    Thursday: [null],
                    Friday: [null],
                    Saturday: [null],
                    Sunday: [null]
                },
                employees: [null]
            })
        }).then(async (res) => {
            let { _id } = await res.json();
            await doCreateUserWithEmailAndPassword(email.value, password1.value, facilityName.value, _id);
        });

        console.log("ADMIN USER ADDED TO FIREBASE AND DB");
    };

    if (currentUser && currentUser.dbUser.role === 'patient') {
        return (<Redirect to='/register/health-details' />)
    } else if (currentUser && currentUser.dbUser.role === 'admin') {
        return (<Redirect to='/register/facility-details' />)
    }

    return (
        <Container className='main' fluid>
            <Row>
                <Col className='register-left' md={3} lg={3}>
                    <h1> Welcome! </h1>
                    <p> You're one step closer to knowing your COVID-19 status! </p>
                    <br />
                    <p> Already have an account? </p>
                    <NavLink href='/login'>
                        Login Here
                    </NavLink><br />
                </Col>

                <Col className='register-right' md={9} lg={9}>
                    <Tab.Container defaultActiveKey="patient">
                        <Row>
                            <Nav variant="pills">
                                <Nav.Item>
                                    <Nav.Link eventKey="patient">PATIENT</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="facility">FACILITY</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Row>

                        <Row>
                            <Tab.Content id='register'>
                                <Tab.Pane eventKey="patient" title='patient'>
                                    <div id='form-error'>>
                                        {passwordMatch && <h4 className='error'> {passwordMatch} </h4>}
                                    </div>
                                    <Form onSubmit={handlePatientRegister} >
                                        <Col lg={12} md={12}>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="firstName">
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control
                                                        className='register-form'
                                                        name='firstName'
                                                        type='text'
                                                        placeholder='First Name'
                                                        onChange={handleChange}
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
                                                        onChange={handleChange}
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
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="password1">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        className='register-form'
                                                        name='password1'
                                                        type="password"
                                                        placeholder="Password"
                                                        autoComplete="new-password"
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Form.Row>

                                            <Form.Row>
                                                <Form.Group as={Col} controlId="password2">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        className='register-form'
                                                        name='password2'
                                                        type="password"
                                                        placeholder="Confirm Password"
                                                        autoComplete="new-password"
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Form.Row>

                                            <Button disabled={passwordMatch} variant="primary" type="submit">
                                                Submit
                                            </Button>
                                        </Col>
                                    </Form>
                                </Tab.Pane>

                                <Tab.Pane eventKey="facility">
                                    <Form onSubmit={handleFacilityRegister} >
                                        <Col lg={12} md={12}>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="facilityName">
                                                    <Form.Label>Facility Name</Form.Label>
                                                    <Form.Control
                                                        className='register-form'
                                                        name='facilityName'
                                                        type='text'
                                                        placeholder='Facility Name'
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group as={Col} controlId="email">
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control
                                                        className='register-form'
                                                        name='email'
                                                        type="email"
                                                        placeholder="Enter Admin Email"
                                                        autoComplete="username"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Form.Row>

                                            <Form.Row>
                                                <Form.Group as={Col} controlId="password1">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        className='register-form'
                                                        name='password1'
                                                        type="password"
                                                        placeholder="Password"
                                                        autoComplete="new-password"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Form.Row>

                                            <Form.Row>
                                                <Form.Group as={Col} controlId="password2">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        className='register-form'
                                                        name='password2'
                                                        type="password"
                                                        placeholder="Confirm Password"
                                                        autoComplete="new-password"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Form.Row>
                                            {passwordMatch && <h4 className='error'> {passwordMatch} </h4>}

                                            <Button variant="primary" type="submit">
                                                Submit
                                            </Button>
                                        </Col>
                                    </Form>
                                </Tab.Pane>
                            </Tab.Content>
                        </Row>

                    </Tab.Container>
                </Col>
            </Row>
        </Container >
    )
};

export default Register;