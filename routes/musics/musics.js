const express = require('express');
const pool = require('../../modules/db');

const router = express();


router.get('/musics', async (req, res) => {
    try {
        // Consulta para selecionar os dados necessários da tabela 'musics'
        const query = 'SELECT songurl, imageurl, title, subtitle FROM musics';
        const { rows } = await pool.query(query);

        // Retorna os dados encontrados
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar músicas.' });
    }
});




module.exports = router;