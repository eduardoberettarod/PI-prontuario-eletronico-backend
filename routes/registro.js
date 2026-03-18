const express = require('express')
const router = express.Router()

const db = require('../conexao')
const bcrypt = require('bcrypt')

//======================================
//              REGISTRO
//======================================

router.post("/", async (req, res) => {

    const { primeiro_nome, sobrenome, email, senha } = req.body;

    if (!primeiro_nome || !sobrenome || !email || !senha) {
        return res.status(400).json({ sucesso: false, mensagem: "Dados Inválidos" })
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const novoUsuario = {
            primeiro_nome,
            sobrenome,
            email,
            senha: senhaHash,
            nivel_acesso: "aluno"
        };

        db.query(
            "INSERT INTO usuarios SET ?",
            novoUsuario,
            (erro, resultado) => {
                if (erro) {
                    console.log(erro);
                    return res.status(500).json({
                        sucesso: false,
                        mensagem: "Erro ao registrar usuário"
                    });
                }
                res.status(201).json({
                    sucesso: true,
                    mensagem: "Usuário registrado com sucesso"
                })
            }
        )

    } catch (erro) {
        console.log(erro);
        res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" })
    }

})

module.exports = router