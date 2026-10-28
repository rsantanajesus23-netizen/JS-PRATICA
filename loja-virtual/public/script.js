// ===== LISTA DE PRODUTOS =====
async function carregarProdutos() {
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
            li.textContent = `${produto.nome} - R$ ${produto.preco}`;
            listaProdutos.appendChild(li);
        });

    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
    }
}

// ===== LOGIN =====

// 1. Acha os elementos do login
const formLogin = document.getElementById('form-login');
const campoEmail = document.getElementById('email-login');
const campoSenha = document.getElementById('senha-login');
const mensagemLogin = document.getElementById('mensagem-login');
const botaoSair = document.getElementById('botao-sair');

// 2. Mostra ou esconde as partes da página conforme exista token guardado
function atualizarTela() {
    const logado = sessionStorage.getItem('token') !== null;

    formLogin.hidden = logado;
    document.getElementById('form-produto').hidden = !logado;
    botaoSair.hidden = !logado;
}

// 3. Enviar o login
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const resposta = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: campoEmail.value, senha: campoSenha.value })
        });

        // 4. Lê a resposta antes de conferir: no erro, o servidor explica o motivo
        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagemLogin.textContent = dados.erro;
            return;
        }

        // 5. Guarda o token e atualiza a tela
        sessionStorage.setItem('token', dados.token);
        mensagemLogin.textContent = '';
        formLogin.reset();
        atualizarTela();
    } catch (erro) {
        mensagemLogin.textContent = 'Não foi possível entrar agora.';
        console.error('Erro no login:', erro);
    }
});

// 6. Sair
botaoSair.addEventListener('click', () => {
    sessionStorage.removeItem('token');
    atualizarTela();
});

// ===== CADASTRO DE PRODUTO =====

// 1. Acha o formulário, os campos e o lugar das mensagens
const form = document.getElementById('form-produto');
const campoNome = document.getElementById('nome-produto');
const campoPreco = document.getElementById('preco-produto');
const mensagemProduto = document.getElementById('mensagem-produto');

// 2. Quando enviar o formulário, roda essa função
form.addEventListener('submit', async (e) => {
    // 3. Segura o envio normal, que recarregaria a página
    e.preventDefault();

    // 4. Lê os campos; o preço vira número aqui
    const nome = campoNome.value;
    const preco = Number(campoPreco.value);

    try {
        // 5. O cabeçalho Authorization leva o token guardado no login
        const resposta = await fetch('/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({ nome, preco })
        });

        // 6. Token vencido ou inválido: volta pra tela de login
        if (resposta.status === 401) {
            sessionStorage.removeItem('token');
            atualizarTela();
            mensagemLogin.textContent = 'Sessão expirada. Entre de novo.';
            return;
        }

        // 7. Logado, mas não é o dono da loja
        if (resposta.status === 403) {
            mensagemProduto.textContent = 'Apenas o dono da loja pode cadastrar produtos.';
            return;
        }

        if (!resposta.ok) {
            throw new Error('Falha ao cadastrar o produto.');
        }

        // 8. Deu certo: limpa a mensagem e os campos, e recarrega a lista
        mensagemProduto.textContent = '';
        form.reset();
        carregarProdutos();
    } catch (erro) {
        console.error('Erro ao cadastrar produto:', erro);
    }
});

// ===== AO ABRIR A PÁGINA =====
atualizarTela();
carregarProdutos();