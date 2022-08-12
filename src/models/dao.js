'use strict';

// Import Azure CosmosDB
const { cosmosClient, cosmosDatabase } = require('../config/cosmosdb');

class Dao {

    /**
     * Manages reading, adding, and updating Items in Cosmos DB
     * @param {string} containerId
     */
    constructor(containerId) {
        this.client = cosmosClient;
        this.database = cosmosDatabase;
        this.databaseId = cosmosDatabase.id;
        this.container = cosmosDatabase.container(containerId);
        this.containerId = containerId;
    }
  
    /* async initDBAndContainer() {
        const dbResponse = await this.client.databases.createIfNotExists({
            id: this.databaseId
        });
        this.database = dbResponse.database;

        const coResponse = await this.database.containers.createIfNotExists({
            id: this.containerId
        });
        this.container = coResponse.container;
        console.log('\n⚡️','Cosmos Database & Container initialization done.\n')
    } */
    
    // Find Items with the QuerySpec
    async find(querySpec) {
        if (!this.container) throw new Error('Container is not initialized.');
        
        const { resources } = await this.container.items.query(querySpec).fetchAll();
        return resources;
    }
    
    // Add a new Item, if this's not exist
    async addItem(item) {
        if (!this.container) throw new Error('Container is not initialized.');
        
        const moment = require('moment');
        item.createdAt = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        const { resource: doc } = await this.container.items.create(item);
        return doc;
    }

    // Get the Item by ID
    async getItem(itemId) {
        // Find the Item by Id
        const item = await this.find(`SELECT * FROM c WHERE c.id = '${itemId}'`);
        // const item = await this.container.item(itemId).read(); // this doesn't work

        // Return the Item data only when it was fetched
        return item && Array.isArray(item) && item[0] || null;
    }

    // Update the Item with new data, optional Insert it if it doesn't exist
    async updateItem(itemNewData, updateOrInsert=false) {
        // Get the current Item data
        const item = await this.getItem(itemNewData.id);

        if (updateOrInsert || (item && item.id) ) {
            const moment = require('moment');

            // Spread the current data with the new data to new Item to be upserted
            const newItem = { ...item, ...itemNewData, updatedAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS') };

            // Update or Insert the new Item
            const { resource: upserted } = await this.container.items.upsert(newItem);

            return upserted;
        }

        return null;
    }
        
    // Update the Item or insert a Item with new data
    async upsertItem(itemNewData) {
        return await this.updateItem(itemNewData, true);
    }

    // Bulk upsert items through an Array of Items
    async bulkUpsert(items) {
        if( !items || !Array.isArray(items) ) throw new Error(`Items are not an Array`);
        let processedItems = 0;
        
        // Items Array has data
        if( items.length>0 ) {
            // Process data of each item
            for (const key in items) {
                const item = items[key];

                // Update or insert the new item data when it has an ID
                if (item.id && item.id!=='') {
                    await this.upsertItem(item);
                }
                // Just add the new item data when it doesn't have an ID
                else {
                    await this.addItem(item);
                }
                processedItems++; // one more processed item
            }
        }

        return processedItems;
    }

    // Delete the Item by ID
    async deleteItem(itemId) {
        if (!this.container) throw new Error('Container is not initialized.');       
        // TODO: fix it, it's not work
        const item = await this.getItem(itemId);
        // const item = await this.container.item(itemId, '/id');
        console.log(item._self)
        // const deleted = await this.container.item(itemId).delete();
        cosmosClient.deleteDocument(item._self, {
            partitionKey: {}
        }, (err) => {
            if (err) {
                console.error(err)
                throw err;
            } else {
                console.log('DELETED document ' + item._self)
            }
        });
        return item;
    }
    
}

module.exports = Dao;