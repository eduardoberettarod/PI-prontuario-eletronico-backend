const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const db = require('../conexao')
const bcrypt = require('bcrypt')

//======================================
//              LOGIN
//======================================

router.post("/login", function (req, res) {

    console.log(req.body)

    const { email, senha } = req.body

    db.query(
        `SELECT 
            id,
            primeiro_nome,
            sobrenome,
            email,
            senha,
            nivel_acesso
        FROM usuarios
        WHERE email = ?`,
        [email],

        async function (erro, resultado) {

            if (erro) {
                console.log(erro)
                return res.status(500).json(erro)
            }

            if (resultado.length === 0) {
                return res.status(401).json({
                    erro: "Email ou senha inválidos"
                })
            }

            const usuario = resultado[0]

            const senhaValida = await bcrypt.compare(senha, usuario.senha)

            if (!senhaValida) {
                return res.status(401).json({
                    erro: "Email ou senha inválidos"
                })
            }

            // GERA JWT TOKEN
            const usuarioData = {
                id: usuario.id,
                primeiro_nome: usuario.primeiro_nome,
                sobrenome: usuario.sobrenome,
                email: usuario.email,
                nivel_acesso: usuario.nivel_acesso
            }

            const token = jwt.sign(usuarioData, process.env.SESSION_SECRET, { expiresIn: '7d' })

            res.json({
                mensagem: "Login realizado com sucesso",
                usuario: usuarioData,
                token: token
            })

        }
    )

})

//======================================
//         USUARIO LOGADO
//======================================

router.get("/me", function (req, res) {

    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            erro: "Usuário não autenticado"
        })
    }

    try {
        const usuarioData = jwt.verify(token, process.env.SESSION_SECRET)
        res.json(usuarioData)
    } catch (erro) {
        return res.status(401).json({
            erro: "Token inválido ou expirado"
        })
    }

})

//======================================
//              LOGOUT
//======================================

router.post("/logout", function (req, res) {

    // JWT é stateless, logout é apenas no frontend (remover token)
    res.json({
        mensagem: "Logout realizado com sucesso"
    })

})

module.exports = router