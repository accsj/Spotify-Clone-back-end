const express = require ("express");
const pool = require('../../modules/db');
const router = express();

router.get('/specifymusics', async(req, res) => {
    const { title } = req.query;
    try {
    const query = `
        SELECT * FROM musics
        WHERE LOWER(title) LIKE LOWER($1)`;
    const result = await pool.query(query, [`%${title}%`]);
    res.json({ success: true, data: result.rows });
    } catch (error) {
    console.error('Erro ao buscar músicas:', error);
    res.json({ success: false, message: 'Erro ao buscar músicas' });
    }
});
    

module.exports = router;