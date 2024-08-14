require('./insights').setup()
const Hapi = require('@hapi/hapi')

const server = Hapi.server({
  port: process.env.PORT
})

const routes = [].concat(
  require('./routes/healthy'),
  require('./routes/healthz'),
  require('./routes/document'),
  require('./routes/prompt'),
  require('./routes/chat'),
  require('./routes/document-parser')
)

server.route(routes)

server.route({
  method: 'GET',
  path: '/send',
  handler: (request, h) => {
    server.publish('/chat', 'hello')
    return 'Message sent!'
  }
})

module.exports = server
