import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { setLogLevel } from 'firebase';

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
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

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

// end ray add for appointment 5/11/2020

const key = process.env.REACT_APP_GOOGLE_API_KEY

async function loadScript(src) {
    let script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', () => console.log('loaded'), { passive: false });
    script.addEventListener('error', (err) => console.log(err), { passive: false });
    document.body.appendChild(script);
}

const SearchDetails = (props) => {
    const [userData, setUserdata] = useState(undefined);
    const [facilityData, setFacilityData] = useState(undefined);
    const [searchResult, setSearchResult] = useState(undefined);
    const [countyData, setCountyData] = useState(undefined);
    const [loaded, setLoaded] = useState(false)
    const [map, setMap] = useState(undefined)

    const [selected, setSelected] = useState(null);


    const script = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    let marker;
    let li;
    let row = null

    useEffect(
        () => {
            async function getLocation(searchInput) {
                await loadScript(script)

                const coor = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchInput}&key=${key}`)

                let data = coor.data.results[0]
                let county;
                let state;
                console.log(data);

                if ((data.address_components.length >= 2) && (data.address_components[1].long_name.includes('County'))) {
                    county = data.address_components[1].long_name;
                    console.log(county)
                    state = data.address_components[2].long_name

                } else if ((data.address_components.length >= 3) && (data.address_components[2].long_name.includes('County'))) {
                    county = data.address_components[2].long_name
                    console.log(county)
                    state = data.address_components[3].long_name

                } else if ((data.address_components.length >= 4) && (data.address_components[3].long_name.includes('County'))) {
                    county = data.address_components[3].long_name
                    console.log(county)
                    state = data.address_components[4].long_name

                } else {
                    setSearchResult({ lat: data.geometry.location.lat, lng: data.geometry.location.lng });
                    return
                };

                setSearchResult({ county: county, lat: data.geometry.location.lat, lng: data.geometry.location.lng })

                fetch(`/data/county/${county.substring(0, county.indexOf('County'))}`)
                    .then((res1) => res1.json())
                    .then((data) => {
                        console.log(data)
                        data.forEach((doc) => {
                            if (doc.Province_State === state) {
                                console.log(doc);
                                setCountyData(doc);
                            };

                        });
                    });

                fetch('/users/admin/')
                    .then((res1) => res1.json())
                    .then((data) => {
                        setFacilityData(data)
                    })
            };

            getLocation(props.location.state.result)
            console.log("%%%%%%%%%%%%")
            window.initMap = initMap();

        }, []
    );

    if (searchResult && facilityData && !loaded) {
        initMap()
        setLoaded(true)
    } else {
        drawMarkers()
    }

    // https://stackoverflow.com
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function initMap() {
        if (searchResult) {
            var usBounds = {
                north: 49.34,
                south: 24.74,
                west: -124.78,
                east: -66.95,
            };

            let lat = searchResult.lat;
            let lng = searchResult.lng;

            let map = new window.google.maps.Map(document.getElementById('map'), {
                center: { lat, lng },
                restriction: {
                    latLngBounds: usBounds,
                    strictBounds: false,
                },
                disableDefaultUI: true,
                zoom: 14,
                styles: [
                    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                    {
                        featureType: 'administrative.locality',
                        elementType: 'labels.text.fill',
                        stylers: [{ color: '#d59563' }]
                    },
                    {
                        featureType: 'road',
                        elementType: 'geometry',
                        stylers: [{ color: '#38414e' }]
                    },
                    {
                        featureType: 'road',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#212a37' }]
                    },
                    {
                        featureType: 'road',
                        elementType: 'labels.text.fill',
                        stylers: [{ color: '#9ca5b3' }]
                    },

                    {
                        featureType: 'water',
                        elementType: 'geometry',
                        stylers: [{ color: '#17263c' }]
                    },
                    {
                        featureType: 'water',
                        elementType: 'labels.text.fill',
                        stylers: [{ color: '#515c6d' }]
                    },
                    {
                        featureType: 'water',
                        elementType: 'labels.text.stroke',
                        stylers: [{ color: '#17263c' }]
                    }
                ]
            });

            drawMarkers()
            setMap(map)

        };
    };

    function drawMarkers() {
        facilityData && facilityData.map((facility, i) => {
            marker = new window.google.maps.Marker({
                position: { lat: facility.geoJSON.geometry.coordinates[0], lng: facility.geoJSON.geometry.coordinates[1] },
                map: map,
                info: facility
            });

            window.google.maps.event.addListener(marker, 'click', ((marker, i) => {
                return () => {
                    // console.log(marker.info)
                    // console.log(marker.info)
                    if (!!selected) {
                        if (selected === marker.info) {
                            setSelected(null)
                        } else {
                            setSelected(marker.info)
                        }
                    } else {
                        setSelected(marker.info)
                    }
                }
            })(marker, i));
        })
    }


    //add fro appointment picker
    function getSteps() {
      return ['Choose an available day for your appointment', 'Choose an available time for your appointment', 'Confirm your appointment'];
    }
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
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


    function checkDisableDate(day) {
        const dateString = moment(day).format('YYYY-DD-MM')
        return moment(day).startOf('day').diff(moment().startOf('day')) < 0
      }
    
    const [selectedDate, setSelectedDate] = React.useState(new Date('2019-08-18T21:11:54'));  
    const handleDateChange = (date) => {
          setSelectedDate(date);
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
                mode={'landscape'}
                onChange={handleDateChange}
                shouldDisableDate={day => checkDisableDate(day)}
            /> </MuiThemeProvider>);
        // case 1:
        //   return (<div>
        //         <SelectField
        //             floatingLabelText="AM or PM"
        //             value={selectedDate}
        //             onChange={handleDateChange}
        //             selectionRenderer={value => value ? 'PM' : 'AM'}>
        //             <MenuItem value={0}>AM</MenuItem>
        //             <MenuItem value={1}>PM</MenuItem>
        //         </SelectField>

        //         <RadioButtonGroup
        //             style={{ marginTop: 15,
        //                     marginLeft: 15
        //                 }}
        //             name="appointmentTimes"
        //             defaultSelected={data.appointmentSlot}
        //             onChange={(evt, val) => this.handleSetAppointmentSlot(val)}>
        //             {this.renderAppointmentTimes()}
        //         </RadioButtonGroup></div>);
        // case 2:
        //   return (<h2 style={{ textAlign: this.state.smallScreen ? 'center' : 'left', color: '#bdbdbd', lineHeight: 1.5, padding: '0 10px', fontFamily: 'Roboto'}}>
        //   { <span>
        //     Scheduling a
        //       <span style={spanStyle}> 1 hour </span>
        //     appointment {this.state.appointmentDate && <span>
        //       on <span style={spanStyle}>{moment(this.state.appointmentDate).format('dddd[,] MMMM Do')}</span>
        //   </span>} {Number.isInteger(this.state.appointmentSlot) && <span>at <span style={spanStyle}>{moment().hour(9).minute(0).add(this.state.appointmentSlot, 'hours').format('h:mm a')}</span></span>}
        //   </span>}
        //   </h2>);
        default:
          return 'Unknown step';
      }
    }
    

    // Populate County Data
    return (
        <Container className='main' fluid >
            <Row>
                <Link to='/'>Go Back</Link>
            </Row>
            <Row>
                <Col lg={6} md={12} sm={12} id='left-comp'>
                    <Row> <h1> LOCATION MAP HERE </h1> </Row>
                    <div id='map' />
                </Col>

                <Col lg={6} md={12} sm={12} id='right-comp'>
                    <Row>
                        <div>
                            <h1> COVID FACTS HERE </h1>

                            <p>County: {(countyData && countyData.Admin2) || 'Data Unavailable'}</p>
                            <p>State: {(countyData && countyData.Province_State) || 'Data Unavailable'}</p>
                            <p>Confirmed Cases: {(countyData && numberWithCommas(countyData.Confirmed)) || 'Data Unavailable'}</p>
                            <p>Deaths: {(countyData && numberWithCommas(countyData.Deaths)) || 'Data Unavailable'}</p>
                            <p>Recovered Patients: {(countyData && countyData.Recovered > 0) ? numberWithCommas(countyData.Recovered) : 'Not Reported'}</p>
                        </div>
                    </Row>

                    <Row >

                        <div>
                            <h1> TESTING CENTER INFO HERE </h1>

                            <div>
                                <h1> {selected && selected.facilityName} </h1>
                                <h3> {selected && selected.email}   {selected && selected.phone} </h3>
                                <h3> {selected && selected.address.street}, {selected && selected.address.city}, {selected && selected.address.state} {selected && selected.address.zip} </h3>
                            </div>
                            {selected &&(
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
                                                onClick={handleNext}
                                                className={classes.button}
                                            >
                                                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
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
                            )}
                        </div>
                    </Row>       
                </Col>
            </Row>
        </Container>
    )
}


export default SearchDetails;