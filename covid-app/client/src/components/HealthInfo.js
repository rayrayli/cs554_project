import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';
import { Container, Row, Col, Modal, Form, Button, FormControl, Nav, Tab, NavLink, Alert } from 'react-bootstrap';
import axios from 'axios';
import AddressModal from './AddressModal';

///// HOW DO WE SET THIS PAGE TO APPEAR ONCE AND ACCESSED ONLY AFTER REGISTER ?! ///////

const key = process.env.REACT_APP_GOOGLE_API_KEY

const HealthInfo = (props) => {
    const { currentUser } = useContext(AuthContext);
    const [ userInfo, setUserInfo ] = useState(undefined)
    const [ formComplete, setFormComplete ] = useState(false)
    const [ isDobValid, setIsDobValid ] = useState(null)
    const [ isSsnValid, setIsSsnValid ] = useState(null);
    const [ correctedAddress, setCorrectedAddress ] = useState(undefined)
    const [ hideModal, setHideModal ] = useState(true)
    const [ states, setStates ] = useState([
        'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
        'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
        'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
        'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
        'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
    ]);

    let displayName = currentUser.dbUser.firstName + ' ' + currentUser.dbUser.lastName;
    let email = currentUser.dbUser.email;
    let option = states.map((state) => {
        return <option value={state}> {state} </option>
    });

    // Query User Input Address to Google GeoCode API
    const validateAddress = async (address) => {
        const find = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`)
        return find.data.results[0].formatted_address
    };

    // Update User Input Address
    const confirmModal = () => {
        let info = userInfo
        info.address1 = correctedAddress.split(',')[0]
        info.city = correctedAddress.split(',')[1]
        info.state = correctedAddress.split(',')[2].split(' ')[1]
        info.zip = correctedAddress.split(',')[2].split(' ')[2]
        setUserInfo(info)
        setHideModal(true)
        updateDbUser(info)
    }

    const updateDbUser = async (info) => {
        try {
            await fetch(`/users/${currentUser.dbUser._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(info)
            }).then( (res) => {
                setFormComplete(true);            
            })
        } catch (err) {
            return err
        }
        
    }

    // Submit Form
    const handlePatientProfile = async (e) => {
        // Clear Errors on Form Change
        e.preventDefault();
        setIsDobValid(null)
        setIsSsnValid(null)

        // Add Form Data to State
        let { dob, gender, ssn, address1, address2, city, state, zip, conditions, insuranceProvider, insuranceID } = e.target.elements
        let info = {
            'dob': dob.value.toLocaleString(),
            'gender': gender.value,
            'ssn': ssn.value,
            'address1': address1.value,
            'address2': address2.value,
            'city': city.value,
            'state': state.value,
            'zip': zip.value,
            'conditions': [...conditions.selectedOptions].map((op) => op.value),
            'insuranceProvider': insuranceProvider.value,
            'insuranceID': insuranceID.value
        }
        setUserInfo(info);

        // Check Age Less Than 105
        let age = (Date.now() - (new Date(dob.value))) / 31557600000;
        if (age > 105 || age < 18) {
            setIsDobValid('Date of Birth is Invalid. Must be 18 years or older');
        }

        // Check SSN Length 
        if (ssn.value.length < 9 || ssn.value.length > 9 || !Number(ssn.value)) {
            setIsSsnValid('Social Security Number is Invalid')
        }

        // Check Address Validity using google Geocoding API
        let entered = `${address1.value}, ${city.value}, ${state.value} ${zip.value}, USA`
        let corrected = await validateAddress(entered)
        setCorrectedAddress(corrected)

        if (corrected !== entered) {
            setHideModal(false);

        } else if (!!isSsnValid || !!isDobValid) {
            return
            
        } else {
            updateDbUser(info);
        }
    };

    if (formComplete) {
        return (
            <Redirect to='/'></Redirect>
        )
    }

    return (
        <Container className='main' fluid>
            <div>
                <Row> <h3> {displayName} </h3> </Row>
                <Row> <h6> {email} </h6></Row>

            </div>
            <div id='form-error'>
                {(!!isDobValid || !!isSsnValid) && <h2> {isDobValid} <br /> {isSsnValid} </h2>}
            </div>
            <Row>
                <Form onSubmit={handlePatientProfile} >
                    <Col lg={12} md={12}>
                        <Form.Row>
                            <Form.Group controlId="dob">
                                <Form.Label>Date of Birth</Form.Label>
                                <Form.Control
                                    className='register-form'
                                    name='dob'
                                    type='date'
                                    placeholder="MM/DD/YYYY"
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="gender">
                                <Form.Label>Gender</Form.Label>
                                <Form.Control as="select" name='gender' custom required>
                                    <option>Choose...</option>
                                    <option value='male'>Male</option>
                                    <option value='female'>Female</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="ssn">
                                <Form.Label>SSN</Form.Label>
                                <Form.Control
                                    className='register-form'
                                    name='ssn'
                                    type='new-password'
                                    placeholder="111222333"
                                    data-toggle="password"
                                    required
                                />
                            </Form.Group>
                        </Form.Row>

                        <Form.Group controlId="address1">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                className='register-form'
                                name='address1'
                                type='text'
                                placeholder="1234 Main St"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="address2">
                            <Form.Label>Address 2</Form.Label>
                            <Form.Control
                                className='register-form'
                                name='address2'
                                type='text'
                                defaultValue=''
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
                                    placeholder='New York'
                                    required
                                />
                            </Form.Group>

                            <Form.Group as={Col} controlId="state">
                                <Form.Label>State</Form.Label>
                                <Form.Control as="select" name='state' custom required >
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
                                <Form.Group controlId="conditions">
                                    <Form.Label>Select Any Pre-Existing Conditions</Form.Label>
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
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="insuranceProvider">
                                    <Form.Label>Insurance Provider</Form.Label>
                                    <Form.Control
                                        className='register-form'
                                        name='insuranceProvider'
                                        type='text'
                                        placeholder="Aetna Health HMO"
                                        required
                                    />
                                </Form.Group>


                                <Form.Group controlId="insuranceID">
                                    <Form.Label>Insurance Member ID</Form.Label>
                                    <Form.Control
                                        className='register-form'
                                        name='insuranceID'
                                        type='text'
                                        placeholder="R11122233"
                                        required />
                                </Form.Group>

                            </Col>
                        </Form.Row>
                    </Col>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>

                </Form>
            </Row>

            <AddressModal
                corrected={correctedAddress}
                show={!hideModal}
                onHide={() => setHideModal(true)}
                update={() => confirmModal()}
            />

        </Container >
    )
};



export default HealthInfo;
