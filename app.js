const express = require ("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const app = express();

const login = require('./routes/auth/login.js');
const playlist = require('./routes/addplaylist/playlist.js');
const musics = require('./routes/musics/musics.js');
const googleregister = require('./routes/registergoogle/googleregister.js');
const listyoursongs = require('./routes/playlist/playlist.js');
const specifymusics = require('./routes/specifymusics/specifymusics.js');
const checklikesong = require('./routes/checklikesong/checklikesong.js');
const getusername = require('./routes/getusername/getusername.js');
const search = require('./routes/Search/Search.js');

// Configs
const allowedOrigins = ["http://localhost:3000", "https://spotify-clone-accsj.vercel.app"]

app.use(cors({ credentials: true, origin: allowedOrigins}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req,res) => {
    res.send("Servidor funcionando para fazer requisições!")
})

app.use('/', login)
app.use('/', playlist)
app.use('/', musics)
app.use('/', googleregister)
app.use('/', listyoursongs)
app.use('/', specifymusics)
app.use('/', checklikesong)
app.use('/', getusername)
app.use('/', search)

app.listen(process.env.port || 5000,  ()=> {
    console.log("Servidor rodando na porta", process.env.PORT);
})