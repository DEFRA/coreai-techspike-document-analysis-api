const { BaseCallbackHandler } = require('@langchain/core/callbacks/base')
const IgLogClient = require('./ig-log-client')
const util = require('util')

class IgLogCallbackHandler extends BaseCallbackHandler {
  name = 'IgLogCallbackHandler'

  constructor (config) {
    super()

    this.sessionId = config.sessionId
    this.user = config.user
    this.projectId = config.projectId

    this.igLog = new IgLogClient({
      baseUrl: config.baseUrl
    })
  }

  async handleChainStart (chain, inputs, runId, parentRunId) {
    if (!parentRunId) {
      this.threadId = runId
      console.log(`[IgLogCallbackHandler.handleChainStart] chain: ${chain}, runId: ${runId}, parentRunId: ${parentRunId}`)
    }
  }

  async handleChainEnd (outputs, runId, parentRunId) {
    if (!parentRunId) {
      console.log(`[IgLogCallbackHandler.handleChainEnd] outputs: ${outputs}, runId: ${runId}, parentRunId: ${parentRunId}`)
    }
  }

  async handleLLMStart (llm, prompts, runId, parentRunId, extraParams) {
    console.log(`[IgLogCallbackHandler.handleLLMStart] llm: ${util.inspect(llm)}, runId: ${runId}, parentRunId: ${parentRunId}`)
    console.log(extraParams)
  }

  async handleLLMEnd (llm, runId, parentRunId) {
    console.log(`[IgLogCallbackHandler.handleLLMEnd] llm: ${util.inspect(llm)}, runId: ${runId} parentRunId: ${parentRunId}`)
    // console.dir(llm.generations, { depth: null })
  }
}

module.exports = IgLogCallbackHandler
