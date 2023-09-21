-- Create a new database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS forgechange;

-- Use the newly created database
USE forgechange;

-- Create a "users" table to store user information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);
