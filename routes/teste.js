const express = require('express')
const router = express.Router()
const db = require('../conexao')

router.get(
    "/",
    function (req, res) {

        db.query(
            `SELECT id,
         primeiro_nome,
         sobrenome,
         email
         FROM usuarios`,
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                res.json(resultado)
            }
        )

    })

module.exports = router