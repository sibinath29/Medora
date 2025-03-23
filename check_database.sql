-- Check if database exists
SHOW DATABASES LIKE 'medora';

-- Use the database
USE medora;

-- Check tables
SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Check sessions table structure
DESCRIBE sessions;

-- View all users (passwords will be hashed)
SELECT id, name, email, created_at, updated_at FROM users; 