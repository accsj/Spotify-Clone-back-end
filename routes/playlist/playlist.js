const express = require('express');
const router = express();
const jwt = require('jsonwebtoken');
const pool = require('../../modules/db');

function extractToken(authorizationHeader) {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.split(' ')[1];
    return token;
}

router.get('/listyoursongs', async (req, res) => {
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

        const checkPlaylistQuery = 'SELECT id FROM playlists WHERE user_id = $1 AND title = $2';
        const playlistResult = await pool.query(checkPlaylistQuery, [userId, 'likesong']);
        if (playlistResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Playlist "likesong" não encontrada para este usuário.' });
        }

        const playlistId = playlistResult.rows[0].id;

        const getLikedSongsQuery = `
            SELECT musics.songurl, musics.imageurl, musics.title, musics.subtitle
            FROM musics
            INNER JOIN playlist_songs ON musics.id = playlist_songs.music_id
            WHERE playlist_songs.playlist_id = $1
        `;
        const likedSongsResult = await pool.query(getLikedSongsQuery, [playlistId]);

        res.status(200).json({ success: true, data: likedSongsResult.rows });
    } catch (error) {
        console.error('Erro ao obter músicas da playlist "likesong":', error);
        return res.status(500).json({ success: false, message: 'Erro ao obter músicas da playlist "likesong".' });
    }
});

module.exports = router;