"use strict";
const express = require('express');
const path = require('path');
const logger = require('./middleware/logger')
const authenticateJWT = require('./middleware/authentication')

const indexRouter = require('./routes/index');
const todosRouter = require('./routes/api/todos');
const usersRouter = require('./routes/api/users');

const app = express();

// Body Parser Middleware to parse request bodies
app.use(express.json());

// To handle encoded data
app.use(express.urlencoded({extended: true }));

// CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(allowCrossDomain)
app.use(logger);
app.use('/', indexRouter);
app.use(usersRouter)
app.use('/todos', authenticateJWT, todosRouter)

let port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log(`Server listening on port ${port}`)
});
