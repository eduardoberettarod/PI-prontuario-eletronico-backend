let mysql = require('mysql')
let conexao = mysql.createConnection({
    host: process.env.HOST,
    port: 4000,                    
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.NOME_BANCO,
    ssl: { rejectUnauthorized: true } 
})

conexao.connect(function (erro) {
    if (erro) {
        console.log("Deu ruim na conexão \n");
        throw erro;
    } else {
        console.log("Conexão deu bom \n")
    }
})

module.exports = conexao