const { describe, it } = require('mocha');
const { assert, expect } = require('chai');

const Dao = require('../src/models/dao');
const dao = new Dao('test');

describe('DAO', () => {

    const data = [
        {
            id: '1',
            business: "corp",
            product: "product1",
            date: "2019-01-01",
            amount: 9257915.52,
            quantity: 22,
            updatedAt: "2022-05-24 13:32:38.299"
        },
        {
            id: '2',
            business: "corp",
            product: "product1",
            date: "2019-01-02",
            amount: 7587589.12,
            quantity: 38,
            updatedAt: "2022-05-24 13:32:38.300"
        },
        {
            id: '3',
            business: "corp",
            product: "product1",
            date: "2019-01-03",
            amount: 5686885.34,
            quantity: 25,
            updatedAt: "2022-05-24 13:32:38.300"
        },
    ]
    
    it('addItem(newItem) should return the Item added', async () => {
        try {
            const item = await dao.addItem(data[0]);
            assert.isObject(item);
            // console.log('💠 Item added: ', item);
            expect(item).to.include.all.keys('id','business','product','date','amount','quantity','createdAt');
        } catch (err) {
            console.error('Error code', err.code, err.body.code);
        }               
    });

    it('getItem(itemId) should return an Item found', async () => {
        
        const item = await dao.getItem(1);

        assert.isObject(item);
        // console.log('💠 Item found: ', item);
        expect(item).to.include.all.keys('id','business','product','date','amount','quantity','createdAt');
    });

    it('find(querySpec) should return an Array of Items', async () => {
        
        const items = await dao.find(`SELECT * FROM c`);

        assert.isArray(items);
        // console.log('🌀 Items found:'); items.map(item=>console.log('🆔',item.id,item.business,item.product,item.date));
        expect(items).to.has.lengthOf.at.least(0);

    });

    it('update(item) should return the Item updated', async () => {
        
        const updatedItem = await dao.updateItem(data[0]);

        assert.isObject(updatedItem);
        expect(updatedItem).to.have.property('updatedAt');
        // expect(updatedItem).to.include.all.keys('id','business','product','date','amount','quantity','createdAt','updatedAt');

    });

    it('bulkUpsert(data) should return the number of Items upserted', async () => {
        
        const itemsNum = await dao.bulkUpsert(data);

        assert.isNumber(itemsNum);
        // console.log('🌀 Number of items upserted:',itemsNum);
        expect(itemsNum).equal(data.length);

    });

    it('delete(itemId) should return the Item deleted', async () => {
        const deletedItem = await dao.deleteItem(data[0].id);
        console.log('deletedItem',deletedItem)
        assert.isObject(deletedItem);
    });

});