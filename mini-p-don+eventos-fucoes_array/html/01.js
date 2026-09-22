const produtos = []

const nome = document.querySelector('#nome')
const preco = document.querySelector('#preco')
const botao = document.querySelector('#btn')
const lista = document.querySelector('#lista')
const total = document.querySelector('#total')
const limpar = document.querySelector('#limpar')

// Função para atualizar a tela e recalcular o total
function renderizar() {
    lista.innerHTML = ''

    produtos.forEach(function(produto, index) {
        lista.innerHTML += `
            <li>
                ${produto.nome} - R$ ${produto.preco}
                <button onclick="removerItem(${index})">X</button>
            </li>
        `
    })

    const soma = produtos.reduce(function(acumulador, produto) {
        return acumulador + produto.preco
    }, 0)

    total.textContent = soma
}

// Função para remover um único item pelo índice
function removerItem(index) {
    produtos.splice(index, 1) // Remove o item do array
    renderizar()              // Atualiza a lista e o total na tela
}

botao.addEventListener('click', function() {
    const produto = {
        nome: nome.value,
        preco: Number(preco.value)
    }

    produtos.push(produto)
    renderizar()

    nome.value = ''
    preco.value = ''
})

limpar.addEventListener('click', function() {
    produtos.length = 0
    renderizar()
})