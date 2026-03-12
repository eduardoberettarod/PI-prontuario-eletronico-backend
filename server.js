const express = require('express')
const app = express()
require('dotenv').config();
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//necessario para permitir requisições de diferentes origens (dominios/servidores)
const cors = require('cors')
app.use(cors({
    origin: "http://localhost:5173", // ou a porta que você usa no Live Server
    credentials: true
}));

//lib para hash da senha do usuario
const bcrypt = require('bcrypt');

//salvar usuario apos sessao de login
const session = require('express-session');

app.use(session({
    secret: 'segredo_super_secreto',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // true só em HTTPS
}));

app.use(express.json())

app.get('/', function (req, res) {
    res.send('TESTE DO PRONTUARIO')
})

let mysql = require('mysql')
let conexao = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.NOME_BANCO
})

conexao.connect(function (erro) {
    if (erro) {
        console.log("Deu ruim na conexão \n");
        throw erro;
    } else {
        console.log("Conexão deu bom \n")
    }
})

app.get("/usuarios", function (req, res) {
    conexao.query(
        `SELECT id,
         primeiro_nome,
         sobrenome,
         email
         FROM usuarios`,
        function (erro, resultado) {

            if (erro) {
                console.log(erro)
                res.status(500).json(erro)
            } else {
                res.json(resultado)
            }
        }
    )
})

// ===========================================
//               MEDICAMENTOS
// ===========================================

app.get("/medicamentos", function (req, res) {
    conexao.query(
        `SELECT 
        nome_medicamento,
        classe_terapeutica,
        unidade
        FROM medicamentos`,
        function (erro, resultado) {

            if (erro) {
                console.log(erro)
                res.status(500).json(erro)
            } else {
                res.json(resultado)
            }
        }
    )
})

app.post("/medicamentos", function (req, res) {

    const { nome_medicamento, classe_terapeutica, unidade } = req.body

    const unidadesValidas = ['mg', 'g', 'mcg', 'ml', 'ui', '%']

    // valida unidade
    if (!unidadesValidas.includes(unidade)) {
        return res.status(400).json({
            erro: "Unidade inválida"
        })
    }

    conexao.query(
        `INSERT INTO medicamentos
        (nome_medicamento, classe_terapeutica, unidade)
        VALUES (?, ?, ?)`,
        [nome_medicamento, classe_terapeutica, unidade],

        function (erro, resultado) {

            if (erro) {
                console.log(erro)
                return res.status(500).json(erro)
            }

            res.status(201).json({
                mensagem: "Medicamento cadastrado com sucesso",
                id: resultado.insertId
            })
        }
    )

})

app.listen(process.env.PORTA)