import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Form, Button, FormControl, Nav, Tab } from 'react-bootstrap';

const Register = () => {
    let option;
    const states = [
        'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
        'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
        'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
        'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
        'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    option = states.map( (state) => {
        console.log(state)
        return <option> {state} </option>
    });

    return (
        <Container className='main' fluid>
            <Row>
                <Col className='register-left' md={3} lg={3}>
                    <h1> Welcome! </h1>
                    <p> You're one step closer to knowing your COVID-19 status! </p>
                    <br />
                    <p> Already have an account? </p>
                    <Button> Login </Button><br />
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
                            <Tab.Content>
                                <Tab.Pane eventKey="patient">
                                    <h2> Personal Information </h2>
                                    <Form>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formGridFName">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control type="text" placeholder="First Name" />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="formGridLName">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control type="text" placeholder="LastName" />
                                            </Form.Group>
                                        </Form.Row>

                                        <Form.Row>
                                            <Form.Group controlId="formGridAddress1">
                                                <Form.Label>Date of Birth</Form.Label>
                                                <Form.Control type='text' placeholder="MM/DD/YYYY" />
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="formGridState">
                                                <Form.Label>Gender</Form.Label>
                                                <Form.Control as="select" value="Choose..." custom>
                                                    <option>Choose...</option>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                </Form.Control>
                                            </Form.Group>

                                            <Form.Group controlId="formGridAddress1">
                                                <Form.Label>SSN</Form.Label>
                                                <Form.Control type='text' placeholder="111222333" />
                                            </Form.Group>
                                        </Form.Row>

                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formGridEmail">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control type="email" placeholder="Enter email" />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="formGridPassword">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control type="password" placeholder="Password" />
                                            </Form.Group>
                                        </Form.Row>

                                        <Form.Group controlId="formGridAddress1">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control placeholder="1234 Main St" />
                                        </Form.Group>

                                        <Form.Group controlId="formGridAddress2">
                                            <Form.Label>Address 2</Form.Label>
                                            <Form.Control placeholder="Apartment, studio, or floor" />
                                        </Form.Group>

                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formGridCity">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="formGridState">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control as="select" value="Choose...">
                                                    <option>Choose...</option>
                                                    {option}
                                                </Form.Control>
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="formGridZip">
                                                <Form.Label>Zip</Form.Label>
                                                <Form.Control />
                                            </Form.Group>
                                        </Form.Row>

                                        <h2> Health Information </h2>

                                        <Form.Row>
                                            <Col>
                                                <Form.Group controlId="exampleForm.ControlSelect2">
                                                    <Form.Label>Select Any Pre-Existing Conditions</Form.Label>
                                                    <Form.Control as="select" multiple>
                                                        <option>High Blood Pressure</option>
                                                        <option>Asthma</option>
                                                        <option>3</option>
                                                        <option>4</option>
                                                        <option>5</option>
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>

                                            <Col md={6}>
                                                <Form.Group controlId="formGridAddress1">
                                                    <Form.Label>Insurance Provider</Form.Label>
                                                    <Form.Control type='text' placeholder="Aetna Health HMO" />
                                                </Form.Group>


                                                <Form.Group controlId="formGridAddress1">
                                                    <Form.Label>Insurance Member ID</Form.Label>
                                                    <Form.Control type='text' placeholder="R11122233" />
                                                </Form.Group>

                                            </Col>
                                        </Form.Row>

                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                    </Form>
                                </Tab.Pane>
                                <Tab.Pane eventKey="facility">
                                    <h1> FACILITY</h1>
                                </Tab.Pane>
                            </Tab.Content>
                        </Row>
                    </Tab.Container>

                </Col>

            </Row>

        </Container>
    )

};

export default Register;