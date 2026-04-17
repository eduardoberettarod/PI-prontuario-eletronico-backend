const jwt = require('jsonwebtoken')

function verificarLogin(req, res, next) {

    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            erro: "Usuário não autenticado"
        })
    }

    try {
        const usuario = jwt.verify(token, process.env.SESSION_SECRET)
        req.usuario = usuario
        next()
    } catch (erro) {
        return res.status(401).json({
            erro: "Token inválido ou expirado"
        })
    }
}

module.exports = verificarLogin