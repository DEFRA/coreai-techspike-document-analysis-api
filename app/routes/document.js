const Joi = require('joi')
const { readPDF } = require('../parser/pdf-reader')
const { callOpenAi } = require('../azure-openai/parse-to-json')
const { processPayloadDocument } = require('../lib/document')
const { indexBlobFromPdf, indexBlobFromDocx } = require('../azure-openai/indexer')
const {
  getDocuments,
  getDocument,
  getDocumentMetadata,
  saveDocument,
  updateDocumentMetadata
} = require('../storage/documents-repo')

module.exports = [{
  method: 'GET',
  path: '/documents',
  options: {
    tags: ['api', 'documents'],
    validate: {
      query: Joi.object({
        orderBy: Joi.string().valid('lastModified', 'createdOn').default('lastModified'),
        orderByDirection: Joi.string().valid('Asc', 'Desc').default('Desc')
      })
    }
  },
  handler: async (request, h) => {
    const { orderBy, orderByDirection } = request.query
    try {
      const documents = await getDocuments(orderBy, orderByDirection)
      return h.response(documents).code(201)
    } catch (err) {
      console.error(err)
      return h.response().code(500)
    }
  }
},
{
  method: 'GET',
  path: '/documents/{id}',
  options: {
    tags: ['api', 'documents'],
    validate: {
      params: Joi.object({
        id: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const document = await getDocument(
      request.params.id
    )

    const content = await readPDF(document)
    try {
      const response = await callOpenAi(content)
    } catch (err) {
      console.error(err)
    }

    return h.response(document).code(201)
  }
},
{
  method: 'GET',
  path: '/documents/{id}/metadata',
  options: {
    tags: ['api', 'documents'],
    validate: {
      params: Joi.object({
        id: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const documentMetadata = await getDocumentMetadata(
      request.params.id
    )

    return h.response(documentMetadata).code(201)
  }
},
{
  method: 'POST',
  path: '/documents',
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
    const contentType = request.headers['content-type']

    try {
      const id = await saveDocument(
        document,
        contentType
      )

      if (contentType === 'application/pdf') {
        await indexBlobFromPdf(id)
      }

      if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        await indexBlobFromDocx(id)
      }

      return h.response({ id }).code(201)
    } catch (err) {
      console.error(err)
      return h.response().code(500)
    }
  }
},
{
  method: 'PUT',
  path: '/documents/{id}',
  options: {
    tags: ['api', 'documents'],
    validate: {
      payload: Joi.object({
        fileName: Joi.string().required(),
        uploadedBy: Joi.string().required(),
        documentType: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    try {
      await updateDocumentMetadata(
        request.params.id,
        request.payload
      )
    } catch (err) {
      if (err.code === 'NotFound') {
        return h.response().code(404).takeover()
      }

      throw err
    }

    return h.response().code(200)
  }
}]
