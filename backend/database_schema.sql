-- AgriPredic MySQL Schema
-- Note: The backend uses SQLAlchemy and will auto-create these tables on
-- first run (against SQLite by default, or MySQL if you set DB_URL in .env).
-- This file is provided for reference / manual DB provisioning.

CREATE DATABASE IF NOT EXISTS agripredic CHARACTER SET utf8mb4;
USE agripredic;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    location VARCHAR(150),
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'farmer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    crop VARCHAR(100) NOT NULL,
    severity_default VARCHAR(20) DEFAULT 'Medium',
    treatment TEXT,
    fertilizer TEXT,
    prevention TEXT
);

CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    image_path VARCHAR(255) NOT NULL,
    disease_name VARCHAR(150) NOT NULL,
    disease_name_mr VARCHAR(150),
    crop VARCHAR(100),
    confidence FLOAT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    treatment TEXT,
    fertilizer TEXT,
    prevention TEXT,
    treatment_mr TEXT,
    fertilizer_mr TEXT,
    prevention_mr TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE weather_risk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    location VARCHAR(150) NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    rainfall FLOAT,
    risk_level VARCHAR(20) NOT NULL,
    risk_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(30) DEFAULT 'alert',
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
