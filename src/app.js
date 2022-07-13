const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
// socketio require only raw http server
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.json())
app.use(express.static(publicDirectoryPath))

// Note:
// socket.emit, io.emit, socket.broadcast.emit => publish to all rooms
// io.to.emit, socket.broadcast.to.emit => publish to a specific room
// io.emit publishes event to all
// socket.broadcast.emit published to all except new connected client

io.on('connection', (socket) => {
    const admin = 'Admin'

    socket.on('join', ({ username, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(room)

        socket.emit('message', generateMessage(admin, 'Welcome!'))
        socket.broadcast
            .to(room)
            .emit('message', generateMessage(admin, `${username} has joined!`))

        io.to(room).emit('roomData', {
            room,
            users: getUsersInRoom(room)
        })
    })

    socket.on('sendMessage', (message, callback) => {
        const { username, room } = getUser(socket.id)

        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed.')
        }

        io.to(room).emit('message', generateMessage(username, message))
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const { username, room } = getUser(socket.id)
        const geolocationURL = `http://www.google.com/maps?q=${latitude},${longitude}`
        io.to(room).emit(
            'locationMessage',
            generateLocationMessage(username, geolocationURL)
        )
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            const { username, room } = user
            socket.broadcast
                .to(room)
                .emit(
                    'message',
                    generateMessage(admin, `${username} has left!`)
                )

            io.to(room).emit('roomData', {
                room,
                users: getUsersInRoom(room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})
