import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Row, Button, Form, InputGroup, FormControl } from 'react-bootstrap';

async function loadScript(src) {
    let script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', () => console.log('loaded'), { passive: false });
    script.addEventListener('error', (err) => console.log(err), { passive: false });
    document.body.appendChild(script);
}

const SearchBar = (props) => {
    const [searchLocality, setSearchLocality] = useState(undefined);
    const [redirect, setRedirect] = useState(false)
    const key = process.env.REACT_APP_GOOGLE_API_KEY
    const script = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`

    useEffect(
        () => {
            async function loadGoogle() {
                await loadScript(script)
            }

            loadGoogle();
        }, []
    )

    if (window.google && window.google.maps && window.google.maps.places) {
        const options = {
            types: ['(cities)'],
        };

        let autocomplete = new window.google.maps.places.Autocomplete(document.getElementById('search'), options);
        autocomplete.setFields(['address_components', 'formatted_address']);
        autocomplete.addListener('place_changed', function() {
            let place = autocomplete.getPlace();
            setSearchLocality(place.name)
        })
    }

    const handleChange = (e) => {
        let value = e.target.value
        setSearchLocality(value)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchLocality) {
            console.log(searchLocality)
            setSearchLocality(searchLocality.replace(',', '').replace(' ', '+'))
            setRedirect(true)
        } else {
            setRedirect(false);
        }
    }

    if (searchLocality !== undefined && redirect) {
        return (
            <Redirect to={{
                pathname: `/searchDetails`,
                state: { result: searchLocality }
            }} />
        );


    } else {
        return (
            <Row className='landing-form'>
                <Form id='landingform' method='POST' name='formSearchLocal' onSubmit={handleSubmit} >
                    <InputGroup>
                        <FormControl type='text' id="search" aria-label="Search for Testing Facilities" placeholder='Search For Your County' onChange={handleChange} />
                        {/* <Button type='submit' className="submit" onClick={handleChange} >Search</Button> */}
                    </InputGroup>
                </Form>
            </Row>
        );
    };
};

export default SearchBar;