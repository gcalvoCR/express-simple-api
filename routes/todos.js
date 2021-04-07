const express = require('express');
const DB = require('../db');
const router = express.Router();
const db = new DB("sqlitedb")

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

module.exports = router;
