// ===== SELEÇÃO DOS ELEMENTOS DO HTML =====
// Pega referência de cada botão e da área de resultado pra poder manipular depois
const btnGet = document.getElementById('btnGet');
const btnPost = document.getElementById('btnPost');
const btnPut = document.getElementById('btnPut');
const btnDelete = document.getElementById('btnDelete');
const resultado = document.getElementById('resultado');

// URL base da API — todos os endpoints são montados a partir daqui
const API_URL = 'https://jsonplaceholder.typicode.com/posts';


// ===== FUNÇÃO GENÉRICA: faz o trabalho pesado uma vez só =====
// endpoint: o pedaço que vem depois de API_URL (ex: '/1', ou '' pra URL pura)
// metodo: 'GET' por padrão, ou 'POST'/'PUT'/'DELETE' quando passado
// dados: objeto a enviar no corpo (só usado em POST/PUT); null quando não precisa
async function fazRequisicao(endpoint, metodo = 'GET', dados = null) {
  try {
    // Monta o objeto de configuração do fetch, começando só com o método
    const opcoes = {
      method: metodo
    };
    if (dados) {
      opcoes.headers = { 'Content-Type': 'application/json' };
      opcoes.body = JSON.stringify(dados); // objeto -> texto, porque HTTP só transporta texto
    }

    // Faz a requisição de fato, juntando URL base + endpoint
    const response = await fetch(`${API_URL}${endpoint}`, opcoes);

    // response.ok é true só se o status estiver na faixa 200-299
    // Sem esse check, um erro do servidor (404, 500) passaria despercebido
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();

  } catch (error) {
    // Repassa o erro pra quem chamou essa função tratar
    throw error;
  }
}


// ===== FUNÇÕES DE CADA BOTÃO: curtas, só chamam fazRequisicao =====

// GET: busca o post de id 1. Sem dados, método padrão já é 'GET'.
async function executarGet() {
  try {
    const dados = await fazRequisicao('/1');
    
    resultado.classList.remove('erro');
    resultado.textContent = JSON.stringify(dados, null, 2);

  } catch (error) {
    resultado.textContent = `Erro na requisição: ${error.message}`;
    resultado.classList.add('erro');
  }

}

// POST: cria um post novo. Endpoint vazio '' porque cria em /posts puro.
// Servidor gera um id novo (101) pro post criado.
async function executarPost() {
  try {
    const dados = await fazRequisicao('', 'POST', {
      title: 'Novo Post',
      body: 'Conteúdo do post de teste.',
      userId: 1
    });
    resultado.classList.remove('erro');

    resultado.textContent = JSON.stringify(dados, null, 2);
  } catch (error) {
    resultado.textContent = `Erro na requisição: ${error.message}`;
    resultado.classList.add('erro');
  }
}

// PUT: atualiza o post de id 1 por completo. Endpoint '/1' aponta pro item específico.
async function executarPut() {
  try {
    const dados = await fazRequisicao('/1', 'PUT', {
      
      id: 1,
      title: 'Post Atualizado',
      body: 'Conteúdo totalmente alterado.',
      userId: 1  
    }
  );
  resultado.classList.remove('erro');

    resultado.textContent = JSON.stringify(dados, null, 2);
  } catch (error) {
    resultado.textContent = `Erro na requisição: ${error.message}`;
    resultado.classList.add('erro');
  }
}

// DELETE: apaga o post de id 1. Sem dados no corpo.
// A API devolve {} vazio, porque não tem conteúdo a retornar depois de apagar.
async function executarDelete() {
  try {
    const dados = await fazRequisicao('/1', 'DELETE');
    resultado.classList.remove('erro');

    resultado.textContent = `Removido com sucesso. Resposta da API: ${JSON.stringify(dados)}`;
  } catch (error) {
    resultado.textContent = `Erro na requisição: ${error.message}`;
    resultado.classList.add('erro');
  }
}



// ===== CONEXÃO DOS BOTÕES COM SUAS FUNÇÕES =====
btnGet.addEventListener('click', executarGet);
btnPost.addEventListener('click', executarPost);
btnPut.addEventListener('click', executarPut);
btnDelete.addEventListener('click', executarDelete);