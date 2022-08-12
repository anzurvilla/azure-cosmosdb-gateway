'use strict';

// Import dotEnv config
require('dotenv').config({path: require('path').resolve('.env')});
// Import moment package
const moment = require('moment');
moment.locale(process.env.DATETIME_LOCALE);
// Import logger util
const logger = require('./utils/logger');

// Import Node-Cron to schedule the tasks
const cron = require('node-cron');

module.exports={

    // Task for tests only
    taskForTests: async (CRON_SCHEDULE_TEST, TIMEZONE) => {
        try {
            // Validate if the Cron expression is defined to process the Cloud-Queries
            if(!CRON_SCHEDULE_TEST) {
                logger.printWarning(`Test CRON expression missing`);
                return ;
            }
            // Schedule the task to run according to the specific cron expression
            cron.schedule(
                CRON_SCHEDULE_TEST, // cron expression
                // task to run
                async () => {
                    try {
                        logger.logVerbose(`CRON: Test task executed on ${moment().format('DD-MMM-YYYY HH:mm:ss')}`);
                        logger.logVerbose(`CRON: Test task completed on ${moment().format('DD-MMM-YYYY HH:mm:ss')}`);
                    } catch (err) {
                        logger.logError(err);
                        throw Error(err);
                    }
                },
                {
                    scheduled: true, // A boolean to set if the created task is scheduled. Default true;
                    timezone: TIMEZONE // The timezone that is used for job scheduling. See moment-timezone for valid values.
                }
            );
            logger.logVerbose(`CRON: Test task scheduled on ${moment().format('DD-MMM-YYYY HH:mm:ss')}`);
        } catch (err) {
            // logger.printError(err);
            throw Error(err);
        }
    },

    // Task to process the Queries stored in the Cloud
    taskToProcessCloudQueries: async (CRON_SCHEDULE_PROCESS_CLOUD_QUERIES, TIMEZONE) => {
        try {
            // Validate if the Cron expression is defined to process the Cloud-Queries
            if(!CRON_SCHEDULE_PROCESS_CLOUD_QUERIES) {
                logger.logWarning(`Cloud-Queries CRON expression missing`);
                return ;
            }
            // Delete previous stored data in the JSON local database
            require('./config/jsondb').delete('/');
            // Schedule the task to run according to the specific cron expression
            cron.schedule(
                CRON_SCHEDULE_PROCESS_CLOUD_QUERIES, // cron expression
                // task to run
                async () => {
                    logger.logVerbose(`CRON: Cloud Queries task executed on ${moment().format('DD-MMM-YYYY HH:mm:ss')}`);
                    try {
                        const queries = await require('./controller/query_controller').runProcessCloudQueries();
                        logger.logInfo(`CRON: ${queries.length||'0'} queries processed.`);
                        logger.logVerbose(`CRON: Cloud Queries task completed on ${moment().format('DD-MMM-YYYY HH:mm:ss')}`);
                    } catch (err) {
                        logger.logError(err);
                        throw Error(err);
                    }
                },
                {
                    scheduled: true, // A boolean to set if the created task is scheduled. Default true;
                    timezone: TIMEZONE // The timezone that is used for job scheduling. See moment-timezone for valid values.
                }
            );
            logger.logVerbose(`CRON: Cloud Queries task scheduled on ${moment().format('DD-MMM-YYYY HH:mm:ss')}`);
        } catch (err) {
            throw Error(err);
        }
    },

}