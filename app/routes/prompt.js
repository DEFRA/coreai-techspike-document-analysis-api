const { askQuestion } = require('../azure-openai/agent')

module.exports = {
  method: 'GET',
  path: '/prompt',
  handler: async (request, h) => {
    try {
      const response = await askQuestion('When placing an order what do I need to do?')
      return h.response({ response }).code(200)
    } catch (err) {
      console.error(err)
      return h.response().code(500)
    }
  }
}
