const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')
const db = require('../conexao')

//======================================
//         PACIENTES - [ GET ]
//======================================

router.get(
    "/",
    autorizar("docente", "admin", "aluno"),
    function (req, res) {

        db.query(
            `SELECT 
            pacientes.*,
            setores.nome_setor
            FROM pacientes
            JOIN setores ON pacientes.id_setor = setores.id
            ORDER BY pacientes.created_at DESC`,
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
//         PACIENTES - [ POST ]
//======================================

router.post(
    "/",
    autorizar("docente", "admin"),
    function (req, res) {

        const { nome_paciente, mae_paciente, data_nasc, tipo_sanguineo, fator_rh,
            equipe, status_paciente, convenio, quarto, leito, id_setor } = req.body

        const tipo_sanguineoValidos = ['A', 'B', 'AB', 'O']
        const fator_rhValidos = ['+', '-']

        if (!tipo_sanguineoValidos.includes(tipo_sanguineo)) {
            return res.status(400).json({
                erro: "Tipo sanguíneo inválido"
            })
        }

        if (!fator_rhValidos.includes(fator_rh)) {
            return res.status(400).json({
                erro: "Fator RH inválido"
            })
        }

        db.query(
            `INSERT INTO pacientes (
            nome_paciente, mae_paciente, data_nasc, tipo_sanguineo, fator_rh,
            equipe, status_paciente, convenio, quarto, leito, id_setor
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [nome_paciente, mae_paciente, data_nasc, tipo_sanguineo, fator_rh,
                equipe, status_paciente, convenio, quarto, leito, id_setor],

            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                res.status(201).json({
                    mensagem: "Paciente cadastrado com sucesso",
                    id: resultado.insertId
                })
            }
        )
    })

//======================================
//         PACIENTES - [ DELETE:id ]
//======================================

router.delete(
    "/:id",
    autorizar("admin", "docente"),
    function (req, res) {

        const { id } = req.params

        db.query(
            "DELETE FROM pacientes WHERE id = ?",
            [id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Paciente não encontrado"
                    })
                }

                res.json({
                    mensagem: "Paciente deletado com sucesso"
                })

            }
        )

    }
)

//======================================
//         PACIENTES - [ GET:id ]
//======================================

router.get(
    "/:id",
    autorizar("docente", "admin", "aluno"),
    function (req, res) {

        const { id } = req.params;

        db.query(
            `SELECT 
                pacientes.*,
                setores.nome_setor
             FROM pacientes
             JOIN setores ON pacientes.id_setor = setores.id
             WHERE pacientes.id = ?`,
            [id],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                res.json(resultado[0])
            }
        )
    }
)

//======================================
//         PACIENTES - [ PUT:id ]
//======================================

router.put(
    "/:id",
    autorizar("admin", "docente"),
    function (req, res) {

        const { id } = req.params;

        const {
            nome_paciente,
            mae_paciente,
            data_nasc,
            tipo_sanguineo,
            fator_rh,
            equipe,
            status_paciente,
            convenio,
            quarto,
            leito,
            id_setor
        } = req.body;

        db.query(
            `UPDATE pacientes SET 
                nome_paciente = ?, 
                mae_paciente = ?, 
                data_nasc = ?, 
                tipo_sanguineo = ?, 
                fator_rh = ?, 
                equipe = ?, 
                status_paciente = ?, 
                convenio = ?, 
                quarto = ?, 
                leito = ?, 
                id_setor = ?
             WHERE id = ?`,
            [
                nome_paciente,
                mae_paciente,
                data_nasc,
                tipo_sanguineo,
                fator_rh,
                equipe,
                status_paciente,
                convenio,
                quarto,
                leito,
                id_setor,
                id
            ],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro);
                    return res.status(500).json(erro);
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        erro: "Paciente não encontrado"
                    });
                }

                res.json({
                    mensagem: "Paciente atualizado com sucesso"
                });

            }
        );
    }
);

module.exports = router