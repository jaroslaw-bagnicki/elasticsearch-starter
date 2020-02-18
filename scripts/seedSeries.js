const fs = require('fs');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');

(async () => {
    const ES_HOST = process.env.ES_HOST || 'localhost';
    const ES_PORT = process.env.ES_PORT || 9200;

    const INDEX_NAME = 'series';

    const client = new Client({ node: `http://${ES_HOST}:${ES_PORT}` });
    const indexConfig = JSON.parse(fs.readFileSync(path.join(__dirname, `../raw-data/${INDEX_NAME}.config.json`), { encoding: 'utf-8' }));
    const series = fs.readFileSync(path.join(__dirname, `../raw-data/${INDEX_NAME}-sample.data.json`), { encoding: 'utf-8' });

    const isIndexExists = (await client.indices.exists({
        index: INDEX_NAME,
    })).body;

    if (isIndexExists) {
        console.warn(`Index "${INDEX_NAME}" already exists!`)
    } else {
        const res = await client.indices.create({
            index: INDEX_NAME,
            body: indexConfig,
        });
        console.log(`Index "${INDEX_NAME}" was created.`);
    }

    const res = await client.bulk({
        index: INDEX_NAME,
        body: series,
    });

    if (res.body.errors) {
        console.warn(`"${INDEX_NAME}" data was inserted with errors!`);
        console.log(JSON.stringify(res.body, null, 2));
    } else {
        console.log(`"${INDEX_NAME}" data was proper inserted.`);
    }
})()
    .catch(err => {
        console.error(err);
    });
