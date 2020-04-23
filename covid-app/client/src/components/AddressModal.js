import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';
import { Container, Row, Col, Modal, Form, Button, FormControl, Nav, Tab, NavLink, Alert } from 'react-bootstrap';

const AddressModal = (props) => {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Invalid Address
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>Did You Mean ...</h4>
                <p>
                    {props.corrected}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>No</Button>
                <Button onClick={props.update}>Yes</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddressModal;