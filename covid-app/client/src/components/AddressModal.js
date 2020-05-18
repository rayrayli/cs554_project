import React from 'react';
import { Modal, Button } from 'react-bootstrap';

// Modal Used to Confirm Addresses for ALL Users 
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
                <p className="map-info-h">Did You Mean...</p>
                <p>
                    {props.corrected}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button className="submit" onClick={props.onHide}>No</Button>
                <Button className="submit" onClick={props.update}>Yes</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddressModal;