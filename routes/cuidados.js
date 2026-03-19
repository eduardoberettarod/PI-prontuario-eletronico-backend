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
        tipo_cuidado,
        id_usuario
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