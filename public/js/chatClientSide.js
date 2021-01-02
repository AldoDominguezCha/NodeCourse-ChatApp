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
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options from the query string

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})
console.log(username, room)

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

const autoscroll = () => {
    //Get the HTML of the new message
    const $newMessage = $messages.lastElementChild
    //Get the height of the new message
    const newMessagesStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Get the visible height of the messages container ('how much it can show', doesn't change)
    const visibleHeight = $messages.offsetHeight
    //Total height of the messages container, it gets taller with every message that gets appended to it
    const contentHeight = $messages.scrollHeight
    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(contentHeight - newMessageHeight <= scrollOffset)
        $messages.scrollTop = $messages.scrollHeight
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a'),
        username : message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        locationURL : location.url,
        createdAt : moment(location.createdAt).format('h:mm a'),
        username : location.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
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

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href='/chat'
    }
})