function validar(){
  let nome = document.getElementById("inome").value
  if (nome.length < 3) {

    document.getElementById("erroNome").textContent = "Nome precisa ter pelo menos 3 caracteres"
    }else {
    document.getElementById("erroNome").textContent = ""
}

  let email = document.getElementById("iemail").value
  if (!email.includes("@")|| !email.includes(".")) {
     
    document.getElementById("erroEmail").textContent = "Email precisa ter @, . caracteres"
  }else {
    document.getElementById("erroEmail").textContent = ""
}  

  let msg = document.getElementById("imsg").value
  if (msg.length < 10) {
    
    document.getElementById("erroMsg").textContent = "Mensagem precisa ter pelo menos 10 caracteres"  
  }else {
    document.getElementById("erroMsg").textContent = ""
}
if (nome.length >= 3 && email.includes("@") && email.includes(".") && msg.length >= 10) {
    document.getElementById("sucesso").textContent = "Mensagem enviada com sucesso!"
}


}