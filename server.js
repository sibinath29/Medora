require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// More permissive CORS configuration for development
app.use(cors({
    origin: '*', // Allow all origins during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false // Set to false since we're allowing all origins
}));

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/html', express.static(path.join(__dirname, 'public/html')));

// Request logging middleware with more details
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/home.html'));
});

app.get('/view-profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/view-profile.html'));
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Database connection and setup
async function setupDatabase() {
    try {
        // First, create connection without database
        const initialConnection = mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Sibi1234'  // Updated default password
        });

        // Create database if it doesn't exist
        await new Promise((resolve, reject) => {
            initialConnection.query('CREATE DATABASE IF NOT EXISTS medora', (err) => {
                if (err) {
                    console.error('Error creating database:', err);
                    reject(err);
                    return;
                }
                console.log('Database created or already exists');
                resolve();
            });
        });

        // Use the database
        await new Promise((resolve, reject) => {
            initialConnection.query('USE medora', (err) => {
                if (err) {
                    console.error('Error using database:', err);
                    reject(err);
                    return;
                }
                resolve();
            });
        });

        // Create tables
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await new Promise((resolve, reject) => {
            initialConnection.query(createUsersTable, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    reject(err);
                    return;
                }
                console.log('Users table created successfully');
                resolve();
            });
        });

        const createSessionsTable = `
            CREATE TABLE IF NOT EXISTS sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        await new Promise((resolve, reject) => {
            initialConnection.query(createSessionsTable, (err) => {
                if (err) {
                    console.error('Error creating sessions table:', err);
                    reject(err);
                    return;
                }
                console.log('Sessions table created successfully');
                resolve();
            });
        });

        // Create test user if it doesn't exist
        const hashedPassword = bcrypt.hashSync('test123', 10);
        await new Promise((resolve, reject) => {
            initialConnection.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                ['Test User', 'test@example.com', hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Error creating test user:', err);
                        reject(err);
                        return;
                    }
                    console.log('Test user created or already exists');
                    console.log('Test credentials: email: test@example.com, password: test123');
                    resolve();
                }
            );
        });

        // Close initial connection
        initialConnection.end();

        // Create the main connection with database selected
        const dbConnection = mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Sibi1234',  // Updated default password
            database: 'medora'
        });

        // Connect and return the connection
        await new Promise((resolve, reject) => {
            dbConnection.connect((err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    reject(err);
                    return;
                }
                console.log('Connected to MySQL database successfully');
                resolve();
            });
        });

        // Create profile table
        const createProfileTable = `
            CREATE TABLE IF NOT EXISTS profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                full_name VARCHAR(255),
                dob DATE,
                gender VARCHAR(50),
                height FLOAT,
                weight FLOAT,
                blood_type VARCHAR(5),
                primary_goal VARCHAR(100),
                activity_level VARCHAR(100),
                medical_conditions TEXT,
                emergency_name VARCHAR(255),
                emergency_phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`;

        // Execute profile table creation
        await new Promise((resolve, reject) => {
            dbConnection.query(createProfileTable, (err) => {
                if (err) {
                    console.error('Error creating profiles table:', err);
                    reject(err);
                    return;
                }
                console.log('Profiles table created or already exists');
                resolve();
            });
        });

        return dbConnection;
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
}

// Initialize database and start server
async function initializeApp() {
    try {
        // Setup database and get connection
        const dbConnection = await setupDatabase();

        // API Routes
        // Signup endpoint
        app.post('/api/signup', async (req, res) => {
            try {
                const { name, email, password } = req.body;

                // Validate input
                if (!name || !email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: 'Name, email and password are required'
                    });
                }

                // Check if user already exists
                dbConnection.query(
                    'SELECT * FROM users WHERE email = ?',
                    [email],
                    async (err, results) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Database error occurred'
                            });
                        }

                        if (results.length > 0) {
                            return res.status(400).json({
                                success: false,
                                message: 'Email already registered'
                            });
                        }

                        // Hash password
                        const hashedPassword = await bcrypt.hash(password, 10);

                        // Insert new user
                        dbConnection.query(
                            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                            [name, email, hashedPassword],
                            (err, result) => {
                                if (err) {
                                    console.error('Error creating user:', err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Error creating user'
                                    });
                                }

                                res.status(201).json({
                                    success: true,
                                    message: 'User registered successfully'
                                });
                            }
                        );
                    }
                );
            } catch (error) {
                console.error('Signup error:', error);
                res.status(500).json({
                    success: false,
                    message: 'An error occurred during signup'
                });
            }
        });

        // Login endpoint
        app.post('/api/login', async (req, res) => {
            try {
                console.log('Login request received:', req.body);
                const { email, password } = req.body;

                // Validate input
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email and password are required'
                    });
                }

                // Query database for user
                dbConnection.query(
                    'SELECT * FROM users WHERE email = ?',
                    [email],
                    async (err, results) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Database error occurred'
                            });
                        }

                        if (results.length === 0) {
                            return res.status(401).json({
                                success: false,
                                message: 'Invalid email or password'
                            });
                        }

                        const user = results[0];

                        // Verify password
                        const isValidPassword = await bcrypt.compare(password, user.password);
                        if (!isValidPassword) {
                            return res.status(401).json({
                                success: false,
                                message: 'Invalid email or password'
                            });
                        }

                        // Generate JWT token
                        const token = jwt.sign(
                            { userId: user.id, email: user.email },
                            process.env.JWT_SECRET || 'your_jwt_secret_key',
                            { expiresIn: '24h' }
                        );

                        // Store session
                        dbConnection.query(
                            'INSERT INTO sessions (user_id, token) VALUES (?, ?)',
                            [user.id, token],
                            (err) => {
                                if (err) {
                                    console.error('Session creation error:', err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Error creating session'
                                    });
                                }

                                // Remove password from user data
                                delete user.password;

                                // Return success response
                                res.json({
                                    success: true,
                                    token,
                                    user
                                });
                            }
                        );
                    }
                );
            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({
                    success: false,
                    message: 'An error occurred during login'
                });
            }
        });

        // Get tables endpoint
        app.get('/api/tables', async (req, res) => {
            try {
                // Set CORS headers specifically for this endpoint
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET');
                res.header('Access-Control-Allow-Headers', 'Content-Type');

                // Get users data
                const usersQuery = 'SELECT * FROM users';
                const [users] = await dbConnection.promise().query(usersQuery);

                // Get sessions data
                const sessionsQuery = 'SELECT * FROM sessions';
                const [sessions] = await dbConnection.promise().query(sessionsQuery);

                res.json({
                    success: true,
                    data: {
                        users,
                        sessions
                    }
                });
            } catch (error) {
                console.error('Error fetching table data:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching table data'
                });
            }
        });

        // Profile endpoints
        app.get('/api/profile', authenticateToken, (req, res) => {
            const userId = req.user.id;
            const query = 'SELECT * FROM profiles WHERE user_id = ?';
            
            dbConnection.query(query, [userId], (err, results) => {
                if (err) {
                    console.error('Error fetching profile:', err);
                    return res.status(500).json({ success: false, message: 'Error fetching profile' });
                }
                
                if (results.length === 0) {
                    return res.json({ 
                        success: true, 
                        profile: {
                            fullName: '',
                            dob: '',
                            gender: '',
                            email: req.user.email,
                            height: '',
                            weight: '',
                            bloodType: '',
                            primaryGoal: '',
                            activityLevel: '',
                            medicalConditions: '',
                            emergencyName: '',
                            emergencyPhone: ''
                        }
                    });
                }
                
                const profile = results[0];
                res.json({
                    success: true,
                    profile: {
                        fullName: profile.full_name,
                        dob: profile.dob,
                        gender: profile.gender,
                        email: req.user.email,
                        height: profile.height,
                        weight: profile.weight,
                        bloodType: profile.blood_type,
                        primaryGoal: profile.primary_goal,
                        activityLevel: profile.activity_level,
                        medicalConditions: profile.medical_conditions,
                        emergencyName: profile.emergency_name,
                        emergencyPhone: profile.emergency_phone
                    }
                });
            });
        });

        app.post('/api/profile', authenticateToken, (req, res) => {
            const userId = req.user.id;
            const {
                fullName,
                dob,
                gender,
                height,
                weight,
                bloodType,
                primaryGoal,
                activityLevel,
                medicalConditions,
                emergencyName,
                emergencyPhone
            } = req.body;

            const checkQuery = 'SELECT id FROM profiles WHERE user_id = ?';
            dbConnection.query(checkQuery, [userId], (err, results) => {
                if (err) {
                    console.error('Error checking profile:', err);
                    return res.status(500).json({ success: false, message: 'Error updating profile' });
                }

                const query = results.length > 0
                    ? `UPDATE profiles SET 
                        full_name = ?, 
                        dob = ?, 
                        gender = ?,
                        height = ?,
                        weight = ?,
                        blood_type = ?,
                        primary_goal = ?,
                        activity_level = ?,
                        medical_conditions = ?,
                        emergency_name = ?,
                        emergency_phone = ?
                      WHERE user_id = ?`
                    : `INSERT INTO profiles (
                        user_id,
                        full_name,
                        dob,
                        gender,
                        height,
                        weight,
                        blood_type,
                        primary_goal,
                        activity_level,
                        medical_conditions,
                        emergency_name,
                        emergency_phone
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const values = results.length > 0
                    ? [fullName, dob, gender, height, weight, bloodType, primaryGoal, activityLevel, medicalConditions, emergencyName, emergencyPhone, userId]
                    : [userId, fullName, dob, gender, height, weight, bloodType, primaryGoal, activityLevel, medicalConditions, emergencyName, emergencyPhone];

                dbConnection.query(query, values, (err) => {
                    if (err) {
                        console.error('Error updating profile:', err);
                        return res.status(500).json({ success: false, message: 'Error updating profile' });
                    }
                    res.json({ success: true, message: 'Profile updated successfully' });
                });
            });
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Something went wrong!' });
        });

        // Start the server
        await startServer();
    } catch (error) {
        console.error('Application initialization failed:', error);
        process.exit(1);
    }
}

// Modified startServer function to try specific ports
async function startServer() {
    const ports = [9000, 9001, 9002, 9003, 9004, 9005];
    
    for (const port of ports) {
        try {
            console.log(`Attempting to start server on port ${port}...`);
            const server = app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
            return;
        } catch (error) {
            console.error(`Error on port ${port}:`, error.message);
            if (port === ports[ports.length - 1]) {
                console.error(`No available ports found in range ${ports[0]}-${ports[ports.length - 1]}`);
                process.exit(1);
            }
        }
    }
}

// Start the application
initializeApp(); 