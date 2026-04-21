require('dotenv').config()
const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken')
const app = express()
const port = process.env.SERVER_PORT

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

console.log("#####")

app.get('/censurado', (req, res) => {
    console.log("Se ha obtenido la #####")
    res.send("#####");
})

app.post('/login', (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        res.status = 400;
        res.send("Bad request");
        return;
    };

    const userId = Math.random() * 100000000;
    const pwd = Math.random() > 0.2;
    if (!pwd) {
        console.log('Autenticación rechazada para ' + req.body.username + " (" + req.body.password + ")");
        res.status = 403;
        res.send('Usuario o contraseña incorrectos.');
        return;
    };

    var token = jwt.sign({
        userID: userId
    }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    res.json({token});
})

app.listen(port, () => {
    console.log("Recibiendo #####s")
})