const fs = require('fs');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');
const parseCsv = require('csv-parse/lib/sync');

(async () => {
    const ES_HOST = process.env.ES_HOST || 'localhost';
    const ES_PORT = process.env.ES_PORT || 9200;
    const INDEX_NAME = 'ratings';

    const client = new Client({ node: `http://${ES_HOST}:${ES_PORT}` });

    // Cols: userId,movieId,rating,timestamp
    const ratingsCsv = fs.readFileSync(path.join(__dirname, '../raw-data/ml-latest-small/ratings.csv'), { encoding: 'utf-8' });

    const isIndexExists = (await client.indices.exists({
        index: INDEX_NAME,
    })).body;

    if (isIndexExists) {
        console.warn(`Index "${INDEX_NAME}" already exists!`)
    } else {
        const mappings = {
            properties: {
                userId: {
                    type: 'integer'
                },
                movieId: {
                    type: 'integer'
                },
                rating: {
                    type: 'scaled_float',
                    scaling_factor: 2
                },
                timestamp: {
                    type: 'date'
                }
            }
        }
    
        const settings = {};

        await client.indices.create({
            index: INDEX_NAME,
            body: { mappings, settings },
        });
        console.log(`Index "${INDEX_NAME}" was created.`);
    }

    const ratingsParsed = parseCsv(ratingsCsv, { columns: true });
    const ratingsBulk = ratingsParsed.reduce((acc, curr, i) => {
        const actionRow = `{ "create" : { "_index": "${INDEX_NAME}", "_id" : "${i + 1}" } }`;
        return acc + actionRow + '\n' + JSON.stringify(curr) + '\n';
    }, '');

    const res = await client.bulk({
        index: INDEX_NAME,
        body: ratingsBulk,
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
