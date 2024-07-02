const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
    // host: process.env.MYSQL_ADDON_HOST,
    // user: process.env.MYSQL_ADDON_USER,
    // password: process.env.MYSQL_ADDON_PASSWORD,
    // database: process.env.MYSQL_ADDON_DB
});


const app = express();
const port = 3000;


db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL database');
});


// Cấu hình Cloudinary với thông tin tài khoản của bạn
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
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


// app.post('/upload-image', upload.single('image'), async (req, res) => {
//     try {
//         const imagePath = req.file.path;
//         const result = await cloudinary.uploader.upload(imagePath, { folder: "your_folder_name" });

//         // Xóa file tạm thời sau khi upload thành công
//         fs.unlinkSync(imagePath);

//         res.status(200).json({ message: 'Hình ảnh đã được tải lên thành công!', url: result.url });
//     } catch (error) {
//         res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên hình ảnh', error: error.message });
//     }
// });

app.post('/api/posts', upload.single('image'), async (req, res) => {
    try {
        const { title, type, content, user_id } = req.body;
        const imagePath = req.file.path;

        // Upload hình ảnh lên Cloudinary
        const cloudinaryUpload = await cloudinary.uploader.upload(imagePath, { folder: "your_folder_name" });

        // Xóa file tạm thời sau khi upload thành công
        fs.unlinkSync(imagePath);

        // Lưu thông tin bài post vào MySQL
        const sql = 'INSERT INTO posts (title, type, img, content, user_id) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [title, type, cloudinaryUpload.secure_url, content, user_id], (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(200).json({ message: 'Bài post đã được tạo thành công!', post: { title, type, img: cloudinaryUpload.secure_url, content, user_id } });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo bài post', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


