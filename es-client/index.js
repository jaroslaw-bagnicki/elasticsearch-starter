const express = require('express');

const server = express();

server.get('/', (req, res) => res.send('Hello from Node.js'));

server.listen(3000, () => console.log('Server listen on port 3000...'));
