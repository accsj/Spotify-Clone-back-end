const express = require("express");
const pool = require("../../modules/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express()

router.post('/googleloginregister', async (req, res) => {
    const { username, email, sub } = req.body;

    try {
        const client = await pool.connect();
        
        const user = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

        if (user.rows.length > 0) {
            const userId = user.rows[0].id;
            const secretKey = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });

            client.release();
            return res.status(200).json({ success: true, message: 'Login realizado com sucesso!', token });
        }

        const hashedPassword = await bcrypt.hash(sub, 10);
        const newUser = await client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username.toLowerCase(), email.toLowerCase(), hashedPassword]);
        const userId = newUser.rows[0].id; 
        const secretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });

        client.release();
        return res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!', token });

    } catch (error) {
        return res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
    }
});

module.exports = router;