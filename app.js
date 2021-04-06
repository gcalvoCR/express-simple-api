"use strict";
const express = require('express');
const DB = require('./db');
const config = require('./config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = new DB("sqlitedb")
const app = express();
const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain)


// #region Users
router.post('/register', function(req, res) {
    db.insert([
        req.body.name,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8)
    ],
    function (err) {
        if (err) return res.status(500).send({message: "Error on the server."})
        db.selectByEmail(req.body.email, (err,user) => {
            if (err) return res.status(500).send({message: "Error on the server."})
            let token = jwt.sign({ id: user.id }, config.secret, {expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({ auth: true, token: token, user: user });
        });
    });
});

router.post('/register-admin', (req, res) => {
    db.insertAdmin([
        req.body.name,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8),
        1
    ],
    function (err) {
        if (err) return res.status(500).send({message: "Error on the server."})
        db.selectByEmail(req.body.email, (err,user) => {
            if (err) return res.status(500).send("There was a problem getting user")
            let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({ auth: true, token: token, user: user });
        });
    });
});

router.post('/login', (req, res) => {
    db.selectByEmail(req.body.email, (err, user) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        if (!user) return res.status(404).send({message: 'No user found.'});
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.user_pass);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, user: user });
    });
})

router.get('/users', (req, res) => {
    db.selectAll((err, users) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        res.status(200).send({message: users });
    });
})
// #endregion

// #region Todos

// Create todo
router.post('/todos', (req, res) => {
    db.insertTodo([1, req.body.title, req.body.completed],
    (err, id) => {
        if (err) {
            return res.status(500).send({message: "There was a problem creating the todo item."})
        } else{
            console.log(`todo with id: ${id} created`)
            let todo = {
                id,
                userId: 1,
                title: req.body.title,
                completed: req.body.completed
            }
            res.status(200).send(todo);
        }
    });
});

// Read todos
router.get('/todos', (req, res) => {
    db.selectAllTodos((err, todos) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        res.status(200).send(todos);
    });
})

// Read todo
router.get('/todos/:id', (req, res) => {
    db.selectTodo(req.params.id, (err, todo) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        if (!todo) return res.status(404).send({message: "Todo not found."});
        res.status(200).send(todo);
    });
})

// Update todo
router.put('/todos/:id', (req, res) => {
    db.selectTodo(req.params.id, (err, todo) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        if (!todo) {
            return res.status(404).send({message: "Todo not found."});
        } else {
            db.updateTodo([
                req.body.title,
                req.body.completed,
                req.params.id   
            ],
            (err) =>{
                if (err) return res.status(500).send({message: "There was a problem updating the todo item."})
                res.status(200).send(todo);
            });
        }   
    });
})

// Delete todo
router.delete('/todos/:id', (req, res) => {
    db.selectTodo(req.params.id, (err, todo) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        if (!todo) {
            return res.status(404).send({message: "Todo not found."});
        } else {
            db.deleteTodo([
                req.params.id
            ], 
            (err) => {
                if (err) return res.status(500).send({message: "Error on the server."});
                res.status(200).send({message: "todo deleted"});
            });
        }   
    });

})

// #endregion

app.use(router)

let port = process.env.PORT || 3000;

app.listen(port, function() {
console.log(`Server listening on port ${port}`)
});
