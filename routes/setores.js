const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')
const db = require('../conexao')

//======================================
//         SETORES - [ GET ]
//======================================

router.get(
    "/",
    autorizar("docente", "admin", "aluno"),
    function (req, res) {

        db.query(
            `SELECT 
        id,
        nome_setor
        FROM setores`,
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                res.json(resultado)
            }
        )
    })

//======================================
//         SETORES - [ POST ]
//======================================

router.post(
    "/",
    autorizar("docente", "admin"),
    function (req, res) {

        const { nome_setor } = req.body

        if (!nome_setor) {
            return res.status(400).json({ erro: "Nome do setor é obrigatório" })
        }

        db.query(
            `INSERT INTO setores
        (nome_setor)
        VALUES (?)`,
            [nome_setor],

            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                res.status(201).json({
                    mensagem: "Setor cadastrado com sucesso",
                    id: resultado.insertId
                })
            }
        )
    })

//======================================
//         SETORES - [ PUT:id ]
//======================================

router.put(
    "/:id",
    autorizar("docente", "admin"),
    function (req, res) {

        const { id } = req.params
        const { nome_setor } = req.body

        if (!nome_setor) {
            return res.status(400).json({
                erro: "Nome do setor é obrigatório"
            })
        }

        db.query(
            `UPDATE setores 
             SET nome_setor = ?
             WHERE id = ?`,
            [nome_setor, id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Setor não encontrado"
                    })
                }

                res.json({
                    mensagem: "Setor atualizado com sucesso"
                })
            }
        )
    }
)

//======================================
//         SETORES - [ DELETE:id ]
//======================================

router.delete(
    "/:id",
    autorizar("admin", "docente"),
    function (req, res) {

        const { id } = req.params

        db.query(
            "DELETE FROM setores WHERE id = ?",
            [id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Setor não encontrado"
                    })
                }

                res.json({
                    mensagem: "Setor deletado com sucesso"
                })

            }
        )

    }
)

module.exports = router