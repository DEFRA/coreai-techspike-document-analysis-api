const { ChatOpenAI } = require('@langchain/openai')
const { ChatPromptTemplate } = require('@langchain/core/prompts')
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables')
const { formatDocumentsAsString } = require('langchain/util/document')
const { StringOutputParser } = require('@langchain/core/output_parsers')
const config = require('../config/azure-openai')
const { loadVectorStore } = require('./vector-store')

const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.

{context}

Question: {question}

Helpful Answer:`

const askQuestion = async (question) => {
  const model = new ChatOpenAI({
    azureOpenAIApiVersion: '2023-09-15-preview',
    azureOpenAIApiKey: config.azureOpenAIApiKey,
    azureOpenAIApiDeploymentName: config.azureOpenAIApiDeploymentName,
    azureOpenAIApiInstanceName: 'adpaipocuksoai-prototyping'
  })

  const pgvectorStore = await loadVectorStore()
  const retriever = pgvectorStore.asRetriever()

  const prompt = ChatPromptTemplate.fromTemplate(template)

  const ragChain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough()
    },
    prompt,
    model,
    new StringOutputParser()
  ])

  return ragChain.invoke(question)
}

module.exports = {
  askQuestion
}
