const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    port: '3307',
    user: 'root',
    password: 'sapassword',
    database: 'webjapan'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL database');
});

// Use db to make queries to your database

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint API để xử lý đăng kí
app.post('/api/signup', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    // Thêm dữ liệu vào cơ sở dữ liệu
    const sql = 'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?,?)';
    db.query(sql, [firstName, lastName, email, password], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: 'User registered successfully' });
        }
    });
});


// Tuyến đường đăng nhập
app.post('/login', (req, res) => {
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
        res.json({ message: 'User logged in successfully' });
    });
});

app.get('/api/data', (req, res) => {
    res.json({ message: 'Hello from server!' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


