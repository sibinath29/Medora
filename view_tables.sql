-- Show all databases
SHOW DATABASES;

-- Use medora database
USE medora;

-- Show all tables in medora database
SHOW TABLES;

-- Show structure of users table
DESCRIBE users;

-- Show structure of sessions table
DESCRIBE sessions;

-- View data in users table
SELECT id, name, email, created_at, updated_at FROM users;

-- View data in sessions table
SELECT * FROM sessions; 