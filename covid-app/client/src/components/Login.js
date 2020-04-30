import React, { useContext, useState } from 'react';
import { Container, Row, Col, Image, Form, Button, Nav, FormGroup } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';
import { Redirect } from 'react-router-dom';
import { doSocialSignIn, doSignInWithEmailAndPassword } from '../firebase/FirebaseFunctions';
import googleImg from '../img/google_signin.png';
import ForgotPassword from './ForgotPassword';


const Login = () => {
    const { currentUser } = useContext(AuthContext)
    const [ showReset, setShowReset ] = useState(false)

    if (currentUser) {
        return <Redirect to='/' />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const [ email, password, btn, btn2 ] = e.target.elements;

        try {
            await doSignInWithEmailAndPassword(email.value, password.value);
        } catch (err) {
            alert(err);
        }
    }

    return (
        <Container className='main' fluid>
            <Row>
                <Form onSubmit={handleLogin}>
                    <Col lg={12} md={12}>
                        <SocialLogin />
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
                        <Form.Row>
                            <Button type='submit'>Login</Button>
                        </Form.Row>

                        <Form.Row>
                            <Button onClick={() => setShowReset(true)}> Forgot Your Password? </Button>
                        </Form.Row>

                    </Col>
                </Form>
            </Row>
            <ForgotPassword
                show={showReset}
                onHide={() => setShowReset(false)}
            />
        </Container >
    )
}

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
            <Image alt='google-login' src={googleImg} onClick={() => loginSocial('google')} />

        </FormGroup>
    </Form.Row>
};

export default Login;