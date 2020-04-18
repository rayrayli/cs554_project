import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Form, Button, FormControl, Nav, Tab, NavLink, Alert } from 'react-bootstrap';
import { doCreateUserWithEmailAndPassword } from '../firebase/FirebaseFunctions';
import { AuthContext } from '../firebase/Auth';
import '../App.css'

const Register = () => {
    const { currentUser } = useContext(AuthContext);
    const [passwordMatch, setPasswordMatch] = useState(undefined);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password1: '',
        password2: ''
    })


    const states = [
        'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
        'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
        'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
        'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
        'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
    let option = states.map((state) => {
        return <option key={state}> {state} </option>
    });

    const handleChange = (e) => {
        e.preventDefault();
        let form = formData
        form[e.target.name] = e.target.value
        setFormData(form)

        if (formData) {
            setPasswordMatch(formData.password1 !== formData.password2 || formData.password1 === '' || formData.email === '')
        }
    }

    const handlePatientRegister = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, password1, password2 } = e.target.elements;

        if (password1.value !== password2.value) {
            setPasswordMatch("Passwords do not match")
            return false
        }

        try {
            let displayName = firstName.value + lastName.value

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
                    phone: null,
                    conditions: [null],
                    insurance: {
                        id: null,
                        provider: null,
                    },
                    appointments: [null],
                    messages: [null]
                })

            }).then(async (res) => {
                console.log("USER ADDED TO FIREBASE")
                let {_id} = await res.json()
                console.log(_id)
                await doCreateUserWithEmailAndPassword(email.value, password1.value, displayName, _id)
            })

            console.log("USER ADDED TO FIREBASE AND DB")

        } catch (err) {
            alert(err);
        }
    }

    const handleFacilityRegister = async (e) => {
    }

    if (currentUser) {
        return (<Redirect to='/account' />)
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
                                            {passwordMatch && <h4 className='error'> {passwordMatch} </h4>}

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

                                                <Form.Group as={Col} controlId="femail">
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
                                                <Form.Group as={Col} controlId="fpassword1">
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
                                                <Form.Group as={Col} controlId="fpassword2">
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

{/* 
    <h2> Personal Information </h2>
    <Form.Row>
<Form.Group controlId="formDOB">
<Form.Label>Date of Birth</Form.Label>
<Form.Control
className='register-form'
name='dob'
type='date'
placeholder="MM/DD/YYYY"
required
/>
</Form.Group>
<Form.Group as={Col} controlId="formGender">
    <Form.Label>Gender</Form.Label>
    <Form.Control as="select" name='gender' custom required>
        <option>Choose...</option>
        <option value='male'>Male</option>
        <option value='female'>Female</option>
    </Form.Control>
</Form.Group>

<Form.Group controlId="formSSN">
    <Form.Label>SSN</Form.Label>
    <Form.Control
        className='register-form'
        name='ssn'
        type='password'
        placeholder="111222333"
        data-toggle="password"
        required
    />
</Form.Group>
</Form.Row> 

<Form.Group controlId="formAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
                className='register-form'
                name='email'
                type='text'
                placeholder="1234 Main St"
                required
            />
        </Form.Group>

        <Form.Group controlId="formAddress2">
            <Form.Label>Address 2</Form.Label>
            <Form.Control
                className='register-form'
                name='address2'
                type='text'
                placeholder="Apartment, studio, or floor"
                required
            />
        </Form.Group>

        <Form.Row>
            <Form.Group as={Col} controlId="formCity">
                <Form.Label>City</Form.Label>
                <Form.Control
                    className='register-form'
                    name='city'
                    type='text'
                    placeholder='New York'
                    required
                />
            </Form.Group>

            <Form.Group as={Col} controlId="formState">
                <Form.Label>State</Form.Label>
                <Form.Control as="select" value="Choose..." name='state' required>
                    <option>Choose...</option>
                    {option}
                </Form.Control>
            </Form.Group>

            <Form.Group as={Col} controlId="formZip">
                <Form.Label>Zip</Form.Label>
                <Form.Control
                    className='register-form'
                    name='city'
                    type='text'
                    placeholder='10001'
                    required
                />
            </Form.Group>
        </Form.Row>
    </Col>

    <Col lg={12} md={12}>
        <h2> Health Information </h2>
        <Form.Row>
            <Col>
                <Form.Group controlId="formPE">
                    <Form.Label>Select Any Pre-Existing Conditions</Form.Label>
                    <Form.Control as="select" name='pe' multiple required>
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
            </Col>

            <Col md={6}>
                <Form.Group controlId="formInsurProv">
                    <Form.Label>Insurance Provider</Form.Label>
                    <Form.Control
                        className='register-form'
                        name='insurProv'
                        type='text'
                        placeholder="Aetna Health HMO"
                        required
                    />
                </Form.Group>


                <Form.Group controlId="formInsurId">
                    <Form.Label>Insurance Member ID</Form.Label>
                    <Form.Control
                        className='register-form'
                        name='insurId'
                        type='text'
                        placeholder="R11122233"
                        required />
                </Form.Group>

            </Col>
        </Form.Row>
    </Col>
*/}