async function carregarProdutos() {
    try{
        const listaProdutos = document.getElementById('lista-produtos');
        const resposta = await fetch ('/produtos');

        if (!resposta.ok) {
            throw new Error ('Falha ao buscar os produtos.');
        }
        
        const produtos = await resposta.json();

        listaProdutos.innerHTML = '';

        produtos.forEach(produto =>{
            const li = document.createElement('li');
            li.textContent = `${produto.nome} - R$ ${produto.preco}`;
            listaProdutos.appendChild(li);
        });

    }catch (erro){
        console.error('Erro ao carregar produtos:', erro);
    }
}

const formProduto = document.getElementById('form-produto');

formProduto.addEventListener('submit', async (e) => {
  e.preventDefault();

  
  const nome = document.getElementById('nome-produto').value;
  const preco = Number(document.getElementById('preco-produto').value);

  try {
    
    const resposta = await fetch('/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, preco })
    });

    if (!resposta.ok) {
      throw new Error('Falha ao cadastrar o produto.');
    }

    
    formProduto.reset();
    carregarProdutos();

  } catch (erro) {
    console.error('Erro ao cadastrar:', erro);
  }
});

carregarProdutos();

