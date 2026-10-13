const express = require('express');
const Database = require('better-sqlite3');
const app = express();

const db = new Database('banco.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    curso TEXT
  )
`);

app.use(express.json());

app.post('/usuario', (req, res) => {
  const inserir = db.prepare('INSERT INTO usuarios (nome, curso) VALUES (?, ?)');
  inserir.run(req.body.nome, req.body.curso);
  res.send('Usuário salvo!');
});

app.get('/usuarios', (req, res) => {
  const buscar = db.prepare('SELECT * FROM usuarios');
  const todos = buscar.all();
  res.send(todos);
});

app.put('/usuario/:id', (req, res) => {
    const id = req.params.id;
    const nome = req.body.nome;
    const curso = req.body.curso;

    const atualizar = db.prepare(
        'UPDATE usuarios SET nome = ?, curso = ? WHERE id = ?'
    );

    atualizar.run(nome, curso, id);

    res.send('Usuário atualizado!');
});

app.delete('/usuario/:id', (req, res) => {
    const id = req.params.id;

    const apagar = db.prepare(
        'DELETE FROM usuarios WHERE id = ?'
    );

    apagar.run(id);

    res.send('Usuário apagado!');
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

