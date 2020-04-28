import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';
import SearchBar from './SearchBar';
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

    const script = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`

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
            window.initMap = initMap();

        }, [initMap()]
    );

    if (facilityData) {
        console.log(facilityData)
    }

    if (searchResult && facilityData) {
        initMap()
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
                zoom: 12,
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

            facilityData && facilityData.forEach((facility) => {
                let marker = new window.google.maps.Marker({
                    position: new window.google.maps.LatLng(facility.geoJSON.geometry.coordinates[0], facility.geoJSON.geometry.coordinates[1]),
                    map: map
                });
            })
        };
    };

    if (searchResult && countyData) {

        return (
            <Container className='main' fluid >
                <Row>
                    <Link to='/'>Go Back</Link>
                </Row>
                <Row>
                    <Col lg={6} md={12} sm={12} id='left-comp'>
                        <Row> <h1> DENSITY MAP HERE </h1> </Row>
                        <div id='map' />
                    </Col>

                    <Col lg={6} md={12} sm={12} id='right-comp'>
                        {/* <Row className='land-row'> */}
                        <h1> COVID FACTS HERE </h1>

                        <p>County: {countyData.Admin2}</p>
                        <p>State: {countyData.Province_State}</p>
                        <p>Confirmed Cases: {countyData.Confirmed}</p>
                        <p>Deaths: {countyData.Deaths}</p>
                        <p>Recovered Patiends: {countyData.Recovered}</p>

                        {/* </Row> */}


                        {/* <Row className='testing-info'>
                            <Row> <h1> TESTING CENTER INFO HERE </h1></Row>
                            <Row>
                                info info info info infoinfo info info info infoinfo info info info infoinfo info info info info
                                info info info info infoinfo info info info infoinfo info info info infoinfo info info info info
                                info info info info infoinfo info info info infoinfo info info info infoinfo info info info info
                                info info info info info
                                info info info info infoinfo info info info infoinfo info info info info
                                info info info info infoinfo info info info infoinfo info info info infoinfo info info info info
                                info info info info info
                                info info info info infoinfo info info info infoinfo info info info infoinfo info info info info
                                info info info info infoinfo info info info infoinfo info info info infoinfo info info info info
                                info info info info infoinfo info info info infoinfo info info info infoinfo info info info info
                                info info info info infoinfo info info info infoinfo info info info infoinfo info info info info
                                info info info info info
                            </Row>
                        </Row> */}

                    </Col>
                </Row>
            </Container>
        )

    } else {
        return (
            <Container className='main' fluid>
                <Row>
                    <Link to='/'>Go Back</Link>
                </Row>
                <Row>
                    <Col lg={6} md={12} sm={12} id='left-comp'>
                        <Row> <h1> DENSITY MAP HERE </h1> </Row>
                        <div id='map' />
                    </Col>

                    <Col lg={6} md={12} sm={12} id='right-comp'>
                        <h1> COVID FACTS HERE </h1>

                        <p>County: Data Unavailable</p>
                        <p> State: Data Unavailable</p>
                        <p> Confirmed Cases: Data Unavailable</p>
                        <p>Deaths: Data Unavailable</p>
                        <p>Recovered Patiends: Data Unavailable</p>

                    </Col>
                </Row>
            </Container>
        )
    }
}

export default SearchDetails;