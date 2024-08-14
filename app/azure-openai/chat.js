const { ChatOpenAI } = require('@langchain/openai')
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts')
const { RunnablePassthrough, RunnableSequence } = require('@langchain/core/runnables')
const { formatDocumentsAsString } = require('langchain/util/document')
const { StringOutputParser } = require('@langchain/core/output_parsers')
const config = require('../config/azure-openai')
const { loadVectorStore } = require('./vector-store')
const { IgLogCallbackHandler } = require('../ig-log')

let chatHistory = []

const handler1 = new IgLogCallbackHandler({
  baseurl: 'http://localhost:3003',
  projectId: 'adpaipocuksoai-prototyping',
  sessionId: 'adpaipocuksoai-prototyping'
})

const qaSystemPrompt = `You are an assistant who helps with questions and supplies the answer.
Answer ONLY with information from the context below. If there isn't enough information in the context, say you don't know. Do not generate answers that don't use the sources. If asking a clarifying question to the user would help, ask the question.
{context}`

const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`

const askQuestion = async (question) => {
  const model = new ChatOpenAI({
    azureOpenAIApiVersion: '2023-09-15-preview',
    azureOpenAIApiKey: config.azureOpenAIApiKey,
    azureOpenAIApiDeploymentName: config.azureOpenAIApiDeploymentName,
    azureOpenAIApiInstanceName: 'adpaipocuksoai-prototyping'
  })

  const pgvectorStore = await loadVectorStore()
  const retriever = pgvectorStore.asRetriever()

  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ['system', contextualizeQSystemPrompt],
    new MessagesPlaceholder('chatHistory'),
    ['human', '{question}']
  ])

  const contextualizeQChain = contextualizeQPrompt.pipe(model).pipe(new StringOutputParser()).pipe(retriever).pipe(formatDocumentsAsString)

  const contextualizedQuestion = (input) => {
    if ('chatHistory' in input) {
      return contextualizeQChain
    }
    return input.question
  }

  const qaPrompt = ChatPromptTemplate.fromMessages([
    ['system', qaSystemPrompt],
    new MessagesPlaceholder('chatHistory'),
    ['human', '{question}']
  ])

  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input) => {
        if ('chatHistory' in input) {
          const chain = contextualizedQuestion(input)
          return chain.pipe(retriever).pipe(formatDocumentsAsString)
        }
        return ''
      }
    }),
    qaPrompt,
    model
  ])

  const response = await ragChain.invoke({
    question,
    chatHistory
  }, { callbacks: [handler1] })

  chatHistory = chatHistory.concat(response)

  return { response, chatHistory }
}

module.exports = {
  askQuestion
}
