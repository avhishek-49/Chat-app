const socket = io()

// Elements for Message form
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
// Elements for Location button
const $sendLocationButton = document.querySelector('#send-location')
// Elements for showing Message
const $messages = document.querySelector('#messages')
// Message Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
// LocationURL Templates
const locationTemplate = document.querySelector('#location-template').innerHTML
// Sidebar Templates
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {
    // Lastest message element
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Visible height
    const visibleHeight = $messages.offsetHeight
    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // How far have I scrolled?
    const scrollOffset = Math.round($messages.scrollTop + visibleHeight)

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()

    $messageFormInput.setAttribute('disabled', 'disabled')
    //   const message = document.querySelector('#input-message').value
    const message = event.target.elements.inputMessage.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormInput.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('The message was delivered!')
    })
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocaion is not supported by your browser.')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    setTimeout(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords
            const location = { latitude, longitude }
            socket.emit('sendLocation', location, (error) => {
                if (error) {
                    return console.log(error)
                }
                $sendLocationButton.removeAttribute('disabled')
                console.log('Location shared!')
            })
        })
    }, 500)
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        // alert and redirect to join page
        alert(error)
        location.href = '/'
    }
})
