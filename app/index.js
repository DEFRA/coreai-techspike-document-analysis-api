const server = require('./server')

const io = require('socket.io')(server.listener,
  { cors: { origin: '*' } }
)

const init = async () => {
  await server.start()
  console.log('Server running on %s', server.info.uri)
}

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.emit('chat', { hello: 'world!' })
})

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
