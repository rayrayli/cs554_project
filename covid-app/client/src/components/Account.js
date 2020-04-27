import React, { useState, useContext } from 'react';
import { AuthContext } from '../firebase/Auth';
import { doChangePassword } from '../firebase/FirebaseFunctions'
import { Container, Nav, Col, Row, Tab, Form, Button } from 'react-bootstrap';
const states = [
    'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
    'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
    'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
    'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
    'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const Account = (props) => {
    const { currentUser } = useContext(AuthContext);
    console.log('#####', currentUser)

    return <Container className='main' fluid>
        {(currentUser.dbUser.role === 'admin' || currentUser.dbUser.role === 'facilityUser') ? <AccountFacility /> : <AccountPatient />}
    </Container>
}

const AccountFacility = () => {

    return (
        <div>
            <h1> ADMIN ACCOUNT PAGE</h1>

        </div>
    )
}

const AccountPatient = () => {
    const { currentUser } = useContext(AuthContext);
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
                        </Nav>
                    </Col>
                    <Col sm={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="Profile">
                                ACCOUNT
                                <Form  >
                                    <Col lg={12} md={12}>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="firstName">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='firstName'
                                                    type='text'
                                                    placeholder={currentUser.dbUser.firstName}

                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="lastName">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control
                                                    className='register-form'
                                                    name='lastName'
                                                    type='text'
                                                    placeholder={currentUser.dbUser.lastName}

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
                                                    placeholder={currentUser.dbUser.email}
                                                    autoComplete="username"

                                                    required
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
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="gender">
                                                <Form.Label>Gender</Form.Label>
                                                <Form.Control as="select" name='gender' defaultValue={currentUser.dbUser.gender || 'Choose...'} custom required>
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
                                                placeholder={currentUser.dbUser.address && currentUser.dbUser.address.street || 'Address'}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="address2">
                                            <Form.Label>Address 2</Form.Label>
                                            <Form.Control
                                                className='register-form'
                                                name='address2'
                                                type='text'
                                                defaultValue={currentUser.dbUser.address && currentUser.dbUser.address.unit || 'Unit'}
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
                                                    placeholder={currentUser.dbUser.address && currentUser.dbUser.address.city || 'City'}
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="state">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control as="select" name='state' defaultValue={currentUser.dbUser.address && currentUser.dbUser.address.state || "Choose..."} custom required >
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
                                                    placeholder={currentUser.dbUser.address && currentUser.dbUser.address.zip || 'Zip'}
                                                    required
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

                                <Form>
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

                                </Form>
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </div >
    )
}

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
        setPasswordMatch(null)
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

        try {
            await doChangePassword(currentUser.user.email, currentPassword.value, newPassword1.value)
            alert('Password Updated. You Will Now Be Logged Out')
        } catch (err) {
            console.log(err)
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

export default Account;