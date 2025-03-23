const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/test-db', async (req, res) => {
    try {
        // Test database connection
        const [result] = await db.query('SELECT 1');
        res.json({ 
            success: true, 
            message: 'Database connection successful',
            data: result
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed',
            error: error.message
        });
    }
});

module.exports = router; 