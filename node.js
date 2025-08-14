// app.js - Sistema de Gestão de Condomínios (base Node.js)
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'condominio'
});

connection.connect(err => {
    if (err) return console.error('Erro ao conectar:', err);
    console.log('Conectado ao banco de dados.');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Cadastro de blocos
app.get('/blocos', (req, res) => {
    connection.query('SELECT * FROM blocos', (err, rows) => {
        if (err) return res.status(500).send('Erro ao buscar blocos.');
        let html = `<h1>Blocos</h1>
        <form method="POST" action="/blocos/cadastrar">
            <input type="text" name="nome" placeholder="Nome do bloco" required>
            <button type="submit">Cadastrar</button>
        </form>
        <table border="1">
            <tr><th>ID</th><th>Nome</th><th>Ações</th></tr>
            ${rows.map(b => `<tr><td>${b.id}</td><td>${b.nome}</td><td>
                <a href="/blocos/editar/${b.id}">Editar</a> |
                <a href="/blocos/deletar/${b.id}">Excluir</a>
            </td></tr>`).join('')}
        </table>
        <a href="/">Voltar</a>`;
        res.send(html);
    });
});

app.post('/blocos/cadastrar', (req, res) => {
    const { nome } = req.body;
    connection.query('INSERT INTO blocos (nome) VALUES (?)', [nome], err => {
        if (err) return res.status(500).send('Erro ao cadastrar bloco.');
        res.redirect('/blocos');
    });
});

app.get('/blocos/deletar/:id', (req, res) => {
    connection.query('DELETE FROM blocos WHERE id = ?', [req.params.id], err => {
        if (err) return res.status(500).send('Erro ao deletar bloco.');
        res.redirect('/blocos');
    });
});

app.get('/blocos/editar/:id', (req, res) => {
    connection.query('SELECT * FROM blocos WHERE id = ?', [req.params.id], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).send('Bloco não encontrado.');
        const bloco = rows[0];
        res.send(`
            <h1>Editar Bloco</h1>
            <form method="POST" action="/blocos/atualizar/${bloco.id}">
                <input type="text" name="nome" value="${bloco.nome}" required>
                <button type="submit">Atualizar</button>
            </form>
            <a href="/blocos">Cancelar</a>
        `);
    });
});

app.post('/blocos/atualizar/:id', (req, res) => {
    const { nome } = req.body;
    connection.query('UPDATE blocos SET nome = ? WHERE id = ?', [nome, req.params.id], err => {
        if (err) return res.status(500).send('Erro ao atualizar bloco.');
        res.redirect('/blocos');
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
