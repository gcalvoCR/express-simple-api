
"use strict";
const moment = require('moment');

const logger = (req, res, next) =>{
    console.log(`[${req.method}]\t${req.protocol}://${req.get('host')}${req.originalUrl}\t${moment().format()}`)
    next();
}

module.exports = logger;
