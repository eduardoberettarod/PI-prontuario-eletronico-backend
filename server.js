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
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.NOME_BANCO
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

//=============================
//          CORS
//=============================

const cors = require('cors')

app.use(cors({
    origin: process.env.FRONTEND_URL,
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

const pacienteCuidadosRoutes = require('./routes/pacienteCuidados')
app.use('/paciente-cuidados', pacienteCuidadosRoutes)

const relatoriosRoutes = require('./routes/relatorios')
app.use('/relatorios', relatoriosRoutes)

const prescricoesRoutes = require('./routes/prescricoes')
app.use('/prescricoes', prescricoesRoutes)

const testeRoutes = require('./routes/teste')
app.use('/teste', testeRoutes)

//=============================
//           TESTE
//=============================

app.get('/', function (req, res) {
    res.send('TESTE DO PRONTUARIO')
})

//=============================
//          SERVER
//=============================

const PORTA = process.env.PORT || process.env.PORTA || 3000

app.listen(PORTA, () => {
    console.log("Servidor rodando na porta " + PORTA)
})