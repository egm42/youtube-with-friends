const express = require('express');
const ws = require('ws');
const path = require('path');

const app = express();
const wss = new ws.Server({ noServer: true })

// const room = {
//     id: 'uuid',
//     queue: ['videos'],
//     currentVideo: ''
// }

const queue = [
  'OCIg-s7geG8',
  'tueAcSiiqYA',
  'V5uycGosYq4'
]

let currentVideo = 'V5uycGosYq4'

function updateQueue() {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({action: 'update-queue', queue: queue}))
  })
}

wss.on('connection', (socket) => {
  console.log('client connected')
  socket.on('message', (message) => {
    try {
      let command = JSON.parse(message);
      switch(command.action) {
        case 'get-video':
          socket.send(JSON.stringify({action: 'set-video', videoId: currentVideo}))
          updateQueue()
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
            client.send(JSON.stringify({action: 'set-video', videoId: currentVideo}))
          })
          updateQueue()
          break
        case 'add-video':
          let url = command.url
          switch (new URL(url).pathname.split('/')[1]) {
            case 'embed':
              queue.push(new URL(url).pathname.split('/').pop())
              break;
            case 'watch':
              queue.push(new URL(url).search.split('=')[1])
              break
          }
          socket.send(JSON.stringify({action: 'alert', success: true, message: 'Video was added successfully'}))
          updateQueue()
          break
        case 'remove-video':
          let index = queue.indexOf(command.videoId);
          if(index > -1) {
            queue.splice(index, 1)
          }
          updateQueue()
          break;
        default:
          console.log('i dont know what you want me to do???????')
      }
    } catch (err) {
      console.log(err);
    }
  })
})

app.use(express.static(path.join('client', 'build')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
})

const server = app.listen(3000, '0.0.0.0', () => {
  console.log('Server listening on port 3000')
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request)
  })
})