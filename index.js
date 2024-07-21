const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const { log } = require('console');
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

//xử lý đăng kí
app.post('/api/signup', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const sql = 'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?,?)';
    db.query(sql, [firstName, lastName, email, password], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: 'Chúc mừng bạn đã đăng kí thành công!', user: { firstName, lastName, email } });
        }
    });
});


//xử lý đăng nhập
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.length === 0) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không khớp' });
        }
        console.log('User logged in successfully');
        res.json({ message: 'User logged in successfully', user: result[0] });
    });
});
//chỉnh sửa bài viết
app.put('/api/posts/:id', upload.single('image'), async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, type, content, subtype } = req.body;

        let updatedImgUrl = null;

        if (req.file) {
            const imagePath = req.file.path;

            // Upload hình ảnh mới lên Cloudinary
            const cloudinaryUpload = await cloudinary.uploader.upload(imagePath, { folder: "your_folder_name" });

            // Xóa file tạm thời sau khi upload thành công
            fs.unlinkSync(imagePath);

            updatedImgUrl = cloudinaryUpload.secure_url;
        }

        // SQL query để cập nhật bài post trong cơ sở dữ liệu
        const sqlUpdate = 'UPDATE posts SET title = ?, type = ?,subtype=?,  content = ?, img = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?';
        const updateParams = [title, type, subtype, content, updatedImgUrl, postId];


        db.query(sqlUpdate, updateParams, (err, result) => {
            if (err) {
                console.error('Error updating post:', err.message);
                return res.status(500).json({ error: 'Error updating post' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.status(200).json({
                message: 'Post updated successfully',
                updatedPost: { id: postId, title, type, subtype, content, img: updatedImgUrl, created_at: new Date().toISOString() }
            });

        });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật bài post', error: error.message });
    }
});

//thêm bài viết
app.post('/api/posts', upload.single('image'), async (req, res) => {
    try {
        const { title, type, subtype, content, user_id } = req.body;
        const imagePath = req.file.path;

        // Upload hình ảnh lên Cloudinary
        const cloudinaryUpload = await cloudinary.uploader.upload(imagePath, { folder: "your_folder_name" });

        // Xóa file tạm thời sau khi upload thành công
        fs.unlinkSync(imagePath);

        // Lưu thông tin bài post vào MySQL
        const sql = 'INSERT INTO posts (title, type, subtype, img, content, user_id) VALUES (?, ?, ?, ?, ?,?)';
        db.query(sql, [title, type, subtype, cloudinaryUpload.secure_url, content, user_id], (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                const postId = result.insertId; // Lấy id của bài post vừa được tạo
                res.status(200).json({ message: 'Bài post đã được tạo thành công!', post: { id: postId, title, type, subtype, img: cloudinaryUpload.secure_url, content, user_id } });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo bài post', error: error.message });
    }
});

//lấy bài viết theo id
app.get('/api/posts/:id', (req, res) => {
    const postId = req.params.id;
    const sql = 'SELECT * FROM posts WHERE id = ?';

    db.query(sql, [postId], (err, results) => {
        if (err) {
            console.error('Error retrieving post:', err.message);
            return res.status(500).json({ error: 'Error retrieving post' });
        }
        if (results.length > 0) {
            const post = results[0];
            res.status(200).json({ post });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    });
});

//xóa bài viết
app.delete('/api/posts/:id', (req, res) => {
    const postId = req.params.id;
    const sql = 'DELETE FROM posts WHERE id = ?';

    db.query(sql, [postId], (err, result) => {
        if (err) {
            console.error('Error deleting post:', err.message);
            return res.status(500).json({ error: 'Error deleting post' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    });
});


//lấy 100 bài post theo 'type', sắp xếp theo thời gian tạo giảm dần
app.get('/api/type/posts', (req, res) => {
    const { type } = req.query; // Lấy 'type' từ query parameters

    // SQL query để lấy 100 bài post theo 'type', sắp xếp theo thời gian tạo giảm dần
    const sql = 'SELECT * FROM posts WHERE type = ? ORDER BY created_at DESC LIMIT 100';

    db.query(sql, [type], (err, results) => {
        if (err) {
            console.error('Error retrieving posts:', err.message);
            return res.status(500).json({ error: 'Error retrieving posts' });
        }
        res.status(200).json({ posts: results });
    });
});


//đếm số lượng bài viết
app.get('/api/count-post-by-type', (req, res) => {
    const sql = 'SELECT type, COUNT(*) AS total_posts FROM posts GROUP BY type';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving post counts by type:', err.message);
            return res.status(500).json({ error: 'Error retrieving post counts by type' });
        }
        // Kiểm tra nếu không có bài viết nào được tìm thấy
        if (results.length === 0) {
            return res.status(404).json({ error: 'No posts found' });
        }
        // Trả về kết quả dưới dạng JSON
        res.status(200).json({ counts: results });
    });
});


app.get('/api/types', (req, res) => {
    const query = 'SELECT DISTINCT `type` FROM `posts`';

    db.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});



app.get('/api/subtypes/:type', (req, res) => {
    const type = req.params.type;
    const query = 'SELECT distinct `subtype` FROM `posts` WHERE `type` = ?';

    db.query(query, [type], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// Route để lấy danh sách các bài viết theo subtype
// app.get('/api/post-by-subtype', (req, res) => {
//     const subtype = req.query.subtype;

//     // Kiểm tra xem subtype có được cung cấp không
//     if (!subtype) {
//         return res.status(400).json({ error: 'Missing subtype parameter' });
//     }

//     // Sử dụng COLLATE để thực hiện tìm kiếm không phân biệt chữ hoa chữ thường
//     const query = 'SELECT * FROM `posts` WHERE LOWER(`subtype`) = LOWER(?)';

//     db.query(query, [subtype], (error, results) => {
//         if (error) {
//             res.status(500).json({ error: 'Internal Server Error' });
//         } else {
//             res.json(results);
//         }
//     });
// });


// Load bài post theo type và subtype
app.get('/api/subtype-posts', (req, res) => {
    const type = req.query.type;
    const subtype = req.query.subtype;
    let query = 'SELECT * FROM `posts` WHERE 1=1';
    const params = [];

    if (type) {
        query += ' AND LOWER(`type`) = LOWER(?)';
        params.push(type.toLowerCase());
    }

    if (subtype) {
        query += ' AND LOWER(`subtype`) = LOWER(?)';
        params.push(subtype.toLowerCase());
    }

    db.query(query, params, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});


app.get('/api/posts-by-subtype', (req, res) => {
    const subtype = req.query.subtype;
    const page = parseInt(req.query.page) || 1;
    const limit = 4; // số lượng bài post trên mỗi trang
    const offset = (page - 1) * limit;

    console.log(`subtype: ${subtype}, page: ${page}, limit: ${limit}, offset: ${offset}`); // Debugging info

    const query = `
        SELECT * FROM posts 
        WHERE subtype = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?;
    `;

    db.query(query, [subtype, limit, offset], (error, results) => {
        if (error) {
            console.error(`Database query error: ${error}`); // Debugging info
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const countQuery = 'SELECT COUNT(*) AS total FROM posts WHERE subtype = ?';
            db.query(countQuery, [subtype], (countError, countResults) => {
                if (countError) {
                    console.error(`Count query error: ${countError}`); // Debugging info
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    const totalPosts = countResults[0].total;
                    res.json({ posts: results, totalPosts });
                }
            });
        }
    });
});





app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


