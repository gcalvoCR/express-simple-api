const express = require('express');
const DB = require('../../db');
const config = require('../../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
let db = new DB("sqlitedb")

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
    db.selectAllUsers((err, users) => {
        if (err) return res.status(500).send({message: "Error on the server."});
        res.status(200).send(users);
    });
})
// #endregion

module.exports = router;


