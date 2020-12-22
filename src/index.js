const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')


const viewsPath = path.join(__dirname, '..', '/templates/views')
const pulicsPath = path.join(__dirname, '..', '/public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT

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
    socket.emit('message', 'Welcome!')
    //Emit the event for all clients except the current one
    socket.broadcast.emit('message', 'A new user has entered the chat room!')

    socket.on('sendMessage', (message) => {
        io.emit('message', `New message: ${message}`)
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat room')
    })

})

server.listen(port, () => {
    console.log(`Server is up in port ${port}.`)
})


