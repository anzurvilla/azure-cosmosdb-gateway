'use strict';

// Import dotEnv config
require('dotenv').config({path: require('path').resolve('.env')});

const {Sequelize, DataTypes, Op, QueryTypes} = require('sequelize');

const sequelize = new Sequelize(
    process.env.LOCALDB_DATABASE,
    process.env.LOCALDB_USERNAME,
    process.env.LOCALDB_PASSWORD,
    {
        dialect: process.env.LOCALDB_DIALECT, // dialects: mariadb, mysql, mssql, postgres, sqlite
        host: process.env.LOCALDB_HOST,
        port: process.env.LOCALDB_PORT,
        // native: false, // default: false
        // ssl: true, // default: true
        pool: {
            max: 100,
            min: 0,
            acquire: 300000,
            idle: 300000
        },
        dialectOptions: {
            options: {
                // instanceName: process.env.LOCALDB_INSTANCE, // MSSQL Server sometimes doesn't support it
                // Enable this if MSSQL server connection gets an error due to its TLS settings (that usually happens in versions less than 2012)
                cryptoCredentialsDetails: {
                    minVersion: 'TLSv1' // TLS 1.0 and TLS 1.1 are no longer secure, but set it up like this if the MSSQL Server doesn't support TLSv1.2
                },
                // encrypt: true, // default: true
                // trustedConnection: true, // default: true
                connectTimeout: 300000,
                requestTimeout: 300000,
                cancelTimeout: 300000
            },
        },
        define: {
            // underscored: false,
            freezeTableName: true,
            paranoid: false,
            // charset: 'utf8',
            // dialectOptions: {
            //     collate: 'utf8_general_ci'
            // },
            timestamps: false
        },
        logging: process.env.LOCALDB_CONSOLE_LOG=='true' ? console.log : false // defualt: console.log
    },
);

module.exports = {sequelize, DataTypes, Op, QueryTypes};