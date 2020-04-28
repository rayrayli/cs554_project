import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';
import { Container, Row, Col, Modal, Form, Button, FormControl, Nav, Tab, NavLink, Alert } from 'react-bootstrap';
import axios from 'axios';
import AddressModal from './AddressModal';

///// HOW DO WE SET THIS PAGE TO APPEAR ONCE AND ACCESSED ONLY AFTER REGISTER ?! ///////

const key = process.env.REACT_APP_GOOGLE_API_KEY

const FacilityInfo = (props) => {
    const { currentUser } = useContext(AuthContext);
    const [userInfo, setUserInfo] = useState(undefined)
    const [formComplete, setFormComplete] = useState(false)
    const [correctedAddress, setCorrectedAddress] = useState(undefined)
    const [hideModal, setHideModal] = useState(true)
    const [states, setStates] = useState([
        'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
        'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
        'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
        'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
        'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
    ]);
    const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])

    let displayName = currentUser.dbUser.facilityName;
    let email = currentUser.dbUser.email;

    const handleClose = (e) => {
        // Use JQuery??!?
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

    // Query User Input Address to Google GeoCode API
    const validateAddress = async (address) => {
        const find = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`)
        console.log(find.data)
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
        return [find.data.results[0].formatted_address, geoJson]
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

    const updateDbUser = async (inf) => {
        let info = userInfo
        try {
            await fetch(`/users/${currentUser.dbUser._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(info)
            }).then((res) => {
                setFormComplete(true);
            })
        } catch (err) {
            return err
        }

    }

    // Submit Form
    const handleAdminProfile = async (e) => {
        e.preventDefault();

        let elem = [...e.target.elements]
        console.log(elem)
        let info = {}

        elem.forEach((element) => {
            if (element.id.includes('Start') || element.id.includes('End') || element.id.includes('Closed')) {
                if (info[element.id.substring(0, element.id.indexOf('y') + 1)]) {
                    let type = element.id.substring(element.id.indexOf('y') + 1)
                    let val = element.value
                    info[element.id.substring(0, element.id.indexOf('y') + 1)][type] = val

                } else {
                    let dat = {}
                    let type = element.id.substring(element.id.indexOf('y') + 1)
                    let val = element.value
                    dat[type] = val
                    info[element.id.substring(0, element.id.indexOf('y') + 1)] = dat
                }

            } else {
                info[element.id] = element.value
            };
        });

        setUserInfo(info);

        // Check Address Validity using google Geocoding API
        let entered = `${info.address1}, ${info.city}, ${info.state} ${info.zip}, USA`
        let [corrected, geoJSON] = await validateAddress(entered)
        info.geoJSON = geoJSON
        setCorrectedAddress(corrected)

        console.log('*******',info)

        if (corrected !== entered) {
            setHideModal(false);

        } else {
            console.log("UPFATE DB USER")
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
            </div>
            <Row>
                <Form onSubmit={handleAdminProfile} >
                    <Col lg={12} md={12}>
                        <Form.Row>
                            <Form.Group as={Col} controlId="phone">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    className='register-form'
                                    name='phone'
                                    type='tel'
                                    placeholder="201-221-2232"
                                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                    required
                                />
                            </Form.Group>

                            <Form.Group as={Col} controlId="website">
                                <Form.Label>Web Page</Form.Label>
                                <Form.Control
                                    className='register-form'
                                    name='website'
                                    type='url'
                                    placeholder="www.facility.com"
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
                        <h2> Hours of Operation </h2>
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
                                        <Form.Control id={day + 'Start'} name='hours' type='time' defaultValue='08:00' />
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Label>To</Form.Label>
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Control id={day + 'End'} name='hours' type='time' defaultValue='20:00' />
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Label>Closed</Form.Label>
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Check id={day + 'Closed'} name={day} type='checkbox' onChange={handleClose} />
                                    </Form.Group>
                                </Form.Row>
                            )
                        })}
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


export default FacilityInfo;
