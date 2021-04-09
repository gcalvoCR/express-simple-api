const express = require('express');
const DB = require('../../db');
const router = express.Router();
const db = new DB("sqlitedb")

// #region Todos

// Create todo
router.post('/', (req, res) => {
    if(!req.body.title){
        return res.status(400).json({message: "Bad request, check your request body."});
    }

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
            return res.status(200).send(todo);
        }
    });
});

// Read and filter todos
router.get('/', (req, res) => {
    console.log(req.headers.authorization)
    if(req.query.limit){
        db.filterTodos([req.query.limit],(err, todos) => {
            if (err) return res.status(500).send({message: "Error on the server."});
            res.status(200).send(todos);
        });
    } else{
        db.selectAllTodos((err, todos) => {
            if (err) return res.status(500).send({message: "Error on the server."});
            res.status(200).send(todos);
        });
    }
})


// Read todo
router.get('/:id', (req, res) => {
    db.selectTodo(req.params.id, (err, todo) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        if (!todo) return res.status(404).send({message: `Todo with id ${req.params.id} not found.`});
        res.status(200).send(todo);
    });
})

// Update todo
router.put('/:id', (req, res) => {
    db.selectTodo(req.params.id, (err, todo) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        if (!todo) {
            return res.status(404).send({message: `Todo with id ${req.params.id} not found.`});
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
router.delete('/:id', (req, res) => {
    db.selectTodo(req.params.id, (err, todo) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        if (!todo) {
            return res.status(404).send({message: `Todo with id ${req.params.id} not found.`});
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
