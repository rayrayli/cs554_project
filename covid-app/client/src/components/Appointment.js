import React, { useState, useEffect, useContext} from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Image, Form, FormGroup } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';

// begin ray add for appointment 5/11/2020
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import DatePicker from 'material-ui/DatePicker'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import { RadioButton,RadioButtonGroup } from 'material-ui/RadioButton'
import moment from 'moment'
import FlatButton from 'material-ui/FlatButton'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Dialog from 'material-ui/Dialog'
import Card from 'material-ui/Card'

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
  }));


const Appointment = (props) => {

    const [selectedDate, setSelectedDate] = useState(new Date());  
    const [selectedMeridiem, setSelectedMeridiem] = useState(0);  
    const { currentUser } = useContext(AuthContext);

    const [hideModal, setHideModal] = useState(true);
    const [appointmentSlot, setAppointmentSlot] = useState([]);
    const [confirmationModalOpen, setConfirmationModal] = useState(false);
    const [confirmationSnackbarMessage, setConfirmationSnackbarMessage] = useState(undefined);
    const [smallScreen, setSmallScreen] = useState(window.innerWidth < 768);

    let displayName = currentUser.dbUser.firstName + ' ' + currentUser.dbUser.lastName;
    let email = currentUser.dbUser.email;
    let phone = currentUser.dbUser.phone;
    let facilityName = currentUser.dbUser.facilityName;

    useEffect(
        () => {
            async function fetchAppointment() {
                fetch(`/users/${currentUser.dbUser.facilityName}/appointment`)
                    .then((res1) => res1.json())
                    .then((data) => {
                        setAppointmentSlot(data);
                    })
            };

            fetchAppointment();
        }, [hideModal]
    );

    const handleConfirmationModalTrue = () => {
        setConfirmationModal(true);
      };
    const handleConfirmationModalFalse = () => {
        setConfirmationModal(false);
      };
    const handleDateChange = (date) => {
          setSelectedDate(date);
        };

    const handleMeridiemChange = (date) => {
        setSelectedMeridiem(date);
    };

    const handleSetAppointmentSlot = (slot) =>{
        setAppointmentSlot({ appointmentSlot: slot })
      }

    function checkDisableDate(day) {
        const dateString = moment(day).format('YYYY-DD-MM')
        return moment(day).startOf('day').diff(moment().startOf('day')) < 0
      }
    
    function renderAppointmentTimes() {
          const slots = [...Array(8).keys()]
          return slots.map(slot => {
            const appointmentDateString = moment(selectedDate).format('YYYY-DD-MM')
            const t1 = moment().hour(9).minute(0).add(slot, 'hours')
            const t2 = moment().hour(9).minute(0).add(slot + 1, 'hours')
            const scheduleDisabled = appointmentSlot[appointmentDateString] ? appointmentSlot[moment(selectedDate).format('YYYY-DD-MM')][slot] : false
            const meridiemDisabled = selectedMeridiem ? t1.format('a') === 'am' : t1.format('a') === 'pm'
            return <RadioButton
              label={t1.format('h:mm a') + ' - ' + t2.format('h:mm a')}
              key={slot}
              value={slot}
              style={{marginBottom: 15, display: meridiemDisabled ? 'none' : 'inherit'}}
              disabled={scheduleDisabled || meridiemDisabled}/>
          })
      }

    //step process
    function getSteps() {
      return ['Choose an available day for your appointment', 'Choose an available time for your appointment', 'Confirm your appointment'];
    }
    const classes = useStyles();
    const [activeStep, setActiveStep] = useState(0);
    const steps = getSteps();

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };


    function getStepContent(step) {

      switch (step) {
        case 0:
            return  ( <MuiThemeProvider ><DatePicker
                style={{
                    marginTop: 10,
                    marginLeft: 10
                }}
                value={selectedDate}
                hintText="Select a date"
                mode={smallScreen ? 'portrait' : 'landscape'}
                onChange={handleDateChange}
                shouldDisableDate={day => checkDisableDate(day)}
            /> </MuiThemeProvider>);

        case 1:
          return (<MuiThemeProvider>
                <SelectField
                    floatingLabelText="AM or PM"
                    value={selectedMeridiem}
                    onChange={handleMeridiemChange}
                    selectionRenderer={value => value ? 'PM' : 'AM'}>
                    <MenuItem value={0}>AM</MenuItem>
                    <MenuItem value={1}>PM</MenuItem>
                </SelectField>

                <RadioButtonGroup
                    style={{ marginTop: 15,
                            marginLeft: 15
                        }}
                    name="appointmentTimes"
                    defaultSelected={'AM'}
                    onChange={(evt, val) => handleSetAppointmentSlot(val)}>
                    {renderAppointmentTimes()}
                </RadioButtonGroup>
                </MuiThemeProvider>);
        case 2:
          const spanStyle = { color: '#00bcd4' }
          return (<MuiThemeProvider><h2 style={{ textAlign: smallScreen ? 'center' : 'left', color: '#bdbdbd', lineHeight: 1.5, padding: '0 10px', fontFamily: 'Roboto'}}>
          { <span>
            Scheduling a
              <span style={spanStyle}> 1 hour </span>
            appointment {selectedDate && <span>
              on <span style={spanStyle}>{moment(selectedDate).format('dddd[,] MMMM Do')}</span>
          </span>} {Number.isInteger(appointmentSlot) && <span>at <span style={spanStyle}>{moment().hour(9).minute(0).add(appointmentSlot, 'hours').format('h:mm a')}</span></span>}
          </span>}
          </h2></MuiThemeProvider>);
        default:
          return 'Unknown step';
      }
    };

    function handleSubmit(){
        //construct user and appointment 
        const appointment = {
            date: moment(selectedDate).format('YYYY-DD-MM'),
            slot: appointmentSlot,
            name: displayName,
            email: email,
            phone: phone,
            facilityName: facilityName
          }
          axios.post('api/appointments', appointment)
          .then(setConfirmationSnackbarMessage("Appointment succesfully added!"))
          .catch(err => {
            console.log(err)
            return setConfirmationSnackbarMessage("Appointment succesfully added!")
          })
    };

    function renderAppointmentConfirmation(){
        const spanStyle = { color: '#00bcd4' }
        return (<MuiThemeProvider><section>
          <p>Name: <span style={spanStyle}>{displayName}</span></p>
          <p>Number: <span style={spanStyle}>{phone}</span></p>
          <p>Email: <span style={spanStyle}>{email}</span></p>
          <p>Appointment: <span style={spanStyle}>{moment(selectedDate).format('dddd[,] MMMM Do[,] YYYY')}</span> at <span style={spanStyle}>{moment().hour(9).minute(0).add(appointmentSlot, 'hours').format('h:mm a')}</span></p>
        </section></MuiThemeProvider>)
    };

    const modalActions = [
        <FlatButton
          label="Cancel"
          primary={false}
          onClick={handleConfirmationModalFalse} />,
        <FlatButton
          label="Confirm"
          primary={true}
          onClick={handleSubmit} />
      ];

    return ( 
        <Container className='main' fluid > 
        <section style={{
            maxWidth: !smallScreen ? '80%' : '100%',
            margin: 'auto',
            marginTop: !smallScreen ? 20 : 0,
          }}>
          <Card style={{
              padding: '10px 10px 25px 10px',
              height: smallScreen ? '100vh' : null
            }}>
                            <Stepper activeStep={activeStep} orientation="vertical">
                                {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                    <StepContent>
                                        { getStepContent(index) }
                                        <div className={classes.actionsContainer}>
                                            <div>
                                            <Button
                                                disabled={activeStep === 0}
                                                onClick={handleBack}
                                                className={classes.button}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={activeStep === steps.length - 1 ? handleConfirmationModalTrue :handleNext}
                                                className={classes.button}
                                            >
                                                {activeStep === steps.length - 1 ? 'Confirm' : 'Next'}
                                            </Button>
                                            </div>
                                        </div>
                                    </StepContent>
                                </Step>
                                ))}
                            </Stepper>
                    </Card>
                            <Dialog
                                modal={true}
                                open={confirmationModalOpen}
                                actions={modalActions}
                                title="Confirm your appointment">
                                {renderAppointmentConfirmation}
                            </Dialog>
                            {activeStep === steps.length && (
                                <Paper square elevation={0} className={classes.resetContainer}>
                                <Typography>All steps completed - you&apos;re finished</Typography>
                                <Button onClick={handleReset} className={classes.button}>
                                    Reset
                                </Button>
                                </Paper>
                            )}
         
        </section>
    </Container>
    )
}

export default Appointment;