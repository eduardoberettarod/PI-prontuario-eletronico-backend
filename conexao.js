let mysql = require('mysql')

let conexao = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORTA || 4000,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.NOME_BANCO,
    ssl: { rejectUnauthorized: false }
})

function conectar() {
    conexao.connect(function (erro) {
        if (erro) {
            console.error("Erro na conexão com banco:", erro.message);
            setTimeout(conectar, 5000); // Reconectar em 5s
        } else {
            console.log("Conexão com banco estabelecida com sucesso");
        }
    })
}

conexao.on('error', function (err) {
    console.error("Erro de conexão detectado:", err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        conectar();
    }
    if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
        conectar();
    }
    if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
        conectar();
    }
});

conectar();

module.exports = conexao