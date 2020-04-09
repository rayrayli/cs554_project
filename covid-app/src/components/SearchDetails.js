import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MapSearch from './MapSearch'

const SearchDetails = (props) => {
    const 
    return (
        <Container className = 'main'>
            <Row>
                <Col lg = {6} md = {12} sm = {12} id = 'left-comp'> 
                    <Row> <h1> DENSITY MAP HERE </h1> </Row>
                    <Row> SEARCH BAR </Row>
                    <Row> <MapSearch/> </Row>
                </Col>

                <Col lg = {6} md = {12} sm = {12} id = 'right-comp'>  
                    <Row className = 'land-row'>
                        <Row> <h1> COVID FACTS HERE </h1></Row>
                        <Row> 
                            Did you know that the world is inhabited by creatures known as Pokémon? Pokémon
                            can be found in all corners of the world: some run across sprawling plains, others
                            fly through the open skies, some in the high mountains, or in dense forests, or 
                            various coasts and bodies of water! Scientists such as Professor Samual Oak (who's 
                            laboratory is located right here in Pallete Town!) have dedicated their lives to 
                            studying the characteristics and behavior patterns of Pokémon in their natural 
                            envionment. All the information learned through research is sompiled into the Pokédex, 
                            a device that acts as a digital encylocpedia created by Professor Oaks to find and 
                            record data on each Pokémon.
                        </Row>
                    </Row>
                    
                    <Row className = 'testing-info'>
                        <Row> <h1> TESTING CENTER INFO HERE </h1></Row>
                        <Row> 
                            Did you know that the world is inhabited by creatures known as Pokémon? Pokémon
                            can be found in all corners of the world: some run across sprawling plains, others
                            fly through the open skies, some in the high mountains, or in dense forests, or 
                            various coasts and bodies of water! Scientists such as Professor Samual Oak (who's 
                            laboratory is located right here in Pallete Town!) have dedicated their lives to 
                            studying the characteristics and behavior patterns of Pokémon in their natural 
                            envionment. All the information learned through research is sompiled into the Pokédex, 
                            a device that acts as a digital encylocpedia created by Professor Oaks to find and 
                            record data on each Pokémon.
                        </Row>
                    </Row>

                </Col>
            </Row>

        </Container>
    )
}

export default SearchDetails;