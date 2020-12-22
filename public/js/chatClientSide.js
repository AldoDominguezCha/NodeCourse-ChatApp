/* Since previous to this file, we loaded the client side version of the socket.io library in 
the same HTML file this script is bein loaded, we get access to the "io" function, from which we get
our socket object to send ans capture events */
const socket = io()

document.querySelector('#chat').addEventListener('submit', (event) => {
    event.preventDefault()
    const message = event.target.elements.chatMessage.value
    socket.emit('sendMessage', message)
})

socket.on('message', (welcomeMessage) => {
    console.log(welcomeMessage)
})