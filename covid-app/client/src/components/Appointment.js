// begin ray add for appointment 5/11/2020
import React, { useState, useEffect, useContext} from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';
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
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';


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
    const [appointmentSlot, setAppointmentSlot] = useState(0);
    const [confirmationModalOpen, setConfirmationModal] = useState(false);
    const [confirmationSnackbarMessage, setConfirmationSnackbarMessage] = useState(undefined);
    const [smallScreen, setSmallScreen] = useState(window.innerWidth < 768);
    const [activeStep, setActiveStep] = useState(0);
    const [confirmationSnackbarOpen, setConfirmationSnackbarOpen] = useState(false);
    const [loading, setLoading] = useState(true)
    const [appointmentSchedule, setAppointmentSchedule] = useState([]);

    let displayName = currentUser.dbUser.firstName + ' ' + currentUser.dbUser.lastName;
    let userEmail = currentUser.dbUser.email;
    let patientId = currentUser.dbUser.uid;
    let facilityInfo = props.location.state.facilityInfo;
    let facilityId = facilityInfo.uid;

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

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
        setAppointmentSlot(slot)
      }
    
    function handlefetch(data) {
        const { appointments } = data
        const initSchedule = {}
        const today = moment().startOf('day')
        initSchedule[today.format('YYYY-DD-MM')] = true
        //return schedule after today
        const schedule = (!appointments || !appointments.length)  ? initSchedule : appointments.reduce((currentSchedule, appointment) => {
          const { _id, date, slot,...otherdata} = appointment
          console.log(appointment);
          const dateString = moment(date, 'YYYY-DD-MM').format('YYYY-DD-MM');
          if (!currentSchedule[date]){
            currentSchedule[dateString] = Array(8).fill(false);
          }
          if (Array.isArray(currentSchedule[dateString])){
            currentSchedule[dateString][slot] = true;
          }
          return currentSchedule;
        }, initSchedule)
    
        for (let day in schedule) {
          let slots = schedule[day];
          if (slots.length){
            if (slots.every(slot => slot === true)){
              schedule[day] = true;
            }
          }
        }
        setAppointmentSchedule(schedule);
        setLoading(false);
      };

      useEffect(
        () => {
          if (currentUser && facilityId) {
            async function fetchAppointment() {
                fetch(`/appointment/facility/${facilityId}`)
                    .then((res1) => res1.json())
                    .then((data) => {
                        handlefetch(data);
                    })          
                    .catch(err => {
                      console.log(err)
                      setConfirmationSnackbarMessage("Fetch Error!");
                      setConfirmationSnackbarOpen(true);
                      return ;
                    })
            };
            fetchAppointment();
        }}, [currentUser]
    );

    const commitAppointment = async (info) => {
      try {
          await fetch(`/appointment/${facilityId}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json;charset=utf-8'
              },
              body: JSON.stringify(info)
          }).then( (res) => {
              setConfirmationSnackbarOpen(true) ;
              setConfirmationSnackbarMessage("Appointment succesfully added!");
            });          
      } catch (err) {
          console.log(err)
          setConfirmationSnackbarMessage("Appointment add failure!");
          setConfirmationSnackbarOpen(true);
          return err
      }
      
  }
    function handleSubmit(){
        //construct user and appointment 
        const appointment = {
            date: moment(selectedDate).format('YYYY-DD-MM'),
            slot: appointmentSlot,
            name: displayName,
            email: userEmail,
            patientId:patientId
         }
          commitAppointment(appointment);
          handleConfirmationModalFalse();
          handleNext();
    };

    function checkDisableDate(day) {
      const dateString = moment(day).format('YYYY-DD-MM')
      return (appointmentSchedule[dateString] === true || moment(day).startOf('day').diff(moment().startOf('day')) < 0)
    }

    function renderAppointmentTimes() {
      if(!loading){
          const slots = [...Array(8).keys()]
          return slots.map(slot => {
            const appointmentDateString = moment(selectedDate).format('YYYY-DD-MM')
            const t1 = moment().hour(9).minute(0).add(slot, 'hours')
            const t2 = moment().hour(9).minute(0).add(slot + 1, 'hours')
            const scheduleDisabled = appointmentSchedule[appointmentDateString] ? appointmentSchedule[moment(selectedDate).format('YYYY-DD-MM')][slot] : false
            const meridiemDisabled = selectedMeridiem ? t1.format('a') === 'am' : t1.format('a') === 'pm'
            return <RadioButton
              label={t1.format('h:mm a') + ' - ' + t2.format('h:mm a')}
              key={slot}
              value={slot}
              style={{marginBottom: 15, display: meridiemDisabled ? 'none' : 'inherit'}}
              disabled={scheduleDisabled || meridiemDisabled}/>
          })
      }
      else{
        return null;
      }       
    }
    //step process
    function getSteps() {
      return ['Choose an available day for your appointment', 'Choose an available time for your appointment', 'Confirm your appointment'];
    }

    const classes = useStyles();
    const steps = getSteps();

    function getStepContent(step) {

      switch (step) {
        case 0:
            return  ( 
            <MuiThemeProvider>
                <div>
                <DatePicker
                style={{
                    marginTop: 10,
                    marginLeft: 10
                }}
                value={selectedDate}
                hintText="Select a date"
                mode={smallScreen ? 'portrait' : 'landscape'}
                onChange={(n, date)=> handleDateChange(date)}
                shouldDisableDate={day => checkDisableDate(day)}
                /> 
                 </div>
            </MuiThemeProvider>);

        case 1:
          return (
          <MuiThemeProvider>
            <div>
                <SelectField
                    floatingLabelText="AM or PM"
                    value={selectedMeridiem}
                    onChange={(evt, key, payload) => handleMeridiemChange(payload)}
                    selectionRenderer={value => value ? 'PM' : 'AM'}>
                    <MenuItem value={0}>AM</MenuItem>
                    <MenuItem value={1}>PM</MenuItem>
                </SelectField>

                <RadioButtonGroup
                    style={{ marginTop: 15,
                            marginLeft: 15
                        }}
                    name="appointmentTimes"
                    defaultSelected={appointmentSlot}
                    onChange={(evt, val) => handleSetAppointmentSlot(val)}>
                    {renderAppointmentTimes()}
                </RadioButtonGroup>
            </div>
          </MuiThemeProvider>);

        case 2:
          const spanStyle = { color: '#00bcd4' }
          return (
          <MuiThemeProvider>
            <h2 style={{ textAlign: smallScreen ? 'center' : 'left', color: '#bdbdbd', lineHeight: 1.5, padding: '0 10px', fontFamily: 'Roboto'}}>
              { <span>
                Scheduling a
                  <span style={spanStyle}> 1 hour </span>
                appointment {selectedDate && <span>
                  on <span style={spanStyle}>{moment(selectedDate).format('dddd[,] MMMM Do')}</span>
              </span>} 
              {Number.isInteger(appointmentSlot) && <span>at <span style={spanStyle}>{moment().hour(9).minute(0).add(appointmentSlot, 'hours').format('h:mm a')}</span></span>}
              </span>}
            </h2>
          </MuiThemeProvider>);

        default:
          return 'Unknown step';
      }
    };

    function renderAppointmentConfirmation(){
        const spanStyle = { color: '#00bcd4' }
        return (
          <div>
         <Typography gutterBottom>
            Name: <span style={spanStyle}>{displayName}</span>
          </Typography >
          <Typography gutterBottom>
            Email: <span style={spanStyle}>{userEmail}</span>
          </Typography>
          <Typography gutterBottom>
          Appointment: <span style={spanStyle}>{moment(selectedDate).format('dddd[,] MMMM Do[,] YYYY')}</span> at <span style={spanStyle}>{moment().hour(9).minute(0).add(appointmentSlot, 'hours').format('h:mm a')}</span>
          </Typography></div>
       );
    }

    return ( 
        <Container className='main' fluid > 
        <Row>
              <Link to='/searchDetails'>Go Back</Link>
            </Row>
        <Row>
              <div className={classes.root}>
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
                                    onClick={activeStep === steps.length - 1 ? handleConfirmationModalTrue : handleNext}
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
                {activeStep === steps.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                    <Typography>All steps completed - you&apos;re finished</Typography>
                    <Button onClick={handleReset} className={classes.button}>
                        Reset
                    </Button>
                    </Paper>
                )}
            </div>

            <Dialog onClose={handleConfirmationModalFalse} aria-labelledby="Confirm-Appt" open={confirmationModalOpen}>
              <DialogTitle id="Confirm-Appt" onClose={handleConfirmationModalFalse}>
                  Confirm your appointment
              </DialogTitle>
              <DialogContent>
                    {renderAppointmentConfirmation}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleConfirmationModalFalse} color="primary">
                  Cancel
                </Button>
                <Button autoFocus onClick={handleSubmit} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={confirmationSnackbarOpen || loading}
              message={loading ? 'Loading... ' : confirmationSnackbarMessage }
              autoHideDuration={6000}
              onClose={()=>setConfirmationSnackbarOpen(false)} />
      </Row>
    </Container>
    )
}

export default Appointment;