const { describe, it } = require('mocha');
const { assert, expect } = require('chai');

describe('Paths', ()=> {

    it(`should return logs path contained: azure-cosmos-gateway\\logs`, async () => {
        const path = require('path');
        const logsPath = path.join(path.resolve(),'logs'); //path.resolve(__dirname+'/../logs');
        
        console.log('logsPath',logsPath);

        assert.isNotNull(logsPath);
        assert.isString(logsPath);
        expect(logsPath).to.contain(`azure-cosmos-gateway\\logs`);
    });

});