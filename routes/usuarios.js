const express = require('express')
const router = express.Router()
const autorizar = require('../middlewares/autorizar')
const bcrypt = require('bcrypt')
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
                email,
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
//       USUARIOS (SENHA) - [ PUT ]
//======================================

router.put(
    "/alterar-senha",
    autorizar("aluno", "docente", "admin"),
    function (req, res) {

        const usuarioId = req.usuario.id
        const { senhaAtual, novaSenha } = req.body

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({
                erro: "Preencha todos os campos"
            })
        }

        // 1. Buscar senha atual no banco
        db.query(
            "SELECT senha FROM usuarios WHERE id = ?",
            [usuarioId],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                if (resultado.length === 0) {
                    return res.status(404).json({
                        erro: "Usuário não encontrado"
                    })
                }

                const senhaHash = resultado[0].senha

                // 2. Comparar senha
                bcrypt.compare(senhaAtual, senhaHash, function (err, senhaValida) {

                    if (err) {
                        console.log(err)
                        return res.status(500).json(err)
                    }

                    if (!senhaValida) {
                        return res.status(400).json({
                            erro: "Senha atual incorreta"
                        })
                    }

                    // 3. Gerar nova hash
                    bcrypt.hash(novaSenha, 10, function (errHash, novaSenhaHash) {

                        if (errHash) {
                            console.log(errHash)
                            return res.status(500).json(errHash)
                        }

                        // 4. Atualizar no banco
                        db.query(
                            "UPDATE usuarios SET senha = ? WHERE id = ?",
                            [novaSenhaHash, usuarioId],
                            function (erroUpdate) {

                                if (erroUpdate) {
                                    console.log(erroUpdate)
                                    return res.status(500).json(erroUpdate)
                                }

                                return res.json({
                                    mensagem: "Senha alterada com sucesso"
                                })
                            }
                        )

                    })

                })

            }
        )

    }
)

//======================================
//         USUARIOS - [ PUT ]
//======================================

router.put(
    "/editar-perfil",
    autorizar("aluno", "docente", "admin"),
    function (req, res) {

        const usuarioId = req.usuario.id
        const { primeiro_nome, sobrenome, email } = req.body

        if (!primeiro_nome || !sobrenome || !email) {
            return res.status(400).json({
                erro: "Preencha todos os campos"
            })
        }

        db.query(
            `UPDATE usuarios 
             SET primeiro_nome = ?, sobrenome = ?, email = ?
             WHERE id = ?`,
            [primeiro_nome, sobrenome, email, usuarioId],
            function (erro, resultado) {

                if (erro) {
                    console.log(erro)
                    return res.status(500).json(erro)
                }

                return res.json({
                    mensagem: "Perfil atualizado com sucesso"
                })
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