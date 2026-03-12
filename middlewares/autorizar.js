function autorizar(...niveisPermitidos) {

    return function (req, res, next) {

        if (!req.usuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        if (!niveisPermitidos.includes(req.usuario.nivel_acesso)) {
            return res.status(403).json({
                erro: "Sem permissão"
            })
        }

        next()

    }

}

module.exports = autorizar