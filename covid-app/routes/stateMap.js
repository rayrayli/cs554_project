const express = require('express');
const router = express.Router();
const data = require('../data')
const getData = data.statData;


// Get National Data Router 
router.get("/", async (req, res) => {
    try {
        const stateLevel = await getData.getData('https://covidtracking.com/api/v1/states/current.json', 'state');
        const nationLevel = await getData.getData('https://covidtracking.com/api/v1/us/current.json', 'nation');

        res.status(200).json({state: stateLevel, nation: nationLevel});

    } catch (err) {
        res.status(400).json( {"error": err.message} );
    };
});