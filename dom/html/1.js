// DOM - Document Object Model

/*const title = document.querySelector('#title')

console.log(title)

const texts = document.querySelectorAll('.text')

console.log(texts)
console.log(texts[1])

texts.forEach((text)=> {
    console.log(text.textContent.toUpperCase())
}) 

// manipulação de elementos

title.textContent = 'Mudei o texto'

texts[0].innerHTML = '<span>Alteramos o HTML deste elemento..!</span>'

texts[1].style.backgroundColor = 'red'

title.style.color = 'red'*/

// Eventos

const btn = document.querySelector('#btn')

btn.addEventListener("click", function(){
    console.log('clicou!')
})

btn.addEventListener("mouseover", function(){
    const x = Math.random() * (window.innerWidth - 100)
    const y = Math.random() * (window.innerHeight - 50)
    btn.style.position = 'fixed'
    btn.style.left = x + 'px'
    btn.style.top = y + 'px'
})

//"input" — usuário digitando em tempo real

const campo = document.querySelector('#campo')

campo.addEventListener("input", function(){
    console.log(campo.value)
})
/*campo.addEventListener("input", function(){
    title.textContent = campo.value
})*/

// O "event.key" te diz qual tecla foi pressionada.

campo.addEventListener("keydown", function(event){
    if (event.key === "Enter") {
      title.textContent = campo.value  
    }
})

/*campo.addEventListener("input", function(){
    title.textContent = campo.value
})*/