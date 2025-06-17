const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'school_monitoring',
    password: 'your_password',
    port: 5432,
});

// Get recent schools (pending status)
app.get('/api/recent-schools', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM schools WHERE status = $1 ORDER BY created_at DESC LIMIT 5',
            ['pending']
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recent schools:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Accept a school
app.put('/api/schools/:id/accept', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE schools SET status = $1 WHERE id = $2 RETURNING *',
            ['accepted', id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'School not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error accepting school:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all accepted schools
app.get('/api/schools', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT s.*, sd.* FROM schools s LEFT JOIN school_details sd ON s.id = sd.school_id WHERE s.status = $1 ORDER BY s.created_at DESC',
            ['accepted']
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a school
app.delete('/api/schools/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM schools WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'School not found' });
        }
        
        res.json({ message: 'School deleted successfully' });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 