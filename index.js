const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});


const app = express();
const port = 3000;


db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL database');
});


app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/api/signup', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const sql = 'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?,?)';
    db.query(sql, [firstName, lastName, email, password], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: 'User registered successfully', user: { firstName, lastName, email } });
        }
    });
});



app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log('User logged in successfully');
        res.json({ message: 'User logged in successfully', user: result[0] });
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


