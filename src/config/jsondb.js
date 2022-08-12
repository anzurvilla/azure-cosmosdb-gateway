'use strict';

// Import JSON Database
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

// Path of the JSON Database local
const jsonDbPath = require('path').resolve(process.env.JSONDB);
let jsonDB;

try {
    // Set new JSON Database instance
    jsonDB = new JsonDB(new Config(jsonDbPath, true, true, '/'));
    // In case it has a exterior change to the JSON databse file and want to reload it
    // jsonDB.reload();
} catch (err) {
    throw new Error(err);
}

const self = module.exports = {

    jsonDB: () => jsonDB,

    get: (dataPath) => {
        if(dataPath) {
            try {
                return jsonDB.getData(dataPath);
            } catch (e) {
                return undefined;
            }
        }
        else return false;
    },

    set: (dataPath, data, override) => {
        if(dataPath) {
            try {
                return jsonDB.push(dataPath, data, override);
            } catch (err) {
                throw new Error(err);
            }
        }
        else return false;
    },

    delete: (dataPath) => {
        if(dataPath) {
            try {
                if(self.get(dataPath)) {
                    return jsonDB.delete(dataPath);
                }
                else return undefined;
            } catch (err) {
                throw new Error(err);
            }
        }
        else return false;
    },
}