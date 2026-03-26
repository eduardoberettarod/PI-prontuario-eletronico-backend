const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')
const db = require('../conexao')

//======================================
//         RELATORIOS - [ GET ]
//======================================

router.get('/',
    autorizar("docente", "admin", "aluno"),
    async (req, res) => {
        try {
            db.query(`
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
            `, function (erro, resultados) {
                res.json(resultados)
            })

        } catch (erro) {
            console.error(erro);
            res.status(erro)
        }
    }
);

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
//      RELATORIOS - [ DELETE/:id ]
//======================================

router.delete(
    "/:id",
    autorizar("admin", "docente", "aluno"),
    function (req, res) {

        const { id } = req.params
        db.query(
            "DELETE FROM relatorios WHERE id = ?",
            [id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Relatório não encontrado"
                    })
                }

                res.json({
                    mensagem: "Relatório deletado com sucesso"
                })

            }
        )
    }
)

//======================================
//         RELATORIOS - [ PUT ]
//======================================

router.put('/:id',
    autorizar("docente", "admin", "aluno"),
    (req, res) => {

        const { id } = req.params;
        const { paciente_id, titulo, conteudo } = req.body;

        db.query(
            `UPDATE relatorios 
             SET paciente_id = ?, titulo = ?, conteudo = ?
             WHERE id = ?`,
            [paciente_id, titulo, conteudo, id],
            (erro, result) => {

                if (erro) {
                    console.error(erro);
                    return res.status(500).json({ erro: 'Erro ao atualizar relatório' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ erro: 'Relatório não encontrado' });
                }

                return res.json({ msg: 'Relatório atualizado com sucesso' });
            }
        );
    }
);

module.exports = router