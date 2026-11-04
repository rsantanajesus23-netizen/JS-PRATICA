// ===== CARRINHO DE COMPRAS =====
const carrinho = [];

const listaCarrinho = document.getElementById('lista-carrinho');
const totalCarrinho = document.getElementById('total-carrinho');
const botaoFinalizar = document.getElementById('botao-finalizar');
const mensagemCarrinho = document.getElementById('mensagem-carrinho');

function renderizarCarrinho() {
    listaCarrinho.innerHTML = '';

    if (carrinho.length === 0) {
        listaCarrinho.innerHTML = '<li>O carrinho está vazio.</li>';
        totalCarrinho.textContent = 'Total: R$ 0.00';
        return;
    }

    carrinho.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.nome} x ${item.quantidade} - R$ ${(item.preco * item.quantidade).toFixed(2)}`;
        listaCarrinho.appendChild(li);
    });

    const valorTotal = carrinho.reduce((acumulador, itemAtual) => {
        return acumulador + (itemAtual.preco * itemAtual.quantidade);
    }, 0);

    totalCarrinho.textContent = `Total: R$ ${valorTotal.toFixed(2)}`;
}

function adicionarAoCarrinho(produto) {
    const existente = carrinho.find(item => item.produto_id === produto.id);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            produto_id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }

    renderizarCarrinho();
}

botaoFinalizar.addEventListener('click', async () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
        mensagemCarrinho.textContent = 'Você precisa estar logado para finalizar o pedido.';
        mensagemCarrinho.style.color = 'red';
        return;
    }

    if (carrinho.length === 0) {
        mensagemCarrinho.textContent = 'O carrinho está vazio.';
        mensagemCarrinho.style.color = 'red';
        return;
    }

    const itensParaEnviar = carrinho.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade
    }));

    try {
        const resposta = await fetch('/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ itens: itensParaEnviar })
        });

        const dados = await resposta.json();

        if (resposta.status === 401) {
            sessionStorage.removeItem('token');
            atualizarTela();
            mensagemLogin.textContent = 'Sessão expirada. Entre de novo.';
            return;
        }

        if (!resposta.ok) {
            mensagemCarrinho.textContent = dados.erro || 'Erro ao finalizar o pedido.';
            mensagemCarrinho.style.color = 'red';
            return;
        }

        mensagemCarrinho.textContent = `${dados.mensagem} ID do pedido: ${dados.pedido_id}`;
        mensagemCarrinho.style.color = 'green';

        carrinho.length = 0;
        renderizarCarrinho();

    } catch (erro) {
        mensagemCarrinho.textContent = 'Erro de conexão ao finalizar o pedido.';
        mensagemCarrinho.style.color = 'red';
        console.error('Erro no pedido:', erro);
    }
});

// ===== VERIFICAR PERFIL =====
async function verificarPerfil() {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
        const resposta = await fetch('/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resposta.ok) {
            const dados = await resposta.json();
            return dados.ehDono;
        }

        return false;
    } catch (erro) {
        console.error('Erro ao verificar perfil:', erro);
        return false;
    }
}

// ===== APAGAR PRODUTO =====
async function apagarProduto(id) {
    const token = sessionStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado como dono para apagar produtos.');
        return;
    }

    try {
        const resposta = await fetch(`/produtos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao apagar o produto.');
            return;
        }

        carregarProdutos();

    } catch (erro) {
        console.error('Erro ao apagar produto:', erro);
        alert('Não foi possível conectar ao servidor para apagar o produto.');
    }
}

// ===== LISTA DE PRODUTOS =====
async function carregarProdutos() {
    const ehDono = await verificarPerfil();

    try {
        const listaProdutos = document.getElementById('lista-produtos');
        const resposta = await fetch('/produtos');

        if (!resposta.ok) {
            throw new Error('Falha ao buscar os produtos.');
        }

        const produtos = await resposta.json();

        listaProdutos.innerHTML = '';

        produtos.forEach(produto => {
            const li = document.createElement('li');
            li.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)} `;

            const botaoAdicionar = document.createElement('button');
            botaoAdicionar.textContent = 'Adicionar';
            botaoAdicionar.addEventListener('click', () => {
                adicionarAoCarrinho(produto);
            });

            li.appendChild(botaoAdicionar);

            if (ehDono) {
                const botaoApagar = document.createElement('button');
                botaoApagar.textContent = 'Apagar';
                botaoApagar.style.marginLeft = '5px';
                botaoApagar.style.color = 'red';
                botaoApagar.addEventListener('click', () => {
                    apagarProduto(produto.id);
                });
                li.appendChild(botaoApagar);
            }

            listaProdutos.appendChild(li);
        });

    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
    }
}

// ===== LOGIN =====
const formLogin = document.getElementById('form-login');
const campoEmail = document.getElementById('email-login');
const campoSenha = document.getElementById('senha-login');
const mensagemLogin = document.getElementById('mensagem-login');
const botaoSair = document.getElementById('botao-sair');

async function atualizarTela() {
    const token = sessionStorage.getItem('token');
    const logado = token !== null;

    formLogin.hidden = logado;
    formCadastro.hidden = logado;
    mensagemCadastro.hidden = logado;
    botaoSair.hidden = !logado;

    if (!logado) {
        document.getElementById('form-produto').hidden = true;
        return;
    }

    try {
        const resposta = await fetch('/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resposta.ok) {
            document.getElementById('form-produto').hidden = true;
            return;
        }

        const dados = await resposta.json();
        document.getElementById('form-produto').hidden = !dados.ehDono;

    } catch (erro) {
        console.error('Erro ao atualizar tela:', erro);
        document.getElementById('form-produto').hidden = true;
    }
}

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const resposta = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: campoEmail.value, senha: campoSenha.value })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagemLogin.textContent = dados.erro;
            return;
        }

        sessionStorage.setItem('token', dados.token);
        mensagemLogin.textContent = '';
        formLogin.reset();
        atualizarTela();
        carregarProdutos();
    } catch (erro) {
        mensagemLogin.textContent = 'Não foi possível entrar agora.';
        console.error('Erro no login:', erro);
    }
});

botaoSair.addEventListener('click', () => {
    sessionStorage.removeItem('token');
    mensagemProduto.textContent = '';
    mensagemCarrinho.textContent = '';
    carrinho.length = 0;
    renderizarCarrinho();
    atualizarTela();
    carregarProdutos();
});

// ===== CADASTRO DE PRODUTO =====
const form = document.getElementById('form-produto');
const campoNome = document.getElementById('nome-produto');
const campoPreco = document.getElementById('preco-produto');
const mensagemProduto = document.getElementById('mensagem-produto');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = campoNome.value;
    const preco = Number(campoPreco.value);

    try {
        const resposta = await fetch('/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({ nome, preco })
        });

        if (resposta.status === 401) {
            sessionStorage.removeItem('token');
            atualizarTela();
            mensagemLogin.textContent = 'Sessão expirada. Entre de novo.';
            return;
        }

        if (resposta.status === 403) {
            mensagemProduto.textContent = 'Apenas o dono da loja pode cadastrar produtos.';
            return;
        }

        if (!resposta.ok) {
            throw new Error('Falha ao cadastrar o produto.');
        }

        mensagemProduto.textContent = '';
        form.reset();
        carregarProdutos();
    } catch (erro) {
        console.error('Erro ao cadastrar produto:', erro);
    }
});

// ===== CADASTRO DE USUÁRIO =====
const formCadastro = document.getElementById('form-cadastro');
const campoNomeCadastro = document.getElementById('nome-cadastro');
const campoEmailCadastro = document.getElementById('email-cadastro');
const campoSenhaCadastro = document.getElementById('senha-cadastro');
const mensagemCadastro = document.getElementById('mensagem-cadastro');

formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const resposta = await fetch('/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: campoNomeCadastro.value,
                email: campoEmailCadastro.value,
                senha: campoSenhaCadastro.value
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagemCadastro.textContent = dados.erro;
            mensagemCadastro.style.color = 'red';
            return;
        }

        mensagemCadastro.textContent = dados.mensagem;
        mensagemCadastro.style.color = 'green';
        formCadastro.reset();

    } catch (erro) {
        mensagemCadastro.textContent = 'Não foi possível cadastrar agora.';
        mensagemCadastro.style.color = 'red';
        console.error('Erro no cadastro:', erro);
    }
});

// ===== AO ABRIR A PÁGINA =====
atualizarTela().then(() => carregarProdutos());
renderizarCarrinho();