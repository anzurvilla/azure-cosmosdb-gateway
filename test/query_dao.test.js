const { describe, it } = require('mocha');
const { assert, expect } = require('chai');

const QueryDao = require('../src/models/query_dao');
const queryDao = new QueryDao();

describe('QueryDAO', () => {

    it('findOne(itemId) should return a Query item object', async () => {

        const itemId = '1066a679-b614-4487-9314-3998e61f2886';
        const item = await queryDao.findOne(itemId);
        // console.log('📜','Item found is type of', typeof item);        
        // console.log('🌀','Item data found:', item);

        if(item === null) {
            console.log('🚧 Item not found');
        }
        else  {
            assert.isObject(item);
            expect(item).to.include.all.keys('id','business','to','enabled','startAt','sqlQuery','createdAt');
            console.log('💠 Query item found: 🆔', item.id);
        }
        // console.log('🏁 🏆 Finish!');
    });
    
    it('findEnabledQueries(businessCode) should return an Array of queries items', async () => {
        
        const businessCode = 'corp';
        const items = await queryDao.findEnabledQueries(businessCode);
        console.log('🌀 Queries items found:', items.length);
        items.map(item=>console.log('🆔',item.id));
        
        assert.isArray(items);
        expect(items[0]).to.include.all.keys('id','business','to','enabled','startAt','sqlQuery','createdAt');
        expect(items.length).to.be.greaterThanOrEqual(0);
        expect(result).to.have.lengthOf.above(0);

        assert.isTrue( items.map(item => item.enabled).every(el=>el===true) );
        
    });
    
    it('updateAsScheduled(itemId) should return the query scheduled', async () => {
        
        const itemId = '1066a679-b614-4487-9314-3998e61f2886';
        const updatedItem = await queryDao.updateAsScheduled(itemId);
        
        if(updatedItem === null) {
            console.log('🚧 Item could not be updated due to not found❕');
        }
        else  {
            assert.isObject(updatedItem);
            expect(updatedItem).to.include.all.keys('id','business','to','enabled','startAt','sqlQuery','createdAt','updatedAt','scheduledAt');
            expect(new Date(updatedItem.scheduledAt).getDate()).equals(new Date(updatedItem.updatedAt).getDate());
            console.log('🔸Query item scheduled at: ', updatedItem.scheduledAt);
            // console.log('📜','Updated Query item data:',updatedItem);
        }
        
    });

    it('updateAsExecuted(itemId) should return the query scheduled', async () => {
        
        const itemId = '1066a679-b614-4487-9314-3998e61f2886';
        const updatedItem = await queryDao.updateAsExecuted(itemId);

        if(updatedItem === null) {
            console.log('🚧 Item could not be updated due to not found❕');
        }
        else  {
            assert.isObject(updatedItem);
            expect(updatedItem).to.include.all.keys('id','business','to','enabled','startAt','sqlQuery','createdAt','updatedAt','executedAt');     
            expect(new Date(updatedItem.executedAt).getDate()).equals(new Date(updatedItem.updatedAt).getDate());
            console.log('🔸Query item executed at: ', updatedItem.scheduledAt);
        }
        
    });

});