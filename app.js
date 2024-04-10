const express = require ("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const app = express();

const login = require('./routes/auth/login.js');
const playlist = require('./routes/playlist/playlist.js');
const musics = require('./routes/musics/musics.js');

// Configs
app.use(cors({ credentials: true, origin: "https://spotify-clone-accsj.vercel.app" }));
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


app.listen(process.env.port || 5000,  ()=> {
    console.log("Servidor rodando na porta", process.env.PORT);
})