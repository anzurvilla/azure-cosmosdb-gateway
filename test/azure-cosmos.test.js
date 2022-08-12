const { describe, it } = require('mocha');
const { assert, expect } = require('chai');

describe('Azure CosmosDB', ()=> {

    const databaseId = 'SalesBI';
    const containerId = 'queries';

    it(`should return '${databaseId}' database read successfully`, async () => {
        const {cosmosDatabase} = require('../src/config/cosmosdb');
        assert.isNotNull(cosmosDatabase);
        assert.isString(cosmosDatabase.id);
        expect(cosmosDatabase.id).to.equal(databaseId);
    });
    
    it(`should return '${containerId}' container read successfully`, async() => {
        const {cosmosDatabase} = require('../src/config/cosmosdb');
        const { resource: containerDefinition } = await cosmosDatabase.container(containerId).read();
        expect(containerDefinition.id).to.equal(containerId);
    });

});