"use strict";
const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateJWT = (req, res, next) => {
    if(config.secured){
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const accessTokenSecret = config.secret;

            jwt.verify(token, accessTokenSecret, (err, user) => {
                if (err) {
                    console.log(`Forbidden request`)
                    return res.status(403).json({message: "You are not welcome here"}); 
                }
                req.user = user;
                next();
            });
            
        } else {
            console.log(`Unauthorized request`)
            return res.sendStatus(401);
        }
    } else{
        next();
    }
};

module.exports = authenticateJWT;
