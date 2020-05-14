import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Row, Form, InputGroup, FormControl } from 'react-bootstrap';

const SearchBar = (props) => {
    const [searchLocality, setSearchLocality] = useState(undefined);
    const [redirect, setRedirect] = useState(false)

    const handleChange = (e) => {
        let value = e.target.value
        setSearchLocality(value)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchLocality) {
            setSearchLocality(searchLocality.replace(',', '').replace(' ', '+'))
            setRedirect(true)
        } else {
            setSearchLocality('new+york+new+york');
            setRedirect(true);
        }
    }

    if (searchLocality !== undefined && redirect) {
        return(
            <Redirect to={{
                pathname: `/searchDetails`,
                state: {result: searchLocality}
            }}/>
        );

    } else {
        return (
            <Row className='landing-form'>
                <Form id='landingform' method='POST' name='formSearchLocal' onSubmit={handleSubmit} >
                    <InputGroup>
                        <FormControl type='text' id="search" placeholder='Search Testing Facilities in Your Area' onChange={handleChange} />
                        {/* <button> SEARCH </button> */}
                    </InputGroup>
                </Form>
            </Row>
        );
    };
};

export default SearchBar;