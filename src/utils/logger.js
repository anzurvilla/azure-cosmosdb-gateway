'use strict';

// Import dotEnv config
const path = require('path');
require('dotenv').config({path: path.resolve('.env')});

const colors = require('colors');
const moment = require('moment');
moment.locale(process.env.DATETIME_LOCALE);
// Import logger packages
const winston = require('winston');
require('winston-daily-rotate-file');

try {
    const transport = new winston.transports.DailyRotateFile({
        filename: path.join(path.resolve(),'logs/%DATE%.log'),
        datePattern: process.env.LOGGER_DATE_PATTERN,
        zippedArchive: true,
        maxSize: process.env.LOGGER_MAX_SIZE,
        maxFiles: process.env.LOGGER_MAX_FILES
    });
    transport.on('error', function(newFilename) {
        console.log(colors.green(`${moment.utc().local().format('DD-MMM-YYYY HH:mm:ss')} Logger: The new file ${newFilename} was created`));
    });
/* 
    transport.on('new', function(newFilename) {
        console.log(colors.green(`${moment.utc().local().format('DD-MMM-YYYY HH:mm:ss')} Logger: The new file ${newFilename} was created`));
    });
    transport.on('rotate', function(oldFilename, newFilename) {
        console.info(colors.blue(`${moment.utc().local().format('DD-MMM-YYYY HH:mm:ss')} Logger: The files ${oldFilename} / ${newFilename} were rotated`));
    });
    transport.on('archive', function(zipFilename) {
        console.log(colors.blue(`${moment.utc().local().format('DD-MMM-YYYY HH:mm:ss')} Logger: The file ${zipFilename} was zipped`));
    });
    transport.on('logRemoved', function(removedFilename) {
        console.warn(colors.yellow(`${moment.utc().local().format('DD-MMM-YYYY HH:mm:ss')} Logger: The file ${removedFilename} was removed`));
    });
*/
    const logger = winston.createLogger({
        transports: [ transport ]
    });

/*
    Colors reference

Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
*/

    module.exports = {
        ...logger,
        logInfo: (message, printConsole=true) => {
            if(printConsole) console.info(colors.cyan(`💠 `, message)); // https://fbemojis.com/
            logger.info({datetime: moment().format('YYYY-MM-DD HH:mm:ss'), message});
        },
        logVerbose: (message, printConsole=true) => {
            if(printConsole) console.info(colors.magenta(`🔮 `, message)); // https://fbemojis.com/
            logger.verbose({datetime: moment().format('YYYY-MM-DD HH:mm:ss'), message});
        },
        logWarning: (message, printConsole=true) => {
            if(printConsole) console.warn(colors.yellow(`⚠️ `,message));
            logger.warn({datetime: moment().format('YYYY-MM-DD HH:mm:ss'), message});
        },
        logError: (err, printConsole=true) => {
            // const msgErr = `${err.code||''} ${err.name||''} ${err.message||err||''}`;
            if(printConsole) console.error(colors.red(`💢 ERROR`,`[ ${moment().format('DD-MMM-YYYY HH:mm:ss')} ] =>`), colors.red(err));
            logger.error({datetime: moment().format('YYYY-MM-DD HH:mm:ss'), message: err.stack});
        },
        printVerbose: (message, printConsole=true) => {
            if(printConsole) console.log(colors.blue(message)); // https://fbemojis.com/
        },
        printInfo: (message, printConsole=true) => {
            if(printConsole) console.info(`💠 `, colors.cyan(message)); // https://fbemojis.com/
        },
        printSuccess: (message, printConsole=true) => {
            if(printConsole) console.info(colors.green(`✔`, message)); // https://fbemojis.com/  ✔
        },
        printWarning: (message, printConsole=true) => {
            if(printConsole) console.warn(colors.yellow(`⚡️`, message)); // https://fbemojis.com/    
        },
        printError: (message, printConsole=true) => {
            if(printConsole) console.error(colors.red(`⭕️`, message)); // https://fbemojis.com/
        },
    }

} catch(err) {
    console.error(colors.red(`${moment.utc().local().format('DD-MMM-YYYY HH:mm:ss')}`), colors.red(err));
}