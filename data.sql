CREATE DATABASE webjapan;
USE webjapan;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50),
	lastName VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    role ENUM('user', 'admin', 'editer') NOT NULL DEFAULT 'user'
);

DROP TABLE IF EXISTS users;

select * from users;

SELECT * FROM users WHERE email = 'hieu92145@gmail.com' AND password = 123



ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sapassword';
FLUSH PRIVILEGES;