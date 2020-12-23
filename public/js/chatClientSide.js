/* Since previous to this file, we loaded the client side version of the socket.io library in 
the same HTML file this script is bein loaded, we get access to the "io" function, from which we get
our socket object to send ans capture events */
const socket = io()

document.querySelector('#chat').addEventListener('submit', (event) => {
    event.preventDefault()
    const message = event.target.elements.chatMessage.value
    socket.emit('sendMessage', message, (serverMessage) => {
        console.log(`The send chat message event was acknowledged by the server: ${serverMessage}.`)
    })
})

socket.on('message', (welcomeMessage) => {
    console.log(welcomeMessage)
})

const success = (position) => {
    socket.emit('sendLocation', {
        latitude : position.coords.latitude,
        longitude : position.coords.longitude
    })
}

const error = () => {
    alert('Sorry, no position available')
}

const settings = {
    enableHighAccuracy : true,
    maximumAge : 20000,
    timeout : 10000
}


document.querySelector('#sendLocation').addEventListener('click', (event) => {
    event.preventDefault()
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by your browser.')

    navigator.geolocation.getCurrentPosition(success, error, settings);
    
})