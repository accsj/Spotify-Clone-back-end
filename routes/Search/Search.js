const express = require("express");
const router = express();
const bodyParser = require("body-parser");
const axios = require('axios');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/search', async (req, res) => {
    try {
        const searchItem = req.body.searchItem;
        const index = 0;
        const limit = 4;
        const format = 'json';
        const apiUrl = `https://api.deezer.com/search?q=${searchItem}&index=${index}&limit=${limit}&output=${format}`;

        const searchTracks = async () => {
            try {
                const response = await axios.get(apiUrl);
                console.log('Response data:', response.data);
                if (response.data && response.data.data) {
                    const tracks = response.data.data;
                    console.log('Tracks:', tracks);
                    const formattedTracks = tracks.map(track => ({
                        title: track.title,
                        preview: track.preview,
                        artist: track.artist.name,
                        albumCover: track.album.cover_big,
                        artistPic: track.artist.picture_big,
                        duration: track.duration,
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
        };

        await searchTracks();
    } catch (err) {
        console.log('Erro ao realizar a busca: ', err)
        res.status(500).json({ error: 'Erro interno ao realizar a busca.' });
    }
});

module.exports = router;
