const express = require('express')
const router = express.Router()

const db = require('../conexao')
const bcrypt = require('bcrypt')

//======================================
//              LOGIN
//======================================

router.post("/login", function (req, res) {

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

            // SALVA NA SESSION
            req.session.usuario = {
                id: usuario.id,
                primeiro_nome: usuario.primeiro_nome,
                sobrenome: usuario.sobrenome,
                email: usuario.email,
                nivel_acesso: usuario.nivel_acesso
            }

            res.json({
                mensagem: "Login realizado com sucesso",
                usuario: req.session.usuario
            })

        }
    )

})

//======================================
//         USUARIO LOGADO
//======================================

router.get("/me", function (req, res) {

    if (!req.session.usuario) {
        return res.status(401).json({
            erro: "Usuário não autenticado"
        })
    }

    res.json(req.session.usuario)

})

//======================================
//              LOGOUT
//======================================

router.post("/logout", function (req, res) {

    req.session.destroy(function (erro) {

        if (erro) {
            return res.status(500).json({
                erro: "Erro ao fazer logout"
            })
        }

        res.json({
            mensagem: "Logout realizado com sucesso"
        })

    })

})

module.exports = router