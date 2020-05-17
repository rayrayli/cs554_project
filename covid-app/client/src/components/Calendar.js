import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../firebase/Auth';
import { Modal, Button } from 'react-bootstrap';


import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import axios from 'axios'

const Calendar = (props) => {
    const { currentUser } = useContext(AuthContext);
    const [hideModal, setHideModal] = useState(true)
    const [selectedAppt, setSelectedAppt] = useState(undefined);

    const handleModal = (bool) => {
        if (selectedAppt || bool) {
            setHideModal(false)
        }
    }
    const handleEventClick = (e) => {
        e.jsEvent.preventDefault();

        setSelectedAppt(e.event._def.extendedProps)
        handleModal(true)
    }

    return (
        <div>
            <FullCalendar
                defaultView="dayGridMonth"
                header={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
                }}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                eventClick={handleEventClick}
                events={props.appts}
            />

            <AppointmentDetailsModal
                appointmentDetails={selectedAppt}
                clearSelected={() => setSelectedAppt(undefined)}
                show={!hideModal}
                onHide={() => setHideModal(true)}
            />
        </div>
    )
}

const AppointmentDetailsModal = (props) => {
    const [empl, setEmpl] = useState(undefined)

    useEffect(
        () => {
            async function getClinician() {
                let clinician = await axios.get(`/users/${props.appointmentDetails.assignedToEmployee}`)
                setEmpl(clinician.data)
            }

            if (props.appointmentDetails && props.appointmentDetails.assignedToEmployee) {
                getClinician()
            }

        }, [props.appointmentDetails]
    )

    const handleAppointDelete = async (id) => {
        try {
            await axios({
                method: "DELETE",
                url: `/appointment/${id}`,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }).then((conf) => {
                console.log('Appointment Deleted');
                props.onHide()
                window.location.reload();
            });
        } catch (err) {
            console.log(err)
            return err
        }
    };

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {`${props.appointmentDetails && props.appointmentDetails.userName.split(' ')[1]}, ${props.appointmentDetails && props.appointmentDetails.userName.split(' ')[0]}`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>Appointment Details</h4>
                <p>
                    <strong> Patiend ID: </strong> {props.appointmentDetails && props.appointmentDetails.patientId}
                </p>
                <p>
                    <strong> Patient Email: </strong> {props.appointmentDetails && props.appointmentDetails.userEmail}
                </p>
                <p>
                    <strong> Appointment Date: </strong> {props.appointmentDetails && props.appointmentDetails.slot.split(' ')[0]}
                </p>
                <p>
                    <strong> Appointment Time: </strong>{props.appointmentDetails && props.appointmentDetails.slot.split(' ')[1]}
                </p>
                <p>
                    <strong> Appointment Duration: </strong> 15 minutes
                </p>
                <p>
                    <strong> Clinician ID: </strong> {props.appointmentDetails && props.appointmentDetails.assignedToEmployee}
                </p>
                <p>
                    <strong> Clinician Name: </strong> {empl && props.appointmentDetails && `${empl.firstName} ${empl.lastName} `}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => handleAppointDelete(props.appointmentDetails && props.appointmentDetails._id)}>Delete Appointment</Button>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal >
    );
}

export default Calendar;
