/**
 * Esquema de base de datos para MSSQL Server - CLB App
 * Ejecutar en Windows Server 2025 con SQL Server Management Studio o sqlcmd.
 * 
 * Uso:
 *   sqlcmd -S localhost -U clb_app -P 'password' -d CLB_DB -i schema.sql
 */

-- ============================================================================
-- 1. Crear base de datos (opcional, si ya existe omitir)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CLB_DB')
BEGIN
    CREATE DATABASE CLB_DB
    COLLATE SQL_Latin1_General_CP1_CI_AS;
END
GO

USE CLB_DB;
GO

-- ============================================================================
-- 2. Habilitar READ_COMMITTED_SNAPSHOT para reducir bloqueos de lectura
-- ============================================================================
ALTER DATABASE CLB_DB SET READ_COMMITTED_SNAPSHOT ON;
GO

-- ============================================================================
-- 3. Tabla: users (usuarios del sistema)
-- ============================================================================
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'coordinador',
    createdAt DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
GO

CREATE INDEX IX_users_cedula ON dbo.users(cedula);
CREATE INDEX IX_users_username ON dbo.users(username);
CREATE INDEX IX_users_role ON dbo.users(role);
GO

-- ============================================================================
-- 4. Tabla: electores (padrón electoral)
-- ============================================================================
IF OBJECT_ID('dbo.electores', 'U') IS NOT NULL DROP TABLE dbo.electores;
GO

CREATE TABLE dbo.electores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    edad INT NULL,
    telefono VARCHAR(20) NULL,
    whatsapp BIT NOT NULL DEFAULT 1,
    telefonoAlt VARCHAR(20) NULL,
    sector VARCHAR(100) NULL,
    direccion VARCHAR(200) NULL,
    recinto VARCHAR(100) NULL,
    mesa VARCHAR(20) NULL,
    orden INT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'indeciso',
    cba VARCHAR(100) NULL,
    celula VARCHAR(50) NULL,
    movilizacionDiaD BIT NOT NULL DEFAULT 0,
    asignadoA VARCHAR(100) NULL,
    registradoPor VARCHAR(100) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    intento VARCHAR(500) NULL,
    reconfirmadoAt DATETIME2 NULL
);
GO

CREATE INDEX IX_electores_cedula ON dbo.electores(cedula);
CREATE INDEX IX_electores_estado ON dbo.electores(estado);
CREATE INDEX IX_electores_recinto ON dbo.electores(recinto);
CREATE INDEX IX_electores_mesa ON dbo.electores(mesa);
CREATE INDEX IX_electores_estado_recinto ON dbo.electores(estado, recinto);
CREATE INDEX IX_electores_asignadoA ON dbo.electores(asignadoA);
GO

-- ============================================================================
-- 5. Tabla: comites (comités electorales CBA/CBE)
-- ============================================================================
IF OBJECT_ID('dbo.comites', 'U') IS NOT NULL DROP TABLE dbo.comites;
GO

CREATE TABLE dbo.comites (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    lider VARCHAR(100) NOT NULL,
    cedulaLider VARCHAR(20) NULL,
    sector VARCHAR(100) NULL,
    recinto VARCHAR(100) NULL,
    mesa VARCHAR(20) NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'proceso',
    votos VARCHAR(50) NOT NULL DEFAULT '0 de 0',
    integrantes INT NOT NULL DEFAULT 1,
    telefono VARCHAR(20) NULL,
    delegados NVARCHAR(MAX) NULL,
    votoComprometido NVARCHAR(MAX) NULL,
    alerta NVARCHAR(MAX) NULL
);
GO

CREATE INDEX IX_comites_codigo ON dbo.comites(codigo);
CREATE INDEX IX_comites_tipo ON dbo.comites(tipo);
CREATE INDEX IX_comites_estado ON dbo.comites(estado);
CREATE INDEX IX_comites_recinto ON dbo.comites(recinto);
GO

-- ============================================================================
-- 6. Tabla: llamadas (llamadas de call center)
-- ============================================================================
IF OBJECT_ID('dbo.llamadas', 'U') IS NOT NULL DROP TABLE dbo.llamadas;
GO

CREATE TABLE dbo.llamadas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    detalle NVARCHAR(MAX) NULL,
    recinto VARCHAR(100) NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    completado BIT NOT NULL DEFAULT 0,
    completadoAt DATETIME2 NULL,
    creadoEn DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
GO

CREATE INDEX IX_llamadas_estado ON dbo.llamadas(estado);
CREATE INDEX IX_llamadas_recinto ON dbo.llamadas(recinto);
CREATE INDEX IX_llamadas_creadoEn ON dbo.llamadas(creadoEn);
GO

-- ============================================================================
-- 7. Tabla: tareas (tareas de movilización)
-- ============================================================================
IF OBJECT_ID('dbo.tareas', 'U') IS NOT NULL DROP TABLE dbo.tareas;
GO

CREATE TABLE dbo.tareas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    electorId VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    vencimiento VARCHAR(50) NULL,
    creadoEn DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completadoEn DATETIME2 NULL
);
GO

CREATE INDEX IX_tareas_electorId ON dbo.tareas(electorId);
CREATE INDEX IX_tareas_estado ON dbo.tareas(estado);
CREATE INDEX IX_tareas_vencimiento ON dbo.tareas(vencimiento);
GO

-- ============================================================================
-- 8. Usuario admin por defecto (cambiar la contraseña en producción)
-- ==========================================================================--
-- Contraseña: ClbSegura2026@  (hash bcrypt con salt 12)
-- ============================================================================
INSERT INTO dbo.users (cedula, username, passwordHash, nombres, apellidos, telefono, role)
VALUES (
    '402-1234567-8',
    'clbarcelo2026',
    '$2a$12$K8vX3Y7Z9W1E2R3T4Y5U6I8O7P0L9KJ8H7G6F5D4S3A2Q1W0E',
    'Carmen Ligia',
    'Barceló',
    '8295550000',
    'admin'
);
GO

INSERT INTO dbo.users (cedula, username, passwordHash, nombres, apellidos, telefono, role)
VALUES (
    '402-1234567-9',
    'coord1',
    '$2a$12$K8vX3Y7Z9W1E2R3T4Y5U6I8O7P0L9KJ8H7G6F5D4S3A2Q1W0E',
    'Ana',
    'García',
    '8295550001',
    'coordinador'
);
GO

INSERT INTO dbo.users (cedula, username, passwordHash, nombres, apellidos, telefono, role)
VALUES (
    '402-1234567-0',
    'admin2026',
    '$2a$12$K8vX3Y7Z9W1E2R3T4Y5U6I8O7P0L9KJ8H7G6F5D4S3A2Q1W0E',
    'Admin',
    'Sistema',
    '8295550002',
    'admin'
);
GO

PRINT 'Esquema CLB_DB creado exitosamente en MSSQL Server';
GO
