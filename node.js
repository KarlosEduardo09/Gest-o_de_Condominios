const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();
const path = require("path");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
// Conexão com MySQL
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "condominio"
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

app.get('/blocos', (req, res) => {
    connection.query('SELECT * FROM blocos', (err, rows) => {
        if (err) return res.status(500).send('Erro ao buscar blocos.');
        let html = `<h1>Blocos</h1>
        <form method="POST" action="/blocos/cadastrar">
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
        <a href="/">Voltar</a>`;
        res.send(html);
    });
});

app.post('/blocos/cadastrar', (req, res) => {
    const { nome, descricao } = req.body;
    connection.query(
        'INSERT INTO blocos (nome, descricao) VALUES (?, ?)',
        [nome, descricao],
        err => {
            if (err) return res.status(500).send('Erro ao cadastrar bloco.');
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



app.get("/apartamentos", (req, res) => {
    connection.query("SELECT * FROM apartamentos", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
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
        `);
    });
});

app.post("/apartamentos/cadastrar", (req, res) => {
    connection.query("INSERT INTO apartamentos (numero, bloco_id) VALUES (?, ?)", [req.body.numero, req.body.bloco_id], err => {
        if (err) return res.send("Erro: " + err);
        res.redirect("/apartamentos");
    });
});


app.get("/moradores", (req, res) => {
    connection.query("SELECT * FROM moradores", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
            <h1>Moradores</h1>
            <form method="POST" action="/moradores/cadastrar">
                <input type="text" name="nome" placeholder="Nome" required>
                <input type="text" name="telefone" placeholder="Telefone">
                <input type="email" name="email" placeholder="Email">
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
        `);
    });
});

app.post("/moradores/cadastrar", (req, res) => {
    const { nome, telefone, email, apartamento_id } = req.body;
    connection.query("INSERT INTO moradores (nome, telefone, email, apartamento_id) VALUES (?, ?, ?, ?)",
        [nome, telefone, email, apartamento_id], err => {
            if (err) return res.send("Erro: " + err);
            res.redirect("/moradores");
        });
});



app.get("/pagamentos", (req, res) => {
    connection.query("SELECT * FROM pagamentos", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
            <h1>Pagamentos</h1>
            <form method="POST" action="/pagamentos/cadastrar">
                <input type="number" name="morador_id" placeholder="ID Morador" required>
                <input type="date" name="data" required>
                <input type="number" step="0.01" name="valor" placeholder="Valor" required>
                <button type="submit">Cadastrar</button>
            </form>
            <table border="1">
                <tr><th>ID</th><th>Morador</th><th>Data</th><th>Valor</th></tr>
                ${rows.map(p => `<tr>
                    <td>${p.id}</td>
                    <td>${p.morador_id}</td>
                    <td>${p.data}</td>
                    <td>${p.valor}</td>
                </tr>`).join("")}
            </table>
            <a href="/">Voltar</a>
        `);
    });
});

app.post("/pagamentos/cadastrar", (req, res) => {
    const { morador_id, data, valor } = req.body;
    connection.query("INSERT INTO pagamentos (morador_id, data, valor) VALUES (?, ?, ?)", [morador_id, data, valor], err => {
        if (err) return res.send("Erro: " + err);
        res.redirect("/pagamentos");
    });
});



app.get("/tipos_manutencao", (req, res) => {
    connection.query("SELECT * FROM tipos_manutencao", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
            <h1>Tipos de Manutenção</h1>
            <form method="POST" action="/tipos_manutencao/cadastrar">
                <input type="text" name="descricao" placeholder="Descrição" required>
                <button type="submit">Cadastrar</button>
            </form>
            <table border="1">
                <tr><th>ID</th><th>Descrição</th></tr>
                ${rows.map(t => `<tr>
                    <td>${t.id}</td>
                    <td>${t.descricao}</td>
                </tr>`).join("")}
            </table>
            <a href="/">Voltar</a>
        `);
    });
});

app.post("/tipos_manutencao/cadastrar", (req, res) => {
    connection.query("INSERT INTO tipos_manutencao (descricao) VALUES (?)", [req.body.descricao], err => {
        if (err) return res.send("Erro: " + err);
        res.redirect("/tipos_manutencao");
    });
});


app.get("/manutencoes", (req, res) => {
    connection.query("SELECT * FROM manutencoes", (err, rows) => {
        if (err) return res.send("Erro: " + err);
        res.send(`
            <h1>Manutenções Realizadas</h1>
            <form method="POST" action="/manutencoes/cadastrar">
                <input type="number" name="tipo_id" placeholder="Tipo ID" required>
                <input type="date" name="data" required>
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
        `);
    });
});

app.post("/manutencoes/cadastrar", (req, res) => {
    const { tipo_id, data, descricao } = req.body;
    connection.query("INSERT INTO manutencoes (tipo_id, data, descricao) VALUES (?, ?, ?)", [tipo_id, data, descricao], err => {
        if (err) return res.send("Erro: " + err);
        res.redirect("/manutencoes");
    });
});



app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
