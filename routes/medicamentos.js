const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')
const db = require('../conexao')

//======================================
//        MEDICAMENTOS - [ POST ]
//======================================

router.post(
    "/",
    autorizar("docente", "admin"),
    function (req, res) {

        const { nome_medicamento, classe_terapeutica, unidade } = req.body

        const unidadesValidas = ['mg', 'g', 'mcg', 'ml', 'ui', '%']

        if (!unidadesValidas.includes(unidade)) {
            return res.status(400).json({
                erro: "Unidade inválida"
            })
        }

        db.query(
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


//======================================
//        MEDICAMENTOS - [ GET ]
//======================================

router.get(
    "/",
    autorizar("docente", "admin"),
    function (req, res) {

        db.query(
            `SELECT
            id, 
            nome_medicamento,
            classe_terapeutica,
            unidade
            FROM medicamentos`,
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
//      MEDICAMENTOS - [ DELETE:id ]
//======================================

router.delete(
    "/:id",
    autorizar("admin", "docente"),
    function (req, res) {

        const { id } = req.params

        db.query(
            "DELETE FROM medicamentos WHERE id = ?",
            [id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Medicamento não encontrado"
                    })
                }

                res.json({
                    mensagem: "Medicamento deletado com sucesso"
                })

            }
        )

    }
)

//======================================
//      MEDICAMENTOS - [ PUT:id ]
//======================================

router.put(
    "/:id",
    autorizar("admin", "docente"),
    function (req, res) {

        const { id } = req.params
        const { nome_medicamento, classe_terapeutica, unidade } = req.body

        const unidadesValidas = ['mg', 'g', 'mcg', 'ml', 'ui', '%']

        if (!unidadesValidas.includes(unidade)) {
            return res.status(400).json({
                erro: "Unidade inválida"
            })
        }

        db.query(
            `UPDATE medicamentos 
             SET nome_medicamento = ?, 
                 classe_terapeutica = ?, 
                 unidade = ?
             WHERE id = ?`,
            [nome_medicamento, classe_terapeutica, unidade, id],

            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Medicamento não encontrado"
                    })
                }

                res.json({
                    mensagem: "Medicamento atualizado com sucesso"
                })
            }
        )
    }
)
module.exports = router