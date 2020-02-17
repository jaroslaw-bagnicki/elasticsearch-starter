const http = require('http');
const fs = require('fs');
const path = require('path');

try {
    console.log('Reading series.json...');
    // const moviesPath = path.resolve('raw-data/movies.json');
    const moviesPath = path.join(__dirname, '../raw-data/series.json');

    const movies = fs.readFileSync(moviesPath, { encoding: 'utf-8' });
    console.log('Series loaded.');

    console.log('Preparing request.');
    const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
    const url = new URL('./_bulk?pretty', ELASTICSEARCH_URL);
    
    const req = http.request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    }, res => {
        console.log(`statusCode: ${res.statusCode}`);
        res.on('data', data => {
            process.stdout.write(data);
        });
    });
    
    req.write(movies);
    req.end();
    console.log('Sending request...');


} catch (err) {
    console.error(err);
}

