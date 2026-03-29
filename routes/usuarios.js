const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')

const db = require('../conexao')

//======================================
//         USUARIOS - [ GET ]
//======================================

router.get(
    "/",
    autorizar("aluno", "docente", "admin"),
    function (req, res) {

        db.query(
            `SELECT id,
         primeiro_nome,
         sobrenome,
         email
         FROM usuarios
         WHERE nivel_acesso = 'aluno'`,
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                res.json(resultado)
            }
        )

    })

router.get(
    "/me",
    autorizar("aluno", "docente", "admin"),
    function (req, res) {

        console.log(req.usuario)

        const usuarioId = req.usuario.id

        db.query(
            `SELECT 
                id,
                primeiro_nome,
                sobrenome,
                nivel_acesso
             FROM usuarios
             WHERE id = ?`,
            [usuarioId],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.length === 0) {
                    return res.status(404).json({ erro: "Usuário não encontrado" })
                }

                res.json(resultado[0])
            }
        )
    }
)

//======================================
//         USUARIOS - [DELETE]
//======================================

router.delete(
    "/alunos",
    autorizar("admin", "docente"),
    function (req, res) {

        db.query(
            "DELETE FROM usuarios WHERE nivel_acesso = 'aluno'",
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                res.json({
                    mensagem: "Todos os alunos foram deletados",
                    deletados: resultado.affectedRows
                })

            }
        )

    }
)

//======================================
//       USUARIOS - [ DELETE:ID ]
//======================================

router.delete(
    "/:id",
    autorizar("admin", "docente"),
    function (req, res) {

        const { id } = req.params

        db.query(
            "DELETE FROM usuarios WHERE id = ?",
            [id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Usuário não encontrado"
                    })
                }

                res.json({
                    mensagem: "Usuário deletado com sucesso"
                })

            }
        )

    }
)

module.exports = router