const express = require('express');
const ws = require('ws');
const path = require('path');

const app = express();
const wss = new ws.Server({ noServer: true })

// message = {
//     action: ['play', 'pause', 'stop', 'new'],
//     room: 'uuid'
// }

// const room = {
//     id: 'uuid',
//     queue: ['videos'],
//     currentVideo: ''
// }

const queue = [
  'https://www.youtube.com/embed/OCIg-s7geG8?start=0',
  'https://www.youtube.com/embed/tueAcSiiqYA?start=1',
  'https://www.youtube.com/embed/V5uycGosYq4?start=1'
]

let currentVideo = 'https://www.youtube.com/embed/V5uycGosYq4?start=1'

wss.on('connection', (socket) => {
  console.log('client connected')
  socket.on('message', (message) => {
    try {
      let command = JSON.parse(message);
      switch(command.action) {
        case 'get-video':
          socket.send(JSON.stringify({action: 'set-video', video: currentVideo, videoId: new URL(currentVideo).pathname.split('/').pop()}))
          break;
        case 'play':
          wss.clients.forEach((client) => {
            client.send(JSON.stringify({action: 'play-video'}))
          })
          break;
        case 'pause':
          wss.clients.forEach((client) => {
            client.send(JSON.stringify({action: 'pause-video'}))
          })
          break;
        case 'next':
          currentVideo = queue.shift();
          wss.clients.forEach((client) => {
            client.send(JSON.stringify({action: 'set-video', video: currentVideo, videoId: new URL(currentVideo).pathname.split('/').pop()}))
          })
          break
        default:
          console.log('i dont know what you want me to do???????')
      }
    } catch (err) {
      console.log(err);
    }

    
    
    // wss.clients.forEach((client) => {
    //   client.send(message)
    // })
  })
})

app.use(express.static(path.join('client', 'build')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
})

const server = app.listen(3333, '0.0.0.0', () => {
  console.log('Server listening on port 3333')
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request)
  })
})