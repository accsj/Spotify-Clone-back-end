const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../../modules/db');
const router = express();

function extractToken(authorizationHeader) {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.split(' ')[1];
    return token;
}

async function getMusicId(songUrl) {
    try {
        const query = 'SELECT id FROM musics WHERE songurl = $1';
        const result = await pool.query(query, [songUrl]);
        console.log(result.rows[0].id)
        if (result.rows.length > 0) {
            return result.rows[0].id;
        } else {
            return null; 
        }
    } catch (error) {
        console.error('Erro ao buscar o ID da música:', error);
        return null;
    }
}


router.get('/checkLikeSong', async (req, res) => {
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
        const songUrl = req.query.songUrl;
        const musicId = await getMusicId(songUrl);

        if (musicId !== null) {
            const checkLikedQuery = `
                SELECT EXISTS (
                    SELECT 1
                    FROM playlist_songs AS ps
                    JOIN playlists AS p ON ps.playlist_id = p.id
                    WHERE ps.music_id = $1
                    AND p.user_id = $2
                    AND p.title = 'likesongs'
                ) AS liked
            `;
            const result = await pool.query(checkLikedQuery, [musicId, userId]);
            console.log(result.rows[0].liked);
            res.status(200).json({ success: true, liked: result.rows[0].liked });
        } else {
            res.status(404).json({ success: false, message: 'Música não encontrada.' });
        }
    } catch (error) {
        console.error('Erro ao verificar música na playlist:', error);
        return res.status(500).json({ success: false, message: 'Erro ao verificar música na playlist.' });
    }
});

module.exports = router;
