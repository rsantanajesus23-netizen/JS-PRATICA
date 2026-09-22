/*const numeros = [3, 7, 12, 5]
const resultado = numeros.find(n => n > 6)
console.log(resultado) */

//filter(), find() e reduce()

const produtos = [
    { nome: 'Camiseta', preco: 45 },
    { nome: 'Tênis', preco: 220 },
    { nome: 'Boné', preco: 35 },
    { nome: 'Calça', preco: 180 },
    { nome: 'Meia', preco: 15 }
]
/*const barato = produtos.filter(function(number){
   return number.preco < 100 
})
console.log(barato) */

/*const barato = produtos.find(function(number){
   return number.nome == 'Tênis' 
})
console.log(barato) */

// .reduce() para somar

/*const total = produtos.reduce(function(acumulador, number){
   return acumulador + number.preco 
},0)
console.log(total)*/

//Use .map() para criar um novo array só com os nomes dos produtos
const nomes = produtos.map(function(produto){
    return produto.nome
})
console.log(nomes)


//Use .map() para criar um novo array com os preços com 10% de desconto
const descontos = produtos.map(produto => produto.preco * 0.9); console.log(descontos);
