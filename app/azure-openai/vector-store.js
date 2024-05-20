const { AzureOpenAIEmbeddings } = require('@langchain/azure-openai')
const { PGVectorStore } = require('@langchain/community/vectorstores/pgvector')
const dbConfig = require('../config/db')
const aiConfig = require('../config/azure-openai')

const loadVectorStore = async () => {
  return PGVectorStore.initialize(
    new AzureOpenAIEmbeddings({
      user: 'test',
      stripNewLines: true,
      timeout: 1000,
      azureOpenAIApiKey: aiConfig.azureOpenAIApiKey,
      azureOpenAIApiDeploymentName: 'ada-002',
      azureOpenAIEndpoint: aiConfig.azureOpenAIEndpoint
    }),
    dbConfig
  )
}

const filterVectorStore = async (search) => {
  const pgvectorStore = await loadVectorStore()
  pgvectorStore.similaritySearch(search, 1)
}

module.exports = {
  loadVectorStore,
  filterVectorStore
}
