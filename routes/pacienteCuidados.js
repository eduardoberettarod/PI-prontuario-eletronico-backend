const express = require('express')
const router = express.Router()
const db = require('../conexao')

//======================================
//      PACIENTES CUIDADOS - [ POST ]
//======================================

router.post("/", (req, res) => {

    const { paciente_id, cuidado_id, observacao } = req.body;

    db.query(
        `INSERT INTO paciente_cuidados 
        (paciente_id, cuidado_id, status_id, observacao)
        VALUES (?, ?, ?, ?)`,
        [paciente_id, cuidado_id, 1, observacao],
        (erro, resultado) => {
            if (erro) return res.status(500).json(erro)
            res.json({ sucesso: true })
        }
    )
})

//======================================
//    PACIENTES CUIDADOS - [ GET/:id ]
//======================================

router.get("/:id", (req, res) => {

    const { id } = req.params;

    db.query(
        `SELECT 
        pc.id,
        c.tipo_cuidado,
        pc.observacao,
        s.nome_status,
        pc.status_id,
        pc.created_at
        FROM paciente_cuidados pc
        JOIN cuidados c ON c.id = pc.cuidado_id
        JOIN status_cuidado s ON s.id = pc.status_id
        WHERE pc.paciente_id = ?
        ORDER BY pc.created_at DESC;`,
        [id],
        (erro, resultado) => {
            if (erro) return res.status(500).json(erro)
            res.json(resultado)
        }
    )
})

//======================================
//    PACIENTES CUIDADOS - [ PUT/:id ]
//======================================

router.put("/:id", (req, res) => {

    const { id } = req.params;
    const { status_id } = req.body;

    db.query(
        `UPDATE paciente_cuidados
         SET status_id = ?
         WHERE id = ?`,
        [status_id, id],
        (erro, resultado) => {
            if (erro) return res.status(500).json(erro)
            res.json({ sucesso: true })
        }
    )
})

module.exports = router