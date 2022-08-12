'use strict';

// Import dotEnv config
require('dotenv').config({path: require('path').resolve(`.env`)});

const Dao = require('./dao'); // Import the Data Access Object model
const containerId = 'queries'; // Container ID of this DAO

/**
 * Data Access Object for the Queries
 */
class QueryDao {
    
    constructor() {
        this.dao = new Dao(containerId); // Create the DAO with the ContainerID
    }

    // Find one Item by ID
    async findOne(itemId) {
        try {

            if(!itemId) throw new Error(`Item ID is empty`);
            
            const item = await this.dao.getItem(itemId);

            return item;

        } catch (err) {
            throw new Error(err);
        }
    }
    
    // Find all queries that have the enabled status filtered by Business Code
    async findEnabledQueries(businessCode) {
        try {

            if(!businessCode) throw new Error(`Business code is empty`);

            const querySpec = {
                query: `SELECT * FROM c WHERE c.business=@business AND c.enabled=@enabled ORDER BY c.startAt`,
                parameters: [
                    { name: '@enabled', value: true },
                    { name: '@business', value: businessCode},
                ]
            };
            
            const items = await this.dao.find(querySpec);
            
            return items;

        } catch (err) {
            throw new Error(err);
        }
    }

    // Update a Query as scheduled by ID only if this exists
    async updateAsScheduled(itemId) {
        try {
            
            if(!itemId || itemId=='') throw new Error(`Item ID is empty`);

            const moment = require('moment');

            const item = {
                id: itemId,
                scheduledAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            }

            const updatedItem = await this.dao.updateItem(item);

            return updatedItem;

        } catch (err) {
            throw new Error(err);
        }
    }

    // Update a Query as executed by ID only if this exists
    async updateAsExecuted(itemId) {
        try {
            
            if(!itemId || itemId=='') throw new Error(`Item ID is empty`);

            const moment = require('moment');

            const item = {
                id: itemId,
                executedAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            }

            const updatedItem = await this.dao.updateItem(item);

            return updatedItem;

        } catch (err) {
            throw new Error(err);
        }
    }

}

module.exports = QueryDao;