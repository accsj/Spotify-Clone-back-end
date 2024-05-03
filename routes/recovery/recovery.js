const express = require("express");
const pool = require('../../modules/db.js');
const crypto = require ('crypto');
const transporter = require("../../modules/nodemailer.js");
const router = express();

router.post('/recovery', async (req, res)=> {
    const { email } = req.body;

    try {
        const client = await pool.connect();
        const emailLowerCase = email.toLowerCase();
        const user = await client.query("Select * from users WHERE email = $1", [emailLowerCase]);

        if (user.rows.length === 0) {
            client.release();
            return res.status(404).json({success:false, message: 'Email não encontrado'})
        } else {
    
            const token = crypto.randomBytes(20).toString('hex');
            const expirationTime = new Date(Date.now() + 3600000);
            await client.query("UPDATE users SET token = $1, expiration_time = $2 WHERE email = $3", [token, expirationTime, emailLowerCase]);
            const resetPasswordLink = `http://localhost:3000/redefinir-senha/${token}`;
    
            const mailOptions = {
                from: process.env.user,
                to: emailLowerCase,
                subject: 'Recuperação de senha',
                text: `Clique no seguinte link para redefinir sua senha: ${resetPasswordLink}`
            };
            
            transporter.sendMail(mailOptions, (error, info)=> {
                if (error) {
                    client.release();
                    res.status(500).json({success:false, message: 'Erro ao enviar o email'});
                } else {
                    client.release();
                    res.status(200).json({success:true, message: 'Email de recuperação enviado!'});
                }
            });
        };
    }
    catch (error) {
        return res.status(500).json({success:false, error: 'Erro interno do servidor.' });
    }
});

module.exports = router;