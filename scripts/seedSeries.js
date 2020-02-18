#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('@elastic/elasticsearch')

const ES_HOST = process.env.ES_HOST || 'localhost'
const ES_PORT = process.env.ES_PORT || 9200

const client = new Client({ node: `http://${ES_HOST}:${ES_PORT}` });

(async () => {
    const indexConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../raw-data/series.config.json'), { encoding: 'utf-8' }));
    const series = fs.readFileSync(path.join(__dirname, '../raw-data/series.data.json'), { encoding: 'utf-8' });


    const isIndexExists = (await client.indices.exists({
        index: 'series',
    })).body;

    if (isIndexExists) {
        console.warn('Index "series" already exists!')
    } else {
        const res = await client.indices.create({
            index: 'series',
            body: indexConfig,
        });
        console.log('Index "series" was created.');
    }

    const res = await client.bulk({
        index: 'series',
        body: series,
    });

    if (res.body.errors) {
        console.warn('"series" data was inserted with errors!');
        console.log(JSON.stringify(res.body, null, 2));
    } else {
        console.log('"series" data was proper inserted.');
    }
})()
    .catch(err => {
        console.error(err);
    });
