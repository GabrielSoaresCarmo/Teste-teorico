const express = require("express");
const app = express();
const porta = 3000;
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

//app.use(express.json);

app.listen(porta, () => console.log("Servidor rodando"))

//Testa a rota '/' da API para atestar sucesso
app.get('/', (req, res) => {
  res.send("Servidor rodando com sucesso!");
});

//Cria na pasta raiz o documento do banco de dados, sua conexao e as tabelas necessarias
let database;
(async () => {
    database = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    //Cria as tabelas se elas não existirem
    await database.exec(`
        CREATE TABLE IF NOT EXISTS Order(
            orderId TEXT PRIMARY KEY,
            value REAL,
            criationDate TEXT
        )

        CREATE TABLE IF NOT EXISTS Items(
            productId INTEGER PRIMARY KEY,
            orderId TEXT, 
            quantity INTEGER,
            price REAL,
            FOREIGN KEY (orderId) REFERENCES Order(orderId)
        )
    `);
    console.log("Banco de dados pronto!");
})();