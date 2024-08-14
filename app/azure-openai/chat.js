const { ChatOpenAI } = require('@langchain/openai')
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts')
const { RunnablePassthrough, RunnableSequence } = require('@langchain/core/runnables')
const { formatDocumentsAsString } = require('langchain/util/document')
const { StringOutputParser } = require('@langchain/core/output_parsers')
const config = require('../config/azure-openai')
const { loadVectorStore } = require('./vector-store')
const { ConsoleCallbackHandler } = require('@langchain/core/tracers/console')
const { BaseCallbackHandler } = require('@langchain/core/callbacks/base')

let chatHistory = []

const qaSystemPrompt = `You are an assistant who helps with questions and supplies the answer.
Answer ONLY with information from the context below. If there isn't enough information in the context, say you don't know. Do not generate answers that don't use the sources. If asking a clarifying question to the user would help, ask the question.
{context}`

const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`

class CustomHandler extends BaseCallbackHandler {
  name = 'custom_handler'

  handleLLMNewToken (token) {
    console.log('token', { token })
  }

  handleLLMStart (llm, _prompts) {
    console.log('handleLLMStart', { llm })
  }

  handleChainStart (chain) {
    console.log('handleChainStart', { chain })
  }

  handleAgentAction (action) {
    console.log('handleAgentAction', action)
  }

  handleToolStart (tool) {
    console.log('handleToolStart', { tool })
  }
}

const handler1 = new CustomHandler()

const askQuestion = async (question) => {
  const model = new ChatOpenAI({
    azureOpenAIApiVersion: '2023-09-15-preview',
    azureOpenAIApiKey: config.azureOpenAIApiKey,
    azureOpenAIApiDeploymentName: config.azureOpenAIApiDeploymentName,
    azureOpenAIApiInstanceName: 'adpaipocuksoai-prototyping',
    callbacks: [handler1]
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
  })

  chatHistory = chatHistory.concat(response)

  return { response, chatHistory }
}

module.exports = {
  askQuestion
}
