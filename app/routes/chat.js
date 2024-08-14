const { askQuestion } = require('../azure-openai/chat')

module.exports = {
  method: 'GET',
  path: '/chat',
  handler: async (request, h) => {
    try {
      const question = request.query.question
      const { response, chatHistory } = await askQuestion(question)
      return h.response({ response, chatHistory }).code(200)
    } catch (err) {
      console.error(err)
      return h.response().code(500)
    }
  }
}
