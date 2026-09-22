const cadastro = [] // array que guarda as pessoas

// seleciona os elementos do HTML
const nome = document.querySelector('#nome')
const idade = document.querySelector('#idade')
const adicionar = document.querySelector('#adicionar')
const lista = document.querySelector('#lista')

// quando clicar em "Adicionar"
adicionar.addEventListener('click', function() {
    
    // cria objeto pessoa com os valores digitados
    const pessoa = {
        nome: nome.value,
        idade: Number(idade.value) // converte string pra número
    }
    cadastro.push(pessoa) // adiciona a pessoa no array

    const li = document.createElement('li') // cria o item da lista

    const span = document.createElement('span') // cria o texto
    span.textContent = `${pessoa.nome} - ${pessoa.idade} anos`

    const btn = document.createElement('button') // cria o botão
    btn.textContent = 'Aniversário'

    // quando clicar em "Aniversário"
    btn.addEventListener('click', function() {
        pessoa.idade += 1 // incrementa a idade do objeto
        span.textContent = `${pessoa.nome} - ${pessoa.idade} anos` // atualiza o texto na tela
    })

    li.appendChild(span) // coloca o texto dentro do li
    li.appendChild(btn)  // coloca o botão dentro do li
    lista.appendChild(li) // coloca o li dentro da ul

    // limpa os inputs
    nome.value = ''
    idade.value = ''
})