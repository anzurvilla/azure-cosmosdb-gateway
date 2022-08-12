'use strict';

// Import dotEnv config
require('dotenv').config({path: require('path').resolve('.env')});
// Import moment package
const moment = require('moment');
moment.locale(process.env.DATETIME_LOCALE);
// Import logger util
const logger = require('./utils/logger');

// Init message
console.group('\x1b[44m',`📚 Azure CosmosDB Gateway [${process.env.NODE_ENV}] `,'\x1b[0m');
logger.logInfo(`🚀 The server app started on ${moment().format('DD-MMM-YYYY \\a\\t hh:mm:ss a')}`);
console.groupEnd();

try {
    // Cron App
    const cronapp = require('./cronapp');
    
    // Task for tests only
    if (process.env.NODE_ENV==='development') cronapp.taskForTests(process.env.CRON_SCHEDULE_TEST, process.env.TZ);
    
    // Task to process the Cloud-Queries
    cronapp.taskToProcessCloudQueries(process.env.CRON_SCHEDULE_PROCESS_CLOUD_QUERIES, process.env.TZ);

} catch (err) {
    logger.logError(err, process.env.NODE_ENV && process.env.NODE_ENV==='development');
}