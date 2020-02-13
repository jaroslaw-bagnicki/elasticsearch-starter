const express = require('express');

const PORT = process.env.PORT || 3000;

const server = express();

server.get('/', (req, res) => {
    const dt = new Date();
    res.send(`${dt.toISOString()}: Hello from Node.js`);
});

server.listen(PORT, () => console.log(`Server listen on port ${PORT}...`));
