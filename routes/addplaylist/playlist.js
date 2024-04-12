const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../../modules/db');
const router = express();

function extractToken(authorizationHeader) {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.split(' ')[1];
    return token;
}


router.post('/playlist', async (req, res) => {
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
        const userQuery = 'SELECT id FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
        }

        const { songUrl, imageUrl, title, subtitle } = req.body;

        if (!songUrl || !title || !subtitle || !imageUrl) {
            return res.status(400).json({ success: false, message: 'URL da música, URL da imagem, título e subtítulo são obrigatórios.' });
        }

        const client = await pool.connect();
        await client.query('BEGIN');

        const checkMusicQuery = 'SELECT id FROM musics WHERE songurl = $1 AND title = $2';
        const checkMusicResult = await client.query(checkMusicQuery, [songUrl, title]);

        let musicId;

        if (checkMusicResult.rows.length > 0) {
            musicId = checkMusicResult.rows[0].id;
        } else {
            const insertMusicQuery = 'INSERT INTO musics (songurl, imageurl, title, subtitle) VALUES ($1, $2, $3, $4) RETURNING id';
            const insertMusicResult = await client.query(insertMusicQuery, [songUrl, imageUrl, title, subtitle]);
            musicId = insertMusicResult.rows[0].id;
        }

        const checkPlaylistQuery = 'SELECT id FROM playlists WHERE user_id = $1 AND title = $2';
        const playlistResult = await client.query(checkPlaylistQuery, [userId, 'likesong']);

        let playlistId;

        if (playlistResult.rows.length === 0) {
            const createPlaylistQuery = 'INSERT INTO playlists (user_id, title) VALUES ($1, $2) RETURNING id';
            const newPlaylistResult = await client.query(createPlaylistQuery, [userId, 'likesong']);
            playlistId = newPlaylistResult.rows[0].id;
        } else {
            playlistId = playlistResult.rows[0].id;
        }

        const insertPlaylistSongQuery = 'INSERT INTO playlist_songs (playlist_id, music_id) VALUES ($1, $2)';
        await client.query(insertPlaylistSongQuery, [playlistId, musicId]);

        await client.query('COMMIT');
        client.release();
    
        res.status(200).json({ success: true, message: 'Música adicionada à playlist "likesong" com sucesso.' });
    } catch (error) {
        console.error('Erro ao adicionar música à playlist:', error);
        return res.status(500).json({ success: false, message: 'Erro ao adicionar música à playlist.' });
    }
});


module.exports = router;