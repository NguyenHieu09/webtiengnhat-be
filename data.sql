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

CREATE TABLE `registration_form` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `topic` VARCHAR(255),
    `fullName` VARCHAR(255),
    `phone` VARCHAR(255),
    `address` VARCHAR(255),
    `question` VARCHAR(255),
    `user_id` INT,
     FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

-- Bảng bài đăng (posts)
CREATE TABLE `posts` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255), -- Chú ý là title, không phải titile
    `type` ENUM('KH', 'DH', 'KS', 'XKLD', 'TD'),
    `img` VARCHAR(255),
    `content` TEXT,
    `user_id` INT,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);


ALTER TABLE `posts`
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE `posts` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255), -- Chú ý là title, không phải titile
    `type` ENUM('KH', 'DH', 'KS', 'XKLD', 'TD'),
    `img` VARCHAR(255),
    `content` TEXT,
    `user_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

SELECT type, COUNT(*) as total_posts FROM posts GROUP BY type;

ALTER TABLE `posts`
ADD COLUMN `subtype` VARCHAR(100) AFTER `type`;

ALTER TABLE posts MODIFY COLUMN content LONGTEXT;

INSERT INTO users (firstName, lastName, email, password, role)
VALUES ('Admin', 'User', 'admin@gmail.com', '123', 'admin');

DROP TABLE IF EXISTS users;

select * from users;

SELECT * FROM users WHERE email = 'hieu92145@gmail.com' AND password = 123