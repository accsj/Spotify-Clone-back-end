const express = require("express");
const pool = require('../../modules/db.js');
const bcrypt = require("bcrypt");
const router = express();

router.post('/recovery-pass', async (req, res) => {
    const token = req.body.token;
    const newPassword = req.body.password;
    
    try {
        const client = await pool.connect();

        const userPasswordQuery = await client.query('SELECT password FROM users WHERE token = $1', [token]);
        const userPassword = userPasswordQuery.rows[0].password;

        const SamePassword = await bcrypt.compare(newPassword, userPassword);
        if (SamePassword) {
            client.release();
            return res.status(400).json({ success: false, message: 'Nova senha é idêntica à senha atual. Insira uma nova senha diferente.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await client.query("UPDATE users SET password = $1, token = NULL, expiration_time = NULL WHERE token = $2", [hashedPassword, token]);
        client.release();
        return res.status(200).json({ success: true, message: 'Senha redefinida com sucesso' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
})

module.exports = router;