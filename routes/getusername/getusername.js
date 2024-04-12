const express = require('express');
const pool = require('../../modules/db');
const jwt = require('jsonwebtoken');
const router = express();


function extractToken(authorizationHeader) {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.split(' ')[1];
    return token;
}

router.get('/getusername', async(req, res) => {
    try {
        const token = extractToken(req.headers.authorization);
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Token inválido.' });
        }
        const userId = decoded.userId;
        const client = await pool.connect();
        
        const result = await pool.query('select username from users where id = $1', [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
        
        const username = result.rows[0].username;
        client.release()
        res.status(200).json({ success: true, username });
    }
    catch (error) {
        console.log(error)
    }
})


module.exports = router;