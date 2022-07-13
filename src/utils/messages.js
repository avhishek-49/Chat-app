const generateMessage = (username, text) => {
    const date = new Date()
    return {
        username,
        text,
        createdAt: date.getTime()
    }
}

const generateLocationMessage = (username, url) => {
    const date = new Date()
    return {
        username,
        url,
        createdAt: date.getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}
