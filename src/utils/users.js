const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return { error: 'username and room are required' }
    }

    const userIndex = users.findIndex(
        (user) => user.username === username && user.room === room
    )
    if (userIndex >= 0) {
        return { error: 'this username is in the room already' }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    if (!id) {
        return { error: 'id is required' }
    }

    const userIndex = users.findIndex((user) => user.id === id)

    if (userIndex === -1) {
        return { error: 'not found user' }
    }

    const removedUser = users.splice(userIndex, 1)[0]
    return removedUser
}

const getUser = (id) => {
    if (!id) {
        return { error: 'id is required' }
    }

    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    if (!room) {
        return { error: 'room is required' }
    }
    room = room.trim().toLowerCase()

    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
