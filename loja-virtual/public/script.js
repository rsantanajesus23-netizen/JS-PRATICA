// ===== CARRINHO DE COMPRAS =====
const carrinho = [];
let produtos = [];

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
        
        const span = document.createElement('span');
        span.textContent = `${item.nome} x ${item.quantidade} - R$ ${(item.preco * item.quantidade).toFixed(2)}`;
        li.appendChild(span);

        // Botão de aumentar (+) 
        const botaoMais = document.createElement('button');
        botaoMais.textContent = '+';
        botaoMais.style.marginLeft = '10px';
        botaoMais.style.padding = '2px 6px';
        
        botaoMais.addEventListener('click', () => {
            item.quantidade += 1;
            renderizarCarrinho();
        });
        li.appendChild(botaoMais);

        // Botão de diminuir (−)
        const botaoMenos = document.createElement('button');
        botaoMenos.textContent = '−';
        botaoMenos.style.marginLeft = '10px';
        botaoMenos.style.padding = '2px 6px';
        
        botaoMenos.addEventListener('click', () => {
            item.quantidade -= 1;

            if (item.quantidade <= 0) {
                const index = carrinho.findIndex(i => i.produto_id === item.produto_id);
                if (index > -1) {
                    carrinho.splice(index, 1);
                }
            }

            renderizarCarrinho();
        });
        li.appendChild(botaoMenos);

        // Botão de Lixeira (Excluir item de vez)
        const botaoRemover = document.createElement('button');
        botaoRemover.textContent = '🗑️'; 
        botaoRemover.style.marginLeft = '5px';
        botaoRemover.style.padding = '2px 6px';
        botaoRemover.addEventListener('click', () => {
            const index = carrinho.findIndex(i => i.produto_id === item.produto_id);
            if (index > -1) {
                carrinho.splice(index, 1); 
            }
            renderizarCarrinho();
        });
        li.appendChild(botaoRemover);

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

// ===== HISTÓRICO DE PEDIDOS =====
const botaoMeusPedidos = document.getElementById('botao-meus-pedidos');
const areaMeusPedidos = document.getElementById('area-pedidos'); 

async function carregarPedidos() {
    const token = sessionStorage.getItem('token');

    if (!token) {
        return;
    }

    try {
        const resposta = await fetch('/pedidos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resposta.ok) {
            throw new Error('Falha ao buscar os pedidos.');
        }

        const pedidos = await resposta.json();

        if (areaMeusPedidos) {
            areaMeusPedidos.innerHTML = '';

            if (pedidos.length === 0) {
                areaMeusPedidos.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
                return;
            }

            const ul = document.createElement('ul');

            pedidos.forEach(p => {
                const li = document.createElement('li');
                const itensDescricao = p.itens.map(i => `${i.nome} (${i.quantidade}x)`).join(', ');
                
                li.textContent = `Pedido #${p.pedido_id} | Itens: ${itensDescricao} | Total: R$ ${p.total.toFixed(2)}`;
                ul.appendChild(li);
            });

            areaMeusPedidos.appendChild(ul);
        }

    } catch (erro) {
        console.error('Erro ao carregar pedidos:', erro);
    }
}


botaoMeusPedidos.addEventListener('click', () => {
    if ( areaMeusPedidos.hidden) {
        areaMeusPedidos.hidden = false;
        carregarPedidos();
    }else{
        areaMeusPedidos.hidden = true;
        areaMeusPedidos.innerHTML = '';
    }
});

// ===== LISTA DE PRODUTOS =====
async function carregarProdutos() {
    const ehDono = await verificarPerfil();

    try {
        const listaProdutos = document.getElementById('lista-produtos');
        const resposta = await fetch('/produtos');

        if (!resposta.ok) {
            throw new Error('Falha ao buscar os produtos.');
        }

        produtos = await resposta.json();

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
                const botaoEditar = document.createElement('button');
                botaoEditar.textContent = 'Editar'
                botaoEditar.style.marginLeft = '5px'
                botaoEditar.style.color = 'orange'
                botaoEditar.addEventListener('click', () => {
                editarProdutoInline(produto, li);
            });
                li.appendChild(botaoEditar);

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

// ===== EDITAR PRODUTO INLINE =====
async function editarProdutoInline(produto, liElemento) {
    const token = sessionStorage.getItem('token');
    const conteudoOriginalHTML = liElemento.innerHTML;

    liElemento.innerHTML = `
        <input type="text" id="edit-nome-${produto.id}" value="${produto.nome}" style="width: 100px;">
        <input type="number" id="edit-preco-${produto.id}" value="${produto.preco}" step="0.01" style="width: 60px;">
        <button id="salvar-${produto.id}" style="color: green; margin-left: 5px;">Salvar</button>
        <button id="cancelar-${produto.id}" style="color: gray; margin-left: 5px;">Cancelar</button>
    `;

    const btnSalvar = document.getElementById(`salvar-${produto.id}`);
    const btnCancelar = document.getElementById(`cancelar-${produto.id}`);

    btnCancelar.addEventListener('click', () => {
        liElemento.innerHTML = conteudoOriginalHTML;
        carregarProdutos();
    });

    btnSalvar.addEventListener('click', async () => {
        const novoNome = document.getElementById(`edit-nome-${produto.id}`).value;
        const novoPreco = Number(document.getElementById(`edit-preco-${produto.id}`).value);

        if (!novoNome || novoPreco < 0) {
            alert('Preencha um nome válido e um preço maior ou igual a zero.');
            return;
        }

        try {
            const resposta = await fetch(`/produtos/${produto.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome: novoNome, preco: novoPreco })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.erro || 'Erro ao atualizar o produto.');
                return;
            }

            carregarProdutos();

        } catch (erro) {
            console.error('Erro ao salvar edição:', erro);
            alert('Erro de conexão ao salvar o produto.');
        }
    });
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
    document.getElementById('botao-meus-pedidos').hidden = !logado;

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
    areaMeusPedidos.hidden = true;
    areaMeusPedidos.innerHTML = '';
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

// Olhinho do login
document.getElementById('toggle-senha-login').addEventListener('click', () => {
    const campo = document.getElementById('senha-login');
    const botao = document.getElementById('toggle-senha-login');
    campo.type = campo.type === 'password' ? 'text' : 'password';
    botao.innerHTML = campo.type === 'password' ? '<i class="fa fa-eye"></i>' : '<i class="fa fa-eye-slash"></i>';
});

// Olhinho do cadastro
document.getElementById('toggle-senha-cadastro').addEventListener('click', () => {
    const campo = document.getElementById('senha-cadastro');
    const botao = document.getElementById('toggle-senha-cadastro');
    campo.type = campo.type === 'password' ? 'text' : 'password';
    botao.innerHTML = campo.type === 'password' ? '<i class="fa fa-eye"></i>' : '<i class="fa fa-eye-slash"></i>';
});

// ===== AO ABRIR A PÁGINA =====
atualizarTela().then(() => carregarProdutos());
renderizarCarrinho();