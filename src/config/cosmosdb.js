'use strict';

// Import ENV-Variables from rootpath .env file
require('dotenv').config({path: require('path').resolve(`.env`)});

const https = require('https');
const { CosmosClient } = require('@azure/cosmos');

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOSDB_ENDPOINT,
    key: process.env.COSMOSDB_KEY,
    agent: new https.Agent({
        rejectUnauthorized: false
    }),
    userAgentSuffix: 'NodeJS'
});

const cosmosDatabase = cosmosClient.database(process.env.COSMOSDB_DATABASE);

module.exports = {cosmosClient, cosmosDatabase};

/* (async () => {
    const { database } = await client.databases.createIfNotExists({ id: 'test' });
    console.log(database.id);

    const { container } = await database.containers.createIfNotExists({ id: "cities" });
    console.log(container.id);

    const cities = [
        { id: "1", name: "Olympia", state: "WA", isCapitol: true },
        { id: "2", name: "Redmond", state: "WA", isCapitol: false },
        { id: "3", name: "Chicago", state: "IL", isCapitol: false },
        { id: "4", name: "Hermosillo", state: "SON", isCapitol: true },
        { id: "5", name: "Obregón", state: "SON", isCapitol: false },
        { id: "6", name: "Nogales", state: "SON", isCapitol: false },
        { id: "7", name: "Los Mochis", state: "SIN", isCapitol: false },
        { id: "8", name: "Culiacán", state: "SIN", isCapitol: true },
    ];
    cities.forEach(city => {
        container.items.upsert(city);
    });
}) ()

.catch((error) => {
  console.error(error);
}); */