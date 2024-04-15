const express = require ("express");
const router = express();
const bodyParser = require("body-parser");

const axios = require('axios');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/search', async(req, res) => {
    try {
        const searchItem = req.body.searchItem;
        console.log(searchItem)

        const index = 0; 
        const limit = 2; 
        const format = 'json';

        const apiUrl = `https://api.deezer.com/search?q=${searchItem}&index=${index}&limit=${limit}&output=${format}`;

        const searchTracks = async () => {
            try {
                const response = await axios.get(apiUrl);
                const tracks = response.data.data; 
                const formattedTracks = tracks.map(track => ({
                    title: track.title, 
                    preview: track.preview, 
                    artist: track.artist.name, 
                    albumCover: track.album.cover_big,
                }));
                console.log(formattedTracks)
                res.status(200).json(formattedTracks);
            } catch (error) {
                console.error('Erro ao fazer a solicitação:', error);
            }
        };
        
        await searchTracks();
    }
    catch (err) {
        console.log('Erro ao realizar a busca: ', err)
    }
})


module.exports = router;