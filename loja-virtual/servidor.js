const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.static('public'));

const PORT = 3000;

// 1. Lê a chave do .env (process.env guarda as variáveis de ambiente)
const JWT_SECRET = process.env.JWT_SECRET;

// 2. Sem chave, o servidor nem sobe, melhor que falhar só no login
if (!JWT_SECRET) {
  console.error('Falta JWT_SECRET no arquivo .env');
  process.exit(1);
}

app.use(express.json());

// 3. O e-mail do dono da loja também vem do .env
const EMAIL_DONO = process.env.EMAIL_DONO;

// 4. Sem ele, ninguém conseguiria cadastrar produto; melhor avisar na hora
if (!EMAIL_DONO) {
  console.error('Falta EMAIL_DONO no arquivo .env');
  process.exit(1);
}

const db = new Database('loja.db', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios_loja (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios_loja(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  )
`);

// Transação: cria o pedido e todos os itens, ou não cria nada (tudo ou nada)
const criarPedido = db.transaction((usuario_id, itens) => {
  const stmtPedido = db.prepare('INSERT INTO pedidos (usuario_id) VALUES (?)');
  const resultadoPedido = stmtPedido.run(usuario_id);
  const pedidoId = resultadoPedido.lastInsertRowid;

  const stmtItem = db.prepare(`
    INSERT INTO itens_pedido (pedido_id, produto_id, quantidade)
    VALUES (?, ?, ?)
  `);

  for (const item of itens) {
    stmtItem.run(pedidoId, item.produto_id, item.quantidade);
  }

  return pedidoId;
});

// Middleware de Autenticação JWT
const autenticar = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2) {
    return res.status(401).json({ erro: 'Erro no formato do token.' });
  }

  const [esquema, token] = partes;
  if (!/^Bearer$/i.test(esquema)) {
    return res.status(401).json({ erro: 'Token mal formatado.' });
  }

  jwt.verify(token, JWT_SECRET, (erro, payloadDecodificado) => {
    if (erro) {
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }

    req.usuario = payloadDecodificado;
    next();
  });
};

// Só deixa passar o dono da loja (precisa vir depois do autenticar)
function apenasDono(req, res, next) {
  try {
    // 1. O autenticar já guardou quem é o usuário em req.usuario
    // 2. Busca o e-mail desse usuário no banco
    const usuario = db.prepare('SELECT email FROM usuarios_loja WHERE id = ?').get(req.usuario.id);

    // 3. Só passa se o e-mail for o do dono
    if (!usuario || usuario.email !== EMAIL_DONO) {
      return res.status(403).json({ erro: 'Apenas o dono da loja pode fazer isso.' });
    }

    next();
  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno ao conferir o dono da loja.' });
  }
}

app.get('/', (req, res) => {
  res.send('Servidor e banco loja.db rodando com sucesso!');
});

// ===== USUÁRIOS =====

app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  try {
    const SALT_ROUNDS = 10;
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const stmt = db.prepare(`
      INSERT INTO usuarios_loja (nome, email, senha)
      VALUES (?, ?, ?)
    `);

    const resultado = stmt.run(nome, email, senhaHash);

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: resultado.lastInsertRowid,
        nome,
        email
      }
    });

  } catch (erro) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    res.status(500).json({ erro: 'Erro interno no servidor ao cadastrar usuário.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const stmt = db.prepare('SELECT * FROM usuarios_loja WHERE email = ?');
    const usuario = stmt.get(email);

    if (!usuario) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token, // Token incluído corretamente na resposta
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno no servidor ao realizar login.' });
  }
});

// ===== PRODUTOS =====

app.post('/produtos', autenticar, apenasDono, (req, res) => {
  const { nome, preco } = req.body;

  if (!nome || typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ erro: 'Informe o nome e um preço numérico maior ou igual a zero.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO produtos (nome, preco) VALUES (?, ?)');
    const resultado = stmt.run(nome, preco);

    res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso!',
      produto: {
        id: resultado.lastInsertRowid,
        nome,
        preco
      }
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno ao cadastrar produto.' });
  }
});

app.get('/produtos', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM produtos');
    const produtos = stmt.all();

    res.json(produtos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno ao buscar produtos.' });
  }
});

app.put('/produtos/:id', autenticar, apenasDono, (req, res) => {
  const id = req.params.id;
  const { nome, preco } = req.body;

  if (!nome || typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ erro: 'Informe o nome e um preço numérico maior ou igual a zero.' });
  }

  try {
    const atualizar = db.prepare('UPDATE produtos SET nome = ?, preco = ? WHERE id = ?');
    const resultado = atualizar.run(nome, preco, id);

    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    res.json({ mensagem: 'Produto atualizado com sucesso!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno ao atualizar produto.' });
  }
});

app.delete('/produtos/:id', autenticar, apenasDono, (req, res) => {
  const id = req.params.id;

  try {
    const apagar = db.prepare('DELETE FROM produtos WHERE id = ?');
    const resultado = apagar.run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    res.json({ mensagem: 'Produto apagado com sucesso!' });
  } catch (erro) {
    if (erro.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(409).json({ erro: 'Não é possível deletar este produto pois ele está vinculado a pedidos existentes.' });
    }

    res.status(500).json({ erro: 'Erro interno ao apagar produto.' });
  }
});

// ===== PEDIDOS =====

// Rota protegida pelo middleware 'autenticar'
app.post('/pedidos', autenticar, (req, res) => {
  const usuario_id = req.usuario.id; // Extraído de forma segura direto do token decodificado
  const { itens } = req.body;

  if (
    !Array.isArray(itens) ||
    itens.length === 0 ||
    itens.some(item =>
      !item ||
      typeof item.produto_id !== 'number' ||
      !Number.isInteger(item.quantidade) ||
      item.quantidade <= 0
    )
  ) {
    return res.status(400).json({
      erro: 'Informe itens (lista não vazia, cada item com produto_id e quantidade inteira maior que zero).'
    });
  }

  try {
    const novoPedidoId = criarPedido(usuario_id, itens);

    res.status(201).json({
      mensagem: 'Pedido realizado com sucesso!',
      pedido_id: novoPedidoId
    });
  } catch (erro) {
    if (erro.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ erro: 'Usuário ou produto informado não existe no banco de dados.' });
    }

    res.status(500).json({ erro: 'Erro interno ao processar o pedido.' });
  }
});

app.get('/pedidos/:id', autenticar, (req, res) => {
  // 1. Pega o id do pedido que veio na URL
  const id = req.params.id;

  try {
    // 2. Busca o pedido e confere de quem ele é
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);

    // 3. Pedido que não existe, ou que é de outra pessoa: a mesma resposta
    //    (assim ninguém descobre quais pedidos existem)
    if (!pedido || pedido.usuario_id !== req.usuario.id) {
      return res.status(404).json({ erro: 'Pedido não encontrado.' });
    }

    // 4. Junta itens_pedido com produtos, só desse pedido
    const stmt = db.prepare(`
      SELECT produtos.nome, produtos.preco, itens_pedido.quantidade
      FROM itens_pedido
      JOIN produtos ON itens_pedido.produto_id = produtos.id
      WHERE itens_pedido.pedido_id = ?
    `);
    const itens = stmt.all(id);

    // 5. Soma preço × quantidade de cada item (pedido sem itens dá 0)
    const total = itens.reduce((acumulador, itemAtual) => {
      return acumulador + itemAtual.preco * itemAtual.quantidade;
    }, 0);

    // 6. Devolve o pedido, os itens e o total
    res.json({ pedido_id: pedido.id, itens, total });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno ao buscar pedido.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});