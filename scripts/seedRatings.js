const fs = require('fs');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');
const parseCsv = require('csv-parse/lib/sync');
const { PerformanceObserver, performance } = require('perf_hooks');

const marks = {
    SCRIPT_START: 'script-start',
    SCRIPT_END: 'script-end',
    LOAD_START: 'load-start',
    LOAD_END: 'load-end',
    PARSE_START: 'parse-start',
    PARSE_END: 'parse-end',
    INSERT_START: 'insert-start',
    INSERT_END: 'insert-end',
};

(async () => {
    const ES_HOST = process.env.ES_HOST || 'localhost';
    const ES_PORT = process.env.ES_PORT || 9200;
    const INDEX_NAME = 'ratings';

    const perfObserver = new PerformanceObserver((items) => {
        const measure = items.getEntries()[0];
        console.log(`"${measure.name}" took ${(measure.duration / 1000).toFixed(2)}s`);
      });
    perfObserver.observe({ entryTypes: ['measure'] });

    performance.mark(marks.SCRIPT_START);

    const client = new Client({ node: `http://${ES_HOST}:${ES_PORT}` });

    // Cols: userId,movieId,rating,timestamp
    performance.mark(marks.LOAD_START);
    const ratingsCsv = fs.readFileSync(path.join(__dirname, '../raw-data/ml-latest-small/ratings.csv'), { encoding: 'utf-8' });
    performance.mark(marks.LOAD_END);
    performance.measure('load', marks.LOAD_START, marks.LOAD_END);

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

    performance.mark(marks.PARSE_START);
    const ratingsParsed = parseCsv(ratingsCsv, { columns: true });
    const ratingsBulk = ratingsParsed.flatMap(rating => [
        { create: { _index: INDEX_NAME } }, rating,
    ]);
    performance.mark(marks.PARSE_END);
    performance.measure('parse', marks.PARSE_START, marks.PARSE_END);

    performance.mark(marks.INSERT_START);
    const res = await client.bulk({
        index: INDEX_NAME,
        body: ratingsBulk,
    });
    performance.mark(marks.INSERT_END);
    performance.measure('insert', marks.INSERT_START, marks.INSERT_END);

    if (res.body.errors) {
        console.warn(`"${INDEX_NAME}" data was inserted with errors!`);
        console.log(JSON.stringify(res.body, null, 2));
    } else {
        console.log(`"${INDEX_NAME}" data was proper inserted.`);
    }

    performance.mark(marks.SCRIPT_END);
    performance.measure('script', marks.SCRIPT_START, marks.SCRIPT_END);
})()
.catch(err => {
    console.error(err);
});
