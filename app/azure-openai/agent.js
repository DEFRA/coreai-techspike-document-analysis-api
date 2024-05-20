const { ChatOpenAI } = require('@langchain/openai')
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts')
const { createOpenAIFunctionsAgent, AgentExecutor } = require('langchain/agents')
const { createRetrieverTool } = require('langchain/tools/retriever')
const config = require('../config/azure-openai')
const { loadVectorStore } = require('./vector-store')

const askQuestion = async (question) => {
  console.log('askQuestion', question)

  const model = new ChatOpenAI({
    azureOpenAIApiVersion: '2023-09-15-preview',
    azureOpenAIApiKey: config.azureOpenAIApiKey,
    azureOpenAIApiDeploymentName: config.azureOpenAIApiDeploymentName,
    azureOpenAIApiInstanceName: 'adpaipocuksoai-prototyping'
  })

  const pgvectorStore = await loadVectorStore()
  const retriever = pgvectorStore.asRetriever()

  const prompt = ChatPromptTemplate.fromMessages([
    ('system', `You are an helpful assistant.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Use three sentences maximum and keep the answer as concise as possible.`),
    ('human', '{question}'),
    new MessagesPlaceholder('agent_scratchpad')
  ])

  const retrieverTool = createRetrieverTool(retriever, {
    name: 'question',
    description: 'Use this tool when asking a question.'
  })

  const tools = [retrieverTool]

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt,
    tools
  })

  const agentExecutor = new AgentExecutor({
    agent,
    tools
  })

  const response = await agentExecutor.invoke({
    question
  })

  return {
    response,
    chatHistory: {}
  }
}

module.exports = {
  askQuestion
}
