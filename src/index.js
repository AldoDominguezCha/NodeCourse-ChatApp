const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {
    generateMessageObject,
    generateLocationObject
} = require('./utils/messagesObject')

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const viewsPath = path.join(__dirname, '..', '/templates/views')
const pulicsPath = path.join(__dirname, '..', '/public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT

/* New foul language filter form the "bad-words" npm module, it replaces the foul language 
with the specified placeholder character, among other things */
const filter = new Filter({placeHolder : '*'})

/* Here we are specifying the paths that express can use to fond some of the static files
that the server (app) will serve of that will be imported inside the HTML documents, 
the first path for static files (viewsPath) is the one that contains the HTML files
to show in the browser.
The second path (publicPath) specifies where do our JS files that need to be loeaded in the   
HTML documets (Client side JS code) live*/
app.use('/chat', express.static(viewsPath))
app.use('/public', express.static(pulicsPath))

let count = 0;

io.on('connection', (socket) => {
    console.log(`New connection`)
    

    socket.on('join', ({ username, room }, acknowledge) => {
        const { error, user} = addUser({ 
            id : socket.id,
            username,
            room
        })
        
        if(error)
            return acknowledge(error)
        
        /* Joins this socket or client connection to a specific socket.io "room", that means,
        this connection or client gets assigned a specific "namespace" we can use to collect
        different connections under specific "groups"
        a */
        socket.join(user.room)

        socket.emit('message', generateMessageObject('Welcome to the chat app!', 'Admin'))
        /* Since we previously joined our new connection to the chat "room" (socket connection group) 
        that the user specified, we can now boradcast the message that states that a new chat user has  
        entered the room pointing to that specific connections group, like using a namespace 
        ('boradcast.to(room)')*/
        socket.broadcast.to(user.room).emit('message', generateMessageObject(`${user.username} has joined the chat room!`, 'Admin'))

        acknowledge()

    })

    /* We are listening here in the server for the "sendMessage" event, when we catch the event,
    we use the "message" data that comes along with the event to send that "message" to all the
    clients by emitting a "message" event and attaching the string data we received from the 
    "sendMessage" event emitted by one of the clients, then we acknowledge the fact that we received
    that "sendMessage" event by calling a callback function we received that here we are naming 
    as "acknowledge", we are even providing a static string parameter to the function, this
    function is declared in the client side, in the part of the code that emits this "sendMessage"
    event, and it will have access to the data we have provided to it here ('Greetings from the server! :)')
     */
    socket.on('sendMessage', (message, acknowledge) => {
        if(filter.isProfane(message))
            return acknowledge('Profanity is not allowed in the chat!')
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessageObject(message, user.username))
        acknowledge('Message delivered by the server!')
    })

    socket.on('sendLocation', ({latitude, longitude}, acknowledge) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationObject(latitude, longitude, user.username))
        acknowledge('Location shared!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user)
            return io.to(user.room).emit('message', generateMessageObject(`${user.username} has left the chat room`, 'Admin'))
    })

})

server.listen(port, () => {
    console.log(`Server is up in port ${port}.`)
})


