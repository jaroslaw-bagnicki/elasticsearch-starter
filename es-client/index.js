const express = require('express');
const { Client } = require('@elastic/elasticsearch')

const PORT = process.env.PORT || 3000;
const ES_HOST = process.env.ES_HOST || 'localhost'
const ES_PORT = process.env.ES_PORT || 9200

const server = express();
const client = new Client({ node: `http://${ES_HOST}:${ES_PORT}` })

server.get('/', (req, res) => {
    const dt = new Date();
    client;
    res.send(`${dt.toISOString()}: Hello from Node.js`);
});

server.listen(PORT, () => console.log(`Server listen on port ${PORT}...`));
