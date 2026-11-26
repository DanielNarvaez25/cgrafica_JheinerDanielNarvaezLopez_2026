SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS db_DanielNarvaez2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_DanielNarvaez2;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificacion VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cargo ENUM('Doctor','Especialista','Administrativo') NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado ENUM('Activado','Desactivado') NOT NULL DEFAULT 'Activado',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;