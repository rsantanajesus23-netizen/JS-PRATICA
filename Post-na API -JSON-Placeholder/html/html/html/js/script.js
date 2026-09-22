/*// Selecionamos os elementos do HTML
const botao = document.getElementById('btnEnviar');
const resultado = document.getElementById('resultado');

// Adicionamos o evento de clique no botão
botao.addEventListener('click', async function() {
    resultado.textContent = "Enviando dados...";

    const novoPost = {
        title: 'Post via HTML',
        body: 'Este post foi gerado clicando no botão do HTML.',
        userId: 99
    };

    fetch('https://jsonplaceholder.typicode.com/posts/1', {   // mudou: /posts/1 em vez de /posts
        method: 'PUT',                                          // mudou: PUT em vez de POST
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(novoPost)
    })
    .then(response => response.json())
    .then(dados => {
        resultado.textContent = JSON.stringify(dados, null, 2);
    })
    .catch(erro => {
        resultado.textContent = 'Erro na requisição: ' + erro;
    });
});*/


// Delete POST

const botao = document.getElementById('btnEnviar');
const resultado = document.getElementById('resultado');

botao.addEventListener('click', async function() {
    resultado.textContent = "Enviando dados...";

    fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(dados => {
        resultado.textContent = 'Post apagado. Resposta: ' + JSON.stringify(dados, null, 2);
    })
    .catch(erro => {
        resultado.textContent = 'Erro na requisição: ' + erro;
    });
}); 