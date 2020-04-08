import React, { useState, useEffect } from 'react'
import GoogleMapReact from 'google-map-react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const MapSearch = () =>{
    const [ locData, setLocData ] = useState(undefined);
    const [ gotMap, setGotMap ] = useState(undefined)

    useEffect(
        () => {
            setLocData({ 
                center: {
                    lat: 40,
                    lng: -95
                }, 
                zoom: 4,
                urlKeys: {
                    key:'AIzaSyAzvmldZdw7JDk_x7g-fvOLzs_Egd5Ha6o',
                    language: 'en'
                }
            })
        }, [ gotMap ]
    );

    if (!gotMap) {
        setGotMap(true)
    }

    if (locData) {
        return (
            <Row id  = 'map'>
                <GoogleMapReact
                    bootstrapURLKeys = {locData.urlKeys}
                    center = {locData.center}
                    zoom = {locData.zoom} >
                </GoogleMapReact> 
            </Row>
        );
    } else {
        return null
    }
    
};

export default MapSearch