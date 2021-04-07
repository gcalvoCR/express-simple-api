"use strict";
const sqlite3 = require('sqlite3').verbose();

class Db {
    constructor(file) {
        this.db = new sqlite3.Database(file);
        this.createTableUsers()
        this.createTableTodos()
    }

    createTableUsers() {
        const sql = `
            CREATE TABLE IF NOT EXISTS user (
                id integer PRIMARY KEY,
                name text,
                email text UNIQUE,
                user_pass text,
                is_admin integer);`
        return this.db.run(sql);
    }

    createTableTodos() {
        const sql = `
            CREATE TABLE IF NOT EXISTS todos (
                id integer PRIMARY KEY,
                userId integer,
                title text,
                completed integer);`
        return this.db.run(sql);
    }

    selectByEmail(email, callback) {
        return this.db.get(
            `SELECT * FROM user WHERE email = ?`,
            [email],
            (err,row) => {callback(err,row)}
        )
    }

    insertAdmin(user, callback) {
        return this.db.run(
            'INSERT INTO user (name,email,user_pass,is_admin) VALUES (?,?,?,?)',
            user, 
            (err) => {callback(err)}
        )
    }

    selectAllUsers(callback) {
        this.db.all(
            'SELECT * FROM user', 
            (err,rows) =>{callback(err,rows)}
        )
    }

    insertUser(user, callback) {
        this.db.run(
            'INSERT INTO user (name,email,user_pass) VALUES (?,?,?)',
            user, (err) => {callback(err)}
        )
    }

    // #region *********************   Todos section ********************************** 
    insertTodo(data, callback) {
        this.db.run(
            'INSERT INTO todos (userId,title,completed) VALUES (?,?,?)',
            data, 
            function (err) {callback(err, this.lastID)}
        )
    }

    selectAllTodos(callback) {
        this.db.all(
            'SELECT * FROM todos', 
            (err,rows) =>{callback(err,rows)}
        )
    }

    selectTodo(id, callback) {
        this.db.get(
            'SELECT * FROM todos WHERE id=?', 
            id, 
            (err,row) =>{callback(err,row)}
        )
    }

    filterTodos(limit, callback) {
        this.db.all(
            'SELECT * FROM todos LIMIT ?', 
            limit,
            function(err,rows){callback(err,rows)}
        )
    }

    updateTodo(data, callback) {
        this.db.run(
            'UPDATE todos SET title=?, completed=? WHERE id=?', 
            data, 
            (err) =>{callback(err)}
        )
    }

    deleteTodo(data, callback) {
        this.db.run(
            'DELETE FROM todos WHERE id=?', 
            data, 
            (err) =>{callback(err)}
        )
    }

    // #endregion
}

module.exports = Db