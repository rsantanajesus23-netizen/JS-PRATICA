const fs = require('fs');

fs.writeFileSync('nota.txt', 'Criado pelo Node');
console.log('Arquivo criado kjhuhihucom sucesso!');


const conteudo = fs.readFileSync('teste-node.js/nota.txt', 'utf-8');
console.log(conteudo);

