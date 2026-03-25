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
app.use('/usuarios', usuariosRoutes)

const medicamentosRoutes = require('./routes/medicamentos')
app.use('/medicamentos', medicamentosRoutes)

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

const registroRoutes = require('./routes/registro')
app.use('/registro', registroRoutes)

const setoresRoutes = require('./routes/setores')
app.use('/setores', setoresRoutes)

const cuidadosRoutes = require('./routes/cuidados')
app.use('/cuidados', cuidadosRoutes)

const pacientesRoutes = require('./routes/pacientes')
app.use('/pacientes', pacientesRoutes)

const pacienteCuidados = require('./routes/pacienteCuidados')
app.use('/paciente-cuidados', pacienteCuidados)

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