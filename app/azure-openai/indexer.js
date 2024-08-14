const { loadVectorStore } = require('./vector-store')
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter')
const { Document } = require('langchain/document')
const { getDocument } = require('../storage/documents-repo')
const { readPDF } = require('../parser/pdf-reader')
const config = require('../config/storage')
const mammoth = require('mammoth')

const splitDocuments = async (docs) => {
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
  return await textSplitter.splitDocuments(docs)
}

const addDocumentsToStore = async (store, docs) => await store.addDocuments(docs)

const indexBlobFromDocx = async (id) => {
  const downloadDocument = await getDocument(id, config.documentsContainer, '')
  const extractDocumentText = await mammoth.extractRawText({ buffer: downloadDocument })

  const docs = new Document({ pageContent: extractDocumentText.value, metadata: { id } })
  return indexDocuments([docs])
}

const indexBlobFromPdf = async (id) => {
  const downloadDocument = await getDocument(id, config.documentsContainer, '')
  const extractDocumentText = await readPDF(downloadDocument)
  const docs = new Document({ pageContent: extractDocumentText, metadata: { id } })
  return indexDocuments([docs])
}

const indexDocuments = async (docs) => {
  const pgvectorStore = await loadVectorStore()
  const splits = await splitDocuments(docs)

  await addDocumentsToStore(pgvectorStore, splits)
  await pgvectorStore.end()
  return splits.map(split => ({ metadata: split.metadata }))
}

const deleteDocuments = async (url) => {
  const pgvectorStore = await loadVectorStore()
  await pgvectorStore.delete({ filter: { metadata: { source: url } } })
  await pgvectorStore.end()
}

module.exports = {
  indexBlobFromDocx,
  indexBlobFromPdf,
  deleteDocuments
}
