function autorizar(...niveisPermitidos) {

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

        req.usuario = usuario

        next()

    }

}

module.exports = autorizar