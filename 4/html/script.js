
/*const nomes = ['ana', 'bruno', 'carla'];

const nomesEmMaiusculas = nomes.map(nome => nome.toUpperCase());
console.log(nomesEmMaiusculas)

console.log(nomes)*/

const precos = [{preco: 10}, {preco: 20}, {preco: 30}];

const total = precos.reduce((acumulador, itemAtual) => {
  return acumulador + itemAtual.preco;
}, 0);

console.log(total);