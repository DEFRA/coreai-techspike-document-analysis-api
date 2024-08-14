const { readPDF } = require('../parser/pdf-reader')
const { processPayloadDocument } = require('../lib/document')
const { callOpenAi } = require('../azure-openai/parse-to-json')

module.exports = [{
  method: 'POST',
  path: '/document/parse',
  options: {
    tags: ['api', 'documents'],
    payload: {
      maxBytes: (50 * 1024 * 1024) + 250,
      timeout: false,
      output: 'stream',
      parse: false,
      allow: [
        'application/msword',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
    }
  },
  handler: async (request, h) => {
    const document = await processPayloadDocument(request.payload)

    try {
      const content = await readPDF(document)
      const json = await callOpenAi(content)

      return h.response({ content: JSON.parse(json) }).code(201)
    } catch (err) {
      console.error(err)
      return h.response().code(500)
    }
  }
}]
