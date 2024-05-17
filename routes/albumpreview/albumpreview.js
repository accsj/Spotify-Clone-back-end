const express = require("express");
const router = express();
const bodyParser = require("body-parser");
const axios = require('axios');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/tracks', async (req, res) => {
    try {
        const albumId = req.body.albumId; 

        const apiUrl = `https://api.deezer.com/album/${albumId}/tracks`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.data) {
            const tracks = response.data.data;
            const formattedTracks = tracks.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist.name,
                duration: track.duration,
                preview: track.preview,
            }));

            res.status(200).json(formattedTracks);
        } else {
            console.error('Dados de resposta da API estão incompletos ou ausentes.');
            res.status(500).json({ error: 'Erro ao processar a resposta da API.' });
        }
    } catch (error) {
        console.error('Erro ao fazer a solicitação:', error);
        res.status(500).json({ error: 'Erro ao fazer a solicitação para a API.' });
    }
});

module.exports = router;
