const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000; // You can change the port as needed

app.use(express.json());

// Read the merch.json and trends.json files
const merchData = require('./Merch.json');
const trendsData = require('./trends.json');

// API endpoint to get data in chunks
app.get('/merch', (req, res) => {
    const page = parseInt(req.query.page) || 0; // Change the default page to 0
    const pageSize = 60;
    const startIndex = page * pageSize; // Subtract 1 from page here
    const endIndex = startIndex + pageSize;
    const dataChunk = merchData.slice(startIndex, endIndex);

    res.json(dataChunk);
});

app.get('/trends', (req, res) => {
    const page = parseInt(req.query.page) || 0; // Change the default page to 0
    const pageSize = 60;
    const startIndex = page * pageSize; // Subtract 1 from page here
    const endIndex = startIndex + pageSize;
    const dataChunk = trendsData.slice(startIndex, endIndex);

    res.json(dataChunk);
});

app.listen(port, () => {
    console.log(`API server is running on port ${port}`);
});
