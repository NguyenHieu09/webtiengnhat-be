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
INSERT INTO users (firstName, lastName, email, password, role)
VALUES ('Admin', 'User', 'admin@gmail.com', '123', 'admin');

DROP TABLE IF EXISTS users;

select * from users;

SELECT * FROM users WHERE email = 'hieu92145@gmail.com' AND password = 123