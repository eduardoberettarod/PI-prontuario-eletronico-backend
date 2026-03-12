function verificarNivel(...niveisPermitidos) {

    return function (req, res, next) {

        const usuario = req.session.usuario

        if (!usuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        if (!niveisPermitidos.includes(usuario.nivel_acesso)) {
            return res.status(403).json({
                erro: "Sem permissão"
            })
        }

        next()
    }

}

module.exports = verificarNivel