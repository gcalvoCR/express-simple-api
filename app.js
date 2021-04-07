"use strict";
const express = require('express');
var path = require('path');

const indexRouter = require('./routes/index');
const todosRouter = require('./routes/todos');
const usersRouter = require('./routes/users');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain)
app.use('/', indexRouter);
app.use(usersRouter)
app.use(todosRouter)

let port = process.env.PORT || 3000;

app.listen(port, function() {
console.log(`Server listening on port ${port}`)
});
