/* Since previous to this file, we loaded the client side version of the socket.io library in 
the same HTML file this script is bein loaded, we get access to the "io" function, from which we get
our socket object to send ans capture events */
const socket = io()

//DOM elements
const $messageForm = document.querySelector('#chat')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = event.target.elements.chatMessage.value
    socket.emit('sendMessage', message, (serverMessage) => {
        console.log(`Acknowledged: ${serverMessage}.`)
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')
    })
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (locationURL) => {
    console.log(locationURL)
    const html = Mustache.render(locationTemplate, {
        locationURL
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

const success = (position) => {
    socket.emit('sendLocation', {
        latitude : position.coords.latitude,
        longitude : position.coords.longitude
    }, (serverMessage) => {
        //Acknowledgement function 
        console.log(serverMessage)
        $locationButton.removeAttribute('disabled')
    })
}

const error = () => {
    alert('Sorry, no position available')
    $locationButton.removeAttribute('disabled')
}

const settings = {
    enableHighAccuracy : true,
    maximumAge : 20000,
    timeout : 10000
}


$locationButton.addEventListener('click', (event) => {
    event.preventDefault()
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by your browser.')
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(success, error, settings);
    
})