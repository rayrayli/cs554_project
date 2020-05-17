import React, { useContext, useState } from 'react';
import { Container, Row, Col, Image, Form, Button, FormGroup } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';
import { Redirect } from 'react-router-dom';
import { doSocialSignIn, doSignInWithEmailAndPassword } from '../firebase/FirebaseFunctions';
import googleImg from '../img/google_signin.png';
import ForgotPassword from './ForgotPassword';

// User Login With Email and Password
const Login = () => {
    const { currentUser } = useContext(AuthContext)
    const [ showReset, setShowReset ] = useState(false)

    // If Auth Component Finds Registered User, Redirect to Landing
    if (currentUser) {
        if (currentUser.dbUser.role === 'patient') {
            if (!currentUser.dbUser.dob || !currentUser.dbUser.address.street || !currentUser.dbUser.gender || !currentUser.dbUser.insurance.id) {
                return (<Redirect to='/user/health-details' />)
            } else {
                return (<Redirect to='/' />)
            }
        } else if (currentUser.dbUser.role === 'admin') {
            if (!currentUser.dbUser.address.street || !currentUser.dbUser.hours || !currentUser.dbUser.phone || !currentUser.dbUser.url) {
                return (<Redirect to='/user/facility-details' />)
            } else {
                return (<Redirect to='/' />)
            }
        } else if (currentUser.dbUser.role === 'employee') {
            return (<Redirect to='/' />)
        }
    }

    // Attempt Login With User Input Email and Password
    const handleLogin = async (e) => {
        console.log("logging in");
        e.preventDefault();
        const [ email, password, btn, btn2 ] = e.target.elements;

        try {
            console.log("trying");
            await doSignInWithEmailAndPassword(email.value, password.value);
            console.log("logged in");
        } catch (err) {
            alert(err);     // Unable to Login
        }
    }

    return (
        <Container className='main' fluid>
            <div className="login-content">
                <div className='registration-header'>
                    <h1> Welcome! </h1>
                    <p className="reg-login"> Thank you for your diligence in fighting COVID-19! Login to your account below.</p>
                    <br />
                </div>
                <Form onSubmit={handleLogin}>
                    <Col lg={12} md={12}>
                        <SocialLogin/>
                        <Form.Row>
                            <Form.Group as={Col} controlId="email-login">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    className='login-form'
                                    name='email-login'
                                    type='email'
                                    placeholder='Email'
                                    autoComplete='username'
                                    required
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col} controlId="password-login">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    className='login-form'
                                    name='password-login'
                                    type='password'
                                    placeholder='Password'
                                    autoComplete='current-password'
                                    required
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row className="login-button">
                            <Button type='submit' className="submit" block>Login</Button>
                        </Form.Row>

                        <Form.Row className="forgot-pw">
                            <p className="cursor" onClick={() => setShowReset(true)}> Forgot Your Password? </p>
                        </Form.Row>

                    </Col>
                </Form>
            </div>
            <ForgotPassword
                show={showReset}
                onHide={() => setShowReset(false)}
            />
        </Container >
    )
}

// User Login With Social (i.e. Google, Facebook (still need to add I dont have a FB account))
const SocialLogin = () => {
    const loginSocial = async (social) => {
        try {
            await doSocialSignIn(social);
            return <Redirect to='/' />
        } catch (err) {
            alert(err);
        }
    }

    return <Form.Row>
        <FormGroup as={Col} controlId="formGmailLogin">
            <Image className="cursor" alt='google-login' src={googleImg} onClick={() => loginSocial('google')} />
        </FormGroup>
    </Form.Row>
};

export default Login;