'use strict';

// Import dotEnv config
require('dotenv').config({path: require('path').resolve(`.env`)});
// Import logger util
const logger = require('../utils/logger');
// Import moment package
const moment = require('moment');
moment.locale(process.env.DATETIME_LOCALE);

// Get if it's in development enviorment
const DEV_NODE_ENV = process.env.NODE_ENV && process.env.NODE_ENV==='development';

// Handle an error or warning: log the error and print on console in dev mode
function handleErrWarn (message, err) {
    if (err) logger.logError(err, DEV_NODE_ENV);
    else logger.logWarning(message, DEV_NODE_ENV);
}

const self = module.exports = {

    // Validate if the Query must be executed or not depending on the start and end dates
    mustBeExecuted (query) {
        try {
            // Validate if the start datetime is defined
            if(query.startAt) {
                // DateTime RegEx format YYYY-MM-DD HH:MM:SS
                const datetime_regex = /^([0-9]{4})-?(1[0-2]|0[1-9])-?(3[01]|0[1-9]|[12][0-9]) ([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
                // Validate if the start datetime is a valid datetime format
                if( datetime_regex.test(query.startAt) ) {
                    // Validate if the end datetime is a valid datetime format or is just null/undefined
                    if( query.endAt===null || query.endAt===undefined
                        || ( typeof query.endAt==='string' && query.endAt==='' )
                        || ( query.endAt && datetime_regex.test(query.endAt) )
                    ) {
                        // Set the now datetime
                        // const now = moment().utcOffset('-07:00').format('YYYY-MM-DD HH:mm');
                        const now = moment().format('YYYY-MM-DD HH:mm');
                        // Validate if the start datetime is same or before than now,
                        // and if the end datetime is null or isn't null and same or after than now (diffs by minutes)
                        const startAtVsNow = moment(query.startAt).diff(now, 'minutes');
                        const endAtVsNow = moment(query.endAt).diff(now, 'minutes');
                        if ( startAtVsNow <= 0
                            && ( endAtVsNow >= 0 || query.endAt === null || query.endAt === undefined
                                || (typeof query.endAt === 'string' && query.endAt === '')
                            )
                        ) {
                            return true;
                        }
                    }
                    else {
                        handleErrWarn(`QueryID ${query.id}: ${query.endAt} as endAt is an invalid date format`);
                    }
                }
                else {
                    handleErrWarn(`QueryID ${query.id}: ${query.startAt} as startAt is an invalid date format`);
                }
            }
            else {
                handleErrWarn(`QueryID ${query.id}: It doesn't have enough data to be executed or scheduled`);
            }
        } catch (err) {
            handleErrWarn(`QueryID ${query.id||'(null)'}: startAt/endAt is an invalid date format (${err.message||''})`);
        }
        return false;
    },

    // Send an Email the results of the query executed
    async notify (query) {
                
        const queryValidation = ()  =>  {
            try {
                const validator = require('validator');
                let msgWarn = '';
                // Validate the query elements to notify via Email
                if (!query || !query.id) handleErrWarn(`Couldn't notify the query result due to the QueryID is null`);
                else if (!query.notifyTo || !validator.isEmail(query.notifyTo)) handleErrWarn(`Couldn't notify the query result due to the Email is invalid`);
                if (!validator.isEmpty(msgWarn)) {
                    handleErrWarn(msgWarn);
                    Promise.reject(msgWarn);
                }
                Promise.resolve(true);
            } catch (err) {
                Promise.reject(err);
            }
        }

        const sendNotification = new Promise( async (resolve,reject) => {
            try {
                const mailer = require('../utils/mailer');
                // In case the query execution was successful
                if(query.successful) {
                    await mailer.send({
                        to_recipients: query.notifyTo,
                        subject: `Subida de datos: ${process.env.COSMOSDB_DATABASE}.${query.to}${query.business?' ('+query.business.toUpperCase()+')':''}`,
                        html: `<h4 style="color:green;">La subida de los datos <u>${process.env.COSMOSDB_DATABASE}.${query.to}</u>${query.business?' del negocio '+query.business.toUpperCase()+' ':''} hacia la base de datos Cloud fue realizada con éxito.</h4>
                        <ul>
                            <li>QueryID: ${query.id||''}</li>
                            <li>Ejecutado: ${query.executedAt||''}</li>
                            <li>Terminado: ${query.finishedAt||''}</li>
                            <li>Tiempo de Ejecución: ${query.executionTime||''}</li>
                            <li>Resultados: ${query.executionResult||''}</li>
                        </ul>`
                    });
                }
                else {
                    await mailer.send({
                        to_recipients: query.notifyTo,
                        subject: `Error en subida de los datos: ${query.to}  (${query.business})`,
                        html: `<h4 style="color:red;">El proceso de subida de los datos <u>${query.to}</u> del negocio ${query.business} hacia la base de datos Cloud ha fallado.</h4>
                        <ul>
                            <li>QueryID: ${query.id||''}</li>
                            <li>Ejecutado: ${query.executedAt||''}</li>
                            <li>Terminado: ${query.finishedAt||''}</li>
                            <li>Tiempo de Ejecución: ${query.executionTime||''}</li>
                            <li>Resultados: ${query.executionResult||''}</li>
                        </ul>`
                    });
                }
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });

        // Process all promises
        Promise.all(
            queryValidation(),
            sendNotification()
        ).then(([validationResult, notificationResult]) => {
            if (notificationResult) {
                logger.printInfo(`✉️  ${moment().format('DD-MMM-YYYY HH:mm:ss')} QueryID ${query.id||'(null)'} has notified to the recipient Email: ${query.notifyTo}`, DEV_NODE_ENV);
            }
        }).catch(err=>{
            handleErrWarn(`${err.code||''} ${err.name||''} ${err.message||err||''}`, err);
            reject(err);
        });

    },

    // Call/Execute the SQL query into local database server
    callSqlQuery: async (sqlQuery) => {
        return new Promise( async (resolve, reject) => {
            try {
                if(sqlQuery && typeof(sqlQuery)==='string' ) {

                    // Run SQL-Query in the DB
                    const { sequelize } = require('../config/localdb');
                    const queryResult = await sequelize.query(sqlQuery, {type: sequelize.QueryTypes.EXEC });

                    // Resolve if query has data result
                    if(queryResult && queryResult[0] && queryResult[0].constructor.name=='Array') {
                        resolve(queryResult[0]);
                    }
                    else {
                        reject('Query failed');
                    }

                }
                else reject(`SQL query is empty`);

            } catch (err) {
                reject(err);
            }
        });
    },
    
    // Get the data by SQL-Query from the local database and then upload it to the contianer cloud
    queryAndUploadData: async (query) => {
        return new Promise( async (resolve, reject) => {
            if(!query) reject(`Query is not defined`);
            try {
                const Dao = require('../models/dao');
                const dao = new Dao(query.to);

                query.executedAt = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                
                // Query has the option set to wipe all data
                if(query.wipeData) {
                    // Delete all items of the container
                    logger.printVerbose(`📑 ${moment().format('YYYY-MM-DD HH:mm:ss')} Deleting all items of the ${query.to} container...`, DEV_NODE_ENV);
                    // TODO: Delete all items function
                    // const deletedCount = await whateverModel.deleteMany({});
                    logger.printVerbose(`♻ ${moment().format('YYYY-MM-DD HH:mm:ss')} All items data were deleted successfully`, DEV_NODE_ENV);
                    // console.log('\x1b[30m','deletedCount',deletedCount,'\x1b[0m');
                }

                // Execute the SQLDB-query to fetch the data
                logger.printInfo(`${moment().format('YYYY-MM-DD HH:mm:ss')} Executing the query...`, DEV_NODE_ENV);
                const rows = await self.callSqlQuery(query.sqlQuery);
                logger.printSuccess(`${moment().format('YYYY-MM-DD HH:mm:ss')} Query executed successfully (${rows.length} rows)`, DEV_NODE_ENV);

                // Upload the query result data as items to the cloud container
                logger.printVerbose(`📝 ${moment().format('YYYY-MM-DD HH:mm:ss')} Uploading query result data to ${query.to} container...`, DEV_NODE_ENV);
                let itemsUploaded = 0;
                // It's an valid and not null array
                if( rows && Array.isArray(rows) && rows.length>=0 ) {
                    try {
                        // Upload each row from the query result to the Cloud-DB through the bulk upsert items function
                        itemsUploaded = await dao.bulkUpsert(rows);
                        // // Loop for each query result row to upload its data through the upsert item function
                        // rows.forEach(row => {
                        //     dao.upsertItem(row);
                        //     itemsUploaded++;
                        // });
                        logger.printSuccess(`${moment().format('YYYY-MM-DD HH:mm:ss')} ${query.to} container data uploaded successfully. Items uploaded: ${itemsUploaded}`, DEV_NODE_ENV);
                    } catch (error) {
                        logger.printWarning(`${moment().format('YYYY-MM-DD HH:mm:ss')} ${query.to} container data uploading failed with only ${itemsUploaded} items uploaded`, DEV_NODE_ENV);
                        logger.logError(error);
                    }
                }

                // Set the result of the query execution
                const queryResult = {
                    ... query,
                    executedAt: query.executedAt,
                    finishedAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    executionTime: `${moment().diff(query.executedAt,'seconds',true)} seconds`,
                    successful: typeof(itemsUploaded)==='number',
                    executionResult: itemsUploaded ? `Items uploaded: ${itemsUploaded||'0'}` : `Data uploading failed`,
                    updatedAt: moment().utcOffset(process.env.UTC).format('YYYY-MM-DD HH:mm:ss.SSS'),
                }

                // Update the Query with the current and result data in the Cloud-DB
                await dao.updateItem(queryResult);

                // Set the Query with the current and result data into the local JSON-DB
                const jsonDB = require('../config/jsondb');
                jsonDB.set(`/queries/${query.id}`, queryResult);
                
                resolve(queryResult);

            } catch (err) {
                // logger.printError(err);
                reject(err);
            }
        });
    },

    // Execute the Query
    executeQuery (query) {
        if(query) return new Promise( async (resolve, reject) => {
            try {
                // Try to execute the specified query and get the results
                const queryResult = await self.queryAndUploadData(query);
                if(DEV_NODE_ENV) logger.printSuccess(`QueryID ${query.id} uploading results: ${queryResult}`);

                // Notify the results when Email is defined
                if(query.notifyTo) await self.notify(queryResult);

                // Resolve the query execution with the results
                resolve(queryResult);

            } catch (err) {
                query.successful = false;
                query.executionResult = `${err.code||''} ${err.name||''} ${err.message||''}`;
                // Notify the results as a query failed when Email is defined
                if(query.notifyTo) self.notify(query);
                // Reject the query execution with the error
                reject(err);
            }
        });
        return false;
    },

    // Schedule the Query
    scheduleQuery (query) {
        return new Promise( async (resolve, reject) => {
            try {
                // Import Node-Cron to schedule tasks
                const cron = require('node-cron');
                let cronTask;

                // Validate if the Query is not empty
                if (!query || !query.id) handleErrWarn(`Query is not valid: ID is empty`);
                // Validate if the Query has a valid cronjob expression format
                else if (!query.cronExpression || !cron.validate(query.cronExpression)) handleErrWarn(`Query ${query.id} has ${query.cronExpression} as cronjob and this is not a valid expression`);
                // in case the Query is valid
                else {
                    
                    // Schedule a task to run according to the specific cron expresion format
                    cronTask = cron.schedule(
                        query.cronExpression,
                        // Task to run
                        async () => {
                            if(DEV_NODE_ENV) console.group('\x1b[45m',`${moment().format('DD-MMM-YYYY HH:mm:ss')} CRON: Task to execute the query is running...`,'\x1b[0m');
                            try {
                                
                                // Import JSON Database
                                const jsonDB = require('../config/jsondb');
                                // Get the SQL-query from local JSON-DB
                                const storedQuery = jsonDB.get(`/queries/${query.id}`);

                                // Validate if the query must be executed
                                if( self.mustBeExecuted(storedQuery) ) {
                                    logger.printVerbose(`QueryID ${storedQuery.id} must be executed`, DEV_NODE_ENV);
                                    // Execute the Query
                                    await self.executeQuery(storedQuery);
                                }
                                else logger.printVerbose(`QueryID ${storedQuery.id} must NOT be executed`, DEV_NODE_ENV);
                            } catch (err) {
                                logger.logError(err);
                                reject(err);
                            }
                            if(DEV_NODE_ENV) { logger.logVerbose(`${moment().format('DD-MMM-YYYY HH:mm:ss')} CRON: Query task execution finished`); console.groupEnd(); }
                        },
                        {
                            scheduled: true, // A boolean to set if the created task is scheduled. Default true;
                            timezone: `${process.env.TZ}` // The timezone that is used for job scheduling. See moment-timezone for valid values.
                        }
                    );
                }
                resolve(cronTask);
            } catch (err) {
                handleErrWarn(`Query ID ${query.id}: ${err.code||''} ${err.name||''} ${err.message||err||''}`, err);
                reject(err);
            }
        });
    },

    // Run the process to fetch and/or execute all queries that are into the Cloud-DB
    runProcessCloudQueries: async () => {
        return new Promise( async (resolve, reject) => {
            try {
                // Import the Data Access Object for the Queries
                const QueryDao = require('../models/query_dao');
                const queryDao = new QueryDao();

                // Find and get all the enabled queries that are stored in the Cloud-DB by Business Code
                const queries = await queryDao.findEnabledQueries(process.env.BUSINESS_CODE);
                logger.printInfo(`Queries found: ${queries.length}`, DEV_NODE_ENV);

                // Validate if the queries-data is an Array and it's not empty
                if(queries && Array.isArray(queries) && queries.length>0) {

                    // Import JSON Database
                    const jsonDB = require('../config/jsondb');
                    
                    // Process each query found
                    queries.forEach( async (query) => {
                        try {
                            if(DEV_NODE_ENV) { console.groupEnd(); console.group('\x1b[30m','QueryID',query.id,'\x1b[0m'); }
                            // Validate if the query must be executed or not
                            if( self.mustBeExecuted(query) ) {
                                // Validate if it will be a cronjob
                                if(query.cronExpression) {
                                    // Schedule the Query execution if this doesn't exist in JSON local-db
                                    if( !jsonDB.get('/queries/'+query.id) ) {
                                        // Schedule the Query to the processes
                                        await self.scheduleQuery(query);
                                        // Set the Query as scheduled in the CloudDB
                                        queryDao.updateAsScheduled({id: query.id}).catch(err=>{
                                            logger.logWarning(`QueryID ${query.id}: Couldn't update it as scheduled: ${err.code||''} ${err.name||''} ${err.message||err||''}`);
                                        });
                                        logger.printVerbose(`🕒 QueryID ${query.id} scheduled`, DEV_NODE_ENV);
                                    }
                                    else { // Query already exists in the local JSON-DB thus it's scheduled
                                        logger.printVerbose(`🕙 QueryID ${query.id} is already scheduled`, DEV_NODE_ENV);
                                    }
                                    // Set the Query data in the local JSON-DB (Upsert new query data)
                                    jsonDB.set('/queries/'+query.id, query);
                                }
                                // If the Query is not a cronjob and it hasn't been executed, only then execute it
                                else if (query.executedAt===null || query.executedAt===undefined
                                    || (typeof query.executedAt==='string' && query.executedAt==='') )
                                {
                                    // Execute the Query
                                    await self.executeQuery(query);
                                }
                            }
                            // TODO: missing test next
                            // The query must not be executed but already exists in the local JSON-DB, so then update its data
                            else if( jsonDB.get(`/queries/${query.id}`) ) {
                                // Update the Query data in the local JSON-DB
                                jsonDB.set(`/queries/`+query.id, query);
                            }
                        } catch(err) {
                            reject(err);
                        }
                    });
                }
                else {
                    handleErrWarn(`No queries from the Cloud DB❕`);
                }
                // Resolve with all the queries
                resolve(queries);
                
            } catch (err) {
                reject(err);
            }
        });
    }
}