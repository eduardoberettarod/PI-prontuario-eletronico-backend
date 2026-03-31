const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')
const db = require('../conexao')

//======================================
//         CUIDADOS - [ GET ]
//======================================

router.get(
    "/",
    autorizar("docente", "admin"),
    function (req, res) {

        db.query(
            `SELECT 
        id,
        tipo_cuidado
        FROM cuidados`,
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
//         CUIDADOS - [ POST ]
//======================================

router.post(
    "/",
    autorizar("admin", "docente"),
    function (req, res) {

        const { tipo_cuidado } = req.body


        db.query(
            `INSERT INTO cuidados
        (tipo_cuidado)
        VALUES (?)`,
            [tipo_cuidado],

            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                res.status(201).json({
                    mensagem: "Cuidado cadastrado com sucesso",
                    id: resultado.insertId
                })
            }
        )
    })

//======================================
//         CUIDADOS - [ PUT:id ]
//======================================

router.put(
    "/:id",
    autorizar("admin", "docente"),
    function (req, res) {

        const { id } = req.params
        const { tipo_cuidado } = req.body

        if (!tipo_cuidado) {
            return res.status(400).json({
                erro: "O campo tipo_cuidado é obrigatório"
            })
        }

        db.query(
            `UPDATE cuidados 
             SET tipo_cuidado = ?
             WHERE id = ?`,
            [tipo_cuidado, id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Cuidado não encontrado"
                    })
                }

                res.json({
                    mensagem: "Cuidado atualizado com sucesso"
                })
            }
        )
    }
)

//======================================
//         CUIDADOS - [ DELETE:id ]
//======================================

router.delete(
    "/:id",
    autorizar("admin", "docente"),
    function (req, res) {

        const { id } = req.params

        db.query(
            "DELETE FROM cuidados WHERE id = ?",
            [id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Cuidado não encontrado"
                    })
                }

                res.json({
                    mensagem: "Cuidado deletado com sucesso"
                })

            }
        )

    }
)

module.exports = router