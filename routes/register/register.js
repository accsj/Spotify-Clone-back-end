const express = require("express");
const pool = require('../../modules/db.js');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express()

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({success:false, error: 'É necessário fornecer um nome de usuário, email e senha.' });
    }

    try {
        
        const client = await pool.connect();
        const usernameLowerCase = username.toLowerCase();
        const emailLowerCase = email.toLowerCase();

        const user = await client.query('SELECT * FROM users WHERE username = $1 OR email = $2', [usernameLowerCase, emailLowerCase]);

        if (user.rows.length > 0) {
            client.release();
            return res.status(409).json({success:false, error: 'Nome de usuário ou email já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [usernameLowerCase, emailLowerCase, hashedPassword]);

        const userId = newUser.rows[0].id; 
        const secretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });

        client.release();
        return res.status(201).json({success:true, message: 'Usuário registrado com sucesso!', token });

    } catch (error) {
        return res.status(500).json({success:false, error: 'Erro interno do servidor.' });
    }
});

module.exports = router;