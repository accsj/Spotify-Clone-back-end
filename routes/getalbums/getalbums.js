const express = require("express");
const router = express();
const bodyParser = require("body-parser");
const axios = require('axios');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/albums', async (req, res) => {
    try {
        const artistId = req.body.artistId; 

        const apiUrl = `https://api.deezer.com/artist/${artistId}/albums`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.data) {
            const albums = response.data.data;
            const formattedAlbums = albums.map(album => ({
                albumId: album.id,
                title: album.title,
                cover: album.cover_big,
                release_year: album.release_date.split('-')[0],
            })).slice(0, 4);
            res.status(200).json(formattedAlbums);
        } else {
            res.status(500).json({ error: 'Erro ao processar a resposta da API.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer a solicitação para a API.' });
    }
});

module.exports = router;
