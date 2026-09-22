
async function buscarPostsDoUsuarioUm() {
  try {
    const resposta = await fetch(
      'https://jsonplaceholder.typicode.com/posts'
    );

    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const posts = await resposta.json();

    const postsFiltrados = posts.filter(
      post => post.userId === 1
    );

    const titulos = postsFiltrados.map( post => post.title );

    console.log("Posts do userId 1:", postsFiltrados);
    console.log("Títulos dos posts:", titulos);
    console.log("Total de posts encontrados:", postsFiltrados.length);

  } catch (erro) {
    console.error("Erro ao buscar os posts:", erro);
  }
}

buscarPostsDoUsuarioUm();

