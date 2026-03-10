const express = require("express");
const app = express();
const porta = 3000;
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

app.use(express.json());

app.listen(porta, () => console.log("Servidor rodando"))

//Testa a rota '/' da API para atestar sucesso
/*app.get('/', (req, res) => {
    res.send("Servidor rodando com sucesso!");
});*/

//Cria na pasta raiz o documento do banco de dados, sua conexao e as tabelas necessarias
let database;
(async () => {
    database = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    //Cria as tabelas se elas não existirem
    await database.exec(`
        CREATE TABLE IF NOT EXISTS Orders(
            orderId TEXT PRIMARY KEY,
            value REAL NOT NULL,
            creationDate TEXT
        )
    `);
    await database.exec(`
        CREATE TABLE IF NOT EXISTS Items(
            productId INTEGER PRIMARY KEY,
            orderId TEXT,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY (orderId) REFERENCES Orders(orderId)
        )
    `);
    console.log("Banco de dados pronto!");
})();

//Rota que espera requisicao para criar novo pedido
app.post('/order', async (req, res) => {
    const {numeroPedido, valorTotal, dataCriacao, items} = req.body;

    try {
        await database.run('INSERT INTO Orders (orderId, value, creationDate) VALUES (?, ?, ?)', 
            [numeroPedido, valorTotal, dataCriacao]);

        for (const item of items) {
            await database.run('INSERT INTO Items (productId, orderId, quantity, price) VALUES (?, ?, ?, ?)',
                [item.idItem, numeroPedido, item.quantidadeItem, item.valorItem]);
        }
        res.status(201).json({ message: "Pedido criado com sucesso!" });
    } catch (err) {
        res.status(400).json({ error: "Erro ao criar pedido. Verifique se o numero dp pedido já existe." });
    }
});

//Rota que lista todos os pedidos da tabela Orders
app.get("/order/list/", async(req, res) => {
    const list = await database.all("SELECT * FROM orders");
    res.json(list);
});

//Rota que obtem o pedido e os respectivos items passando por parametro no URL o numero do pedido
app.get("/order/:numeroPedido", async (req, res) => {
    const order = await database.get("SELECT * FROM Orders WHERE orderId = ?", [req.params.numeroPedido]);
    
    if(order){
        const items = await database.all("SELECT productId, quantity, price FROM Items WHERE orderId = ?", [req.params.numeroPedido]);
        order.items = items;
        res.json(order);
    } 
    else{
        res.status(404).json({ error: "Pedido não encontrado" });
    }
});