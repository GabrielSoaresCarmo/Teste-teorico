const express = require("express");
const app = express();
const porta = 3000;

app.listen(porta, () => console.log("Servidor rodando"))

app.get('/', (req, res) => {
  res.send("Servidor rodando com sucesso!");
});

