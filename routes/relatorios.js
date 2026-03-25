const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')
const db = require('../conexao')

//======================================
//         RELATORIOS - [ POST ]
//======================================

router.post('/',
    autorizar("docente", "admin", "aluno"),
    async (req, res) => {
        const { paciente_id, titulo, conteudo } = req.body;

        const usuario_id = req.session.usuario.id;

        try {
            await db.query(
                `INSERT INTO relatorios (paciente_id, usuario_id, titulo, conteudo)
             VALUES (?, ?, ?, ?)`,
                [paciente_id, usuario_id, titulo, conteudo]
            );

            res.status(201).json({ msg: 'Relatório criado com sucesso' });

        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao criar relatório' });
        }
    });

//======================================
//         RELATORIOS - [ GET ]
//======================================

router.get('/',
    autorizar("docente", "admin", "aluno"),
    async (req, res) => {
        try {
            const [rows] = await db.query(`
            SELECT 
                r.id,
                r.titulo,
                r.conteudo,
                r.created_at,

                p.nome_paciente,
                p.id AS paciente_id,

                u.primeiro_nome AS usuario_nome

            FROM relatorios r
            JOIN pacientes p ON r.paciente_id = p.id
            JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.created_at DESC
            `);

            res.json(rows);

        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao buscar relatórios' });
        }
    }
);

module.exports = router