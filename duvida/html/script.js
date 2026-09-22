
    // 1. Seleção dos elementos do HTML
    const inputNome = document.getElementById('inputNome');
    const inputPreco = document.getElementById('inputPreco');
    const listaProdutos = document.getElementById('listaProdutos');
    
    const btnGet = document.getElementById('btnGet');
    const btnPost = document.getElementById('btnPost');
    const btnPut = document.getElementById('btnPut');
    const btnDelete = document.getElementById('btnDelete');

    const API_URL = 'https://jsonplaceholder.typicode.com/posts';

    // 2. GET: Busca do servidor e montagem dinâmica do HTML
    async function carregarCardapio() {
      try {
        const response = await fetch(`${API_URL}/1`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const produto = await response.json();
        
        // Em vez de JSON bruto no <pre>, criamos um bloco HTML visual
        listaProdutos.innerHTML = `
          <div class="card-produto">
            <h3>🍔 Lanche ID #${produto.id}</h3>
            <p><strong>Nome:</strong> ${produto.title}</p>
            <p><strong>Descrição/Preço:</strong> ${produto.body}</p>
          </div>
        `;
      } catch (error) {
        listaProdutos.innerHTML = `<p style="color: red;">Erro ao carregar: ${error.message}</p>`;
      }
    }

    // 3. POST: Pega o que o usuário digitou e manda pro servidor
    async function cadastrarLanche() {
      // Pega o valor digitado nos inputs
      const nome = inputNome.value;
      const preco = inputPreco.value;

      if (!nome || !preco) {
        alert("Preencha o nome e o preço antes de cadastrar!");
        return;
      }

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: nome,
            body: `Preço: ${preco}`,
            userId: 1
          })
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const novoProduto = await response.json();
        
        // Exibe o item recém-criado na tela
        listaProdutos.innerHTML = `
          <p style="color: green;"><strong>✅ Item Cadastrado com Sucesso!</strong></p>
          <div class="card-produto">
            <h3>🍔 ${novoProduto.title} (ID #${novoProduto.id})</h3>
            <p>${novoProduto.body}</p>
          </div>
        `;

        // Limpa os campos digitados
        inputNome.value = '';
        inputPreco.value = '';
      } catch (error) {
        listaProdutos.innerHTML = `<p style="color: red;">Erro ao cadastrar: ${error.message}</p>`;
      }
    }

    // 4. PUT: Atualiza o item #1 com o que está digitado nos campos
    async function atualizarLanche() {
      const nome = inputNome.value || "X-Burger Modificado";
      const preco = inputPreco.value || "R$ 30,00";

      try {
        const response = await fetch(`${API_URL}/1`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 1,
            title: nome,
            body: `Preço Atualizado: ${preco}`,
            userId: 1
          })
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const produtoAtualizado = await response.json();

        listaProdutos.innerHTML = `
          <p style="color: #d9a000;"><strong>✏️ Item #1 Atualizado!</strong></p>
          <div class="card-produto">
            <h3>🍔 ${produtoAtualizado.title}</h3>
            <p>${produtoAtualizado.body}</p>
          </div>
        `;
      } catch (error) {
        listaProdutos.innerHTML = `<p style="color: red;">Erro ao atualizar: ${error.message}</p>`;
      }
    }

    // 5. DELETE: Remove o item e limpa a tela
    async function excluirLanche() {
      try {
        const response = await fetch(`${API_URL}/1`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        listaProdutos.innerHTML = `
          <p style="color: red;"><strong>🗑️ O lanche ID #1 foi removido do sistema!</strong></p>
        `;
      } catch (error) {
        listaProdutos.innerHTML = `<p style="color: red;">Erro ao excluir: ${error.message}</p>`;
      }
    }

    // Escutadores de Eventos
    btnGet.addEventListener('click', carregarCardapio);
    btnPost.addEventListener('click', cadastrarLanche);
    btnPut.addEventListener('click', atualizarLanche);
    btnDelete.addEventListener('click', excluirLanche);
  