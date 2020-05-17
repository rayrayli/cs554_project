import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import {Container , Button}from 'react-bootstrap';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { setLogLevel } from 'firebase';

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
    const [redirectToAppointment, setRedirectToAppointment] = useState(false);

    const script = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    let marker;

    useEffect(
        () => {
            async function getLocation(searchInput) {
                await loadScript(script)

                const coor = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchInput}&key=${key}`)

                let data = coor.data.results[0]
                let county;
                let state;
                console.log(data);
                
                data && data.address_components.forEach( (arrInd, i) => {
                    if (arrInd.types[0] === 'administrative_area_level_2') {
                        county = data.address_components[i].long_name;
                        state = data.address_components[i + 1].long_name
                    }
                })

                setSearchResult({ county: county, lat: data.geometry.location.lat, lng: data.geometry.location.lng })

                axios.get(`/data/county/${county.substring(0, county.indexOf('County'))}`)
                    .then((data) => {
                        console.log(data)
                        data.data.forEach((doc) => {
                            if (doc.Province_State === state) {
                                console.log(doc);
                                setCountyData(doc);
                            };

                        });
                    });

                axios.get('/users/admin/')
                    .then((data) => {
                        setFacilityData(data.data)
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
            if (facility.geoJSON && facility.geoJSON.geometry.coordinates) {
                marker = new window.google.maps.Marker({
                    position: { lat: facility.geoJSON.geometry.coordinates[0], lng: facility.geoJSON.geometry.coordinates[1] },
                    map: map,
                    info: facility
                });
            }

            window.google.maps.event.addListener(marker, 'click', ((marker, i) => {
                return () => {
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

    //add for appointment picker
    if (redirectToAppointment) {
        return (
        <Redirect to={{
            pathname: '/appointment',
            state: {
                facilityInfo: selected,
                result: props.location.state.result 
                }
        }}/>
        )
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
                                <div>
                                    {selected && (<Button onClick={() => setRedirectToAppointment(true)}> Create an appointment</Button>)}
                                </div>
                            </div>
                            
                        </div>
                    </Row>       
                </Col>
            </Row>
        </Container>
    )
}


export default SearchDetails;
