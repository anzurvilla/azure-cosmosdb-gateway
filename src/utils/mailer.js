'use strict';

// Import dotEnv config
require('dotenv').config({path: require('path').resolve('.env')});

// Import Node-Mailer
const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    requireTLS: process.env.MAIL_TLS==='true' ? true : false,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        // secure: false,
        // ignoreTLS: true,
        rejectUnauthorized: false
    }
});

module.exports={

    // Send a mail containing html or text
    send: (options) => {
        return new Promise( (resolve, reject) => {
            try {
                // Validate that recipients to whom the mail is sent must not be empty or null
                if(!options || !options.to_recipients || options.to_recipients=='') reject('Recipients must be defined');
                // Set the mail options
                const mailOptions = {
                    from: process.env.MAIL_SENDER,
                    to: options.to_recipients,
                    cc: options.cc_recipients,
                    bcc: options.bcc_recipients,
                    subject: options.subject||'',
                    html: options.html||null,
                    text: options.text||null,
                }
                // Send the mail with defined transport object
                transporter.sendMail(mailOptions, (err, info)=>{
                    if (err) reject(err);
                    else resolve(info);
                });
            } catch (err) {
                reject(err);
            }
        });
    },
    
    
}
