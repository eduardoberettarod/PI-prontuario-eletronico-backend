//=============================
//        DOTENV
//=============================

require('dotenv').config();

//=============================
//         EXPRESS
//=============================

const express = require('express')
const app = express()

app.use(express.json())

//=============================
//      EXPRESS-SESSION
//=============================

const session = require('express-session');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2
    }
}))

//=============================
//          CORS
//=============================

const cors = require('cors')

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

//=============================
//       BODY-PARSER
//=============================

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//=============================
//           ROTAS
//=============================

const usuariosRoutes = require('./routes/usuarios')
const medicamentosRoutes = require('./routes/medicamentos')
const authRoutes = require('./routes/auth')
const registroRoutes = require('./routes/registro')
const setoresRoutes = require('./routes/setores')
const cuidadosRoutes = require('./routes/cuidados')

app.use('/setores', setoresRoutes)
app.use('/cuidados', cuidadosRoutes)
app.use('/registro', registroRoutes)
app.use('/usuarios', usuariosRoutes)
app.use('/medicamentos', medicamentosRoutes)
app.use('/auth', authRoutes)

//=============================
//           TESTE
//=============================

app.get('/', function (req, res) {
    res.send('TESTE DO PRONTUARIO')
})

//=============================
//          SERVER
//=============================

app.listen(process.env.PORTA, () => {
    console.log("Servidor rodando na porta " + process.env.PORTA)
})