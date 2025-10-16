const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();
const path = require("path");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

<<<<<<< HEAD
app.use('/public', express.static('public'));
=======
app.use(express.static('public'));
>>>>>>> 09204ecf45579c6ac0ce350f989724528965314f

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Condominio"
});

connection.connect(err => {
    if (err) {
        console.error("Erro ao conectar no banco:", err);
    } else {
        console.log("Conectado ao MySQL!");
    }
});

app.get("/", function (req, res) {
    res.sendFile(__dirname+ "/index.html")
});

app.get("/blocos",(req,res)=>{
    res.sendFile(__dirname+ "/blocos.html")
});

app.get('/blocos', (req, res) => {
    connection.query('SELECT * FROM blocos', (err, rows) => {
        if (err) return res.status(500).send('Erro ao buscar blocos.');
        let html = `
        <html>
            <head>
              <link rel="stylesheet" href="./public_blocos.css">
            </head>
        <h1>Blocos</h1>
        <form method="POST" action="/blocos_cadastrar">
            <input type="text" name="nome" placeholder="Nome do bloco" required>
            <input type="text" name="descricao" placeholder="Descrição do bloco">
            <button type="submit">Cadastrar</button>
        </form>
        <table border="1">
            <tr><th>ID</th><th>Nome</th><th>Descrição</th><th>Ações</th></tr>
            ${rows.map(b => `<tr>
                <td>${b.id}</td>
                <td>${b.nome}</td>
                <td>${b.descricao || ''}</td>
                <td>
                    <a href="/blocos/editar/${b.id}">Editar</a> |
                    <a href="/blocos/deletar/${b.id}">Excluir</a>
                </td>
            </tr>`).join('')}
        </table>
        <a href="/">Voltar</a>`

        ;
        res.send(html);
    });
});

app.post('/blocos_cadastrar', (req, res) => {
    const { nome, descricao } = req.body;
    connection.query(
        'INSERT INTO blocos (nome, descricao) VALUES (?, ?)',
        [nome, descricao],
        err => {
            if (err) return res.status(500).send('Erro ao cadastrar bloco.', err);
            res.redirect('/blocos');
        }
    );
});

app.get('/blocos/editar/:id', (req, res) => {
    connection.query('SELECT * FROM blocos WHERE id = ?', [req.params.id], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).send('Bloco não encontrado.');
        const bloco = rows[0];
        res.send(`
            <h1>Editar Bloco</h1>
            <form method="POST" action="/blocos/atualizar/${bloco.id}">
                <input type="text" name="nome" value="${bloco.nome}" required>
                <input type="text" name="descricao" value="${bloco.descricao || ''}">
                <button type="submit">Atualizar</button>
            </form>
            <a href="/blocos">Cancelar</a>
        `);
    });
});

app.post('/blocos/atualizar/:id', (req, res) => {
    const { nome, descricao } = req.body;
    connection.query(
        'UPDATE blocos SET nome = ?, descricao = ? WHERE id = ?',
        [nome, descricao, req.params.id],
        err => {
            if (err) return res.status(500).send('Erro ao atualizar bloco.');
            res.redirect('/blocos');
        }
    );
});


app.get("/apartamento",(req,res)=>{
    res.sendFile(__dirname+ "/apartamentos.html")
});
app.get("/apartamentos", (req, res) => {
    connection.query("SELECT * FROM apartamentos", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
            <html>
            <head>
              <link rel="stylesheet" href="./public/apartamento.css">
            </head>
            <h1>Apartamentos</h1>
            <form method="POST" action="/apartamentos/cadastrar">
                <input type="text" name="numero" placeholder="Número" required>
                <input type="number" name="bloco_id" placeholder="ID do Bloco" required>
                <button type="submit">Cadastrar</button>
            </form>
            <table border="1">
                <tr><th>ID</th><th>Número</th><th>Bloco</th><th>Ações</th></tr>
                ${rows.map(a => `<tr>
                    <td>${a.id}</td>
                    <td>${a.numero}</td>
                    <td>${a.bloco_id}</td>
                    <td>
                        <a href="/apartamentos/editar/${a.id}">Editar</a> |
                        <a href="/apartamentos/deletar/${a.id}">Excluir</a>
                    </td>
                </tr>`).join("")}
            </table>
            <a href="/">Voltar</a>
            </html>
        `);
    });
});

app.post("/apartamentos/cadastrar", (req, res) => {
    connection.query("INSERT INTO apartamentos (numero, bloco_id) VALUES (?, ?)", [req.body.numero, req.body.bloco_id], err => {
        if (err) return res.send("Erro: " + err);
        res.redirect("/apartamentos");
    });
});

app.get("/moradores",(req,res)=>{
    res.sendFile(__dirname+ "/moradores.html")
});
app.get("/moradores", (req, res) => {
    connection.query("SELECT * FROM moradores", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
            <html>
            <head>
              <link rel="stylesheet" href="./public/moradores.css">
            </head>
            <h1>Moradores</h1>
            <form method="POST" action="/moradores/cadastrar">
                <input type="text" name="nome" placeholder="Nome" required>
                <input type="text" name="telefone" placeholder="Telefone">
                <input type="email" name="email" placeholder="Email">
                <input type="text" name="cpf" placeholder="CPF" required>
                <input type="number" name="apartamento_id" placeholder="Apartamento ID">
                <button type="submit">Cadastrar</button>
            </form>
            <table border="1">
                <tr><th>ID</th><th>Nome</th><th>Telefone</th><th>Email</th><th>Apartamento</th></tr>
                ${rows.map(m => `<tr>
                    <td>${m.id}</td>
                    <td>${m.nome}</td>
                    <td>${m.telefone || ""}</td>
                    <td>${m.email || ""}</td>
                    <td>${m.apartamento_id || ""}</td>
                </tr>`).join("")}
            </table>
            <a href="/">Voltar</a>
            </html>
        `);
    });
});

app.post("/moradores/cadastrar", (req, res) => {
    const { nome, telefone, email, apartamento_id, cpf } = req.body;
    connection.query("INSERT INTO moradores (nome, telefone, email, apartamento_id, cpf) VALUES (?, ?, ?, ?, ?)",
        [nome, telefone, email, apartamento_id, cpf], err => {
            if (err) return res.send("Erro: " + err);
            res.redirect("/moradores");
        });
});


app.get("/pagamento",(req,res)=>{
    res.sendFile(__dirname+ "/pagamentos.html")
});
app.get("/pagamentos", (req, res) => {
    connection.query("SELECT * FROM pagamentos", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
            <html>
            <head>
              <link rel="stylesheet" href="./public/pagamentos.css">
            </head>
            <h1>Pagamentos</h1>
            <form method="POST" action="/pagamentos/cadastrar">
                <input type="text" name="nome_morador" placeholder="nome Morador" required>
                <input type="date" name="data_pagamento" required>
                <input type="number" step="0.01" name="valor" placeholder="Valor" required>
                <button type="submit">Cadastrar</button>
            </form>
            <table border="1">
                <tr><th>ID</th><th>Morador</th><th>Data</th><th>Valor</th></tr>
                ${rows.map(p => `<tr>
                    <td>${p.id}</td>
                    <td>${p.nome_morador}</td>
                    <td>${p.data_pagamentos}</td>
                    <td>${p.valor}</td>
                </tr>`).join("")}
            </table>
            <a href="/">Voltar</a>
            </html>
        `);
    });
});

app.post("/pagamentos/cadastrar", (req, res) => {
    const { nome_morador, data_pagamento, valor } = req.body;
    connection.query("INSERT INTO pagamentos ( nome_morador, data_pagamento, valor) VALUES (?, ?, ?)", [nome_morador, data_pagamento, valor], err => {
        if (err) return res.send("Erro: " + err);
        res.redirect("/pagamentos");
    });
});

app.get("/tipomanutencao",(req,res)=>{
    res.sendFile(__dirname+ "/tiposmanutencao.html")
});

app.post('/tiposmanutencao', (req, res) => {
    const {id_tipo, descricao } = req.body;
    const insert = 'INSERT INTO tipos_manutencao (descricao) VALUES (?)';
    connection.query(insert, [descricao], (err) => {
        if (err) {
            console.error("Erro ao cadastrar tipo de manutenção: ", err);
            res.status(500).send('Erro ao cadastrar tipo de manutenção');
            return;
        } else {
            res.redirect('/listar-tiposmanutencao');
        }
    });
});


app.get('/listar-tiposmanutencao', (req, res) => {
    const select = 'SELECT * FROM tipos_manutencao';
    connection.query(select, (err, rows) => {
        if (err) {
            console.error("Erro listar tipos de manutenções: ", err);
            res.status(500).send('Erro ao listar tipos de manutenções');
            return;
        } else {
            res.send(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <title>Listagem de Tipos de Manutenção</title>
                </head>
                <body>
                    <h1>Dados da Manutenção</h1>
                    <table>
                        <tr>
                            <th>ID Tipo</th>
                            <th>Descrição</th>
                            <th>Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.id_tipo}</td>
                                <td>${row.descricao}</td>
                                <td class="acoes">
                                    <a href="/deletar-tipos-manutencoes/${row.id_tipo}">Deletar</a>
                                    <a href="/atualizar-tipos-manutencoes/${row.id_tipo}">Atualizar</a>
                                </td>
                            </tr>`).join('')}
                    </table>
                    <a href="/" class="voltar">Voltar</a>
                </body>
                </html>
            `);
        }
    });
});

app.get('/deletar-tiposmanutencoes/:id_tipo', (req, res) => {
    const id_tipo = req.params.id_tipo;
    const deletar = 'DELETE FROM tipos_manutencao WHERE id_tipo = ?';
    connection.query(deletar, [id_tipo], (err) => {
        if (err) {
            console.error("Erro ao deletar tipo de manutenção: ", err);
            res.status(500).send('Erro ao deletar tipo de manutenção');
            return;
        } else {
            res.redirect('/listar-tiposmanutencao');
        }
    });
});

app.get('/atualizar-tiposmanutencoes/:id_tipo', (req, res) => {
    const id_tipo = req.params.id_tipo;
    const select = 'SELECT * FROM tipos_manutencao WHERE id_tipo = ?';
    connection.query(select, [id_tipo], (err, rows) => {
        if (!err && rows.length > 0) {
            const tipo_manutencao = rows[0];
            res.send(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <title>Atualizar Manutenção</title>
                </head>
                <body>
                    <h1>Atualizar Tipo de Manutenção</h1>
                    <form action="/atualizar-manutencoes/${tipo_manutencao.id_tipo}" method="POST">
                        <label for="id_tipo">ID Tipo:</label>
                        <input type="text" id="id_tipo" name="id_tipo" value="${tipo_manutencao.id_tipo}" required>

                        <label for="descricao">Descrição da Manutenção:</label>
                        <input type="text" id="descricao" name="descricao" value="${tipo_manutencao.descricao}" required>

                        <input type="submit" value="Atualizar">
                    </form>
                    <a href="/listar-tiposmanutencao" class="voltar">Voltar</a>
                </body>
                </html>
            `);
        } else {
            res.status(404).send('Tipo de manutenção não encontrada');
        }
    });
});

app.post('/atualizar-tipos-manutencoes/:id_tipo', (req, res) => {
    const id_tipo = req.params.id_tipo;
    const { descricao } = req.body;
    const update = 'UPDATE tipos_manutencao SET descricao = ? WHERE id_tipo = ?';
    connection.query(update, [descricao, id_tipo], (err) => {
        if (err) {
            res.status(500).send('Erro ao atualizar tipo de manutenção');
        } else {
            res.redirect('/listar-tiposmanutencao');
        }
    });
});

app.get("/manutencoes",(req,res)=>{
    res.sendFile(__dirname+ "/manutencoes.html")
});
app.get("/manutencoes", (req, res) => {
    connection.query("SELECT * FROM manutencoes", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
            <html>
            <head>
              <link rel="stylesheet" href="./public/manutencoes.css">
            </head>
            <h1>Manutenções Realizadas</h1>
            <form method="POST" action="/manutencoes/cadastrar">
                <input type="number" name="tipo_id" placeholder="Tipo ID" required>
                <input type="date" name="bloco_id" required>
                <textarea name="descricao" placeholder="Descrição"></textarea>
                <button type="submit">Cadastrar</button>
            </form>
            <table border="1">
                <tr><th>ID</th><th>Tipo</th><th>Data</th><th>Descrição</th></tr>
                ${rows.map(m => `<tr>
                    <td>${m.id}</td>
                    <td>${m.tipo_id}</td>
                    <td>${m.data}</td>
                    <td>${m.descricao}</td>
                </tr>`).join("")}
            </table>
            <a href="/">Voltar</a>
            </html>
        `);
    });
});

app.post("/manutencoes/cadastrar", (req, res) => {
    const { tipo_id, data, descricao } = req.body;
    connection.query("INSERT INTO manutencoes (tipo_id, bloco_id, descricao) VALUES (?, ?, ?)", [tipo_id, bloco_id, descricao], err => {
        if (err) return res.send("Erro: " + err);
        res.redirect("/manutencoes");
    });
});



app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
